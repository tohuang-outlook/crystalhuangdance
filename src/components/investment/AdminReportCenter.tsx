import { useEffect, useState } from 'react';
import {
  getAdminInvestmentReportDownloadUrl,
  type AdminInvestmentReportRecord,
} from '../../services/admin';

interface AdminReportCenterProps {
  reports: AdminInvestmentReportRecord[];
  isLoading: boolean;
  activeSaveKey: string | null;
  activeRegenerateKey: string | null;
  onSave: (report: AdminInvestmentReportRecord, notes: {
    investorNote: string | null;
    adminNote: string | null;
  }) => Promise<void>;
  onRegenerate: (report: AdminInvestmentReportRecord) => Promise<void>;
}

interface DraftState {
  investorNote: string;
  adminNote: string;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function buildInitialDraft(report: AdminInvestmentReportRecord): DraftState {
  return {
    investorNote: report.investorNote ?? '',
    adminNote: report.adminNote ?? '',
  };
}

export default function AdminReportCenter({
  reports,
  isLoading,
  activeSaveKey,
  activeRegenerateKey,
  onSave,
  onRegenerate,
}: AdminReportCenterProps) {
  const [drafts, setDrafts] = useState<Record<string, DraftState>>({});

  useEffect(() => {
    const next: Record<string, DraftState> = {};

    reports.forEach((report) => {
      next[`${report.monthKey}:${report.id}`] = buildInitialDraft(report);
    });

    setDrafts(next);
  }, [reports]);

  const groupedReports = reports.reduce<Record<string, AdminInvestmentReportRecord[]>>((groups, report) => {
    const key = `${report.investorEmail}__${report.portfolioDisplayName ?? 'Investor Portfolio'}`;
    const current = groups[key] ?? [];
    current.push(report);
    groups[key] = current;
    return groups;
  }, {});

  const groupedEntries = Object.entries(groupedReports).map(([groupKey, groupReports]) => {
    const [investorEmail, portfolioDisplayName] = groupKey.split('__');
    return {
      investorEmail,
      portfolioDisplayName,
      reports: [...groupReports].sort((left, right) => right.monthKey.localeCompare(left.monthKey)),
    };
  });

  return (
    <section aria-labelledby="admin-report-center-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Investor Reports</p>
          <h2 id="admin-report-center-heading" className="mt-3 text-4xl text-[var(--text)]">
            Saved monthly reports
          </h2>
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          {reports.length} saved report{reports.length === 1 ? '' : 's'}
        </p>
      </div>

      {isLoading ? (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-10 text-center">
          <p className="text-sm text-[var(--text-muted)]">Loading saved investor reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-[var(--line)] bg-[var(--surface)] px-6 py-10 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            No saved investor reports yet. Generate the latest month-end reports to start the archive.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {groupedEntries.map((group) => (
            <article
              key={`${group.investorEmail}-${group.portfolioDisplayName}`}
              className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_20px_55px_rgba(68,102,136,0.09)] sm:p-6"
            >
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow text-[10px]">Investor archive</p>
                  <h3 className="mt-3 text-3xl text-[var(--text)]">{group.investorEmail}</h3>
                  <p className="mt-3 text-sm text-[var(--text-muted)]">
                    Portfolio: {group.portfolioDisplayName}
                  </p>
                </div>
                <p className="text-sm text-[var(--text-muted)]">
                  {group.reports.length} month{group.reports.length === 1 ? '' : 's'}
                </p>
              </div>

              <div className="mt-6 grid gap-5">
                {group.reports.map((report) => {
                  const draftKey = `${report.monthKey}:${report.id}`;
                  const draft = drafts[draftKey] ?? buildInitialDraft(report);
                  const hasChanges =
                    draft.investorNote !== (report.investorNote ?? '') ||
                    draft.adminNote !== (report.adminNote ?? '');
                  const isSaving = activeSaveKey === draftKey;
                  const isRegenerating = activeRegenerateKey === draftKey;

                  return (
                    <div
                      key={draftKey}
                      className="rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="eyebrow text-[10px]">{report.label}</p>
                          <h4 className="mt-3 text-2xl text-[var(--text)]">{report.fileName}</h4>
                          <div className="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            <span>Status: {report.status}</span>
                            <span>Generated: {formatDateTime(report.generatedAt)}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <a
                            className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[var(--text)]"
                            href={getAdminInvestmentReportDownloadUrl(report.monthKey, report.id)}
                          >
                            Download PDF
                          </a>
                          <button
                            className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[var(--text)] disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={isRegenerating}
                            onClick={() => void onRegenerate(report)}
                            type="button"
                          >
                            {isRegenerating ? 'Regenerating...' : 'Regenerate PDF'}
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 lg:grid-cols-2">
                        <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                          <span className="eyebrow text-[10px]">Investor-facing note</span>
                          <textarea
                            className="min-h-32 rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
                            onChange={(event) =>
                              setDrafts((current) => ({
                                ...current,
                                [draftKey]: {
                                  ...draft,
                                  investorNote: event.target.value,
                                },
                              }))
                            }
                            placeholder="Visible in the investor dashboard and monthly PDF"
                            value={draft.investorNote}
                          />
                        </label>

                        <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
                          <span className="eyebrow text-[10px]">Admin-only note</span>
                          <textarea
                            className="min-h-32 rounded-[1.2rem] border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
                            onChange={(event) =>
                              setDrafts((current) => ({
                                ...current,
                                [draftKey]: {
                                  ...draft,
                                  adminNote: event.target.value,
                                },
                              }))
                            }
                            placeholder="Visible only in the admin console"
                            value={draft.adminNote}
                          />
                        </label>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-[var(--text-muted)]">
                          Investor notes publish to the dashboard and the saved PDF. Admin notes stay internal.
                        </p>
                        <button
                          className="rounded-full bg-[var(--text)] px-5 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[var(--text-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={!hasChanges || isSaving}
                          onClick={() =>
                            void onSave(report, {
                              investorNote: draft.investorNote.trim() || null,
                              adminNote: draft.adminNote.trim() || null,
                            })
                          }
                          type="button"
                        >
                          {isSaving ? 'Saving...' : 'Save notes'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
