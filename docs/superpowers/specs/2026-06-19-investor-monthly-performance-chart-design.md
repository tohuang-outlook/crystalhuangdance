# Investor Monthly Performance Chart Design

## Goal

Add a monthly `Portfolio Value` chart to the investor dashboard so investor users can see how the total value of their portfolio changes over time in a calm, easy-to-read format.

The chart should appear on `My Investment` below `Current Holdings` and above `Purchase History`.

## Scope

This feature is only for the investor-facing dashboard in `crystalhuangdance`.

This first version will:

- show one chart for `Portfolio Value`
- use month-end data points
- seed the chart with manually provided historical values for January 2026 through May 2026
- treat the provided May 2026 number as the current seeded month value
- automatically append one new month-end value at the end of each future month
- keep the rest of the dashboard unchanged

This first version will not:

- show unrealized P&L as a separate line
- show multiple chart series
- let admins manually edit chart history in the UI
- backfill older months from reconstructed historical prices
- add export or CSV download for chart data

## User Story

As an investor, when I open `My Investment`, I want to see how my portfolio value has changed month by month so I can quickly understand the overall direction of my account without reading transaction rows one by one.

## Seeded Historical Values

The initial chart history should include these month-end portfolio values:

- `2026-01`: `$45,283.78`
- `2026-02`: `$36,456.40`
- `2026-03`: `$31,754.30`
- `2026-04`: `$32,263.08`
- `2026-05`: `$34,855.04`

These values represent the end-of-month portfolio value for the investor account and should be stored as monthly history records rather than recalculated from old transaction history.

## Chart Behavior

The chart should:

- plot one point per month
- show months in chronological order
- label the x-axis by month, using a short readable format such as `Jan 2026`
- format the y-axis as USD currency
- show a connected line for the monthly values
- show a calm card-style presentation that matches the rest of the investor dashboard

The chart should render even if there are only seeded values and no future snapshots yet.

If there is only one monthly data point in the future for any reason, the chart should still render without breaking layout.

## Data Model

Add persistent monthly history storage for investor portfolios.

Each monthly history record should include:

- unique id
- portfolio id
- month key in `YYYY-MM` format
- month-end value in USD
- snapshot date in ISO date format
- created timestamp
- updated timestamp

There should only be one monthly history record per portfolio per month.

If the system tries to add a new snapshot for a month that already exists, it should update or skip safely instead of creating duplicates.

## Snapshot Rules

The system should support two ways monthly history exists:

1. Seeded historical values
2. Automatically created month-end snapshots

### Seed Rules

When an investor portfolio is loaded and no monthly history exists yet, the app should have a way to ensure the seeded history for `2026-01` through `2026-05` is available for that portfolio.

For this first version, seeding can happen lazily on the server the first time the portfolio history is requested, as long as duplicate seed rows are not created.

### Automatic Month-End Rules

Starting after May 2026, the system should add one new month-end record for each later month.

For this first version, the month-end snapshot can be created lazily when the investor dashboard is requested after a month has ended.

That means:

- if the latest stored month is behind the most recently completed month
- the server should compute the current live portfolio value
- the server should store that value as the month-end record for the missing month

This version only needs to create the latest missing completed month record when the page is visited. It does not need a separate scheduled cron job.

## Source of Future Monthly Values

Future month-end values should come from the same portfolio snapshot logic already used by the investor dashboard summary.

That means the stored monthly value should be based on:

- the current portfolio holdings derived from buy transactions
- the current live market pricing logic already used for the investor dashboard

For this first version, we accept that the stored month-end value is created when the page is opened after month end, using the live portfolio value available at that time. We are not attempting true historical reconstruction for the exact final second of the month.

## API Contract

Extend the investor portfolio response with a new monthly performance array.

Each item should include:

- `month`
- `label`
- `portfolioValue`

Example:

```json
{
  "monthlyPerformance": [
    {
      "month": "2026-01",
      "label": "Jan 2026",
      "portfolioValue": 45283.78
    }
  ]
}
```

This data should be available to:

- `GET /api/investment/me`
- the admin investor portfolio read endpoint if it already mirrors the same portfolio payload

## UI Placement

Add a new chart card section:

- below the `Current Holdings` / account row
- above the `Purchase History` section

The section should include:

- eyebrow label such as `Performance`
- heading such as `Monthly Portfolio Value`
- one chart visual
- a short supporting sentence explaining that values reflect month-end portfolio totals

## Empty and Error States

If monthly performance data is unavailable but the rest of the portfolio loads:

- keep the dashboard visible
- replace the chart with a calm empty state message
- do not crash the page

If seeded data exists, the chart should never be empty for a seeded portfolio.

## Testing Requirements

We should verify:

- seeded month history is returned in the expected order
- duplicate seed rows are not created
- a missing later month can be appended once
- investor dashboard renders the new chart section
- chart appears in the correct position between holdings and purchase history
- chart renders the seeded `Jan 2026` through `May 2026` values
- dashboard remains stable if monthly performance is missing or malformed

## Success Criteria

This feature is complete when:

- investor users see a `Monthly Portfolio Value` chart on `My Investment`
- the chart appears below `Current Holdings` and above `Purchase History`
- the chart initially shows the five provided month-end values from January 2026 through May 2026
- future months can be appended one time per month without duplicates
- the investor page remains stable if chart data cannot be rendered
