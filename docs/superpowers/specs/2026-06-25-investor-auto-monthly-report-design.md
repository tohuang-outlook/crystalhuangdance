# Investor Auto Monthly Report Design

## Goal

Add a real month-end report pipeline for investor portfolios so the system automatically locks a completed month, generates a PDF report for that month, stores the PDF on the app server filesystem, and lets the investor download the saved historical report later.

This closes the current gap where:

- `monthlyPerformance` is only appended lazily when someone opens the portfolio page
- PDF reports are generated only when a user clicks `Download Monthly Report`
- historical reports are not fixed artifacts and can drift with current pricing data

## Scope

### In scope

- persist generated investor monthly report metadata in the database
- store generated PDF files on the local server filesystem
- add a reusable server-side report generation flow for a specific portfolio and month
- add a job entrypoint that generates the latest completed month for all investor portfolios
- expose investor report list and report download APIs
- expose an admin-only manual rerun endpoint for the latest completed month
- keep existing on-demand PDF rendering logic as a base, but move shared report building logic to code that can run on the server

### Out of scope

- automatic email delivery
- external object storage
- end-user UI polishing for report history beyond basic listing/download support
- retroactive regeneration UI for arbitrary past months
- background queue infrastructure beyond a simple scheduled job trigger

## Current State

### Data

- `investment_monthly_history` stores month-end portfolio values
- historical seed data exists for older months
- the latest completed month is appended via `appendLatestCompletedMonthSnapshot(...)`
- that append runs only when portfolio APIs are requested

### PDF generation

- PDF generation currently happens in the browser via `downloadInvestmentReportPdf(data)`
- the PDF is built from the current API response, not from a frozen server-side report snapshot

### Gap

There is no system-owned report artifact for a month such as "May 2026 report for portfolio 12". There is only current API data plus a client-side PDF renderer.

## Recommended Approach

Use local filesystem storage plus a month-end server generation pipeline.

### Why this approach

- fastest path from current codebase to working automation
- avoids overloading SQLite with binary PDF blobs
- keeps future migration to object storage straightforward
- preserves historical reports as fixed files
- allows manual reruns when a scheduled run fails

## Data Model

Add a new table:

### `investment_monthly_reports`

- `id INTEGER PRIMARY KEY AUTOINCREMENT`
- `portfolio_id INTEGER NOT NULL REFERENCES investment_portfolios(id) ON DELETE CASCADE`
- `month_key TEXT NOT NULL`
  - format: `YYYY-MM`
- `snapshot_date TEXT NOT NULL`
  - expected to be the last day of the reported month, for example `2026-06-30`
- `file_name TEXT NOT NULL`
- `file_path TEXT NOT NULL`
  - path relative to a known report storage root, not an absolute path
- `status TEXT NOT NULL DEFAULT 'ready'`
  - first version supports `ready` and `failed`
- `generated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `error_message TEXT`
  - nullable; populated only when a generation attempt fails
- `created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP`
- `UNIQUE (portfolio_id, month_key)`

### Notes

- `investment_monthly_history` remains the source of month-end value series
- `investment_monthly_reports` becomes the index of saved PDF artifacts
- storing relative paths keeps future storage migration simpler

## Filesystem Layout

Store PDFs under a dedicated app-managed directory, for example:

`storage/investment-reports/<portfolioId>/<month-key>.pdf`

Example:

`storage/investment-reports/12/2026-06.pdf`

Rules:

- create directories recursively when missing
- overwrite the same file when rerunning a month
- treat the database row as the source of truth for discoverability

## Report Snapshot Rules

For a given report month:

- `summary`, `holdings`, and `allocation` should use the frozen month-end pricing snapshot for that month, not current live prices
- `monthlyPerformance` should include all available historical month-end values through the report month
- the report label should match the report month being generated

This requires a server-side report payload builder that works from a target month rather than from "now".

## Architecture Changes

### 1. Extract server-safe PDF generation

Move report construction into shared logic that can be called from the server.

Recommended split:

- shared report payload builder: constructs report data for a portfolio and month
- server PDF writer: renders a PDF file to disk from that payload
- client download action: either downloads a saved server report or falls back only where appropriate

The current browser-only `jspdf` implementation should not remain the only report path. The month-end automation needs a server-owned generation path.

### 2. Add month-targeted report generation service

Introduce a server function with a shape like:

- `generateInvestmentMonthlyReport({ portfolioId, monthKey })`

Responsibilities:

- validate the target portfolio exists
- ensure the relevant month-end history exists
- build the frozen report payload for that month
- render the PDF
- save the file
- upsert the `investment_monthly_reports` row

### 3. Add batch generator for the latest completed month

Introduce a job function with a shape like:

- `generateLatestCompletedInvestmentReports()`

Responsibilities:

- determine the latest completed month from `now`
- fetch all investor portfolios
- skip portfolios with no transactions if desired, or generate a zero-value report if we want consistency
- generate one report per portfolio
- continue processing other portfolios if one fails
- return a summary of successes and failures

## Scheduling Strategy

### First version

Build the generation function and a manual trigger first.

Then wire it to a scheduler entrypoint suitable for Railway or the deployment platform.

This keeps the core logic independent from the hosting scheduler.

### Scheduler contract

The scheduled trigger should run once shortly after month-end rollover, for example:

- on the first day of the month shortly after midnight UTC or the chosen business timezone

The exact schedule can be configured later, but the core generator should accept an injected `now` value for deterministic behavior and tests.

## API Design

### Investor report list

`GET /api/investment/me/reports`

Returns:

- `monthKey`
- `label`
- `snapshotDate`
- `status`
- `generatedAt`
- `fileName`

Purpose:

- show available historical monthly reports
- drive download links in the investor dashboard

### Investor report download

`GET /api/investment/me/reports/:monthKey/download`

Behavior:

- verify the requesting investor owns the portfolio
- load the matching `investment_monthly_reports` row
- return the PDF file as an attachment
- return `404` if the report does not exist

### Admin manual rerun

`POST /api/admin/investment/reports/generate-latest`

Behavior:

- admin-only
- generates or regenerates reports for the latest completed month
- returns counts of generated, updated, skipped, and failed reports

This is the operational safety valve if an automated run fails.

## Failure Handling

### Per-portfolio failures

If one investor report fails:

- mark that portfolio/month row as `failed`
- record `error_message`
- continue processing other portfolios

### Missing data

If the portfolio has no transactions or no resolvable month-end snapshot:

- choose a consistent behavior for v1
- recommendation: skip generation and record nothing unless a report is expected for that portfolio

### Regeneration

If the same month is generated again:

- overwrite the PDF file
- upsert the existing `investment_monthly_reports` row
- update `generated_at`, `updated_at`, and clear old errors

## Security

- investor report list/download endpoints must only expose reports belonging to the logged-in investor
- file downloads should always resolve through the database row, not arbitrary filesystem path input
- `monthKey` must be validated to `YYYY-MM`
- admin trigger endpoint must stay admin-only

## Testing Strategy

### Database tests

- creates and upserts `investment_monthly_reports`
- enforces one row per portfolio/month

### Service tests

- generates a PDF file for a specific portfolio and month
- regenerates the same month idempotently
- marks failures without stopping the whole batch

### API tests

- investor can list only their own reports
- investor can download only their own reports
- missing month returns `404`
- non-investor access is rejected
- admin rerun endpoint is protected and works

### Scheduler/job tests

- latest completed month is chosen correctly
- batch run processes multiple investors
- one failure does not abort the batch

## Rollout Plan

### Phase 1

- add database table and statements
- add server-side report generation service
- add investor list/download endpoints
- add admin manual rerun endpoint

### Phase 2

- wire deployment scheduler to call the batch generation job
- verify generated files land in the expected local storage path

### Phase 3

- optionally replace current "download current report" button behavior with "download latest saved month report" plus a separate current preview flow if needed

## Open Decisions Resolved

- storage location: local server filesystem
- automation target: auto-generate saved PDFs, not just lazy history updates
- investor delivery: download from saved reports, not email

## Recommendation

Implement the server-side report generation service first, then the report metadata table, then the investor/admin APIs, and only after that wire the scheduled trigger. This sequence keeps the hardest logic testable before we add deployment-time scheduling concerns.
