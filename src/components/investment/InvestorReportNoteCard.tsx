import type { InvestmentMonthlyReportRecord } from '../../services/investment';

interface InvestorReportNoteCardProps {
  report: InvestmentMonthlyReportRecord;
}

function formatSnapshotDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`));
}

export default function InvestorReportNoteCard({ report }: InvestorReportNoteCardProps) {
  return (
    <section className="mt-6 rounded-[1.5rem] border border-[var(--line)] bg-white/80 p-6 shadow-[0_16px_40px_rgba(68,102,136,0.08)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Monthly Note</p>
          <h2 className="mt-4 text-3xl text-[var(--text)]">{report.label} Update</h2>
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          Snapshot date: {formatSnapshotDate(report.snapshotDate)}
        </p>
      </div>

      <div className="mt-5 rounded-[1.25rem] border border-[var(--line)] bg-[rgba(238,246,255,0.58)] p-5">
        <p className="text-base leading-7 text-[var(--text)]">{report.investorNote}</p>
      </div>
    </section>
  );
}
