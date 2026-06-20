import type { InvestmentHolding } from '../../services/investment';

const assetAccentBySymbol: Record<string, string> = {
  BTC: '#2a7884',
  ETH: '#57a89b',
  SOL: '#96c39b',
  XRP: '#d8b37a',
  ADA: '#df8a62',
  DOGE: '#a67378',
};

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
      <table className="min-w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--line)] text-sm font-medium text-[var(--text)]">
            <th className="pb-4 pr-4">Asset</th>
            <th className="pb-4 px-4">Quantity</th>
            <th className="pb-4 px-4">Invested</th>
            <th className="pb-4 px-4">Value</th>
            <th className="pb-4 pl-4">P&amp;L</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => (
            <tr key={holding.assetSymbol} className="border-b border-[rgba(132,157,176,0.18)] last:border-b-0">
              <td className="py-5 pr-4">
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        assetAccentBySymbol[holding.assetSymbol] ?? 'rgba(42, 120, 132, 0.72)',
                    }}
                  />
                  <div>
                    <div className="font-semibold text-[var(--text)]">{holding.assetSymbol}</div>
                    <div className="text-sm text-[var(--text-muted)]">
                      {holding.assetName} · {formatPercent(holding.allocationPercent)}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-5 text-[var(--text)]">{formatQuantity(holding.quantity)}</td>
              <td className="px-4 py-5 text-[var(--text)]">{formatCurrency(holding.invested)}</td>
              <td className="px-4 py-5 text-[var(--text)]">{formatCurrency(holding.currentValue)}</td>
              <td
                className={`pl-4 py-5 ${
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
