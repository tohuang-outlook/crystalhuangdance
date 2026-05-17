import { siteConfig } from '../data/siteData';
import { useLanguage } from '../context/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();

  const archiveHrefMap: Record<string, string> = {
    '#media': '#videos',
    '#range': '#styles',
  };

  return (
    <section id="home" className="section-padding relative overflow-hidden pt-32 sm:pt-36">
      <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(166,124,82,0.18),transparent_60%)]" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.18))]" />

      <div className="container-max relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="eyebrow">{t('Curated Dossier', '策劃檔案')}</p>
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--text-muted)]">
              {t(siteConfig.coverIdentity, siteConfig.coverIdentityZh)}
            </p>
            <h1 className="max-w-3xl text-6xl leading-none sm:text-7xl lg:text-8xl">
              {siteConfig.name}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--text-muted)]">
              {t(siteConfig.coverStatement, siteConfig.coverStatementZh)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-[var(--line)] pt-5">
            {siteConfig.identityStrip.slice(1).map((item) => (
              <span
                key={item.label}
                className="rounded-full border border-[var(--line)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]"
              >
                {t(item.label, item.labelZh)}
              </span>
            ))}
          </div>

          <div className="grid gap-4 border-t border-[var(--line)] pt-6 sm:grid-cols-2">
            {siteConfig.archiveEntryPoints.map((entryPoint) => (
              <a
                key={entryPoint.title}
                href={archiveHrefMap[entryPoint.href] ?? entryPoint.href}
                className="rounded-[1.5rem] border border-[var(--line)] bg-[rgba(24,23,20,0.72)] p-5 transition-colors hover:border-[rgba(243,238,228,0.24)] hover:bg-[rgba(24,23,20,0.92)]"
              >
                <p className="text-lg text-[var(--text)]">{t(entryPoint.title, entryPoint.titleZh)}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  {t(entryPoint.description, entryPoint.descriptionZh)}
                </p>
              </a>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)]">
          <img
            src="/crystal-hero.jpg"
            alt="Crystal Huang cover portrait"
            className="h-[34rem] w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#11100d]/30 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-[linear-gradient(180deg,transparent,rgba(17,16,13,0.82))] px-6 py-5">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
              {t('Professional Focus', '專業重點')}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--text)]">
              {t(siteConfig.heroSubtitle, '芭蕾・當代・爵士・抒情・嘻哈・音樂劇')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
