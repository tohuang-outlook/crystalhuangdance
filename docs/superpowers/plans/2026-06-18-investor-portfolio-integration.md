# Investor Portfolio Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an admin-managed crypto portfolio system to `crystalhuangdance.org` so admins can create investor portfolios and manage buy-only transactions, while investor users can only view their own read-only investment dashboard.

**Architecture:** Extend the existing SQLite + Express backend with investor portfolio and transaction tables, expose admin-only portfolio mutation APIs plus investor/admin read APIs, and replace the current mock `My Investment` page with server-backed portfolio data. Reuse the portfolio tracker concepts already proven in the separate app: buy-and-hold positions, weighted average cost basis, unrealized P&L, allocation, and transaction history.

**Tech Stack:** React 18, React Router, Express, better-sqlite3, Vitest, React Testing Library, Supertest

---

## File Structure

**Backend**
- Modify: `server/db.js`
  Responsibility: add portfolio/transaction schema, queries, and calculation-friendly reads.
- Modify: `server/app.js`
  Responsibility: add admin/investor portfolio API routes and request validation.
- Modify: `server/app.test.js`
  Responsibility: backend coverage for portfolio creation, transaction CRUD, authorization, and investor read-only access.

**Frontend services + types**
- Create: `src/services/investment.ts`
  Responsibility: typed API client for portfolio reads and transaction mutations.
- Modify: `src/services/admin.ts`
  Responsibility: optionally add admin helpers here only if portfolio actions stay grouped with admin APIs; otherwise keep all portfolio calls in `src/services/investment.ts`.

**Frontend pages/components**
- Modify: `src/pages/MyInvestmentPage.tsx`
  Responsibility: replace static mock content with authenticated investor portfolio data.
- Create: `src/components/investment/PortfolioSummary.tsx`
  Responsibility: summary cards for invested value, portfolio value, unrealized P&L, return, and optional last updated label.
- Create: `src/components/investment/HoldingsTable.tsx`
  Responsibility: reusable holdings table for admin/investor read views.
- Create: `src/components/investment/TransactionTable.tsx`
  Responsibility: reusable transaction list with optional admin actions.
- Create: `src/components/investment/TransactionForm.tsx`
  Responsibility: admin-only create/edit form for buy transactions.
- Modify: `src/pages/AdminPage.tsx`
  Responsibility: add investor portfolio management section and transaction controls.
- Modify: `src/App.tsx`
  Responsibility: keep route wiring stable if admin portfolio management gets its own nested section or screen.

**Frontend tests**
- Modify: `src/App.test.tsx`
  Responsibility: investor dashboard now renders real API-backed states instead of fixture-only copy.
- Create: `src/components/investment/*.test.tsx` as needed
  Responsibility: focused UI behaviors for portfolio rendering and admin controls.

## Domain Model

- `investment_portfolios`
  - `id`
  - `user_id` unique, foreign key to `users.id`
  - `base_currency` default `USD`
  - `display_name` nullable
  - `notes` nullable
  - `created_at`
  - `updated_at`

- `investment_transactions`
  - `id`
  - `portfolio_id`
  - `asset_symbol` uppercase text like `BTC`, `ETH`
  - `asset_name` text like `Bitcoin`
  - `transaction_type` restricted to `buy` for this phase
  - `amount_invested`
  - `purchase_price`
  - `purchase_shares`
  - `purchase_date`
  - `notes` nullable
  - `created_at`
  - `updated_at`

## Read Models

- **Portfolio summary**
  - total invested
  - current portfolio value
  - unrealized P&L
  - total return percent
- **Holdings**
  - asset symbol/name
  - total quantity
  - total invested
  - average cost basis
  - current price
  - current value
  - unrealized P&L
  - allocation percent
- **Transactions**
  - newest first
  - buy-only
- **Permissions**
  - admin can create/update/delete any investor portfolio + transactions
  - investor can only read their own portfolio
  - dancer/non-investor cannot access `/investment`

## API Shape

- `GET /api/investment/me`
  - investor read-only portfolio payload for the current signed-in investor
- `GET /api/admin/investors`
  - list investor users with portfolio status
- `POST /api/admin/investors/:userId/portfolio`
  - create portfolio for investor if one does not already exist
- `GET /api/admin/investors/:userId/portfolio`
  - admin read specific investor portfolio
- `POST /api/admin/investors/:userId/portfolio/transactions`
  - create a buy transaction
- `PATCH /api/admin/portfolio-transactions/:transactionId`
  - edit transaction
- `DELETE /api/admin/portfolio-transactions/:transactionId`
  - delete transaction

---

### Task 1: Add portfolio schema and database accessors

**Files:**
- Modify: `server/db.js`
- Test: `server/app.test.js`

- [ ] **Step 1: Write the failing backend test for portfolio creation and retrieval**

```js
it('lets an admin create a portfolio for an investor and read it back', async () => {
  const adminAgent = request.agent(app);
  const investorAgent = request.agent(app);

  await registerAndLogin(adminAgent, {
    email: 'admin@example.com',
    password: 'StrongPass123!',
    role: 'admin',
  });

  const investorResponse = await registerAndLogin(investorAgent, {
    email: 'jennifer@example.com',
    password: 'InvestorPass123!',
  });

  const promotedUser = db.setUserMemberTypeById(investorResponse.body.user.id, 'investor');

  const createResponse = await adminAgent
    .post(`/api/admin/investors/${promotedUser.id}/portfolio`)
    .send({ displayName: 'Jennifer Portfolio' });

  expect(createResponse.status).toBe(201);
  expect(createResponse.body.portfolio).toMatchObject({
    userId: promotedUser.id,
    displayName: 'Jennifer Portfolio',
    baseCurrency: 'USD',
  });

  const getResponse = await adminAgent.get(`/api/admin/investors/${promotedUser.id}/portfolio`);
  expect(getResponse.status).toBe(200);
  expect(getResponse.body.portfolio.displayName).toBe('Jennifer Portfolio');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- --run server/app.test.js`

Expected: FAIL because the new investment portfolio routes and DB accessors do not exist yet.

- [ ] **Step 3: Add schema and DB helpers in `server/db.js`**

Add:

```js
ensureColumn(db, 'users', 'member_type', "TEXT NOT NULL DEFAULT 'dancer'");

db.exec(`
  CREATE TABLE IF NOT EXISTS investment_portfolios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    base_currency TEXT NOT NULL DEFAULT 'USD',
    display_name TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS investment_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    portfolio_id INTEGER NOT NULL REFERENCES investment_portfolios(id) ON DELETE CASCADE,
    asset_symbol TEXT NOT NULL,
    asset_name TEXT NOT NULL,
    transaction_type TEXT NOT NULL DEFAULT 'buy',
    amount_invested REAL NOT NULL,
    purchase_price REAL NOT NULL,
    purchase_shares REAL NOT NULL,
    purchase_date TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);
```

And export helpers shaped like:

```js
createInvestmentPortfolio({ userId, displayName, baseCurrency = 'USD', notes = null })
findInvestmentPortfolioByUserId(userId)
listInvestorUsersWithPortfolioStatus()
```

- [ ] **Step 4: Add minimal admin routes in `server/app.js` to make the test pass**

Implement:

```js
app.post('/api/admin/investors/:userId/portfolio', requireAdmin, (req, res) => {
  // validate target user exists and memberType === 'investor'
  // create portfolio if missing
  // return 201 with portfolio payload
});

app.get('/api/admin/investors/:userId/portfolio', requireAdmin, (req, res) => {
  // return existing portfolio or 404
});
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- --run server/app.test.js`

Expected: PASS for the new admin portfolio creation test.

- [ ] **Step 6: Commit**

```bash
git add server/db.js server/app.js server/app.test.js
git commit -m "add investor portfolio schema"
```

### Task 2: Add buy transaction CRUD and portfolio calculations

**Files:**
- Modify: `server/db.js`
- Modify: `server/app.js`
- Test: `server/app.test.js`

- [ ] **Step 1: Write failing tests for create, edit, delete, and investor read-only access**

```js
it('lets an admin add a buy transaction and exposes calculated holdings to the investor', async () => {
  // arrange admin + investor + portfolio
  // create BTC buy transaction
  // call GET /api/investment/me as investor
  // assert total invested, quantity, average cost, holdings length
});

it('rejects transaction mutation requests from investor users', async () => {
  // investor tries POST /api/admin/investors/:userId/portfolio/transactions
  // expect 403
});
```

- [ ] **Step 2: Run backend tests to verify they fail**

Run: `npm test -- --run server/app.test.js`

Expected: FAIL because transaction CRUD and investment summary calculations are missing.

- [ ] **Step 3: Add transaction queries and portfolio aggregation helpers in `server/db.js`**

Implement helpers shaped like:

```js
createInvestmentTransaction(input)
updateInvestmentTransactionById(transactionId, input)
deleteInvestmentTransactionById(transactionId)
listInvestmentTransactionsByPortfolioId(portfolioId)
```

Add a pure calculation helper:

```js
function buildPortfolioSnapshot(transactions, livePricesBySymbol) {
  // group by asset
  // quantity = sum(shares)
  // invested = sum(amountInvested)
  // averageCost = invested / quantity
  // currentValue = quantity * currentPrice
  // unrealizedPnL = currentValue - invested
  // allocation = currentValue / portfolioValue
}
```

- [ ] **Step 4: Add transaction mutation routes and investor read route in `server/app.js`**

Implement:

```js
app.get('/api/investment/me', requireAuth, requireInvestor, async (req, res) => {
  // load user's portfolio and transactions
  // use price service / current stubbed price provider
  // return summary, holdings, transactions
});

app.post('/api/admin/investors/:userId/portfolio/transactions', requireAdmin, (req, res) => {
  // validate buy-only input
});

app.patch('/api/admin/portfolio-transactions/:transactionId', requireAdmin, (req, res) => {
  // update editable transaction fields
});

app.delete('/api/admin/portfolio-transactions/:transactionId', requireAdmin, (req, res) => {
  // delete and return deleted id
});
```

- [ ] **Step 5: Run backend tests to verify they pass**

Run: `npm test -- --run server/app.test.js`

Expected: PASS with transaction CRUD and read-only permission coverage.

- [ ] **Step 6: Commit**

```bash
git add server/db.js server/app.js server/app.test.js
git commit -m "add investor transaction apis"
```

### Task 3: Add frontend investment service and replace mock investor dashboard

**Files:**
- Create: `src/services/investment.ts`
- Modify: `src/pages/MyInvestmentPage.tsx`
- Create: `src/components/investment/PortfolioSummary.tsx`
- Create: `src/components/investment/HoldingsTable.tsx`
- Create: `src/components/investment/TransactionTable.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Write the failing frontend test for live investor dashboard data**

```tsx
it('renders investor holdings from the investment api', async () => {
  vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();

    if (url.endsWith('/api/auth/me')) {
      return jsonResponse({ user: { id: 11, email: 'jennifer@example.com', role: 'user', memberType: 'investor' } });
    }

    if (url.endsWith('/api/investment/me')) {
      return jsonResponse({
        portfolio: { displayName: 'Jennifer Portfolio' },
        summary: { totalInvested: 5000, portfolioValue: 5400, unrealizedPnL: 400, totalReturnPercent: 8 },
        holdings: [{ assetSymbol: 'BTC', assetName: 'Bitcoin', quantity: 0.1, invested: 5000, currentValue: 5400, allocationPercent: 100, unrealizedPnL: 400 }],
        transactions: [],
      });
    }

    throw new Error(`Unhandled fetch request: ${url}`);
  });

  render(<App />);

  expect(await screen.findByText('Bitcoin')).toBeInTheDocument();
  expect(screen.getByText('$5,400.00')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the frontend test to verify it fails**

Run: `npm test -- --run src/App.test.tsx`

Expected: FAIL because `MyInvestmentPage` still renders static fixture data.

- [ ] **Step 3: Create `src/services/investment.ts` with typed fetch helpers**

Define types:

```ts
export interface InvestmentSummary { /* totalInvested, portfolioValue, unrealizedPnL, totalReturnPercent */ }
export interface InvestmentHolding { /* assetSymbol, assetName, quantity, invested, averageCost, currentPrice, currentValue, unrealizedPnL, allocationPercent */ }
export interface InvestmentTransaction { /* id, assetSymbol, assetName, amountInvested, purchasePrice, purchaseShares, purchaseDate, notes */ }
export interface InvestmentPortfolioResponse { /* portfolio, summary, holdings, transactions */ }
```

And fetch helper:

```ts
export function fetchMyInvestmentPortfolio() {
  return request<InvestmentPortfolioResponse>('/api/investment/me');
}
```

- [ ] **Step 4: Replace static `MyInvestmentPage` data flow**

Implement:

```tsx
const [data, setData] = useState<InvestmentPortfolioResponse | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  let isMounted = true;
  void fetchMyInvestmentPortfolio().then(...).catch(...);
  return () => {
    isMounted = false;
  };
}, []);
```

Render:
- loading state
- empty state if investor has no portfolio yet
- summary cards via `PortfolioSummary`
- holdings via `HoldingsTable`
- transaction history via `TransactionTable`

- [ ] **Step 5: Run frontend test to verify it passes**

Run: `npm test -- --run src/App.test.tsx`

Expected: PASS with API-backed investor dashboard coverage.

- [ ] **Step 6: Commit**

```bash
git add src/services/investment.ts src/pages/MyInvestmentPage.tsx src/components/investment src/App.test.tsx
git commit -m "connect investor dashboard to live portfolio data"
```

### Task 4: Add admin investor portfolio management UI

**Files:**
- Modify: `src/pages/AdminPage.tsx`
- Create: `src/components/investment/TransactionForm.tsx`
- Create: `src/components/investment/TransactionTable.tsx` if not already created in Task 3
- Create/Modify: `src/services/investment.ts`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Write the failing UI test for admin-managed investor transactions**

```tsx
it('lets admins open an investor portfolio section and add a buy transaction', async () => {
  // mock auth me as admin
  // mock admin user list with an investor user
  // mock GET investor portfolio
  // mock POST transaction
  // assert investor card shows transaction form and refreshed holdings
});
```

- [ ] **Step 2: Run the frontend test to verify it fails**

Run: `npm test -- --run src/App.test.tsx`

Expected: FAIL because admin page has no investor portfolio management UI yet.

- [ ] **Step 3: Add investor portfolio management section to `src/pages/AdminPage.tsx`**

UI requirements:
- separate `Investor Portfolios` section below member management
- only list users whose `memberType === 'investor'`
- show whether each investor already has a portfolio
- admin button to create portfolio when missing
- show read-only summary cards when portfolio exists
- show transaction table
- show create/edit form
- show delete action for transactions

Suggested state:

```tsx
const [selectedInvestorId, setSelectedInvestorId] = useState<number | null>(null);
const [portfolioByInvestorId, setPortfolioByInvestorId] = useState<Record<number, InvestmentPortfolioResponse>>({});
const [activePortfolioAction, setActivePortfolioAction] = useState<string | null>(null);
```

- [ ] **Step 4: Add admin transaction form behavior**

Form fields:
- asset
- amount invested
- purchase price
- purchase shares
- purchase date
- notes

Rules:
- buy-only
- require amount invested
- require either purchase price or purchase shares, then derive the missing value
- normalize numbers before submit

- [ ] **Step 5: Run the frontend test to verify it passes**

Run: `npm test -- --run src/App.test.tsx`

Expected: PASS with admin investor portfolio management coverage.

- [ ] **Step 6: Commit**

```bash
git add src/pages/AdminPage.tsx src/components/investment src/services/investment.ts src/App.test.tsx
git commit -m "add admin investor portfolio management"
```

### Task 5: Harden authorization, empty states, and validation

**Files:**
- Modify: `server/app.js`
- Modify: `server/app.test.js`
- Modify: `src/pages/MyInvestmentPage.tsx`
- Modify: `src/pages/AdminPage.tsx`

- [ ] **Step 1: Write failing tests for edge cases**

```js
it('returns 404 when an investor has no portfolio yet', async () => {
  // investor login without portfolio
  // GET /api/investment/me
  // expect 404 or stable empty payload depending on chosen contract
});

it('rejects non-investor portfolio creation targets', async () => {
  // admin tries creating portfolio for dancer
  // expect 400
});
```

```tsx
it('shows a calm empty state when an investor has no portfolio yet', async () => {
  // api returns 404 or empty response contract
  // page shows a message instead of crashing
});
```

- [ ] **Step 2: Run targeted tests to verify they fail**

Run:
- `npm test -- --run server/app.test.js`
- `npm test -- --run src/App.test.tsx`

Expected: FAIL until validation and empty-state handling are implemented.

- [ ] **Step 3: Implement guardrails**

Guardrails:
- cannot create portfolio for a non-investor member
- one portfolio per investor
- transaction type remains `buy`
- cannot mutate transactions unless admin
- investor page shows friendly no-portfolio state
- invalid transaction ids return 404

- [ ] **Step 4: Run targeted tests to verify they pass**

Run:
- `npm test -- --run server/app.test.js`
- `npm test -- --run src/App.test.tsx`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/app.js server/app.test.js src/pages/MyInvestmentPage.tsx src/pages/AdminPage.tsx src/App.test.tsx
git commit -m "harden investor portfolio permissions"
```

### Task 6: Final verification and production readiness

**Files:**
- Modify: `README.md` if investor admin workflow needs short operator notes

- [ ] **Step 1: Run the full test suite**

Run: `npm test -- --run`

Expected: PASS

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: PASS

- [ ] **Step 3: Manually verify the core flows**

Verify:
- admin can change user to investor
- admin can create investor portfolio
- admin can add/edit/delete buy transactions
- investor can log in and view only their own portfolio
- dancer still cannot access `/investment`

- [ ] **Step 4: Commit any documentation touch-up**

```bash
git add README.md
git commit -m "document investor portfolio workflow"
```

## Self-Review

- Spec coverage:
  - admin-managed investor portfolio creation: covered by Tasks 1 and 4
  - buy-only transaction management: covered by Tasks 2 and 4
  - investor read-only dashboard: covered by Tasks 2 and 3
  - authorization and non-investor safety: covered by Task 5
  - regression protection and build verification: covered by Task 6
- Placeholder scan:
  - removed vague “add validation later” language and listed concrete route, UI, and test expectations
- Type consistency:
  - use `memberType` on frontend
  - use buy-only `transaction_type`
  - use one portfolio per `userId`

## Recommended execution notes

- Keep pricing simple for this phase.
  - If reusing the live price source from the standalone tracker is easy, use it.
  - If not, centralize a temporary server-side price provider behind one helper so it can be swapped later without rewriting UI or DB logic.
- Do not add sell transactions, alerts, or PDF export in this pass.
- Prefer calm empty states over partial broken UI when a portfolio is not yet set up.

