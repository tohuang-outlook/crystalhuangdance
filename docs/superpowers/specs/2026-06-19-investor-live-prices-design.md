# Investor Live Prices Design

## Goal

Add real-time crypto price information to the investor dashboard so investor users can see current market prices when they open `My Investment`, with the page refreshing prices automatically every 60 seconds.

## Scope

This design covers the investor-facing dashboard only. It adds market price visibility to the existing portfolio experience without changing admin transaction entry flows, portfolio permissions, or the current monthly report workflow.

## User Experience

When an investor opens `My Investment`, the page should:

- Fetch the latest supported crypto prices immediately
- Show a `Live Prices` card section near the top of the page
- Show a `Current Price` column in the holdings table
- Recalculate portfolio value and unrealized P&L using the newest prices
- Display a `Last updated` timestamp so the investor knows when prices were refreshed
- Refresh the investment snapshot automatically every 60 seconds without replacing the whole page with a loading state

If price refresh fails, the dashboard should stay usable. Existing portfolio data should remain on screen, and the failure should not cause a white screen or wipe the holdings list.

## Supported Assets

The live pricing experience will support the same fixed asset symbols already used by the investment tracker:

- `BTC`
- `ETH`
- `ADA`
- `XRP`
- `SOL`
- `DOGE`

These symbols should map to CoinGecko coin identifiers on the server. Unsupported symbols should not appear in normal admin entry because transaction creation is already restricted to the fixed asset list.

## Recommended Architecture

Use server-side price fetching rather than calling CoinGecko directly from the browser.

### Why this approach

- Keeps third-party integration details off the client
- Centralizes error handling and response normalization
- Preserves a clean upgrade path to server-side caching later
- Reuses the existing `/api/investment/me` and admin portfolio response flow, where holdings and summary are already derived from live prices

### Data flow

1. Investor opens `My Investment`
2. Frontend calls the existing investment portfolio endpoint
3. Server looks at portfolio transactions and collects the unique asset symbols in the portfolio
4. Server requests current USD prices for those symbols from CoinGecko
5. Server builds the portfolio snapshot using those prices
6. Server returns:
   - portfolio metadata
   - summary
   - holdings with `currentPrice`
   - transactions
   - a `livePrices` collection for the top-of-page card UI
   - a `pricesLastUpdatedAt` timestamp for the successful price fetch
7. Frontend renders the response and schedules a silent refresh every 60 seconds

## API Changes

Extend the investor portfolio response envelope to include live price metadata.

### Response additions

- `livePrices`: array of supported asset price records for the current snapshot
- `pricesLastUpdatedAt`: ISO timestamp for the most recent successful server-side market price fetch

### Live price record shape

Each live price record should include:

- `assetSymbol`
- `assetName`
- `currentPrice`

This data is separate from holdings so the top summary card can show prices even if a user has no position in every supported asset, depending on the server’s chosen set of fetched symbols. For this first version, the server may restrict `livePrices` to symbols present in the investor portfolio to keep the request small and aligned with visible holdings.

## Frontend Behavior

### Initial load

- Keep the existing loading experience for the first fetch only
- Render the current dashboard once data arrives

### Refresh loop

- Start a `setInterval` after the first successful render
- Re-fetch the investment snapshot every 60 seconds
- Update data in place without flashing the main loading placeholder again
- Clear the interval when the page unmounts

### Error handling

- If the first request fails entirely, show the existing page error state
- If a later refresh fails, keep the previously rendered dashboard data
- Do not replace the whole dashboard with an error state on background refresh failure
- This first implementation may fail silently during background refresh as long as the last successful dashboard data remains visible

## UI Changes

### Top section

Add a `Live Prices` card group near the top of `My Investment`, above the holdings/account split and below the summary cards.

The block should show:

- Supported symbol
- Friendly asset name
- Current USD price
- `Last updated` timestamp for the price set

The visual style should match the existing soft investor dashboard cards rather than looking like an exchange terminal.

### Holdings table

Add a `Current Price` column between `Invested` and `Value`.

The table row should continue to show:

- asset symbol
- asset name
- allocation percent
- quantity
- invested
- current price
- current value
- unrealized P&L

## CoinGecko Integration

Use CoinGecko as the first provider.

### Request strategy

- Request simple USD prices for the relevant supported coins
- Map CoinGecko IDs to the supported asset symbols in server code
- Only fetch the symbols required for the current snapshot when possible

### Failure behavior

If CoinGecko fails or returns incomplete data:

- Treat missing prices as `0` for snapshot math, consistent with the current behavior
- Still return a valid JSON response
- Set `pricesLastUpdatedAt` only when a successful price response is received
- Return any successfully resolved symbol prices in `livePrices`

This keeps the dashboard resilient while still making degraded data states understandable.

## Testing Strategy

### Server tests

Add or update server tests to verify:

- investor portfolio responses include `livePrices`
- investor portfolio responses include `pricesLastUpdatedAt` when price fetching succeeds
- holdings still derive `currentPrice`, `currentValue`, and P&L from fetched market data
- price fetch failures do not break the investment endpoint

### Frontend tests

Add or update UI tests to verify:

- `My Investment` renders the `Live Prices` section from API data
- `HoldingsTable` renders the new `Current Price` column
- investor page background refresh updates rendered values without re-entering the first-load placeholder state

## Out of Scope

This phase does not include:

- second-by-second websocket streaming
- user-configurable refresh intervals
- historical charts
- price alerts
- provider failover across multiple pricing APIs
- persistent server-side price caching

## Future Upgrade Path

If the investor dashboard later needs better scalability, this design can evolve into a cached server-side price service by replacing direct CoinGecko fetches with a small in-memory or database-backed cache layer. The client contract can stay mostly unchanged if `livePrices` and `pricesLastUpdatedAt` remain part of the response.
