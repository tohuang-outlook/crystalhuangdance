import type { InvestmentMonthlyPerformancePoint } from '../../services/investment';

function formatCurrency(value: number) {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function buildLinePath(points: { x: number; y: number }[]) {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
}

export default function MonthlyPerformanceChart({
  monthlyPerformance,
}: {
  monthlyPerformance: InvestmentMonthlyPerformancePoint[];
}) {
  if (monthlyPerformance.length === 0) {
    return (
      <div className="mt-6 rounded-[1.25rem] border border-dashed border-[var(--line)] px-5 py-8 text-sm text-[var(--text-muted)]">
        Monthly portfolio history will appear here once performance snapshots are available.
      </div>
    );
  }

  const width = 760;
  const height = 260;
  const paddingX = 28;
  const paddingTop = 24;
  const paddingBottom = 42;
  const values = monthlyPerformance.map((point) => point.portfolioValue);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  const points = monthlyPerformance.map((point, index) => {
    const x =
      monthlyPerformance.length === 1
        ? width / 2
        : paddingX + (index * (width - paddingX * 2)) / (monthlyPerformance.length - 1);
    const normalized = (point.portfolioValue - minValue) / range;
    const y = height - paddingBottom - normalized * (height - paddingTop - paddingBottom);

    return { x, y, ...point };
  });

  const path = buildLinePath(points);

  return (
    <div className="mt-6">
      <div className="rounded-[1.25rem] border border-[var(--line)] bg-[rgba(238,246,255,0.64)] p-4">
        <svg
          aria-label="Monthly portfolio value chart"
          className="h-auto w-full"
          role="img"
          viewBox={`0 0 ${width} ${height}`}
        >
          <path
            d={path}
            fill="none"
            stroke="rgba(42, 79, 110, 0.92)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          {points.map((point) => (
            <g key={point.month}>
              <circle cx={point.x} cy={point.y} fill="rgba(19, 55, 78, 1)" r="5" />
              <text
                fill="rgba(90, 112, 126, 1)"
                fontSize="11"
                textAnchor="middle"
                x={point.x}
                y={height - 14}
              >
                {point.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {monthlyPerformance.map((point) => (
          <div
            key={point.month}
            className="rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3"
          >
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {point.label}
            </p>
            <p className="mt-2 text-lg text-[var(--text)]">{formatCurrency(point.portfolioValue)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
