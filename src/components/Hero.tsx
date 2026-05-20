import { siteConfig } from '../data/siteData';
import { useLanguage } from '../context/LanguageContext';

export default function Hero() {
  const { t } = useLanguage();

  const archiveHrefMap: Record<string, string> = {
    '#media': '#styles',
    '#range': '#styles',
  };

  return (
    <section id="home" className="section-padding relative overflow-hidden pt-32 sm:pt-36">
      <video
        className="absolute inset-0 h-full w-full object-cover object-center"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/crystal-hero.jpg"
        aria-label="Crystal Huang hero background video"
      >
        <source src="/crystal-hero-side.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(244,248,255,0.78)_0%,rgba(236,242,250,0.66)_34%,rgba(214,228,244,0.56)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(255,107,107,0.16),transparent_60%)]" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.16))]" />

      <div className="container-max relative z-10">
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

          <div className="grid gap-4 border-t border-[var(--line)] pt-6 sm:grid-cols-2">
            {siteConfig.archiveEntryPoints.map((entryPoint) => (
              <a
                key={entryPoint.title}
                href={archiveHrefMap[entryPoint.href] ?? entryPoint.href}
                className="hover-float-card rounded-[1.5rem] border border-[var(--line)] bg-[rgba(184,196,210,0.58)] p-5 transition-colors hover:border-[rgba(36,24,18,0.22)] hover:bg-[rgba(197,208,221,0.78)]"
              >
                <p className="text-lg text-[var(--text)]">{t(entryPoint.title, entryPoint.titleZh)}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  {t(entryPoint.description, entryPoint.descriptionZh)}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="container-max relative z-10 mt-8 sm:mt-10">
        <div className="border-t border-[rgba(250,247,242,0.35)] bg-[linear-gradient(180deg,transparent,rgba(250,247,242,0.78))] px-6 py-5">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
            {t('Professional Focus', '專業重點')}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--text)]">
            {t(siteConfig.heroSubtitle, '芭蕾・當代・爵士・抒情・嘻哈・音樂劇')}
          </p>
        </div>
      </div>
    </section>
  );
}
