import type { InvestmentTransaction } from '../../services/investment';

function formatCurrency(value: number) {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export default function TransactionTable({
  transactions,
}: {
  transactions: InvestmentTransaction[];
}) {
  if (transactions.length === 0) {
    return (
      <div className="mt-5 rounded-[1.25rem] border border-dashed border-[var(--line)] px-5 py-6 text-sm text-[var(--text-muted)]">
        No transactions recorded yet.
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-3 text-left">
        <thead>
          <tr className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
            <th>Date</th>
            <th>Asset</th>
            <th>Invested</th>
            <th>Price</th>
            <th>Shares</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="rounded-2xl bg-[rgba(238,246,255,0.72)]">
              <td className="px-3 py-4 text-[var(--text)]">{formatDate(transaction.purchaseDate)}</td>
              <td className="px-3 py-4">
                <div className="font-medium text-[var(--text)]">{transaction.assetSymbol}</div>
                <div className="text-sm text-[var(--text-muted)]">{transaction.assetName}</div>
              </td>
              <td className="px-3 py-4 text-[var(--text)]">
                {formatCurrency(transaction.amountInvested)}
              </td>
              <td className="px-3 py-4 text-[var(--text)]">
                {formatCurrency(transaction.purchasePrice)}
              </td>
              <td className="px-3 py-4 text-[var(--text)]">
                {transaction.purchaseShares.toFixed(8)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
