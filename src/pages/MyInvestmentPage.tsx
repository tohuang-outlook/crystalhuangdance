import {
  investmentHoldings,
  investmentNotes,
  investmentReports,
  investmentSummaryCards,
} from '../data/investmentDashboardData';

export default function MyInvestmentPage() {
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
            <button className="inline-flex items-center justify-center rounded-full bg-[var(--text)] px-5 py-3 text-sm uppercase tracking-[0.22em] text-white transition hover:bg-[var(--text-muted)]">
              Download Monthly Report
            </button>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {investmentSummaryCards.map((card) => (
              <article
                key={card.label}
                className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-5 shadow-[0_16px_40px_rgba(68,102,136,0.08)]"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {card.label}
                </p>
                <p className="mt-4 text-3xl text-[var(--text)]">{card.value}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
            <section className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-6 shadow-[0_16px_40px_rgba(68,102,136,0.08)]">
              <p className="eyebrow">Portfolio Overview</p>
              <h2 className="mt-4 text-3xl text-[var(--text)]">Current Holdings</h2>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-3 text-left">
                  <thead>
                    <tr className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      <th>Asset</th>
                      <th>Quantity</th>
                      <th>Invested</th>
                      <th>Value</th>
                      <th>P&amp;L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investmentHoldings.map((holding) => (
                      <tr key={holding.symbol} className="rounded-2xl bg-[rgba(238,246,255,0.72)]">
                        <td className="px-3 py-4">
                          <div className="font-medium text-[var(--text)]">{holding.symbol}</div>
                          <div className="text-sm text-[var(--text-muted)]">
                            {holding.name} · {holding.allocation}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-[var(--text)]">{holding.quantity}</td>
                        <td className="px-3 py-4 text-[var(--text)]">{holding.invested}</td>
                        <td className="px-3 py-4 text-[var(--text)]">{holding.value}</td>
                        <td className="px-3 py-4 text-[var(--text)]">{holding.pnl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="grid gap-6">
              <section className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-6 shadow-[0_16px_40px_rgba(68,102,136,0.08)]">
                <p className="eyebrow">Reports</p>
                <h2 className="mt-4 text-3xl text-[var(--text)]">Monthly Reports</h2>
                <div className="mt-6 space-y-3">
                  {investmentReports.map((report) => (
                    <article
                      key={report.month}
                      className="rounded-2xl border border-[var(--line)] bg-[rgba(238,246,255,0.72)] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-base text-[var(--text)]">{report.month}</p>
                          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            {report.status}
                          </p>
                        </div>
                        <button className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                          {report.actionLabel}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-6 shadow-[0_16px_40px_rgba(68,102,136,0.08)]">
                <p className="eyebrow">Notes</p>
                <h2 className="mt-4 text-3xl text-[var(--text)]">Investment Notes</h2>
                <ul className="mt-6 space-y-3 text-[var(--text-muted)]">
                  {investmentNotes.map((note) => (
                    <li
                      key={note}
                      className="rounded-2xl bg-[rgba(238,246,255,0.72)] px-4 py-3"
                    >
                      {note}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
