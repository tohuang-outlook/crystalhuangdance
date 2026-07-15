import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  pressHighlights as fallbackPressHighlights,
  type PressHighlightEntry,
} from '../data/pressHighlights';
import { fetchPressHighlights } from '../services/pressHighlights';

export default function PressHighlight() {
  const { t } = useLanguage();
  const [highlights, setHighlights] = useState<PressHighlightEntry[]>(fallbackPressHighlights);
  const recentHighlights = highlights.slice(0, 3);
  const archiveHighlights = highlights.slice(3);

  useEffect(() => {
    let isMounted = true;

    const loadPressHighlights = async () => {
      try {
        const response = await fetchPressHighlights();

        if (!isMounted || response.length === 0) {
          return;
        }

        setHighlights(response);
      } catch {
        // Fall back to static data when the admin-managed feed is unavailable.
      }
    };

    void loadPressHighlights();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="press" className="section-padding section-divider relative">
      <div className="container-max space-y-8">
        <div className="grid gap-8 lg:grid-cols-[0.32fr_0.68fr] lg:items-start">
          <div className="space-y-3">
            <p className="eyebrow">{t('Press Highlight', '媒體焦點')}</p>
            <h2 className="text-3xl sm:text-4xl">{t('Press Highlight', '媒體焦點')}</h2>
          </div>

          <p className="max-w-3xl text-base leading-8 text-[var(--text-muted)]">
            {t(
              'A small selection of interviews, features, and artist spotlights that trace Crystal Huang’s development across training, recognition, and performance.',
              '精選幾篇訪談、人物報導與藝術家焦點內容，呈現 Crystal Huang 在訓練、獲獎與演出上的發展軌跡。'
            )}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="grid gap-5">
            {recentHighlights.map((item, index) => (
              <article
                key={item.id}
                className="hover-float-card rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] px-6 py-7 sm:px-8 sm:py-8"
              >
                <p className="eyebrow">
                  {index === 0 ? t('Featured Article', '焦點文章') : t('Recent Press Highlight', '最新媒體焦點')}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  {t(item.source, item.sourceZh)}
                </p>
                <p className="mt-3 text-sm text-[var(--text-muted)]">
                  {t(item.dateLabel, item.dateLabelZh)}
                </p>
                <h3 className="mt-4 max-w-3xl text-4xl leading-tight sm:text-5xl">
                  {t(item.title, item.titleZh)}
                </h3>
                <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--text-muted)]">
                  {t(item.description, item.descriptionZh)}
                </p>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 inline-flex items-center rounded-full border border-[var(--line)] bg-[rgba(250,247,242,0.72)] px-5 py-3 text-sm uppercase tracking-[0.18em] text-[var(--text)] transition-colors hover:bg-[rgba(250,247,242,0.95)]"
                >
                  {t('Read the feature', '閱讀專訪')}
                </a>
                <a
                  href={item.imageHref ?? item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 block aspect-[3/2] overflow-hidden rounded-[1.5rem] border border-[var(--line)] transition-transform hover:scale-[1.01]"
                  aria-label={t('Watch interview video', '觀看訪談影片')}
                >
                  <img
                    src={item.imageSrc}
                    alt={t(item.imageAlt, item.imageAltZh)}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-center"
                  />
                </a>
              </article>
            ))}
          </div>

          <div className="grid gap-5">
            {archiveHighlights.map((item) => (
              <article
                key={item.id}
                className="hover-float-card overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)]"
              >
                <a
                  href={item.imageHref ?? item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block aspect-[16/9] overflow-hidden border-b border-[var(--line)]"
                  aria-label={t('Open featured press image', '開啟焦點媒體圖片')}
                >
                  <img
                    src={item.imageSrc}
                    alt={t(item.imageAlt, item.imageAltZh)}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-[1.03]"
                  />
                </a>
                <div className="px-6 py-6">
                  <p className="eyebrow">{t(item.source, item.sourceZh)}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    {t(item.dateLabel, item.dateLabelZh)}
                  </p>
                  <h3 className="mt-3 text-2xl leading-tight">{t(item.title, item.titleZh)}</h3>
                  <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
                    {t(item.description, item.descriptionZh)}
                  </p>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center rounded-full border border-[var(--line)] bg-[rgba(250,247,242,0.72)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition-colors hover:bg-[rgba(250,247,242,0.95)]"
                  >
                    {t('Read the feature', '閱讀專訪')}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
