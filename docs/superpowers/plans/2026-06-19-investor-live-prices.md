# Investor Live Prices Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add CoinGecko-backed live crypto pricing to the investor dashboard on initial page load and on a silent 60-second refresh cycle, with price cards at the top of the page and a current-price column in holdings.

**Architecture:** Keep market pricing server-side. Extend the existing investment portfolio response to include `livePrices` and `pricesLastUpdatedAt`, then update the investor page to render that metadata and refresh its snapshot every 60 seconds without re-entering the first-load placeholder state. Guard the integration so CoinGecko failures do not break the dashboard.

**Tech Stack:** Express, React, TypeScript, Vitest, Supertest, Testing Library, CoinGecko simple price API

---

### Task 1: Lock the server contract with failing tests

**Files:**
- Modify: `server/app.test.js`
- Verify against: `server/app.js`

- [ ] **Step 1: Add a failing investor API test for live prices in `server/app.test.js`**

```js
  it('includes live prices and a last-updated timestamp in the investor snapshot', async () => {
    const mockedPriceTime = '2026-06-19T16:00:00.000Z';

    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async (payload) => {
        sentResetEmails.push(payload);
      },
      getInvestmentPrices: async () => ({
        BTC: 54000,
        ETH: 2500,
      }),
      getInvestmentPricesLastUpdatedAt: () => mockedPriceTime,
    });

    const adminAgent = request.agent(app);
    const investorAgent = request.agent(app);

    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const createdUser = await registerUser(investorAgent, 'jennifer@example.com');
    const promotedUser = db.setUserMemberTypeById(createdUser.id, 'investor');
    await loginUser(investorAgent, 'jennifer@example.com');

    await adminAgent
      .post(`/api/admin/investors/${promotedUser.id}/portfolio`)
      .send({ displayName: 'Jennifer Portfolio' });

    await adminAgent
      .post(`/api/admin/investors/${promotedUser.id}/portfolio/transactions`)
      .send({
        assetSymbol: 'BTC',
        amountInvested: 5000,
        purchaseShares: 0.1,
        purchaseDate: '2026-06-01',
      });

    const response = await investorAgent.get('/api/investment/me');

    expect(response.status).toBe(200);
    expect(response.body.livePrices).toEqual([
      {
        assetSymbol: 'BTC',
        assetName: 'Bitcoin',
        currentPrice: 54000,
      },
    ]);
    expect(response.body.pricesLastUpdatedAt).toBe(mockedPriceTime);
  });
```

- [ ] **Step 2: Add a failing resilience test for price-provider failure in `server/app.test.js`**

```js
  it('keeps the investor snapshot available when live price fetching fails', async () => {
    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async (payload) => {
        sentResetEmails.push(payload);
      },
      getInvestmentPrices: async () => {
        throw new Error('CoinGecko unavailable');
      },
      getInvestmentPricesLastUpdatedAt: () => null,
    });

    const adminAgent = request.agent(app);
    const investorAgent = request.agent(app);

    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const createdUser = await registerUser(investorAgent, 'jennifer@example.com');
    const promotedUser = db.setUserMemberTypeById(createdUser.id, 'investor');
    await loginUser(investorAgent, 'jennifer@example.com');

    await adminAgent
      .post(`/api/admin/investors/${promotedUser.id}/portfolio`)
      .send({ displayName: 'Jennifer Portfolio' });

    await adminAgent
      .post(`/api/admin/investors/${promotedUser.id}/portfolio/transactions`)
      .send({
        assetSymbol: 'BTC',
        amountInvested: 5000,
        purchaseShares: 0.1,
        purchaseDate: '2026-06-01',
      });

    const response = await investorAgent.get('/api/investment/me');

    expect(response.status).toBe(200);
    expect(response.body.livePrices).toEqual([]);
    expect(response.body.pricesLastUpdatedAt).toBeNull();
    expect(response.body.holdings).toEqual([
      expect.objectContaining({
        assetSymbol: 'BTC',
        currentPrice: 0,
        currentValue: 0,
      }),
    ]);
  });
```

- [ ] **Step 3: Run only the new server tests and confirm they fail**

Run:

```bash
npm run test:ci -- server/app.test.js
```

Expected:

```text
FAIL  server/app.test.js
... livePrices is undefined or pricesLastUpdatedAt is missing
```

- [ ] **Step 4: Commit the red test baseline**

```bash
git add server/app.test.js
git commit -m "test investor live price response contract"
```

### Task 2: Implement CoinGecko-backed server response fields

**Files:**
- Modify: `server/app.js`
- Verify against: `src/services/investment.ts`

- [ ] **Step 1: Add symbol-to-CoinGecko mapping and live price serialization helpers in `server/app.js`**

```js
const investmentAssetCoinGeckoIdsBySymbol = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  ADA: 'cardano',
  XRP: 'ripple',
  SOL: 'solana',
  DOGE: 'dogecoin',
};

function buildLivePriceList(assetSymbols, livePricesBySymbol) {
  return assetSymbols
    .filter((symbol) => Number.isFinite(Number(livePricesBySymbol[symbol])))
    .map((symbol) => ({
      assetSymbol: symbol,
      assetName: investmentAssetNamesBySymbol[symbol],
      currentPrice: roundCurrency(Number(livePricesBySymbol[symbol])),
    }));
}
```

- [ ] **Step 2: Add a default CoinGecko fetcher and tracked timestamp in `server/app.js`**

```js
async function fetchCoinGeckoInvestmentPrices(assetSymbols) {
  const ids = assetSymbols
    .map((symbol) => investmentAssetCoinGeckoIdsBySymbol[symbol])
    .filter(Boolean);

  if (ids.length === 0) {
    return {};
  }

  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd`
  );

  if (!response.ok) {
    throw new Error(`CoinGecko request failed with status ${response.status}`);
  }

  const payload = await response.json();

  return assetSymbols.reduce((result, symbol) => {
    const id = investmentAssetCoinGeckoIdsBySymbol[symbol];
    const usdPrice = payload?.[id]?.usd;

    if (Number.isFinite(Number(usdPrice))) {
      result[symbol] = Number(usdPrice);
    }

    return result;
  }, {});
}
```

- [ ] **Step 3: Extend `createApp` dependency defaults in `server/app.js`**

Replace the current investment-price defaults with:

```js
  getInvestmentPrices = fetchCoinGeckoInvestmentPrices,
  getInvestmentPricesLastUpdatedAt = () => new Date(now()).toISOString(),
```

- [ ] **Step 4: Harden the investor and admin portfolio routes in `server/app.js`**

Use the same guarded fetch pattern in both `/api/investment/me` and `/api/admin/investors/:userId/portfolio`:

```js
    const transactions = db.listInvestmentTransactionsByPortfolioId(portfolio.id);
    const priceSymbols = [...new Set(transactions.map((transaction) => transaction.assetSymbol))];

    let livePricesBySymbol = {};
    let pricesLastUpdatedAt = null;

    try {
      livePricesBySymbol = await getInvestmentPrices(priceSymbols);
      pricesLastUpdatedAt = getInvestmentPricesLastUpdatedAt();
    } catch (error) {
      console.error('Unable to fetch investment prices', error);
    }

    const snapshot = buildPortfolioSnapshot(transactions, livePricesBySymbol);

    return res.json({
      portfolio: serializeInvestmentPortfolio(portfolio),
      summary: snapshot.summary,
      holdings: snapshot.holdings,
      transactions: transactions.map(serializeInvestmentTransaction),
      livePrices: buildLivePriceList(priceSymbols, livePricesBySymbol),
      pricesLastUpdatedAt,
    });
```

- [ ] **Step 5: Re-run the targeted server tests and confirm they pass**

Run:

```bash
npm run test:ci -- server/app.test.js
```

Expected:

```text
PASS  server/app.test.js
```

- [ ] **Step 6: Commit the server implementation**

```bash
git add server/app.js server/app.test.js
git commit -m "add investor live market pricing data"
```

### Task 3: Extend the frontend investment types and UI tests

**Files:**
- Modify: `src/services/investment.ts`
- Modify: `src/App.test.tsx`
- Verify against: `src/pages/MyInvestmentPage.tsx`

- [ ] **Step 1: Extend the shared response types in `src/services/investment.ts`**

Add:

```ts
export interface InvestmentLivePrice {
  assetSymbol: string;
  assetName: string;
  currentPrice: number;
}
```

And extend `InvestmentPortfolioResponse`:

```ts
export interface InvestmentPortfolioResponse {
  portfolio: InvestmentPortfolioRecord;
  summary: InvestmentSummary;
  holdings: InvestmentHolding[];
  transactions: InvestmentTransaction[];
  livePrices: InvestmentLivePrice[];
  pricesLastUpdatedAt: string | null;
}
```

Update `normalizeInvestmentPortfolioResponse`:

```ts
    livePrices: Array.isArray(payload.livePrices) ? payload.livePrices : [],
    pricesLastUpdatedAt:
      typeof payload.pricesLastUpdatedAt === 'string' || payload.pricesLastUpdatedAt === null
        ? payload.pricesLastUpdatedAt
        : null,
```

- [ ] **Step 2: Add a failing investor dashboard UI test in `src/App.test.tsx`**

Create a test near the existing investor route coverage:

```tsx
  it('renders live prices and current price data for investor users', async () => {
    window.history.replaceState({}, '', '/my-investment');

    vi.useFakeTimers();
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(
          JSON.stringify({
            user: {
              id: 7,
              email: 'jennifer@example.com',
              role: 'user',
              memberType: 'investor',
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (url.endsWith('/api/investment/me')) {
        return new Response(
          JSON.stringify({
            portfolio: {
              id: 1,
              userId: 7,
              baseCurrency: 'USD',
              displayName: 'Jennifer Portfolio',
              notes: null,
              createdAt: '2026-06-19T00:00:00.000Z',
              updatedAt: '2026-06-19T00:00:00.000Z',
            },
            summary: {
              totalInvested: 5000,
              portfolioValue: 5400,
              unrealizedPnL: 400,
              totalReturnPercent: 8,
            },
            livePrices: [
              {
                assetSymbol: 'BTC',
                assetName: 'Bitcoin',
                currentPrice: 54000,
              },
            ],
            pricesLastUpdatedAt: '2026-06-19T16:00:00.000Z',
            holdings: [
              {
                assetSymbol: 'BTC',
                assetName: 'Bitcoin',
                quantity: 0.1,
                invested: 5000,
                averageCost: 50000,
                currentPrice: 54000,
                currentValue: 5400,
                unrealizedPnL: 400,
                allocationPercent: 100,
              },
            ],
            transactions: [],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    expect(await screen.findByText('Live Prices')).toBeInTheDocument();
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getAllByText('$54,000.00').length).toBeGreaterThan(0);
    expect(screen.getByRole('columnheader', { name: /Current Price/i })).toBeInTheDocument();

    vi.useRealTimers();
  });
```

- [ ] **Step 3: Add a failing silent-refresh UI test in `src/App.test.tsx`**

Use a call counter:

```tsx
  it('refreshes the investor snapshot every 60 seconds without showing the first-load placeholder again', async () => {
    window.history.replaceState({}, '', '/my-investment');

    let portfolioFetchCount = 0;
    vi.useFakeTimers();

    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.endsWith('/api/auth/me')) {
        return new Response(
          JSON.stringify({
            user: {
              id: 7,
              email: 'jennifer@example.com',
              role: 'user',
              memberType: 'investor',
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (url.endsWith('/api/investment/me')) {
        portfolioFetchCount += 1;
        const currentPrice = portfolioFetchCount === 1 ? 54000 : 55000;

        return new Response(
          JSON.stringify({
            portfolio: {
              id: 1,
              userId: 7,
              baseCurrency: 'USD',
              displayName: 'Jennifer Portfolio',
              notes: null,
              createdAt: '2026-06-19T00:00:00.000Z',
              updatedAt: '2026-06-19T00:00:00.000Z',
            },
            summary: {
              totalInvested: 5000,
              portfolioValue: currentPrice * 0.1,
              unrealizedPnL: currentPrice * 0.1 - 5000,
              totalReturnPercent: currentPrice === 54000 ? 8 : 10,
            },
            livePrices: [{ assetSymbol: 'BTC', assetName: 'Bitcoin', currentPrice }],
            pricesLastUpdatedAt: '2026-06-19T16:00:00.000Z',
            holdings: [
              {
                assetSymbol: 'BTC',
                assetName: 'Bitcoin',
                quantity: 0.1,
                invested: 5000,
                averageCost: 50000,
                currentPrice,
                currentValue: currentPrice * 0.1,
                unrealizedPnL: currentPrice * 0.1 - 5000,
                allocationPercent: 100,
              },
            ],
            transactions: [],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`Unhandled fetch request in App tests: ${url}`);
    });

    render(<App />);

    expect(await screen.findByText('$54,000.00')).toBeInTheDocument();
    expect(screen.queryByText(/Preparing your investment snapshot/i)).not.toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(60000);

    expect(await screen.findByText('$55,000.00')).toBeInTheDocument();
    expect(screen.queryByText(/Preparing your investment snapshot/i)).not.toBeInTheDocument();

    vi.useRealTimers();
  });
```

- [ ] **Step 4: Run only the frontend app tests and confirm they fail**

Run:

```bash
npm run test:ci -- src/App.test.tsx
```

Expected:

```text
FAIL  src/App.test.tsx
... unable to find "Live Prices" or "Current Price"
```

- [ ] **Step 5: Commit the red frontend test baseline**

```bash
git add src/services/investment.ts src/App.test.tsx
git commit -m "test investor live price dashboard ui"
```

### Task 4: Build the investor live-prices UI and refresh flow

**Files:**
- Create: `src/components/investment/LivePricesCard.tsx`
- Modify: `src/components/investment/HoldingsTable.tsx`
- Modify: `src/pages/MyInvestmentPage.tsx`
- Modify: `src/services/investment.ts`

- [ ] **Step 1: Create `src/components/investment/LivePricesCard.tsx`**

```tsx
import type { InvestmentLivePrice } from '../../services/investment';

function formatCurrency(value: number) {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatLastUpdated(value: string | null) {
  if (!value) {
    return 'Last updated unavailable';
  }

  return `Last updated ${new Date(value).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

export default function LivePricesCard({
  livePrices,
  pricesLastUpdatedAt,
}: {
  livePrices: InvestmentLivePrice[];
  pricesLastUpdatedAt: string | null;
}) {
  if (livePrices.length === 0) {
    return null;
  }

  return (
    <section className="mt-6 rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-6 shadow-[0_16px_40px_rgba(68,102,136,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Live Prices</p>
          <h2 className="mt-3 text-3xl text-[var(--text)]">Current Market Prices</h2>
        </div>
        <p className="text-sm text-[var(--text-muted)]">{formatLastUpdated(pricesLastUpdatedAt)}</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {livePrices.map((price) => (
          <article
            key={price.assetSymbol}
            className="rounded-[1.25rem] border border-[var(--line)] bg-[rgba(238,246,255,0.72)] p-4"
          >
            <p className="eyebrow text-[10px]">{price.assetSymbol}</p>
            <h3 className="mt-2 text-lg text-[var(--text)]">{price.assetName}</h3>
            <p className="mt-4 text-2xl text-[var(--text)]">{formatCurrency(price.currentPrice)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add the `Current Price` column in `src/components/investment/HoldingsTable.tsx`**

Update the header and row:

```tsx
            <th>Current Price</th>
            <th>Value</th>
```

```tsx
              <td className="px-3 py-4 text-[var(--text)]">
                {formatCurrency(holding.currentPrice)}
              </td>
```

- [ ] **Step 3: Update `src/pages/MyInvestmentPage.tsx` to support silent refresh and live prices**

Make these structural changes:

```tsx
import { useEffect, useRef, useState } from 'react';
import LivePricesCard from '../components/investment/LivePricesCard';
```

Add a ref to prevent first-load skeleton from reappearing:

```tsx
  const hasLoadedOnceRef = useRef(false);
```

Replace the existing loader with a reusable fetch function:

```tsx
  useEffect(() => {
    let isMounted = true;

    const load = async ({ background = false } = {}) => {
      if (!background && !hasLoadedOnceRef.current) {
        setIsLoading(true);
      }

      if (!background) {
        setError(null);
      }

      try {
        const response = await fetchMyInvestmentPortfolio();
        if (!isMounted) {
          return;
        }

        setData(response);
        setError(null);
        hasLoadedOnceRef.current = true;
      } catch (err) {
        if (!isMounted) {
          return;
        }

        if (!hasLoadedOnceRef.current) {
          const message =
            err instanceof Error ? err.message : 'Unable to load your investment dashboard.';

          if (message.toLowerCase().includes('portfolio not found')) {
            setData(null);
            setError(null);
          } else {
            setError(message);
          }
        }
      } finally {
        if (isMounted && !background) {
          setIsLoading(false);
        }
      }
    };

    void load();
    const intervalId = window.setInterval(() => {
      void load({ background: true });
    }, 60000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);
```

Render the new card:

```tsx
              <PortfolioSummary summary={data.summary} />
              <LivePricesCard
                livePrices={data.livePrices}
                pricesLastUpdatedAt={data.pricesLastUpdatedAt}
              />
```

- [ ] **Step 4: Re-run the targeted frontend tests and confirm they pass**

Run:

```bash
npm run test:ci -- src/App.test.tsx
```

Expected:

```text
PASS  src/App.test.tsx
```

- [ ] **Step 5: Commit the UI implementation**

```bash
git add src/components/investment/LivePricesCard.tsx src/components/investment/HoldingsTable.tsx src/pages/MyInvestmentPage.tsx src/services/investment.ts src/App.test.tsx
git commit -m "add investor live price dashboard"
```

### Task 5: Run full verification and prepare the branch for production handoff

**Files:**
- Verify: `server/app.js`
- Verify: `server/app.test.js`
- Verify: `src/components/investment/LivePricesCard.tsx`
- Verify: `src/components/investment/HoldingsTable.tsx`
- Verify: `src/pages/MyInvestmentPage.tsx`
- Verify: `src/services/investment.ts`
- Verify: `src/App.test.tsx`

- [ ] **Step 1: Run the full test suite**

Run:

```bash
npm run test:ci
```

Expected:

```text
Test Files  ... passed
Tests  ... passed
```

- [ ] **Step 2: Run the production build**

Run:

```bash
npm run build
```

Expected:

```text
✓ built in ...
```

- [ ] **Step 3: Sanity-check the implementation against the approved spec**

Check:

```text
- Live Prices section appears above the holdings/account split
- Holdings table includes Current Price
- Initial investor load fetches current prices
- Investor page silently refreshes every 60 seconds
- Background refresh failures do not clear the last successful dashboard
```

- [ ] **Step 4: Commit final polish if needed**

```bash
git add server/app.js server/app.test.js src/components/investment/LivePricesCard.tsx src/components/investment/HoldingsTable.tsx src/pages/MyInvestmentPage.tsx src/services/investment.ts src/App.test.tsx
git commit -m "polish investor live price refresh flow"
```
