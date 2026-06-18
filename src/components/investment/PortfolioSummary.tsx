import type { InvestmentSummary } from '../../services/investment';

function formatCurrency(value: number) {
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPercent(value: number) {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${Math.abs(value).toFixed(2)}%`;
}

export default function PortfolioSummary({ summary }: { summary: InvestmentSummary }) {
  const cards = [
    { label: 'Total Invested', value: formatCurrency(summary.totalInvested), positive: null },
    { label: 'Portfolio Value', value: formatCurrency(summary.portfolioValue), positive: null },
    {
      label: 'Unrealized P&L',
      value: formatCurrency(summary.unrealizedPnL),
      positive: summary.unrealizedPnL >= 0,
    },
    {
      label: 'Total Return',
      value: formatPercent(summary.totalReturnPercent),
      positive: summary.totalReturnPercent >= 0,
    },
  ];

  return (
    <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-5 shadow-[0_16px_40px_rgba(68,102,136,0.08)]"
        >
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {card.label}
          </p>
          <p
            className={`mt-4 text-3xl ${
              card.positive == null
                ? 'text-[var(--text)]'
                : card.positive
                  ? 'text-[rgb(22,128,110)]'
                  : 'text-[rgb(189,84,58)]'
            }`}
          >
            {card.value}
          </p>
        </article>
      ))}
    </div>
  );
}
