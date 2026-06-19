import { useEffect, useState } from 'react';
import { INVESTMENT_ASSET_OPTIONS } from '../../services/investment';

interface TransactionFormValues {
  assetSymbol: string;
  amountInvested: string;
  purchasePrice: string;
  purchaseShares: string;
  purchaseDate: string;
  notes: string;
}

const defaultValues: TransactionFormValues = {
  assetSymbol: '',
  amountInvested: '',
  purchasePrice: '',
  purchaseShares: '',
  purchaseDate: '',
  notes: '',
};

function normalizeInitialValues(values?: Partial<TransactionFormValues>): TransactionFormValues {
  return {
    ...defaultValues,
    ...values,
  };
}

export default function TransactionForm({
  initialValues,
  isSubmitting,
  onCancel,
  onSubmit,
  submitLabel = 'Add transaction',
}: {
  initialValues?: Partial<TransactionFormValues>;
  isSubmitting: boolean;
  onCancel?: () => void;
  onSubmit: (payload: {
    assetSymbol: string;
    amountInvested: number;
    purchasePrice: number;
    purchaseShares: number;
    purchaseDate: string;
    notes: string | null;
  }) => Promise<void>;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<TransactionFormValues>(normalizeInitialValues(initialValues));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues(normalizeInitialValues(initialValues));
    setError(null);
  }, [initialValues]);

  const handleChange =
    (field: keyof TransactionFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValues((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const amountInvested = Number(values.amountInvested);
    const rawPurchasePrice = values.purchasePrice.trim();
    const rawPurchaseShares = values.purchaseShares.trim();
    const purchasePrice = rawPurchasePrice ? Number(rawPurchasePrice) : NaN;
    const purchaseShares = rawPurchaseShares ? Number(rawPurchaseShares) : NaN;

    if (!values.assetSymbol.trim() || !values.purchaseDate.trim()) {
      setError('Asset symbol and purchase date are required.');
      return;
    }

    if (!Number.isFinite(amountInvested) || amountInvested <= 0) {
      setError('Amount invested must be a positive number.');
      return;
    }

    const hasPurchasePrice = Number.isFinite(purchasePrice) && purchasePrice > 0;
    const hasPurchaseShares = Number.isFinite(purchaseShares) && purchaseShares > 0;

    if (!hasPurchasePrice && !hasPurchaseShares) {
      setError('Enter either purchase price or purchase shares.');
      return;
    }

    const normalizedPurchasePrice = hasPurchasePrice ? purchasePrice : amountInvested / purchaseShares;
    const normalizedPurchaseShares = hasPurchaseShares ? purchaseShares : amountInvested / purchasePrice;

    await onSubmit({
      assetSymbol: values.assetSymbol.trim().toUpperCase(),
      amountInvested,
      purchasePrice: normalizedPurchasePrice,
      purchaseShares: normalizedPurchaseShares,
      purchaseDate: values.purchaseDate.trim(),
      notes: values.notes.trim() || null,
    });

    setValues(defaultValues);
  };

  return (
    <form className="mt-5 grid gap-4 xl:grid-cols-3" onSubmit={(event) => void handleSubmit(event)}>
      <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
        <span className="eyebrow text-[10px]">Asset symbol</span>
        <select
          aria-label="Asset symbol"
          className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
          onChange={handleChange('assetSymbol')}
          value={values.assetSymbol}
        >
          <option value="">Select asset</option>
          {INVESTMENT_ASSET_OPTIONS.map((asset) => (
            <option key={asset.symbol} value={asset.symbol}>
              {asset.symbol}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
        <span className="eyebrow text-[10px]">Amount invested</span>
        <input
          className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
          inputMode="decimal"
          onChange={handleChange('amountInvested')}
          placeholder="5000"
          value={values.amountInvested}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
        <span className="eyebrow text-[10px]">Purchase price</span>
        <input
          className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
          inputMode="decimal"
          onChange={handleChange('purchasePrice')}
          placeholder="50000"
          value={values.purchasePrice}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
        <span className="eyebrow text-[10px]">Purchase shares</span>
        <input
          className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
          inputMode="decimal"
          onChange={handleChange('purchaseShares')}
          placeholder="0.1"
          value={values.purchaseShares}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
        <span className="eyebrow text-[10px]">Purchase date</span>
        <input
          className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
          onChange={handleChange('purchaseDate')}
          type="date"
          value={values.purchaseDate}
        />
      </label>

      <label className="xl:col-span-2 flex flex-col gap-2 text-sm text-[var(--text-muted)]">
        <span className="eyebrow text-[10px]">Notes</span>
        <textarea
          className="min-h-28 rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
          onChange={handleChange('notes')}
          placeholder="Optional note"
          value={values.notes}
        />
      </label>

      <div className="flex items-end gap-3">
        <button
          className="w-full rounded-full bg-[var(--text)] px-5 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[var(--text-soft)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel ? (
          <button
            className="w-full rounded-full border border-[var(--line)] px-5 py-3 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition hover:border-[var(--text)] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="xl:col-span-3 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--text)]">
          {error}
        </p>
      ) : null}
    </form>
  );
}
