# Investor Report Center And Notes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an admin monthly report center for all investor portfolios, plus month-specific investor-facing notes and admin-only notes that can be reviewed, edited, regenerated, and rendered into saved PDF reports.

**Architecture:** Extend the existing `investment_monthly_reports` record so each saved month can carry two note streams: an investor-facing note that appears in investor UI and PDF, and an admin-only internal note that stays in the admin console. Build a report-center API around saved reports rather than around live portfolio snapshots, then add admin tooling for month selection, regenerate/download actions, and note editing. Keep the cron generation flow intact by having it create or update the saved monthly report record for the latest completed month, while admin tools can manage any saved month directly.

**Tech Stack:** Express, better-sqlite3, Node.js filesystem APIs, jsPDF, React, TypeScript, Vitest, Supertest, Testing Library

---

## File Map

- Modify: `server/db.js`
  Responsibility: add report-center queries plus persisted `investorNote` and `adminNote` fields on `investment_monthly_reports`.
- Modify: `server/app.js`
  Responsibility: expose admin report-center APIs, allow note updates and month-targeted regeneration, and include investor-facing notes in investor report responses.
- Modify: `server/investment-report-pdf.js`
  Responsibility: render the investor-facing note from the saved monthly report record instead of only the portfolio-level note.
- Modify: `server/app.test.js`
  Responsibility: cover admin report-center listing, note updates, month-targeted regeneration, and investor visibility rules.
- Modify: `src/services/investment.ts`
  Responsibility: include investor-facing notes in investor report types and responses.
- Modify: `src/services/admin.ts`
  Responsibility: add report-center list, update-note, regenerate, and download helpers.
- Create: `src/components/investment/AdminReportCenter.tsx`
  Responsibility: render grouped investor report history, month actions, and note editors for admins.
- Create: `src/components/investment/InvestorReportNoteCard.tsx`
  Responsibility: render the currently selected investor-facing monthly note in the investor dashboard.
- Modify: `src/pages/AdminPage.tsx`
  Responsibility: mount the report center UI and wire note/update/regenerate workflows.
- Modify: `src/pages/MyInvestmentPage.tsx`
  Responsibility: show the latest investor-facing monthly note alongside saved reports.
- Modify: `src/App.test.tsx`
  Responsibility: verify report-center admin controls and investor note visibility.

## Task 1: Write the failing backend tests for report center and monthly notes

**Files:**
- Modify: `server/app.test.js`
- Reference: `server/app.js`
- Reference: `server/db.js`

- [ ] **Step 1: Add a failing admin report-center listing test**

```js
  it('lists saved investor reports for admins across portfolios', async () => {
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

    const createdUser = await registerUser(investorAgent, 'jennifer@example.com');
    db.setUserMemberTypeById(createdUser.id, 'investor');

    await adminAgent
      .post(`/api/admin/investors/${createdUser.id}/portfolio`)
      .send({ displayName: 'Jennifer Portfolio' })
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

    const response = await adminAgent.get('/api/admin/investment/reports').expect(200);

    expect(response.body.reports).toEqual([
      expect.objectContaining({
        investorEmail: 'jennifer@example.com',
        portfolioDisplayName: 'Jennifer Portfolio',
        monthKey: '2026-06',
        status: 'ready',
      }),
    ]);
  });
```

- [ ] **Step 2: Add a failing note update test**

```js
  it('lets admins save investor-facing and admin-only notes on a monthly report', async () => {
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

    const createdUser = await registerUser(investorAgent, 'jennifer@example.com');
    db.setUserMemberTypeById(createdUser.id, 'investor');
    await loginUser(investorAgent, 'jennifer@example.com');

    await adminAgent
      .post(`/api/admin/investors/${createdUser.id}/portfolio`)
      .send({ displayName: 'Jennifer Portfolio' })
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

    const updateResponse = await adminAgent
      .patch('/api/admin/investment/reports/2026-06/1')
      .send({
        investorNote: 'Stayed patient during June volatility.',
        adminNote: 'Review ETH sizing before next rebalance.',
      })
      .expect(200);

    expect(updateResponse.body.report).toEqual(
      expect.objectContaining({
        investorNote: 'Stayed patient during June volatility.',
        adminNote: 'Review ETH sizing before next rebalance.',
      })
    );

    const investorReportList = await investorAgent.get('/api/investment/me/reports').expect(200);
    expect(investorReportList.body.reports).toEqual([
      expect.objectContaining({
        investorNote: 'Stayed patient during June volatility.',
      }),
    ]);
    expect(investorReportList.body.reports[0].adminNote).toBeUndefined();
  });
```

- [ ] **Step 3: Add a failing month-targeted regeneration test**

```js
  it('lets admins regenerate a specific saved month report', async () => {
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

    const createdUser = await registerUser(investorAgent, 'jennifer@example.com');
    db.setUserMemberTypeById(createdUser.id, 'investor');

    await adminAgent
      .post(`/api/admin/investors/${createdUser.id}/portfolio`)
      .send({ displayName: 'Jennifer Portfolio' })
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

    const response = await adminAgent
      .post('/api/admin/investment/reports/2026-06/1/regenerate')
      .send({})
      .expect(200);

    expect(response.body.report).toEqual(
      expect.objectContaining({
        monthKey: '2026-06',
        status: 'ready',
      })
    );
  });
```

- [ ] **Step 4: Run the focused server test file and confirm failure**

Run:

```bash
npm run test:ci -- server/app.test.js
```

Expected:

- FAIL because admin report-center endpoints do not exist
- FAIL because `investment_monthly_reports` does not persist month-specific notes yet

- [ ] **Step 5: Commit the red tests**

```bash
git add server/app.test.js
git commit -m "test investor report center flows"
```

## Task 2: Extend saved monthly report persistence for notes and admin queries

**Files:**
- Modify: `server/db.js`
- Test: `server/app.test.js`

- [ ] **Step 1: Add note columns to `investment_monthly_reports`**

Add migration helpers near the other `ensureColumn(...)` calls:

```js
  ensureColumn(db, 'investment_monthly_reports', 'investor_note', 'TEXT');
  ensureColumn(db, 'investment_monthly_reports', 'admin_note', 'TEXT');
```

- [ ] **Step 2: Expand saved report select statements**

Update the existing report statements so they return note fields:

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
         investor_note AS investorNote,
         admin_note AS adminNote,
         created_at AS createdAt,
         updated_at AS updatedAt
       FROM investment_monthly_reports
       WHERE portfolio_id = ?
       ORDER BY month_key DESC, id DESC`
    ),
```

Mirror the same two aliases on:

```js
findInvestmentMonthlyReportByPortfolioIdAndMonth
```

and:

```js
upsertInvestmentMonthlyReport
```

- [ ] **Step 3: Add an admin report-center list statement**

Add:

```js
    listInvestmentMonthlyReportsForAdmin: db.prepare(
      `SELECT
         reports.id,
         reports.portfolio_id AS portfolioId,
         reports.month_key AS monthKey,
         reports.snapshot_date AS snapshotDate,
         reports.file_name AS fileName,
         reports.file_path AS filePath,
         reports.status,
         reports.generated_at AS generatedAt,
         reports.error_message AS errorMessage,
         reports.investor_note AS investorNote,
         reports.admin_note AS adminNote,
         portfolios.user_id AS investorUserId,
         portfolios.display_name AS portfolioDisplayName,
         users.email AS investorEmail
       FROM investment_monthly_reports reports
       INNER JOIN investment_portfolios portfolios ON portfolios.id = reports.portfolio_id
       INNER JOIN users ON users.id = portfolios.user_id
       ORDER BY reports.month_key DESC, users.email ASC, reports.id DESC`
    ),
```

- [ ] **Step 4: Add a note-update statement**

Add:

```js
    updateInvestmentMonthlyReportNotes: db.prepare(
      `UPDATE investment_monthly_reports
       SET investor_note = @investorNote,
           admin_note = @adminNote,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @reportId AND month_key = @monthKey
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
         investor_note AS investorNote,
         admin_note AS adminNote,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
```

- [ ] **Step 5: Expose the new DB helpers**

Add these methods to the exported db API:

```js
    listInvestmentMonthlyReportsForAdmin() {
      return statements.listInvestmentMonthlyReportsForAdmin.all();
    },
    updateInvestmentMonthlyReportNotes(reportId, monthKey, investorNote, adminNote) {
      return (
        statements.updateInvestmentMonthlyReportNotes.get({
          reportId,
          monthKey,
          investorNote,
          adminNote,
        }) ?? null
      );
    },
```

- [ ] **Step 6: Run the focused server tests**

Run:

```bash
npm run test:ci -- server/app.test.js
```

Expected:

- FAIL because the API layer still does not expose the new admin report-center endpoints

- [ ] **Step 7: Commit the persistence changes**

```bash
git add server/db.js
git commit -m "persist investor monthly report notes"
```

## Task 3: Add admin report-center APIs and month-specific regeneration

**Files:**
- Modify: `server/app.js`
- Modify: `server/investment-report-pdf.js`
- Test: `server/app.test.js`

- [ ] **Step 1: Expand report serialization**

Update `serializeInvestmentMonthlyReport` in `server/app.js`:

```js
function serializeInvestmentMonthlyReport(report, { includeAdminFields = false } = {}) {
  const serialized = {
    id: report.id,
    monthKey: report.monthKey,
    label: formatMonthLabel(report.monthKey),
    snapshotDate: report.snapshotDate,
    status: report.status,
    generatedAt: report.generatedAt,
    fileName: report.fileName,
    investorNote: report.investorNote ?? null,
  };

  if (includeAdminFields) {
    serialized.adminNote = report.adminNote ?? null;
    serialized.portfolioId = report.portfolioId;
  }

  return serialized;
}
```

- [ ] **Step 2: Preserve notes during generation**

Inside `generateInvestmentMonthlyReport(...)`, keep any existing note values:

```js
  const existing = db.findInvestmentMonthlyReportByPortfolioIdAndMonth(portfolio.id, monthKey);
```

Then pass them into the upsert call:

```js
    investorNote: existing?.investorNote ?? null,
    adminNote: existing?.adminNote ?? null,
```

- [ ] **Step 3: Add an admin report-center list endpoint**

Add:

```js
  app.get('/api/admin/investment/reports', requireAdmin, (_req, res) => {
    const reports = db.listInvestmentMonthlyReportsForAdmin().map((report) => ({
      ...serializeInvestmentMonthlyReport(report, { includeAdminFields: true }),
      investorEmail: report.investorEmail,
      investorUserId: report.investorUserId,
      portfolioDisplayName: report.portfolioDisplayName,
    }));

    return res.json({ reports });
  });
```

- [ ] **Step 4: Add note update and month-targeted regeneration endpoints**

Add:

```js
  app.patch('/api/admin/investment/reports/:monthKey/:reportId', requireAdmin, (req, res) => {
    const reportId = parseIdParam(req.params.reportId);
    const monthKey = String(req.params.monthKey ?? '').trim();
    const investorNote = trimOptionalString(req.body?.investorNote);
    const adminNote = trimOptionalString(req.body?.adminNote);

    if (!reportId || !/^\d{4}-\d{2}$/.test(monthKey)) {
      return res.status(400).json({ error: 'A valid report id and month are required.' });
    }

    const report = db.updateInvestmentMonthlyReportNotes(reportId, monthKey, investorNote, adminNote);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    return res.json({
      report: serializeInvestmentMonthlyReport(report, { includeAdminFields: true }),
    });
  });
```

and:

```js
  app.post('/api/admin/investment/reports/:monthKey/:reportId/regenerate', requireAdmin, async (req, res) => {
    const reportId = parseIdParam(req.params.reportId);
    const monthKey = String(req.params.monthKey ?? '').trim();

    if (!reportId || !/^\d{4}-\d{2}$/.test(monthKey)) {
      return res.status(400).json({ error: 'A valid report id and month are required.' });
    }

    const existing = db.listInvestmentMonthlyReportsForAdmin().find(
      (report) => report.id === reportId && report.monthKey === monthKey
    );

    if (!existing) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    const portfolio = db.findInvestmentPortfolioById(existing.portfolioId);
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found.' });
    }

    const result = await generateInvestmentMonthlyReport({
      db,
      portfolio,
      monthKey,
      currentDate: now(),
      reportStorageRoot,
      getInvestmentPrices,
      getInvestmentPricesLastUpdatedAt,
      runWithInvestmentPricingRequestState,
    });

    return res.json({
      report: serializeInvestmentMonthlyReport(result.report, { includeAdminFields: true }),
    });
  });
```

- [ ] **Step 5: Add investor-facing note support to the saved report list**

Keep the investor list endpoint simple:

```js
  app.get('/api/investment/me/reports', requireInvestor, (req, res) => {
    const portfolio = db.findInvestmentPortfolioByUserId(req.session.user.id);
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found.' });
    }

    return res.json({
      reports: db
        .listInvestmentMonthlyReportsByPortfolioId(portfolio.id)
        .map((report) => serializeInvestmentMonthlyReport(report)),
    });
  });
```

- [ ] **Step 6: Use the saved report note in the PDF renderer**

In `server/investment-report-pdf.js`, prefer a month-specific investor note:

```js
function addSummaryCards(doc, topY, portfolio, summary, reportMonthLabel, investorNote) {
```

and:

```js
  if (investorNote) {
    doc.text(`Investor note: ${investorNote}`, PAGE_MARGIN + 70, topY + 62);
  }
```

Pass the note into `createInvestmentReportPdfDocument(...)` from the saved report payload.

- [ ] **Step 7: Run the focused server tests again**

Run:

```bash
npm run test:ci -- server/app.test.js
```

Expected:

- PASS for the new report-center listing, note update, and regeneration tests

- [ ] **Step 8: Commit the API layer**

```bash
git add server/app.js server/investment-report-pdf.js server/app.test.js
git commit -m "add investor report center backend"
```

## Task 4: Add frontend admin report-center services and components

**Files:**
- Modify: `src/services/admin.ts`
- Create: `src/components/investment/AdminReportCenter.tsx`
- Modify: `src/pages/AdminPage.tsx`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Add admin report-center service types**

In `src/services/admin.ts`, add:

```ts
export interface AdminInvestmentMonthlyReportRecord {
  id: number;
  portfolioId: number;
  investorUserId: number;
  investorEmail: string;
  portfolioDisplayName: string | null;
  monthKey: string;
  label: string;
  snapshotDate: string;
  status: 'ready' | 'failed';
  generatedAt: string;
  fileName: string;
  investorNote: string | null;
  adminNote: string | null;
}
```

and:

```ts
interface AdminInvestmentReportsEnvelope {
  reports: AdminInvestmentMonthlyReportRecord[];
}
```

- [ ] **Step 2: Add admin report-center request helpers**

In `src/services/admin.ts`, add:

```ts
export function fetchAdminInvestmentReports() {
  return request<AdminInvestmentReportsEnvelope>('/api/admin/investment/reports', {
    method: 'GET',
  });
}

export function updateAdminInvestmentReportNotes(
  monthKey: string,
  reportId: number,
  payload: { investorNote: string | null; adminNote: string | null }
) {
  return request<{ report: AdminInvestmentMonthlyReportRecord }>(
    `/api/admin/investment/reports/${monthKey}/${reportId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );
}

export function regenerateAdminInvestmentReport(monthKey: string, reportId: number) {
  return request<{ report: AdminInvestmentMonthlyReportRecord }>(
    `/api/admin/investment/reports/${monthKey}/${reportId}/regenerate`,
    {
      method: 'POST',
      body: JSON.stringify({}),
    }
  );
}

export function getAdminInvestmentReportDownloadUrl(monthKey: string, reportId: number) {
  return `${apiBaseUrl}/api/admin/investment/reports/${monthKey}/${reportId}/download`;
}
```

- [ ] **Step 3: Create the admin report-center component**

Create `src/components/investment/AdminReportCenter.tsx` with a grouped list:

```tsx
interface AdminReportCenterProps {
  reports: AdminInvestmentMonthlyReportRecord[];
  activeActionKey: string | null;
  onRegenerate: (report: AdminInvestmentMonthlyReportRecord) => Promise<void>;
  onSaveNotes: (
    report: AdminInvestmentMonthlyReportRecord,
    payload: { investorNote: string; adminNote: string }
  ) => Promise<void>;
}
```

Render:

- investor email
- portfolio display name
- month label
- status
- download button
- regenerate button
- `Investor note` textarea
- `Admin note` textarea
- save notes button

Use local controlled state seeded from the incoming report list.

- [ ] **Step 4: Mount the report center in `AdminPage.tsx`**

Add state:

```ts
  const [monthlyReports, setMonthlyReports] = useState<AdminInvestmentMonthlyReportRecord[]>([]);
```

Load it in `loadDashboard()`:

```ts
      const [usersResponse, videosResponse, reportsResponse] = await Promise.all([
        fetchAdminUsers(),
        fetchAdminVideos(),
        fetchAdminInvestmentReports(),
      ]);
```

Wire actions:

```ts
  const handleSaveReportNotes = async (...) => { ... }
  const handleRegenerateSavedReport = async (...) => { ... }
```

Render a new section above `Investor Portfolios`:

```tsx
<section aria-labelledby="admin-report-center-heading">
  <p className="eyebrow">Monthly Reports</p>
  <h2 id="admin-report-center-heading" className="mt-3 text-4xl text-[var(--text)]">
    Report Center
  </h2>
  <AdminReportCenter ... />
</section>
```

- [ ] **Step 5: Add a failing admin frontend test**

In `src/App.test.tsx`, add:

```ts
  it('shows the admin investor report center and lets notes be saved', async () => {
    window.history.replaceState({}, '', '/admin');
```

Mock:

- `/api/auth/me`
- `/api/admin/users`
- `/api/admin/videos`
- `/api/admin/investment/reports`
- `/api/admin/investment/reports/2026-06/1`

Then assert:

```ts
    expect(await screen.findByRole('heading', { name: /Report Center/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Stayed patient during June volatility.')).toBeInTheDocument();
```

- [ ] **Step 6: Run the focused frontend tests**

Run:

```bash
npm run test:ci -- src/App.test.tsx
```

Expected:

- FAIL until `AdminPage` and the new component are wired correctly

- [ ] **Step 7: Commit the admin frontend**

```bash
git add src/services/admin.ts src/components/investment/AdminReportCenter.tsx src/pages/AdminPage.tsx src/App.test.tsx
git commit -m "add admin investor report center"
```

## Task 5: Show investor-facing monthly notes in the investor dashboard

**Files:**
- Modify: `src/services/investment.ts`
- Create: `src/components/investment/InvestorReportNoteCard.tsx`
- Modify: `src/pages/MyInvestmentPage.tsx`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Extend investor report types**

In `src/services/investment.ts`, add `investorNote`:

```ts
export interface InvestmentMonthlyReportRecord {
  monthKey: string;
  label: string;
  snapshotDate: string;
  status: 'ready' | 'failed';
  generatedAt: string;
  fileName: string;
  investorNote: string | null;
}
```

Update `normalizeInvestmentMonthlyReports(...)` to parse `investorNote`.

- [ ] **Step 2: Create the investor note card**

Create `src/components/investment/InvestorReportNoteCard.tsx`:

```tsx
interface InvestorReportNoteCardProps {
  report: InvestmentMonthlyReportRecord | null;
}
```

Render:

- heading: `Monthly Note`
- active month label
- note body if present
- fallback copy if the latest report has no note yet

- [ ] **Step 3: Mount the investor note card on `MyInvestmentPage.tsx`**

Add:

```ts
  const latestReport = reports[0] ?? null;
```

Render the card above `Saved Reports`:

```tsx
<InvestorReportNoteCard report={latestReport} />
```

Keep the latest-download button behavior tied to the first saved report entry.

- [ ] **Step 4: Add a frontend test for investor note visibility**

In `src/App.test.tsx`, update the investor report mock to include:

```ts
investorNote: 'Stayed patient during June volatility.',
```

Then assert:

```ts
expect(screen.getByRole('heading', { name: /Monthly Note/i })).toBeInTheDocument();
expect(screen.getByText(/Stayed patient during June volatility./i)).toBeInTheDocument();
```

- [ ] **Step 5: Run the focused frontend tests**

Run:

```bash
npm run test:ci -- src/App.test.tsx
```

Expected:

- PASS for the investor note card and admin report-center coverage

- [ ] **Step 6: Commit the investor note UI**

```bash
git add src/services/investment.ts src/components/investment/InvestorReportNoteCard.tsx src/pages/MyInvestmentPage.tsx src/App.test.tsx
git commit -m "show investor monthly report notes"
```

## Task 6: Run full verification and prepare for production

**Files:**
- Reference: `server/app.test.js`
- Reference: `src/App.test.tsx`
- Reference: `package.json`

- [ ] **Step 1: Run backend tests**

```bash
npm run test:ci -- server/app.test.js
```

Expected:

- PASS

- [ ] **Step 2: Run frontend tests**

```bash
npm run test:ci -- src/App.test.tsx
```

Expected:

- PASS

- [ ] **Step 3: Run the production build**

```bash
npm run build
```

Expected:

- PASS

- [ ] **Step 4: Check working tree**

```bash
git status --short
```

Expected:

- only intended files changed

- [ ] **Step 5: Commit the final verification pass**

```bash
git add server/db.js server/app.js server/investment-report-pdf.js server/app.test.js src/services/admin.ts src/services/investment.ts src/components/investment/AdminReportCenter.tsx src/components/investment/InvestorReportNoteCard.tsx src/pages/AdminPage.tsx src/pages/MyInvestmentPage.tsx src/App.test.tsx
git commit -m "complete investor report center and notes"
```

- [ ] **Step 6: Push the branch**

```bash
git push origin codex/investor-role-dashboard
```

## Self-Review

- Spec coverage: this plan covers admin report-center visibility, saved report month actions, investor-facing monthly notes, admin-only internal notes, and PDF rendering updates. No agreed requirement from the current scope is intentionally omitted.
- Placeholder scan: all tasks reference concrete files, commands, and data shapes. There are no `TODO` or `TBD` markers.
- Type consistency: `investorNote` is always investor-facing and visible in investor surfaces; `adminNote` is always admin-only and stays inside admin endpoints and admin UI.

Plan complete and saved to `docs/superpowers/plans/2026-07-01-investor-report-center-and-notes.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
