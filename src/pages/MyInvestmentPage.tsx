import { useEffect, useRef, useState } from 'react';
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

function formatReportDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`));
}

export default function MyInvestmentPage() {
  const [data, setData] = useState<InvestmentPortfolioResponse | null>(null);
  const [reports, setReports] = useState<InvestmentMonthlyReportRecord[]>([]);
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
        const [portfolioResponse, reportsResponse] = await Promise.all([
          fetchMyInvestmentPortfolio(),
          fetchMyInvestmentReports().catch((err) => {
            const message =
              err instanceof Error ? err.message : 'Unable to load saved reports.';

            if (message.toLowerCase().includes('portfolio not found')) {
              return [];
            }

            throw err;
          }),
        ]);
        if (!isMounted) {
          return;
        }

        setData(portfolioResponse);
        setReports(reportsResponse);
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
