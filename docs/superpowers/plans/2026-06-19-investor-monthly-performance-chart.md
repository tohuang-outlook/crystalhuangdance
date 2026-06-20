# Investor Monthly Performance Chart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a month-by-month `Portfolio Value` chart to the investor dashboard, seeded with the provided January 2026 through May 2026 values and extended with one new month-end snapshot after each future month closes.

**Architecture:** Extend the existing investor portfolio persistence with a new monthly history table keyed by portfolio and month. Seed the requested `2026-01` through `2026-05` values lazily on the server, append one completed missing month snapshot from the current live portfolio value when the dashboard is requested, then expose the ordered series through the existing investor/admin portfolio payload. Render the series in a new chart card placed between `Current Holdings` and `Purchase History` without adding a third-party charting library.

**Tech Stack:** Express, better-sqlite3, React, TypeScript, Vitest, Supertest, Testing Library, Tailwind utility classes, inline SVG

---

## File Map

- Modify: `server/db.js`
  Responsibility: add persistent monthly history table and queries for seed/check/list/upsert behavior.
- Modify: `server/app.js`
  Responsibility: add month-history helpers, seed the initial series, append the newest completed month snapshot, and include `monthlyPerformance` in investor/admin portfolio responses.
- Modify: `server/app.test.js`
  Responsibility: cover seed ordering, duplicate protection, and latest-month append behavior in the server contract.
- Modify: `src/services/investment.ts`
  Responsibility: define the `InvestmentMonthlyPerformancePoint` type and normalize the API payload safely.
- Create: `src/components/investment/MonthlyPerformanceChart.tsx`
  Responsibility: render the monthly portfolio value series as a calm investor dashboard chart with empty-state handling.
- Modify: `src/pages/MyInvestmentPage.tsx`
  Responsibility: place the new chart card below holdings/account and above purchase history.
- Modify: `src/App.test.tsx`
  Responsibility: assert that the investor dashboard renders the monthly chart in the right location and handles populated data.

### Task 1: Add failing server tests for monthly performance history

**Files:**
- Modify: `server/app.test.js`
- Reference: `server/app.js`
- Reference: `server/db.js`

- [ ] **Step 1: Add a failing test that seeds Jan-May 2026 monthly performance values**

```js
  it('returns seeded monthly portfolio performance values for investors', async () => {
    const { app } = createApp({ dbPath: ':memory:', uploadRoot });
    const agent = request.agent(app);

    await agent
      .post('/api/auth/register')
      .send({ email: 'investor@example.com', password: 'password123' })
      .expect(201);

    const adminAgent = request.agent(app);
    await adminAgent
      .post('/api/auth/register')
      .send({ email: 'admin@example.com', password: 'password123', inviteCode: adminInviteCode })
      .expect(201);

    const usersResponse = await adminAgent.get('/api/admin/users').expect(200);
    const investorUser = usersResponse.body.users.find((user) => user.email === 'investor@example.com');

    await adminAgent
      .patch(`/api/admin/users/${investorUser.id}/member-type`)
      .send({ memberType: 'investor' })
      .expect(200);

    await adminAgent
      .post(`/api/admin/investors/${investorUser.id}/portfolio`)
      .send({ displayName: 'Investor Portfolio' })
      .expect(201);

    await adminAgent
      .post(`/api/admin/investors/${investorUser.id}/portfolio/transactions`)
      .send({
        assetSymbol: 'BTC',
        amountInvested: 5000,
        purchasePrice: 50000,
        purchaseShares: 0.1,
        purchaseDate: '2026-05-12',
      })
      .expect(201);

    const response = await agent.get('/api/investment/me').expect(200);

    expect(response.body.monthlyPerformance).toEqual([
      { month: '2026-01', label: 'Jan 2026', portfolioValue: 45283.78 },
      { month: '2026-02', label: 'Feb 2026', portfolioValue: 36456.4 },
      { month: '2026-03', label: 'Mar 2026', portfolioValue: 31754.3 },
      { month: '2026-04', label: 'Apr 2026', portfolioValue: 32263.08 },
      { month: '2026-05', label: 'May 2026', portfolioValue: 34855.04 },
    ]);
  });
```

- [ ] **Step 2: Add a failing test that prevents duplicate seed rows and appends one new completed month**

```js
  it('seeds monthly performance once and appends the latest completed month snapshot', async () => {
    const originalDateNow = Date.now;
    Date.now = () => new Date('2026-07-10T12:00:00.000Z').getTime();

    try {
      const getInvestmentPrices = vi.fn().mockResolvedValue({
        pricesBySymbol: { BTC: 60000 },
        pricesLastUpdatedAt: '2026-07-10T12:00:00.000Z',
      });

      const { app } = createApp({ dbPath: ':memory:', uploadRoot, getInvestmentPrices });
      const agent = request.agent(app);
      const adminAgent = request.agent(app);

      await adminAgent
        .post('/api/auth/register')
        .send({ email: 'admin@example.com', password: 'password123', inviteCode: adminInviteCode })
        .expect(201);

      await agent
        .post('/api/auth/register')
        .send({ email: 'investor@example.com', password: 'password123' })
        .expect(201);

      const usersResponse = await adminAgent.get('/api/admin/users').expect(200);
      const investorUser = usersResponse.body.users.find((user) => user.email === 'investor@example.com');

      await adminAgent
        .patch(`/api/admin/users/${investorUser.id}/member-type`)
        .send({ memberType: 'investor' })
        .expect(200);

      await adminAgent
        .post(`/api/admin/investors/${investorUser.id}/portfolio`)
        .send({ displayName: 'Investor Portfolio' })
        .expect(201);

      await adminAgent
        .post(`/api/admin/investors/${investorUser.id}/portfolio/transactions`)
        .send({
          assetSymbol: 'BTC',
          amountInvested: 5000,
          purchasePrice: 50000,
          purchaseShares: 0.1,
          purchaseDate: '2026-05-12',
        })
        .expect(201);

      const firstResponse = await agent.get('/api/investment/me').expect(200);
      const secondResponse = await agent.get('/api/investment/me').expect(200);

      expect(firstResponse.body.monthlyPerformance).toEqual([
        { month: '2026-01', label: 'Jan 2026', portfolioValue: 45283.78 },
        { month: '2026-02', label: 'Feb 2026', portfolioValue: 36456.4 },
        { month: '2026-03', label: 'Mar 2026', portfolioValue: 31754.3 },
        { month: '2026-04', label: 'Apr 2026', portfolioValue: 32263.08 },
        { month: '2026-05', label: 'May 2026', portfolioValue: 34855.04 },
        { month: '2026-06', label: 'Jun 2026', portfolioValue: 6000 },
      ]);

      expect(secondResponse.body.monthlyPerformance).toEqual(firstResponse.body.monthlyPerformance);
    } finally {
      Date.now = originalDateNow;
    }
  });
```

- [ ] **Step 3: Run the focused server tests and confirm they fail**

Run:

```bash
npm run test:ci -- server/app.test.js
```

Expected:

- FAIL because `monthlyPerformance` is missing from the response
- FAIL because there is no monthly history persistence yet

- [ ] **Step 4: Commit the red tests**

```bash
git add server/app.test.js
git commit -m "test investor monthly performance history"
```

### Task 2: Add monthly performance persistence and server serialization

**Files:**
- Modify: `server/db.js`
- Modify: `server/app.js`
- Test: `server/app.test.js`

- [ ] **Step 1: Add the monthly history table and statements in `server/db.js`**

Add this table after the existing `investment_transactions` table creation:

```js
  db.exec(`
    CREATE TABLE IF NOT EXISTS investment_monthly_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      portfolio_id INTEGER NOT NULL REFERENCES investment_portfolios(id) ON DELETE CASCADE,
      month_key TEXT NOT NULL,
      portfolio_value REAL NOT NULL,
      snapshot_date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (portfolio_id, month_key)
    )
  `);
```

Add statements to `statements`:

```js
    listInvestmentMonthlyHistoryByPortfolioId: db.prepare(
      `SELECT
         id,
         portfolio_id AS portfolioId,
         month_key AS month,
         portfolio_value AS portfolioValue,
         snapshot_date AS snapshotDate,
         created_at AS createdAt,
         updated_at AS updatedAt
       FROM investment_monthly_history
       WHERE portfolio_id = ?
       ORDER BY month_key ASC, id ASC`
    ),
    upsertInvestmentMonthlyHistory: db.prepare(
      `INSERT INTO investment_monthly_history (
         portfolio_id,
         month_key,
         portfolio_value,
         snapshot_date
       ) VALUES (
         @portfolioId,
         @month,
         @portfolioValue,
         @snapshotDate
       )
       ON CONFLICT(portfolio_id, month_key) DO UPDATE SET
         portfolio_value = excluded.portfolio_value,
         snapshot_date = excluded.snapshot_date,
         updated_at = CURRENT_TIMESTAMP
       RETURNING
         id,
         portfolio_id AS portfolioId,
         month_key AS month,
         portfolio_value AS portfolioValue,
         snapshot_date AS snapshotDate,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
```

Expose the methods in the returned database API:

```js
    listInvestmentMonthlyHistoryByPortfolioId(portfolioId) {
      return statements.listInvestmentMonthlyHistoryByPortfolioId.all(portfolioId);
    },
    upsertInvestmentMonthlyHistory(input) {
      return statements.upsertInvestmentMonthlyHistory.get(input);
    },
```

- [ ] **Step 2: Add seed data and month formatting helpers in `server/app.js`**

Add constants near the investment symbol constants:

```js
const seededInvestmentMonthlyPerformance = [
  { month: '2026-01', portfolioValue: 45283.78, snapshotDate: '2026-01-31' },
  { month: '2026-02', portfolioValue: 36456.4, snapshotDate: '2026-02-28' },
  { month: '2026-03', portfolioValue: 31754.3, snapshotDate: '2026-03-31' },
  { month: '2026-04', portfolioValue: 32263.08, snapshotDate: '2026-04-30' },
  { month: '2026-05', portfolioValue: 34855.04, snapshotDate: '2026-05-31' },
];
```

Add helpers:

```js
function formatMonthKeyFromDate(value) {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function getLastCompletedMonthKey(now = new Date()) {
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  date.setUTCMonth(date.getUTCMonth() - 1);
  return formatMonthKeyFromDate(date);
}

function getMonthEndDate(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month, 0));
  return date.toISOString().slice(0, 10);
}
```

- [ ] **Step 3: Add lazy seeding and latest-month append helpers in `server/app.js`**

Add helpers below the formatting helpers:

```js
function ensureSeededInvestmentMonthlyHistory(db, portfolioId) {
  const existing = db.listInvestmentMonthlyHistoryByPortfolioId(portfolioId);

  if (existing.length > 0) {
    return existing;
  }

  for (const seed of seededInvestmentMonthlyPerformance) {
    db.upsertInvestmentMonthlyHistory({
      portfolioId,
      month: seed.month,
      portfolioValue: seed.portfolioValue,
      snapshotDate: seed.snapshotDate,
    });
  }

  return db.listInvestmentMonthlyHistoryByPortfolioId(portfolioId);
}

function appendLatestCompletedMonthSnapshot({
  db,
  portfolioId,
  summary,
  now = new Date(),
}) {
  const lastCompletedMonth = getLastCompletedMonthKey(now);
  const existing = db.listInvestmentMonthlyHistoryByPortfolioId(portfolioId);
  const hasLatestCompletedMonth = existing.some((entry) => entry.month === lastCompletedMonth);

  if (!lastCompletedMonth || hasLatestCompletedMonth) {
    return existing;
  }

  db.upsertInvestmentMonthlyHistory({
    portfolioId,
    month: lastCompletedMonth,
    portfolioValue: summary.portfolioValue,
    snapshotDate: getMonthEndDate(lastCompletedMonth),
  });

  return db.listInvestmentMonthlyHistoryByPortfolioId(portfolioId);
}

function serializeInvestmentMonthlyPerformance(history) {
  return history.map((entry) => ({
    month: entry.month,
    label: formatMonthLabel(entry.month),
    portfolioValue: roundCurrency(entry.portfolioValue),
  }));
}
```

- [ ] **Step 4: Include `monthlyPerformance` in the investor and admin portfolio responses**

Inside both portfolio read handlers, after computing `snapshot`, add:

```js
    ensureSeededInvestmentMonthlyHistory(db, portfolio.id);
    const monthlyHistory = appendLatestCompletedMonthSnapshot({
      db,
      portfolioId: portfolio.id,
      summary: snapshot.summary,
      now: new Date(Date.now()),
    });
```

Then include:

```js
      monthlyPerformance: serializeInvestmentMonthlyPerformance(monthlyHistory),
```

in both response payloads.

- [ ] **Step 5: Run the focused server tests and confirm they pass**

Run:

```bash
npm run test:ci -- server/app.test.js
```

Expected:

- PASS for the new monthly performance tests
- PASS for the existing investor dashboard tests

- [ ] **Step 6: Commit the server-side monthly performance implementation**

```bash
git add server/db.js server/app.js server/app.test.js
git commit -m "add investor monthly performance history"
```

### Task 3: Add frontend contract coverage for the monthly chart

**Files:**
- Modify: `src/services/investment.ts`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Add the frontend type and normalizer support in `src/services/investment.ts`**

Add the new type:

```ts
export interface InvestmentMonthlyPerformancePoint {
  month: string;
  label: string;
  portfolioValue: number;
}
```

Extend `InvestmentPortfolioResponse`:

```ts
  monthlyPerformance: InvestmentMonthlyPerformancePoint[];
```

Add a normalizer:

```ts
function normalizeInvestmentMonthlyPerformance(
  payload: unknown
): InvestmentMonthlyPerformancePoint[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') {
      return [];
    }

    const month = typeof entry.month === 'string' ? entry.month.trim() : '';
    const label = typeof entry.label === 'string' ? entry.label.trim() : '';
    const portfolioValue = Number(entry.portfolioValue);

    if (!month || !label || !Number.isFinite(portfolioValue)) {
      return [];
    }

    return [{ month, label, portfolioValue }];
  });
}
```

Wire it into `normalizeInvestmentPortfolioResponse`:

```ts
    monthlyPerformance: normalizeInvestmentMonthlyPerformance(payload.monthlyPerformance),
```

- [ ] **Step 2: Add a failing investor dashboard UI test in `src/App.test.tsx`**

Add a test near the investor dashboard tests:

```tsx
  it('renders the monthly portfolio value chart between holdings and purchase history', async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);

      if (url.endsWith('/api/auth/session')) {
        return jsonResponse({
          authenticated: true,
          user: {
            id: 11,
            email: 'investor@example.com',
            role: 'user',
            memberType: 'investor',
          },
        });
      }

      if (url.endsWith('/api/investment/me')) {
        return jsonResponse({
          portfolio: {
            id: 7,
            userId: 11,
            baseCurrency: 'USD',
            displayName: 'Jennifer Portfolio',
            notes: null,
            createdAt: '2026-06-18T00:00:00.000Z',
            updatedAt: '2026-06-18T00:00:00.000Z',
          },
          summary: {
            totalInvested: 50000,
            portfolioValue: 34855.04,
            unrealizedPnL: -15144.96,
            totalReturnPercent: -30.29,
          },
          holdings: [],
          transactions: [
            {
              id: 1,
              portfolioId: 7,
              assetSymbol: 'BTC',
              assetName: 'Bitcoin',
              transactionType: 'buy',
              amountInvested: 5000,
              purchasePrice: 50000,
              purchaseShares: 0.1,
              purchaseDate: '2026-05-12',
              notes: null,
              createdAt: '2026-06-18T00:00:00.000Z',
              updatedAt: '2026-06-18T00:00:00.000Z',
            },
          ],
          livePrices: [],
          pricesLastUpdatedAt: '2026-06-19T16:00:00.000Z',
          monthlyPerformance: [
            { month: '2026-01', label: 'Jan 2026', portfolioValue: 45283.78 },
            { month: '2026-02', label: 'Feb 2026', portfolioValue: 36456.4 },
            { month: '2026-03', label: 'Mar 2026', portfolioValue: 31754.3 },
            { month: '2026-04', label: 'Apr 2026', portfolioValue: 32263.08 },
            { month: '2026-05', label: 'May 2026', portfolioValue: 34855.04 },
          ],
        });
      }

      return jsonResponse({ error: 'Not found' }, { status: 404 });
    });

    renderAppAt('/investment');

    expect(
      await screen.findByRole('heading', { name: 'Monthly Portfolio Value' })
    ).toBeInTheDocument();

    const holdingsHeading = screen.getByRole('heading', { name: 'Current Holdings' });
    const chartHeading = screen.getByRole('heading', { name: 'Monthly Portfolio Value' });
    const historyHeading = screen.getByRole('heading', { name: 'Purchase History' });

    expect(holdingsHeading.compareDocumentPosition(chartHeading)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(chartHeading.compareDocumentPosition(historyHeading)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(screen.getByText('Jan 2026')).toBeInTheDocument();
    expect(screen.getByText('May 2026')).toBeInTheDocument();
  });
```

- [ ] **Step 3: Run the focused app tests and confirm they fail**

Run:

```bash
npm run test:ci -- src/App.test.tsx
```

Expected:

- FAIL because `Monthly Portfolio Value` does not render yet

- [ ] **Step 4: Commit the red UI coverage**

```bash
git add src/services/investment.ts src/App.test.tsx
git commit -m "test investor monthly performance chart ui"
```

### Task 4: Build the monthly performance chart UI

**Files:**
- Create: `src/components/investment/MonthlyPerformanceChart.tsx`
- Modify: `src/pages/MyInvestmentPage.tsx`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Create `src/components/investment/MonthlyPerformanceChart.tsx`**

Add this component:

```tsx
import type { InvestmentMonthlyPerformancePoint } from '../../services/investment';

function formatCurrency(value: number) {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function buildLinePath(points: { x: number; y: number }[]) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
}

export default function MonthlyPerformanceChart({
  monthlyPerformance,
}: {
  monthlyPerformance: InvestmentMonthlyPerformancePoint[];
}) {
  if (monthlyPerformance.length === 0) {
    return (
      <div className="mt-6 rounded-[1.25rem] border border-dashed border-[var(--line)] px-5 py-8 text-sm text-[var(--text-muted)]">
        Monthly portfolio history will appear here once performance snapshots are available.
      </div>
    );
  }

  const width = 760;
  const height = 260;
  const paddingX = 28;
  const paddingTop = 24;
  const paddingBottom = 42;
  const values = monthlyPerformance.map((point) => point.portfolioValue);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  const points = monthlyPerformance.map((point, index) => {
    const x =
      monthlyPerformance.length === 1
        ? width / 2
        : paddingX + (index * (width - paddingX * 2)) / (monthlyPerformance.length - 1);
    const normalized = (point.portfolioValue - minValue) / range;
    const y = height - paddingBottom - normalized * (height - paddingTop - paddingBottom);

    return { x, y, ...point };
  });

  const path = buildLinePath(points);

  return (
    <div className="mt-6">
      <div className="rounded-[1.25rem] border border-[var(--line)] bg-[rgba(238,246,255,0.64)] p-4">
        <svg
          aria-label="Monthly portfolio value chart"
          className="h-auto w-full"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
        >
          <path
            d={path}
            fill="none"
            stroke="rgba(42, 79, 110, 0.92)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          {points.map((point) => (
            <g key={point.month}>
              <circle cx={point.x} cy={point.y} fill="rgba(19, 55, 78, 1)" r="5" />
              <text
                fill="rgba(90, 112, 126, 1)"
                fontSize="11"
                textAnchor="middle"
                x={point.x}
                y={height - 14}
              >
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {monthlyPerformance.map((point) => (
          <div
            key={point.month}
            className="rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3"
          >
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {point.label}
            </p>
            <p className="mt-2 text-lg text-[var(--text)]">{formatCurrency(point.portfolioValue)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Place the chart in `src/pages/MyInvestmentPage.tsx`**

Import the component:

```tsx
import MonthlyPerformanceChart from '../components/investment/MonthlyPerformanceChart';
```

Insert this section between the holdings/account grid and the purchase history section:

```tsx
              <section className="mt-6 rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-6 shadow-[0_16px_40px_rgba(68,102,136,0.08)]">
                <p className="eyebrow">Performance</p>
                <h2 className="mt-4 text-3xl text-[var(--text)]">Monthly Portfolio Value</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                  Month-end portfolio totals, seeded from your historical records and extended as new months close.
                </p>
                <MonthlyPerformanceChart monthlyPerformance={data.monthlyPerformance} />
              </section>
```

- [ ] **Step 3: Run the focused app tests and confirm they pass**

Run:

```bash
npm run test:ci -- src/App.test.tsx
```

Expected:

- PASS for the new investor chart test
- PASS for the existing investor dashboard tests

- [ ] **Step 4: Commit the chart UI**

```bash
git add src/components/investment/MonthlyPerformanceChart.tsx src/pages/MyInvestmentPage.tsx src/App.test.tsx src/services/investment.ts
git commit -m "add investor monthly performance chart"
```

### Task 5: Run full verification and finalize

**Files:**
- Modify: `server/db.js`
- Modify: `server/app.js`
- Modify: `server/app.test.js`
- Modify: `src/services/investment.ts`
- Create: `src/components/investment/MonthlyPerformanceChart.tsx`
- Modify: `src/pages/MyInvestmentPage.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Run the full test suite**

Run:

```bash
npm run test:ci
```

Expected:

- PASS
- existing auth, admin, dancer, and investor tests stay green

- [ ] **Step 2: Run the production build**

Run:

```bash
npm run build
```

Expected:

- PASS
- production bundle builds without chart-related type errors

- [ ] **Step 3: Review the final diff**

Run:

```bash
git diff --stat HEAD~3..HEAD
```

Expected:

- changes limited to monthly performance storage, API payload, tests, and investor chart UI

- [ ] **Step 4: Commit any final polish if needed**

```bash
git add server/db.js server/app.js server/app.test.js src/services/investment.ts src/components/investment/MonthlyPerformanceChart.tsx src/pages/MyInvestmentPage.tsx src/App.test.tsx
git commit -m "polish investor monthly performance chart"
```

Only do this step if the verification pass required a real code change after the previous commits.
