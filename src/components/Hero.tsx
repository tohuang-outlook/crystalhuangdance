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
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(246,249,255,0.72)_0%,rgba(234,241,249,0.60)_36%,rgba(214,228,244,0.54)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(246,249,255,0.62)_0%,rgba(246,249,255,0.50)_28%,rgba(246,249,255,0.18)_56%,rgba(246,249,255,0.08)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(255,138,122,0.12),transparent_62%)]" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(180deg,transparent,rgba(247,250,255,0.18))]" />

      <div className="container-max relative z-10">
        <div className="max-w-4xl space-y-8 rounded-[2rem] border border-[rgba(250,247,242,0.52)] bg-[linear-gradient(135deg,rgba(248,251,255,0.84),rgba(240,245,251,0.64))] px-5 py-6 shadow-[0_24px_56px_rgba(78,99,124,0.10)] backdrop-blur-[12px] sm:px-8 sm:py-8 lg:bg-[linear-gradient(135deg,rgba(248,251,255,0.78),rgba(239,244,250,0.52))]">
          <div className="space-y-4">
            <p className="eyebrow">{t('Curated Dossier', '策劃檔案')}</p>
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--text-muted)]">
              {t(siteConfig.coverIdentity, siteConfig.coverIdentityZh)}
            </p>
            <h1 className="max-w-3xl text-6xl leading-none sm:text-7xl lg:text-8xl">
              {siteConfig.name}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[rgba(74,55,40,0.82)]">
              {t(siteConfig.coverStatement, siteConfig.coverStatementZh)}
            </p>
          </div>

          <div className="grid gap-4 border-t border-[var(--line)] pt-6 sm:grid-cols-2">
            {siteConfig.archiveEntryPoints.map((entryPoint) => (
              <a
                key={entryPoint.title}
                href={archiveHrefMap[entryPoint.href] ?? entryPoint.href}
                className="hover-float-card rounded-[1.5rem] border border-[rgba(120,138,160,0.22)] bg-[rgba(247,250,255,0.52)] p-5 transition-colors hover:border-[rgba(36,24,18,0.22)] hover:bg-[rgba(247,250,255,0.68)]"
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
        <div className="max-w-4xl border-t border-[rgba(250,247,242,0.34)] bg-[linear-gradient(180deg,rgba(250,247,242,0.08),rgba(250,247,242,0.76))] px-6 py-5 backdrop-blur-[3px]">
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
