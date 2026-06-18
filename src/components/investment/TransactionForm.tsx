import { useState } from 'react';

interface TransactionFormValues {
  assetSymbol: string;
  assetName: string;
  amountInvested: string;
  purchasePrice: string;
  purchaseShares: string;
  purchaseDate: string;
  notes: string;
}

const defaultValues: TransactionFormValues = {
  assetSymbol: '',
  assetName: '',
  amountInvested: '',
  purchasePrice: '',
  purchaseShares: '',
  purchaseDate: '',
  notes: '',
};

export default function TransactionForm({
  isSubmitting,
  onSubmit,
}: {
  isSubmitting: boolean;
  onSubmit: (payload: {
    assetSymbol: string;
    assetName: string;
    amountInvested: number;
    purchasePrice: number;
    purchaseShares: number;
    purchaseDate: string;
    notes: string | null;
  }) => Promise<void>;
}) {
  const [values, setValues] = useState<TransactionFormValues>(defaultValues);
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: keyof TransactionFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    if (!values.assetSymbol.trim() || !values.assetName.trim() || !values.purchaseDate.trim()) {
      setError('Asset symbol, asset name, and purchase date are required.');
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
      assetName: values.assetName.trim(),
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
        <input
          className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
          onChange={handleChange('assetSymbol')}
          placeholder="BTC"
          value={values.assetSymbol}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
        <span className="eyebrow text-[10px]">Asset name</span>
        <input
          className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-base text-[var(--text)] outline-none transition focus:border-[var(--text)]"
          onChange={handleChange('assetName')}
          placeholder="Bitcoin"
          value={values.assetName}
        />
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

      <div className="flex items-end">
        <button
          className="w-full rounded-full bg-[var(--text)] px-5 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[var(--text-soft)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Saving...' : 'Add transaction'}
        </button>
      </div>

      {error ? (
        <p className="xl:col-span-3 rounded-2xl border border-[rgba(255,107,107,0.24)] bg-[rgba(255,107,107,0.08)] px-4 py-3 text-sm text-[var(--text)]">
          {error}
        </p>
      ) : null}
    </form>
  );
}
