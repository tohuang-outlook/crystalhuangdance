import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { reelVideos } from '../data/reels';

export default function Videos() {
  const { t } = useLanguage();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const featuredVideos = reelVideos.filter((video) => video.placement === 'featured');
  const supportingVideos = reelVideos.filter((video) => video.placement === 'supporting');
  const activeVideoData = reelVideos.find((video) => video.id === activeVideo) ?? null;

  useEffect(() => {
    if (!activeVideo) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveVideo(null);
        return;
      }

      if (event.key === 'Tab') {
        const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), iframe, video[controls]'
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
  }, [activeVideo]);

  return (
    <section id="videos" className="section-padding section-divider">
      <div className="container-max space-y-12">
        <div className="max-w-3xl space-y-4">
          <p className="eyebrow">{t('Featured Performance Reels', '精選演出影片')}</p>
          <h2 className="text-4xl sm:text-5xl">{t('Featured Performance Reels', '精選演出影片')}</h2>
          <p className="max-w-2xl text-base leading-8 text-[var(--text-muted)]">
            {t(
              'A curated set of performance documents selected for artistic review, auditions, and collaboration.',
              '為藝術審閱、試演與合作整理的精選演出紀錄。'
            )}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {featuredVideos.map((video) => (
              <button
                key={video.id}
                type="button"
                className="group relative overflow-hidden border border-[var(--line)] bg-[var(--surface)] text-left"
                onClick={() => setActiveVideo(video.id)}
              >
                <div className="absolute left-6 top-6 z-10 rounded-full border border-[var(--line)] bg-[rgba(250,247,242,0.78)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {t('Featured Reel', '精選主片')}
                </div>
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={t(video.title, video.titleZh)}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(250,247,242,0.48)] bg-[rgba(74,55,40,0.48)] text-[var(--bg)] transition-transform duration-300 group-hover:scale-105">
                      <Play size={30} className="ml-1 fill-current" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(74,55,40,0.76)] via-transparent to-transparent" />
                </div>
                <div className="space-y-3 p-6">
                  <h3 className="text-2xl text-[var(--text)]">{t(video.title, video.titleZh)}</h3>
                  <p className="max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
                    {t(video.description, video.descriptionZh)}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {supportingVideos.map((video) => (
              <button
                key={video.id}
                type="button"
                className="group flex w-full gap-4 border border-[var(--line)] bg-[var(--surface)] p-4 text-left transition-colors hover:bg-[var(--surface-soft)]"
                onClick={() => setActiveVideo(video.id)}
              >
                <div className="relative h-28 w-40 shrink-0 overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={t(video.title, video.titleZh)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-[rgba(74,55,40,0.24)]">
                    <Play size={18} className="ml-0.5 fill-[var(--bg)] text-[var(--bg)]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg leading-tight text-[var(--text)]">
                    {t(video.title, video.titleZh)}
                  </h3>
                  <p className="text-sm leading-6 text-[var(--text-muted)]">
                    {t(video.description, video.descriptionZh)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <a
            href="https://www.youtube.com/@crystalhuangdance"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-5 py-3 text-sm uppercase tracking-[0.16em] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
          >
            <Play size={14} className="fill-current" />
            {t('View Full YouTube Archive', '查看完整 YouTube 檔案')}
          </a>
        </div>
      </div>

      {activeVideo && activeVideoData ? (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(74,55,40,0.88)] p-4"
          onClick={() => setActiveVideo(null)}
          role="dialog"
          aria-modal="true"
          aria-label={t(activeVideoData.title, activeVideoData.titleZh)}
        >
          <div
            className="w-full max-w-5xl overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-6 border-b border-[var(--line)] bg-[var(--surface)] px-5 py-4 sm:px-6">
              <div className="min-w-0 space-y-1">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  {t(activeVideoData.metaLabel, activeVideoData.metaLabelZh)}
                </p>
                <h3 className="text-2xl leading-tight text-[var(--text)]">
                  {t(activeVideoData.title, activeVideoData.titleZh)}
                </h3>
              </div>
              <button
                ref={closeButtonRef}
                className="shrink-0 text-sm uppercase tracking-[0.18em] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                onClick={() => setActiveVideo(null)}
                aria-label={t('Close', '關閉')}
              >
                {t('Close', '關閉')}
              </button>
            </div>

            <div className="aspect-video w-full overflow-hidden bg-black">
              {activeVideoData.videoSrc ? (
                <video
                  src={activeVideoData.videoSrc}
                  title={t(activeVideoData.title, activeVideoData.titleZh)}
                  className="h-full w-full bg-black"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0`}
                  title={t(activeVideoData.title, activeVideoData.titleZh)}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
