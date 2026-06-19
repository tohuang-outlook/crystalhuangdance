import type { InvestmentHolding } from '../../services/investment';

function formatCurrency(value: number) {
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatQuantity(value: number) {
  return value.toFixed(8);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function HoldingsTable({ holdings }: { holdings: InvestmentHolding[] }) {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-3 text-left">
        <thead>
          <tr className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
            <th>Asset</th>
            <th>Quantity</th>
            <th>Invested</th>
            <th>Current Price</th>
            <th>Value</th>
            <th>P&amp;L</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => (
            <tr key={holding.assetSymbol} className="rounded-2xl bg-[rgba(238,246,255,0.72)]">
              <td className="px-3 py-4">
                <div className="font-medium text-[var(--text)]">{holding.assetSymbol}</div>
                <div className="text-sm text-[var(--text-muted)]">
                  {holding.assetName} · {formatPercent(holding.allocationPercent)}
                </div>
              </td>
              <td className="px-3 py-4 text-[var(--text)]">{formatQuantity(holding.quantity)}</td>
              <td className="px-3 py-4 text-[var(--text)]">{formatCurrency(holding.invested)}</td>
              <td className="px-3 py-4 text-[var(--text)]">
                {formatCurrency(holding.currentPrice)}
              </td>
              <td className="px-3 py-4 text-[var(--text)]">{formatCurrency(holding.currentValue)}</td>
              <td
                className={`px-3 py-4 ${
                  holding.unrealizedPnL >= 0 ? 'text-[rgb(22,128,110)]' : 'text-[rgb(189,84,58)]'
                }`}
              >
                {formatCurrency(holding.unrealizedPnL)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
