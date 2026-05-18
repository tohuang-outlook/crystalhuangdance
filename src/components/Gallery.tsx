import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  groupChoreographyEntries,
  groupChoreographyMoments,
  masterClassMoments,
  masterClassTimeline,
} from '../data/siteData';
import { useLanguage } from '../context/LanguageContext';

const archiveImagePositionClasses: Record<string, string> = {
  'Ballet Master Class at YAGP': 'object-[center_58%]',
};

export default function Gallery() {
  const [selectedMediaState, setSelectedMediaState] = useState<{
    collection: 'master' | 'group';
    index: number;
  } | null>(null);
  const { t } = useLanguage();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const selectedItems =
    selectedMediaState?.collection === 'group' ? groupChoreographyMoments : masterClassMoments;
  const selectedItem =
    selectedMediaState !== null ? selectedItems[selectedMediaState.index] : null;

  useEffect(() => {
    if (selectedMediaState === null) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedMediaState(null);
        return;
      }

      if (event.key === 'Tab') {
        const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), video[controls]'
        );

        if (!focusableElements?.length) {
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMediaState]);

  const goNext = () => {
    if (selectedMediaState !== null) {
      setSelectedMediaState({
        collection: selectedMediaState.collection,
        index: (selectedMediaState.index + 1) % selectedItems.length,
      });
    }
  };

  const goPrev = () => {
    if (selectedMediaState !== null) {
      setSelectedMediaState({
        collection: selectedMediaState.collection,
        index: (selectedMediaState.index - 1 + selectedItems.length) % selectedItems.length,
      });
    }
  };

  return (
    <section
      id="gallery"
      aria-labelledby="master-class-archive-heading"
      className="section-padding section-divider"
    >
      <div className="container-max space-y-14">
        <div className="max-w-3xl space-y-4">
          <p className="eyebrow">{t('Master Class and Choreographer', '大師課與編舞指導')}</p>
          <h2 id="master-class-archive-heading" className="text-4xl sm:text-5xl">
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
                className="hover-float-card flex h-full flex-col overflow-hidden border border-[var(--line)] bg-[var(--surface)] text-left"
                onClick={() => setSelectedMediaState({ collection: 'master', index })}
              >
                <img
                  src={item.image}
                  alt={t(item.imageAlt, item.imageAltZh)}
                  className={`h-64 w-full object-cover ${archiveImagePositionClasses[item.title] ?? 'object-center'}`}
                />
                <div className="flex flex-1 flex-col space-y-2 p-5">
                  <p className="min-h-[5.5rem] text-2xl leading-tight text-[var(--text)]">
                    {t(item.title, item.titleZh)}
                  </p>
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
                    {t(item.subtitle, item.subtitleZh)}
                  </p>
                  {item.video ? (
                    <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--accent)]">
                      {t('Click to play video', '點擊播放影片')}
                    </p>
                  ) : null}
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

          <div className="space-y-4 pt-2">
            <p className="eyebrow">{t('Featured Group Works', '精選群舞作品')}</p>
            <div className="grid gap-6 sm:grid-cols-2">
              {groupChoreographyMoments.map((item, index) => (
                <button
                  key={`${item.title}-${item.subtitle}`}
                  type="button"
                  className="hover-float-card flex h-full flex-col overflow-hidden border border-[var(--line)] bg-[var(--surface)] text-left"
                  onClick={() => setSelectedMediaState({ collection: 'group', index })}
                >
                  <img
                    src={item.image}
                    alt={t(item.imageAlt, item.imageAltZh)}
                    className={`h-64 w-full object-cover ${archiveImagePositionClasses[item.title] ?? 'object-center'}`}
                  />
                  <div className="flex flex-1 flex-col space-y-2 p-5">
                    <p className="min-h-[5.5rem] text-2xl leading-tight text-[var(--text)]">
                      {t(item.title, item.titleZh)}
                    </p>
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
                      {t(item.subtitle, item.subtitleZh)}
                    </p>
                    {item.video ? (
                      <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--accent)]">
                        {t('Click to play video', '點擊播放影片')}
                      </p>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedItem ? (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(74,55,40,0.88)]"
          onClick={() => setSelectedMediaState(null)}
          role="dialog"
          aria-modal="true"
          aria-label={t(selectedItem.title, selectedItem.titleZh)}
        >
          <button
            ref={closeButtonRef}
            className="absolute right-4 top-4 z-10 text-[rgba(250,247,242,0.82)] transition-colors hover:text-[var(--bg)]"
            onClick={() => setSelectedMediaState(null)}
            aria-label={t('Close', '關閉')}
          >
            <X size={32} />
          </button>
          <button
            className="absolute left-4 z-10 text-[rgba(250,247,242,0.82)] transition-colors hover:text-[var(--bg)]"
            onClick={(event) => {
              event.stopPropagation();
              goPrev();
            }}
            aria-label={t('Previous', '上一張')}
          >
            <ChevronLeft size={40} />
          </button>
          <button
            className="absolute right-4 z-10 text-[rgba(250,247,242,0.82)] transition-colors hover:text-[var(--bg)]"
            onClick={(event) => {
              event.stopPropagation();
              goNext();
            }}
            aria-label={t('Next', '下一張')}
          >
            <ChevronRight size={40} />
          </button>
          {selectedItem.video ? (
            <div
              className="w-full max-w-5xl overflow-hidden rounded-lg border border-[rgba(250,247,242,0.16)] bg-[var(--surface)] shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] px-5 py-4">
                <div>
                  <p className="eyebrow">{t(selectedItem.subtitle, selectedItem.subtitleZh)}</p>
                  <h4 className="text-2xl text-[var(--text)]">
                    {t(selectedItem.title, selectedItem.titleZh)}
                  </h4>
                </div>
                <button
                  type="button"
                  className="text-sm uppercase tracking-[0.24em] text-[var(--text-muted)] transition-colors duration-300 hover:text-[var(--text)]"
                  onClick={() => setSelectedMediaState(null)}
                >
                  {t('Close', '關閉')}
                </button>
              </div>
              <video
                className="aspect-video w-full bg-black"
                src={selectedItem.video}
                controls
                autoPlay
                playsInline
              />
            </div>
          ) : (
            <img
              src={selectedItem.image}
              alt={t(selectedItem.imageAlt, selectedItem.imageAltZh)}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
              onClick={(event) => event.stopPropagation()}
            />
          )}
        </div>
      ) : null}
    </section>
  );
}
