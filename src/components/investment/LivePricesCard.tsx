import type { InvestmentLivePrice } from '../../services/investment';

function formatCurrency(value: number) {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatLastUpdated(value: string | null) {
  if (!value) {
    return 'Last updated unavailable';
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Last updated unavailable';
  }

  return `Last updated ${parsedDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

export default function LivePricesCard({
  livePrices,
  pricesLastUpdatedAt,
}: {
  livePrices: InvestmentLivePrice[];
  pricesLastUpdatedAt: string | null;
}) {
  if (livePrices.length === 0) {
    return null;
  }

  return (
    <section className="mt-6 rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-6 shadow-[0_16px_40px_rgba(68,102,136,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Live Prices</p>
          <h2 className="mt-3 text-3xl text-[var(--text)]">Current Market Prices</h2>
        </div>
        <p className="text-sm text-[var(--text-muted)]">{formatLastUpdated(pricesLastUpdatedAt)}</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {livePrices.map((price) => (
          <article
            key={price.assetSymbol}
            className="rounded-[1.25rem] border border-[var(--line)] bg-[rgba(238,246,255,0.72)] p-4"
          >
            <p className="eyebrow text-[10px]">{price.assetSymbol}</p>
            <h3 className="mt-2 text-lg text-[var(--text)]">{price.assetName}</h3>
            <p className="mt-4 text-2xl text-[var(--text)]">{formatCurrency(price.currentPrice)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
