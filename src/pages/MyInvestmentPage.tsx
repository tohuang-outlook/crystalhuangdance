import { useEffect, useMemo, useRef, useState } from 'react';
import AllocationChart from '../components/investment/AllocationChart';
import HoldingsTable from '../components/investment/HoldingsTable';
import InvestorReportNoteCard from '../components/investment/InvestorReportNoteCard';
import LivePricesCard from '../components/investment/LivePricesCard';
import MonthlyPerformanceChart from '../components/investment/MonthlyPerformanceChart';
import PortfolioSummary from '../components/investment/PortfolioSummary';
import TransactionTable from '../components/investment/TransactionTable';
import {
  fetchMyInvestmentReports,
  fetchMyInvestmentPortfolio,
  getMyInvestmentReportDownloadUrl,
  type InvestmentMonthlyReportRecord,
  type InvestmentPortfolioResponse,
} from '../services/investment';
import {
  fetchInvestorUpdates,
  type InvestorUpdate,
  type InvestorUpdateCategory,
} from '../services/investorUpdates';

function formatReportDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`));
}

function formatShortDate(value: string) {
  const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(normalizedValue));
}

export default function MyInvestmentPage() {
  const [data, setData] = useState<InvestmentPortfolioResponse | null>(null);
  const [reports, setReports] = useState<InvestmentMonthlyReportRecord[]>([]);
  const [investorUpdates, setInvestorUpdates] = useState<InvestorUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const hasLoadedOnceRef = useRef(false);
  const isRefreshInFlightRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const load = async ({ background = false } = {}) => {
      if (background && isRefreshInFlightRef.current) {
        return;
      }

      if (background) {
        isRefreshInFlightRef.current = true;
      }

      if (!background && !hasLoadedOnceRef.current) {
        setIsLoading(true);
      }

      if (!background) {
        setError(null);
        setRefreshError(null);
      }

      try {
        const [portfolioResponse, reportsResponse, investorUpdatesResponse] = await Promise.all([
          fetchMyInvestmentPortfolio(),
          fetchMyInvestmentReports().catch((err) => {
            const message =
              err instanceof Error ? err.message : 'Unable to load saved reports.';

            if (message.toLowerCase().includes('portfolio not found')) {
              return [];
            }

            throw err;
          }),
          fetchInvestorUpdates().catch(() => []),
        ]);
        if (!isMounted) {
          return;
        }

        setData(portfolioResponse);
        setReports(reportsResponse);
        setInvestorUpdates(investorUpdatesResponse);
        setError(null);
        setRefreshError(null);
        hasLoadedOnceRef.current = true;
      } catch (err) {
        if (!isMounted) {
          return;
        }

        const message =
          err instanceof Error ? err.message : 'Unable to load your investment dashboard.';

        if (!hasLoadedOnceRef.current) {
          if (message.toLowerCase().includes('portfolio not found')) {
            hasLoadedOnceRef.current = true;
            setData(null);
            setReports([]);
            setError(null);
          } else {
            setError(message);
          }
        } else if (background) {
          setRefreshError('Live prices may be stale. We could not refresh your dashboard just now.');
        }
      } finally {
        if (background) {
          isRefreshInFlightRef.current = false;
        }

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

  const handleDownloadReport = async () => {
    if (!data || isDownloadingReport || reports.length === 0) {
      return;
    }

    setIsDownloadingReport(true);

    try {
      window.location.assign(getMyInvestmentReportDownloadUrl(reports[0].monthKey));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to download the monthly report right now.';
      setRefreshError(message);
    } finally {
      setIsDownloadingReport(false);
    }
  };

  const latestInvestorNoteReport =
    reports.find((report) => report.investorNote && report.investorNote.trim().length > 0) ?? null;

  const investorUpdateCategories: Array<{
    id: InvestorUpdateCategory;
    label: string;
  }> = [
    { id: 'investment-page', label: 'Investment Page Updates' },
    { id: 'monthly-reports', label: 'Monthly Report Updates' },
    { id: 'real-time-quote', label: 'Real-Time Quote Updates' },
  ];

  const groupedInvestorUpdates = useMemo(
    () =>
      investorUpdateCategories.reduce<Record<InvestorUpdateCategory, InvestorUpdate[]>>(
        (grouped, category) => {
          grouped[category.id] = investorUpdates.filter((entry) => entry.category === category.id);
          return grouped;
        },
        {
          'investment-page': [],
          'monthly-reports': [],
          'real-time-quote': [],
        }
      ),
    [investorUpdates]
  );

  const latestInvestorUpdate = useMemo(() => {
    if (investorUpdates.length === 0) {
      return null;
    }

    return [...investorUpdates].sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    )[0];
  }, [investorUpdates]);

  const linkedInvestorUpdateCount = useMemo(
    () =>
      investorUpdates.filter(
        (update) => typeof update.href === 'string' && update.href.trim().length > 0
      ).length,
    [investorUpdates]
  );

  return (
    <section className="section-padding pt-32 sm:pt-36">
      <div className="container-max max-w-6xl">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[rgba(238,246,255,0.82)] p-8 shadow-[0_28px_80px_rgba(68,102,136,0.15)] backdrop-blur-sm sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">Private Investor Portal</p>
              <h1 className="mt-4 text-5xl leading-none text-[var(--text)] sm:text-6xl">
                My Investment
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--text-muted)]">
                Review your portfolio, monthly reports, and investor notes in one calm dashboard.
              </p>
            </div>
            <button
              className="inline-flex items-center justify-center rounded-full bg-[var(--text)] px-5 py-3 text-sm uppercase tracking-[0.22em] text-white transition hover:bg-[var(--text-muted)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!data || isDownloadingReport || reports.length === 0}
              onClick={() => void handleDownloadReport()}
              type="button"
            >
              {isDownloadingReport ? 'Preparing Report...' : 'Download Latest Report'}
            </button>
          </div>

          {error ? (
            <p className="mt-8 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--text)]">
              {error}
            </p>
          ) : null}

          {refreshError && data ? (
            <p className="mt-8 rounded-2xl border border-[rgba(228,178,58,0.28)] bg-[rgba(255,245,204,0.72)] px-4 py-3 text-sm text-[var(--text)]">
              {refreshError}
            </p>
          ) : null}

          {investorUpdates.length > 0 ? (
            <section className="mt-10 rounded-[1.7rem] border border-[var(--line)] bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(232,242,255,0.72))] p-6 shadow-[0_18px_46px_rgba(68,102,136,0.10)]">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_20rem]">
                <div className="space-y-5">
                  <div>
                    <p className="eyebrow">Investor Updates</p>
                    <h2 className="mt-4 text-3xl text-[var(--text)]">Admin-published updates</h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
                      Structured updates from the admin console, organized by investor page messaging,
                      monthly report notes, and quote-related guidance.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <article className="rounded-[1.25rem] border border-[var(--line)] bg-white/72 p-4 shadow-[0_12px_28px_rgba(68,102,136,0.06)]">
                      <p className="eyebrow text-[10px]">Total Updates</p>
                      <p className="mt-2 text-3xl text-[var(--text)]">{investorUpdates.length}</p>
                    </article>
                    <article className="rounded-[1.25rem] border border-[var(--line)] bg-white/72 p-4 shadow-[0_12px_28px_rgba(68,102,136,0.06)]">
                      <p className="eyebrow text-[10px]">Linked Items</p>
                      <p className="mt-2 text-3xl text-[var(--text)]">{linkedInvestorUpdateCount}</p>
                    </article>
                    <article className="rounded-[1.25rem] border border-[var(--line)] bg-white/72 p-4 shadow-[0_12px_28px_rgba(68,102,136,0.06)]">
                      <p className="eyebrow text-[10px]">Active Modules</p>
                      <p className="mt-2 text-3xl text-[var(--text)]">
                        {investorUpdateCategories.filter((category) => groupedInvestorUpdates[category.id].length > 0).length}
                      </p>
                    </article>
                  </div>
                </div>

                <aside className="rounded-[1.35rem] border border-[var(--line)] bg-white/78 p-5 shadow-[0_12px_28px_rgba(68,102,136,0.06)]">
                  <p className="eyebrow text-[10px]">Latest Bulletin</p>
                  {latestInvestorUpdate ? (
                    <>
                      <p className="mt-3 text-sm uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        Updated {formatShortDate(latestInvestorUpdate.updatedAt)}
                      </p>
                      <h3 className="mt-3 text-2xl leading-tight text-[var(--text)]">
                        {latestInvestorUpdate.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
                        {latestInvestorUpdate.summary}
                      </p>
                    </>
                  ) : null}
                </aside>
              </div>

              <div className="mt-6 space-y-6">
                {investorUpdateCategories.map((category) => {
                  const entries = groupedInvestorUpdates[category.id];

                  if (entries.length === 0) {
                    return null;
                  }

                  return (
                    <div key={category.id} className="space-y-4">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="eyebrow text-[10px]">Module</p>
                          <h3 className="mt-2 text-xl text-[var(--text)]">{category.label}</h3>
                        </div>
                        <p className="text-sm text-[var(--text-muted)]">
                          {entries.length} item{entries.length === 1 ? '' : 's'}
                        </p>
                      </div>
                      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
                        <article className="rounded-[1.35rem] border border-[var(--line)] bg-[rgba(255,255,255,0.8)] p-5 shadow-[0_12px_28px_rgba(68,102,136,0.06)]">
                          <p className="eyebrow text-[10px]">Featured Update</p>
                          <p className="mt-3 text-sm uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            Updated {formatShortDate(entries[0].updatedAt)}
                          </p>
                          <h4 className="mt-3 text-3xl leading-tight text-[var(--text)]">
                            {entries[0].title}
                          </h4>
                          <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
                            {entries[0].summary}
                          </p>
                          {entries[0].href ? (
                            <a
                              className="mt-5 inline-flex items-center justify-center rounded-full bg-[var(--text)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[var(--text-muted)]"
                              href={entries[0].href}
                              rel="noreferrer"
                              target="_blank"
                            >
                              Open Link
                            </a>
                          ) : null}
                        </article>

                        <div className="space-y-4">
                          {entries.slice(1).length > 0 ? (
                            entries.slice(1).map((entry) => (
                              <article
                                key={entry.id}
                                className="rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5"
                              >
                                <p className="eyebrow text-[10px]">Updated {formatShortDate(entry.updatedAt)}</p>
                                <h4 className="mt-3 text-2xl text-[var(--text)]">{entry.title}</h4>
                                <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                                  {entry.summary}
                                </p>
                                {entry.href ? (
                                  <a
                                    className="mt-5 inline-flex items-center justify-center rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[var(--text)]"
                                    href={entry.href}
                                    rel="noreferrer"
                                    target="_blank"
                                  >
                                    Open Link
                                  </a>
                                ) : null}
                              </article>
                            ))
                          ) : (
                            <div className="rounded-[1.25rem] border border-dashed border-[var(--line)] px-5 py-6 text-sm text-[var(--text-muted)]">
                              No archived updates in this module yet.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {isLoading ? (
            <div className="mt-10 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] px-6 py-14 text-center">
              <p className="eyebrow">Loading portfolio</p>
              <h2 className="mt-4 text-3xl text-[var(--text)]">Preparing your investment snapshot</h2>
            </div>
          ) : !data ? (
            <div className="mt-10 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] px-6 py-14 text-center">
              <h2 className="text-3xl text-[var(--text)]">Portfolio not set up yet</h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[var(--text-muted)]">
                Your investment dashboard will appear here after an administrator creates your portfolio.
              </p>
            </div>
          ) : (
            <>
              <PortfolioSummary summary={data.summary} />
              <LivePricesCard
                livePrices={data.livePrices}
                pricesLastUpdatedAt={data.pricesLastUpdatedAt}
              />

              <section className="mt-10 rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-6 shadow-[0_16px_40px_rgba(68,102,136,0.08)]">
                <p className="eyebrow">Current Positions</p>
                <h2 className="mt-4 text-3xl text-[var(--text)]">Holdings</h2>
                <HoldingsTable holdings={data.holdings} />
              </section>

              <section className="mt-6 rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-6 shadow-[0_16px_40px_rgba(68,102,136,0.08)]">
                <p className="eyebrow">Portfolio Mix</p>
                <h2 className="mt-4 text-3xl text-[var(--text)]">Allocation</h2>
                <AllocationChart holdings={data.holdings} />
              </section>

              <section className="mt-6 rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-6 shadow-[0_16px_40px_rgba(68,102,136,0.08)]">
                <p className="eyebrow">Performance</p>
                <h2 className="mt-4 text-3xl text-[var(--text)]">Monthly Portfolio Value</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">
                  Month-end portfolio totals, seeded from your historical records and extended as
                  new months close.
                </p>
                <MonthlyPerformanceChart monthlyPerformance={data.monthlyPerformance} />
              </section>

              {latestInvestorNoteReport ? (
                <InvestorReportNoteCard report={latestInvestorNoteReport} />
              ) : null}

              <section className="mt-6 rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-6 shadow-[0_16px_40px_rgba(68,102,136,0.08)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="eyebrow">Saved Reports</p>
                    <h2 className="mt-4 text-3xl text-[var(--text)]">Monthly PDFs</h2>
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">
                    {reports.length === 0
                      ? 'Monthly reports appear here after month-end closes.'
                      : `${reports.length} saved report${reports.length === 1 ? '' : 's'}`}
                  </p>
                </div>

                {reports.length === 0 ? (
                  <div className="mt-5 rounded-[1.25rem] border border-dashed border-[var(--line)] px-5 py-6 text-sm text-[var(--text-muted)]">
                    No saved monthly reports yet. Your administrator can generate the latest month-end report,
                    and future reports can be created automatically on schedule.
                  </div>
                ) : (
                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    {reports.map((report) => (
                      <article
                        key={report.monthKey}
                        className="rounded-[1.25rem] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5"
                      >
                        <p className="eyebrow text-[10px]">{report.label}</p>
                        <h3 className="mt-3 text-2xl text-[var(--text)]">{report.fileName}</h3>
                        <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                          Snapshot date: {formatReportDate(report.snapshotDate)}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">
                          Status: {report.status === 'ready' ? 'Ready to download' : 'Generation failed'}
                        </p>
                        <div className="mt-5">
                          <a
                            className="inline-flex items-center justify-center rounded-full bg-[var(--text)] px-5 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[var(--text-soft)]"
                            href={getMyInvestmentReportDownloadUrl(report.monthKey)}
                          >
                            Download PDF
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="mt-6 rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-6 shadow-[0_16px_40px_rgba(68,102,136,0.08)]">
                <p className="eyebrow">Transactions</p>
                <h2 className="mt-4 text-3xl text-[var(--text)]">Purchase History</h2>
                <TransactionTable transactions={data.transactions} />
              </section>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
