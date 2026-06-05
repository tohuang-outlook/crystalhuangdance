import type { ReactNode } from 'react';

export default function AuthPageFrame({
  children,
  eyebrow,
  intro,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  intro: string;
  title: string;
}) {
  return (
    <section className="section-padding pt-32 sm:pt-36">
      <div className="container-max max-w-5xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[rgba(255,255,255,0.55)] p-8 shadow-[0_28px_80px_rgba(68,102,136,0.15)] backdrop-blur-sm sm:p-10">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-4 max-w-xl text-5xl leading-none text-[var(--text)] sm:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[var(--text-muted)]">
              {intro}
            </p>
            <div className="mt-8 space-y-4 text-sm leading-6 text-[var(--text-muted)]">
              <p>Frontend-only shell in place for account access, protected uploads, and session refresh.</p>
              <p>These screens are ready to connect to live `/api/auth/*` responses once the backend contract is wired.</p>
            </div>
          </div>
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_24px_60px_rgba(68,102,136,0.14)] sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
