import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  groupChoreographyEntries,
  masterClassMoments,
  masterClassTimeline,
} from '../data/siteData';
import { useLanguage } from '../context/LanguageContext';

export default function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { t } = useLanguage();
  const selectedItem = selectedIndex !== null ? masterClassMoments[selectedIndex] : null;

  const goNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % masterClassMoments.length);
    }
  };

  const goPrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + masterClassMoments.length) % masterClassMoments.length);
    }
  };

  return (
    <section id="gallery" className="section-padding section-divider">
      <div className="container-max space-y-14">
        <div className="max-w-3xl space-y-4">
          <p className="eyebrow">{t('Master Class and Choreographer', '大師課與編舞指導')}</p>
          <h2 className="text-4xl sm:text-5xl">
            {t('Master Class and Choreographer', '大師課與編舞指導')}
          </h2>
          <p className="max-w-2xl text-base leading-8 text-[var(--text-muted)]">
            {t(
              'A focused archive of master classes, choreographic mentorship, and formative artist development.',
              '聚焦於大師課、編舞指導與藝術養成歷程的精選檔案。'
            )}
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="eyebrow">{t('Archive Timeline', '完整檔案時間線')}</p>
            <h3 className="text-3xl">{t('Archive Timeline', '完整檔案時間線')}</h3>
          </div>

          <div className="grid gap-4 border-t border-[var(--line)] pt-6">
            {masterClassTimeline.map((entry) => (
              <div
                key={`${entry.date}-${entry.title}`}
                className="grid gap-3 border-b border-[var(--line)] pb-5 md:grid-cols-[12rem_1fr]"
              >
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  {t(entry.date, entry.dateZh)}
                </p>
                <div className="space-y-1">
                  <p className="text-2xl text-[var(--text)]">{t(entry.title, entry.titleZh)}</p>
                  <p className="text-sm leading-6 text-[var(--text-muted)]">
                    {t(entry.location, entry.locationZh)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="eyebrow">
              {t('Selected Master Class Moments', '精選大師課片段')}
            </p>
            <h3 className="text-3xl">
              {t('Selected Master Class Moments', '精選大師課片段')}
            </h3>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {masterClassMoments.map((item, index) => (
              <button
                key={`${item.title}-${item.subtitle}`}
                type="button"
                className="hover-float-card overflow-hidden border border-[var(--line)] bg-[var(--surface)] text-left"
                onClick={() => setSelectedIndex(index)}
              >
                <img
                  src={item.image}
                  alt={t(item.imageAlt, item.imageAltZh)}
                  className="h-64 w-full object-cover"
                />
                <div className="space-y-2 p-5">
                  <p className="text-2xl text-[var(--text)]">{t(item.title, item.titleZh)}</p>
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
                    {t(item.subtitle, item.subtitleZh)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="eyebrow">{t('Groups Choreography', '群體編舞作品')}</p>
            <h3 className="text-3xl">{t('Groups Choreography', '群體編舞作品')}</h3>
          </div>

          <div className="space-y-4 border-t border-[var(--line)] pt-6">
            {groupChoreographyEntries.map((entry) => (
              <div
                key={`${entry.season}-${entry.organization}-${entry.work}`}
                className="grid gap-3 border-b border-[var(--line)] pb-5 md:grid-cols-[10rem_1fr]"
              >
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  {t(entry.season, entry.seasonZh)}
                </p>
                <p className="text-lg leading-7 text-[var(--text)]">
                  {t(entry.organization, entry.organizationZh)} — {t(entry.work, entry.workZh)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedItem ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(74,55,40,0.88)]"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            className="absolute right-4 top-4 z-10 text-[rgba(250,247,242,0.82)] transition-colors hover:text-[var(--bg)]"
            onClick={() => setSelectedIndex(null)}
            aria-label="Close"
          >
            <X size={32} />
          </button>
          <button
            className="absolute left-4 z-10 text-[rgba(250,247,242,0.82)] transition-colors hover:text-[var(--bg)]"
            onClick={(event) => {
              event.stopPropagation();
              goPrev();
            }}
            aria-label="Previous"
          >
            <ChevronLeft size={40} />
          </button>
          <button
            className="absolute right-4 z-10 text-[rgba(250,247,242,0.82)] transition-colors hover:text-[var(--bg)]"
            onClick={(event) => {
              event.stopPropagation();
              goNext();
            }}
            aria-label="Next"
          >
            <ChevronRight size={40} />
          </button>
          <img
            src={selectedItem.image}
            alt={t(selectedItem.imageAlt, selectedItem.imageAltZh)}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </section>
  );
}
