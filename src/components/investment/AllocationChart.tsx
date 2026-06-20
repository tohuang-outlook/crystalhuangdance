import type { InvestmentHolding } from '../../services/investment';

const assetAccentBySymbol: Record<string, string> = {
  BTC: '#2a7884',
  ETH: '#57a89b',
  SOL: '#96c39b',
  XRP: '#d8b37a',
  ADA: '#df8a62',
  DOGE: '#a67378',
};

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function buildArcPath(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
) {
  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

export default function AllocationChart({ holdings }: { holdings: InvestmentHolding[] }) {
  if (holdings.length === 0) {
    return null;
  }

  const size = 240;
  const center = size / 2;
  const outerRadius = 86;
  const innerRadius = 56;
  let currentAngle = 0;

  const segments = holdings.map((holding) => {
    const sweepAngle = (holding.allocationPercent / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sweepAngle;
    currentAngle = endAngle;

    return {
      ...holding,
      color: assetAccentBySymbol[holding.assetSymbol] ?? '#2a7884',
      path: buildArcPath(center, center, outerRadius, innerRadius, startAngle, endAngle),
    };
  });

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-center">
      <div className="flex justify-center lg:justify-start">
        <svg
          aria-label="Portfolio allocation chart"
          className="h-auto w-[220px]"
          role="img"
          viewBox={`0 0 ${size} ${size}`}
        >
          {segments.map((segment) => (
            <path
              key={segment.assetSymbol}
              d={segment.path}
              fill={segment.color}
              stroke="white"
              strokeWidth="6"
            />
          ))}
        </svg>
      </div>

      <div className="grid gap-5">
        {segments.map((segment) => (
          <div key={segment.assetSymbol} className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="mt-2 h-3 w-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <div>
              <div className="font-semibold text-[var(--text)]">{segment.assetSymbol}</div>
              <div className="text-sm text-[var(--text-muted)]">
                {segment.assetName} · {formatPercent(segment.allocationPercent)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
