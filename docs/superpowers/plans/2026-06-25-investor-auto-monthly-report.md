# Investor Auto Monthly Report Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically generate and save a month-end PDF report for each investor portfolio on the app server filesystem, then expose saved reports for investor download and admin rerun.

**Architecture:** Add a persistent `investment_monthly_reports` index in SQLite, build a server-side month-targeted report payload and PDF file generator, then expose list/download/admin-rerun APIs around that service. Keep the scheduling trigger thin so the core generation logic remains testable without deployment-time cron dependencies.

**Tech Stack:** Express, better-sqlite3, Node.js filesystem APIs, jsPDF, Supertest, Vitest, React, TypeScript

---

## File Map

- Modify: `server/db.js`
  Responsibility: add the monthly report table plus report-related read/upsert queries.
- Modify: `server/app.js`
  Responsibility: add month-targeted report payload helpers, report generation orchestration, investor/admin APIs, and a scheduler-friendly entrypoint.
- Create: `server/investment-report-pdf.js`
  Responsibility: render a PDF file from a server-side report payload and return file metadata.
- Modify: `server/app.test.js`
  Responsibility: cover report generation, idempotent reruns, investor list/download permissions, and admin rerun behavior.
- Modify: `src/services/investment.ts`
  Responsibility: add report list types and fetch/download helpers.
- Create: `src/components/investment/ReportHistoryList.tsx`
  Responsibility: render saved historical monthly reports with statuses and download actions.
- Modify: `src/pages/MyInvestmentPage.tsx`
  Responsibility: load saved report history, use saved report downloads, and present the report list.
- Modify: `src/App.test.tsx`
  Responsibility: verify the investor dashboard renders saved report history and uses the new report endpoints.

## Task 1: Add failing database and server tests for saved monthly reports

**Files:**
- Modify: `server/app.test.js`
- Reference: `server/app.js`
- Reference: `server/db.js`

- [ ] **Step 1: Add a failing test for investor report list and download**

```js
  it('lists and downloads saved monthly reports for the logged-in investor', async () => {
    currentTime = new Date('2026-07-10T12:00:00.000Z');

    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async () => {},
      getInvestmentPrices: async () => ({ BTC: 60000 }),
    });

    const adminAgent = request.agent(app);
    const investorAgent = request.agent(app);

    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const createdUser = await registerUser(investorAgent, 'investor@example.com');
    db.setUserMemberTypeById(createdUser.id, 'investor');
    await loginUser(investorAgent, 'investor@example.com');

    await adminAgent
      .post(`/api/admin/investors/${createdUser.id}/portfolio`)
      .send({ displayName: 'Investor Portfolio' })
      .expect(201);

    await adminAgent
      .post(`/api/admin/investors/${createdUser.id}/portfolio/transactions`)
      .send({
        assetSymbol: 'BTC',
        amountInvested: 5000,
        purchaseShares: 0.1,
        purchaseDate: '2026-05-12',
      })
      .expect(201);

    await adminAgent.post('/api/admin/investment/reports/generate-latest').send({}).expect(200);

    const listResponse = await investorAgent.get('/api/investment/me/reports').expect(200);
    expect(listResponse.body.reports).toEqual([
      expect.objectContaining({
        monthKey: '2026-06',
        status: 'ready',
        fileName: expect.stringContaining('2026-06'),
      }),
    ]);

    const downloadResponse = await investorAgent
      .get('/api/investment/me/reports/2026-06/download')
      .expect(200);

    expect(downloadResponse.headers['content-type']).toContain('application/pdf');
    expect(downloadResponse.headers['content-disposition']).toContain('2026-06');
  });
```

- [ ] **Step 2: Add a failing test for admin rerun idempotency**

```js
  it('regenerates the latest completed month report idempotently', async () => {
    currentTime = new Date('2026-07-10T12:00:00.000Z');

    app = createApp({
      db,
      sessionSecret: 'test-session-secret',
      config,
      now: () => currentTime,
      sendPasswordResetEmail: async () => {},
      getInvestmentPrices: async () => ({ BTC: 60000 }),
    });

    const adminAgent = request.agent(app);
    const investorAgent = request.agent(app);

    await registerUser(adminAgent, 'admin@example.com');
    promoteUserToAdmin(db, 'admin@example.com');
    await loginUser(adminAgent, 'admin@example.com');

    const createdUser = await registerUser(investorAgent, 'investor@example.com');
    db.setUserMemberTypeById(createdUser.id, 'investor');

    await adminAgent
      .post(`/api/admin/investors/${createdUser.id}/portfolio`)
      .send({ displayName: 'Investor Portfolio' })
      .expect(201);

    await adminAgent
      .post(`/api/admin/investors/${createdUser.id}/portfolio/transactions`)
      .send({
        assetSymbol: 'BTC',
        amountInvested: 5000,
        purchaseShares: 0.1,
        purchaseDate: '2026-05-12',
      })
      .expect(201);

    const firstRun = await adminAgent.post('/api/admin/investment/reports/generate-latest').send({});
    const secondRun = await adminAgent.post('/api/admin/investment/reports/generate-latest').send({});

    expect(firstRun.status).toBe(200);
    expect(secondRun.status).toBe(200);
    expect(secondRun.body.summary.updated + secondRun.body.summary.generated).toBeGreaterThanOrEqual(1);
  });
```

- [ ] **Step 3: Run the focused server tests and confirm they fail**

Run:

```bash
npm run test:ci -- server/app.test.js
```

Expected:

- FAIL because saved report endpoints do not exist
- FAIL because there is no persistent monthly report table

- [ ] **Step 4: Commit the red tests**

```bash
git add server/app.test.js
git commit -m "test investor auto monthly reports"
```

## Task 2: Add monthly report persistence to SQLite

**Files:**
- Modify: `server/db.js`
- Test: `server/app.test.js`

- [ ] **Step 1: Add the `investment_monthly_reports` table**

Add this block after `investment_monthly_history`:

```js
  db.exec(`
    CREATE TABLE IF NOT EXISTS investment_monthly_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      portfolio_id INTEGER NOT NULL REFERENCES investment_portfolios(id) ON DELETE CASCADE,
      month_key TEXT NOT NULL,
      snapshot_date TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ready',
      generated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      error_message TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (portfolio_id, month_key)
    )
  `);
```

- [ ] **Step 2: Add report statements to `server/db.js`**

Add these statements to `statements`:

```js
    listInvestmentMonthlyReportsByPortfolioId: db.prepare(
      `SELECT
         id,
         portfolio_id AS portfolioId,
         month_key AS monthKey,
         snapshot_date AS snapshotDate,
         file_name AS fileName,
         file_path AS filePath,
         status,
         generated_at AS generatedAt,
         error_message AS errorMessage,
         created_at AS createdAt,
         updated_at AS updatedAt
       FROM investment_monthly_reports
       WHERE portfolio_id = ?
       ORDER BY month_key DESC, id DESC`
    ),
    findInvestmentMonthlyReportByPortfolioIdAndMonth: db.prepare(
      `SELECT
         id,
         portfolio_id AS portfolioId,
         month_key AS monthKey,
         snapshot_date AS snapshotDate,
         file_name AS fileName,
         file_path AS filePath,
         status,
         generated_at AS generatedAt,
         error_message AS errorMessage,
         created_at AS createdAt,
         updated_at AS updatedAt
       FROM investment_monthly_reports
       WHERE portfolio_id = ? AND month_key = ?`
    ),
    upsertInvestmentMonthlyReport: db.prepare(
      `INSERT INTO investment_monthly_reports (
         portfolio_id,
         month_key,
         snapshot_date,
         file_name,
         file_path,
         status,
         error_message
       ) VALUES (
         @portfolioId,
         @monthKey,
         @snapshotDate,
         @fileName,
         @filePath,
         @status,
         @errorMessage
       )
       ON CONFLICT(portfolio_id, month_key) DO UPDATE SET
         snapshot_date = excluded.snapshot_date,
         file_name = excluded.file_name,
         file_path = excluded.file_path,
         status = excluded.status,
         error_message = excluded.error_message,
         generated_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
       RETURNING
         id,
         portfolio_id AS portfolioId,
         month_key AS monthKey,
         snapshot_date AS snapshotDate,
         file_name AS fileName,
         file_path AS filePath,
         status,
         generated_at AS generatedAt,
         error_message AS errorMessage,
         created_at AS createdAt,
         updated_at AS updatedAt`
    )
```

- [ ] **Step 3: Run the focused server tests again**

Run:

```bash
npm run test:ci -- server/app.test.js
```

Expected:

- FAIL now moves to missing generation logic or missing endpoints

- [ ] **Step 4: Commit the schema and query layer**

```bash
git add server/db.js
git commit -m "add investment monthly report persistence"
```

## Task 3: Add server-side monthly report generation

**Files:**
- Create: `server/investment-report-pdf.js`
- Modify: `server/app.js`
- Test: `server/app.test.js`

- [ ] **Step 1: Create a server PDF writer module**

Create `server/investment-report-pdf.js` with a minimal interface:

```js
import fs from 'fs/promises';
import path from 'path';
import { jsPDF } from 'jspdf';

export async function writeInvestmentMonthlyReportPdf({
  outputPath,
  reportData,
  buildPdfDocument,
}) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  const { doc } = buildPdfDocument(reportData);
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  await fs.writeFile(outputPath, pdfBuffer);

  return {
    outputPath,
    fileName: path.basename(outputPath),
  };
}
```

- [ ] **Step 2: Add server-side month helpers in `server/app.js`**

Add helpers for:

```js
function getLatestCompletedMonthKey(currentDate) {
  const year = currentDate.getUTCFullYear();
  const month = currentDate.getUTCMonth();
  const completed = new Date(Date.UTC(year, month, 0));
  return completed.toISOString().slice(0, 7);
}

function getMonthSnapshotDate(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}
```

- [ ] **Step 3: Add a month-targeted report generation service in `server/app.js`**

Implement a function with this shape:

```js
async function generateInvestmentMonthlyReport({
  db,
  portfolio,
  monthKey,
  now,
  storageRoot,
  getInvestmentPrices,
  getInvestmentPricesLastUpdatedAt,
  buildPdfDocument,
}) {
  const transactions = db.listInvestmentTransactionsByPortfolioId(portfolio.id);
  if (transactions.length === 0) {
    return { status: 'skipped', reason: 'no-transactions' };
  }

  ensureSeededInvestmentMonthlyHistory(db, portfolio.id);

  const liveSymbols = [...new Set(transactions.map((transaction) => transaction.assetSymbol))];
  const { livePricesBySymbol, livePrices, pricesLastUpdatedAt } =
    await runWithInvestmentPricingRequestState(() =>
      loadInvestmentPricing(liveSymbols, getInvestmentPrices, getInvestmentPricesLastUpdatedAt)
    );

  const snapshot = buildPortfolioSnapshot(transactions, livePricesBySymbol);
  const monthlyHistory = appendLatestCompletedMonthSnapshot({
    db,
    portfolioId: portfolio.id,
    summary: snapshot.summary,
    now,
  });

  const reportMonthHistory = monthlyHistory.find((entry) => entry.month === monthKey);
  if (!reportMonthHistory) {
    return { status: 'skipped', reason: 'missing-month-history' };
  }

  const reportData = {
    portfolio: serializeInvestmentPortfolio(portfolio),
    summary: snapshot.summary,
    holdings: snapshot.holdings,
    transactions: [],
    livePrices,
    pricesLastUpdatedAt,
    monthlyPerformance: serializeInvestmentMonthlyPerformance(
      monthlyHistory.filter((entry) => entry.month <= monthKey)
    ),
  };

  const relativePath = path.join('investment-reports', String(portfolio.id), `${monthKey}.pdf`);
  const absolutePath = path.join(storageRoot, relativePath);
  const fileName = `${monthKey}-${(portfolio.displayName || 'investor-portfolio')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')}.pdf`;

  await writeInvestmentMonthlyReportPdf({
    outputPath: absolutePath,
    reportData,
    buildPdfDocument,
  });

  const reportRow = db.upsertInvestmentMonthlyReport({
    portfolioId: portfolio.id,
    monthKey,
    snapshotDate: reportMonthHistory.snapshotDate,
    fileName,
    filePath: relativePath,
    status: 'ready',
    errorMessage: null,
  });

  return { status: 'ready', report: reportRow };
}
```

- [ ] **Step 4: Run the focused server tests again**

Run:

```bash
npm run test:ci -- server/app.test.js
```

Expected:

- FAIL now moves to missing investor/admin endpoints or missing file download behavior

- [ ] **Step 5: Commit the server generation service**

```bash
git add server/investment-report-pdf.js server/app.js
git commit -m "add server investment monthly report generator"
```

## Task 4: Add investor and admin monthly report endpoints

**Files:**
- Modify: `server/app.js`
- Test: `server/app.test.js`

- [ ] **Step 1: Add investor report list endpoint**

Add:

```js
  app.get('/api/investment/me/reports', requireInvestor, (req, res) => {
    const portfolio = db.findInvestmentPortfolioByUserId(req.session.user.id);

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found.' });
    }

    const reports = db.listInvestmentMonthlyReportsByPortfolioId(portfolio.id).map((report) => ({
      monthKey: report.monthKey,
      label: new Intl.DateTimeFormat('en-US', {
        month: 'short',
        year: 'numeric',
      }).format(new Date(`${report.monthKey}-01T12:00:00Z`)),
      snapshotDate: report.snapshotDate,
      status: report.status,
      generatedAt: report.generatedAt,
      fileName: report.fileName,
    }));

    return res.json({ reports });
  });
```

- [ ] **Step 2: Add investor report download endpoint**

Add:

```js
  app.get('/api/investment/me/reports/:monthKey/download', requireInvestor, async (req, res) => {
    const portfolio = db.findInvestmentPortfolioByUserId(req.session.user.id);

    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found.' });
    }

    const monthKey = String(req.params.monthKey ?? '').trim();
    if (!/^\d{4}-\d{2}$/.test(monthKey)) {
      return res.status(400).json({ error: 'A valid report month is required.' });
    }

    const report = db.findInvestmentMonthlyReportByPortfolioIdAndMonth(portfolio.id, monthKey);
    if (!report || report.status !== 'ready') {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const absolutePath = path.join(reportStorageRoot, report.filePath);
    return res.download(absolutePath, report.fileName);
  });
```

- [ ] **Step 3: Add admin rerun endpoint**

Add:

```js
  app.post('/api/admin/investment/reports/generate-latest', requireAdmin, async (_req, res) => {
    const monthKey = getLatestCompletedMonthKey(now());
    const portfolios = db.listInvestmentPortfoliosForInvestors();
    let generated = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const portfolio of portfolios) {
      try {
        const existing = db.findInvestmentMonthlyReportByPortfolioIdAndMonth(portfolio.id, monthKey);
        const result = await generateInvestmentMonthlyReport({
          db,
          portfolio,
          monthKey,
          now: now(),
          storageRoot: reportStorageRoot,
          getInvestmentPrices,
          getInvestmentPricesLastUpdatedAt,
          buildPdfDocument: createInvestmentReportPdfDocument,
        });

        if (result.status === 'ready') {
          if (existing) {
            updated += 1;
          } else {
            generated += 1;
          }
        } else {
          skipped += 1;
        }
      } catch (error) {
        failed += 1;
      }
    }

    return res.json({
      monthKey,
      summary: { generated, updated, skipped, failed },
    });
  });
```

- [ ] **Step 4: Run server tests and make sure they pass**

Run:

```bash
npm run test:ci -- server/app.test.js
```

Expected:

- PASS for new report list/download/rerun tests

- [ ] **Step 5: Commit the API layer**

```bash
git add server/app.js server/app.test.js
git commit -m "add investor monthly report endpoints"
```

## Task 5: Add investor dashboard report history UI

**Files:**
- Modify: `src/services/investment.ts`
- Create: `src/components/investment/ReportHistoryList.tsx`
- Modify: `src/pages/MyInvestmentPage.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Extend investment service types and helpers**

Add to `src/services/investment.ts`:

```ts
export interface InvestmentMonthlyReportRecord {
  monthKey: string;
  label: string;
  snapshotDate: string;
  status: 'ready' | 'failed';
  generatedAt: string;
  fileName: string;
}

export async function fetchMyInvestmentReports() {
  const response = await fetch(`${apiBaseUrl}/api/investment/me/reports`, {
    credentials: 'include',
  });

  if (!response.ok) {
    await parseError(response);
  }

  const payload = (await response.json()) as { reports?: InvestmentMonthlyReportRecord[] };
  return Array.isArray(payload.reports) ? payload.reports : [];
}

export function downloadMyInvestmentReport(monthKey: string) {
  window.open(`${apiBaseUrl}/api/investment/me/reports/${monthKey}/download`, '_blank', 'noopener');
}
```

- [ ] **Step 2: Create the report history list component**

Create `src/components/investment/ReportHistoryList.tsx`:

```tsx
import type { InvestmentMonthlyReportRecord } from '../../services/investment';

export default function ReportHistoryList({
  reports,
  onDownload,
}: {
  reports: InvestmentMonthlyReportRecord[];
  onDownload: (monthKey: string) => void;
}) {
  if (reports.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-6 text-sm text-[var(--text-muted)]">
        No saved monthly reports yet.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {reports.map((report) => (
        <div
          key={report.monthKey}
          className="flex flex-col gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="eyebrow">{report.monthKey}</p>
            <h3 className="mt-2 text-xl text-[var(--text)]">{report.label} Report</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Snapshot date: {report.snapshotDate}
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center rounded-full bg-[var(--text)] px-4 py-2 text-xs uppercase tracking-[0.22em] text-white transition hover:bg-[var(--text-muted)]"
            onClick={() => onDownload(report.monthKey)}
            type="button"
          >
            Download PDF
          </button>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Load and render saved reports in `MyInvestmentPage.tsx`**

Add the new fetch to the existing load flow:

```tsx
  const [reports, setReports] = useState<InvestmentMonthlyReportRecord[]>([]);
```

Inside `load()`:

```tsx
        const [portfolioResponse, reportResponse] = await Promise.all([
          fetchMyInvestmentPortfolio(),
          fetchMyInvestmentReports(),
        ]);

        setData(portfolioResponse);
        setReports(reportResponse);
```

Replace the current report download handler:

```tsx
  const handleDownloadReport = async (monthKey?: string) => {
    if (monthKey) {
      downloadMyInvestmentReport(monthKey);
      return;
    }

    if (!data || isDownloadingReport) {
      return;
    }

    setIsDownloadingReport(true);
    try {
      downloadInvestmentReportPdf(data);
    } finally {
      setIsDownloadingReport(false);
    }
  };
```

Render a saved report section below the page intro:

```tsx
              <section className="mt-8 rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-6 shadow-[0_16px_40px_rgba(68,102,136,0.08)]">
                <p className="eyebrow">Monthly Reports</p>
                <h2 className="mt-4 text-3xl text-[var(--text)]">Saved Reports</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                  Download previously generated month-end reports from the saved archive.
                </p>
                <ReportHistoryList reports={reports} onDownload={(monthKey) => void handleDownloadReport(monthKey)} />
              </section>
```

- [ ] **Step 4: Add a dashboard test for saved report history**

Add to `src/App.test.tsx`:

```tsx
  it('renders saved investor monthly reports and download actions', async () => {
    fetchMock.mockImplementation((input) => {
      const url = String(input);
      if (url.endsWith('/api/investment/me/reports')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              reports: [
                {
                  monthKey: '2026-06',
                  label: 'Jun 2026',
                  snapshotDate: '2026-06-30',
                  status: 'ready',
                  generatedAt: '2026-07-01T00:10:00.000Z',
                  fileName: '2026-06-investor-portfolio.pdf',
                },
              ],
            })
          )
        );
      }
      return Promise.resolve(new Response(JSON.stringify(investorPortfolioFixture)));
    });

    renderAppAt('/investment');

    expect(await screen.findByText('Saved Reports')).toBeInTheDocument();
    expect(screen.getByText('Jun 2026 Report')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
  });
```

- [ ] **Step 5: Run the focused frontend tests**

Run:

```bash
npm run test:ci -- src/App.test.tsx
```

Expected:

- PASS for the new saved report history coverage

- [ ] **Step 6: Commit the investor report history UI**

```bash
git add src/services/investment.ts src/components/investment/ReportHistoryList.tsx src/pages/MyInvestmentPage.tsx src/App.test.tsx
git commit -m "add investor saved monthly report history"
```

## Task 6: Final verification and scheduler handoff

**Files:**
- Modify: `server/app.js`
- Optional: deployment docs or script file if needed

- [ ] **Step 1: Add a scheduler-friendly trigger surface**

If the deployment needs a dedicated route, add:

```js
  app.post('/internal/jobs/investment-reports/generate-latest', (req, res, next) => {
    if (req.get('x-cron-secret') !== config.cronSecret) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return app._router.handle(
      { ...req, url: '/api/admin/investment/reports/generate-latest', method: 'POST' },
      res,
      next
    );
  });
```

If that pattern feels too indirect during implementation, call the shared generator function directly instead.

- [ ] **Step 2: Run the full test suite**

Run:

```bash
npm run test:ci
```

Expected:

- PASS with no regressions

- [ ] **Step 3: Run the production build**

Run:

```bash
npm run build
```

Expected:

- PASS and emit the Vite build output

- [ ] **Step 4: Commit the final scheduler-ready integration**

```bash
git add server/app.js server/app.test.js src/services/investment.ts src/components/investment/ReportHistoryList.tsx src/pages/MyInvestmentPage.tsx src/App.test.tsx docs/superpowers/plans/2026-06-25-investor-auto-monthly-report.md
git commit -m "complete investor auto monthly report flow"
```

## Self-Review

- Spec coverage check:
  - persistent report index table: covered by Task 2
  - local filesystem storage: covered by Task 3
  - month-targeted generation service: covered by Task 3
  - batch latest-month generation: covered by Task 4 and Task 6
  - investor list/download APIs: covered by Task 4
  - admin rerun endpoint: covered by Task 4
  - investor dashboard history UI: covered by Task 5
- Placeholder scan:
  - removed generic "add validation" phrasing and replaced with concrete routes, SQL, and test examples
- Type consistency:
  - `monthKey`, `snapshotDate`, `fileName`, and `status` are used consistently across DB, API, and UI tasks
