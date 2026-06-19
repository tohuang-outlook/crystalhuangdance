import type { InvestmentTransaction } from '../../services/investment';

function formatCurrency(value: number) {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(normalizedValue));
}

export default function TransactionTable({
  activeDeleteId,
  activeEditId,
  onDelete,
  onEdit,
  transactions,
}: {
  activeDeleteId?: number | null;
  activeEditId?: number | null;
  onDelete?: (transaction: InvestmentTransaction) => void;
  onEdit?: (transaction: InvestmentTransaction) => void;
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
            {onEdit || onDelete ? <th>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="rounded-2xl bg-[rgba(238,246,255,0.72)]">
              <td className="px-3 py-4 text-[var(--text)]">{formatDate(transaction.purchaseDate)}</td>
              <td className="px-3 py-4">
                <div className="font-medium text-[var(--text)]">{transaction.assetSymbol}</div>
                <div className="text-sm text-[var(--text-muted)]">{transaction.assetName}</div>
                {transaction.notes ? (
                  <div className="mt-1 text-sm text-[var(--text-muted)]">{transaction.notes}</div>
                ) : null}
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
              {onEdit || onDelete ? (
                <td className="px-3 py-4">
                  <div className="flex flex-wrap gap-2">
                    {onEdit ? (
                      <button
                        aria-label={`Edit ${transaction.assetSymbol} transaction from ${formatDate(transaction.purchaseDate)}`}
                        className="rounded-full border border-[var(--line)] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[var(--text)]"
                        onClick={() => onEdit(transaction)}
                        type="button"
                      >
                        {activeEditId === transaction.id ? 'Editing' : 'Edit'}
                      </button>
                    ) : null}
                    {onDelete ? (
                      <button
                        aria-label={`Delete ${transaction.assetSymbol} transaction from ${formatDate(transaction.purchaseDate)}`}
                        className="rounded-full border border-[rgba(255,107,107,0.24)] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[rgba(255,107,107,0.48)]"
                        onClick={() => onDelete(transaction)}
                        type="button"
                      >
                        {activeDeleteId === transaction.id ? 'Deleting...' : 'Delete'}
                      </button>
                    ) : null}
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
