import { achievements } from '../data/siteData';
import { useLanguage } from '../context/LanguageContext';
import { reelVideos } from '../data/reels';
import { getLocalizedAchievement } from '../lib/achievementLocalization';

export default function LatestAchievementBanner() {
  const { t } = useLanguage();
  const latestAchievement = achievements.find((achievement) => achievement.latest);
  const moscowVideos = reelVideos.filter((video) => video.event === 'moscow');

  if (!latestAchievement) {
    return null;
  }

  const localizedAchievement = getLocalizedAchievement(latestAchievement, t);

  return (
    <section className="section-divider px-4 py-6 sm:px-6 lg:px-8" aria-labelledby="latest-achievement-title">
      <div className="container-max">
        <div className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] px-6 py-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:px-8 sm:py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="eyebrow">{t('Latest Achievement', '最新成就')}</p>
              <h2 id="latest-achievement-title" className="text-2xl leading-tight text-[var(--text)] sm:text-3xl">
                {localizedAchievement.title}
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-[var(--text-muted)] sm:text-base">
                {localizedAchievement.description}
              </p>
            </div>

            <a
              href="#distinctions"
              className="inline-flex items-center justify-center self-start rounded-full border border-[var(--line)] px-5 py-3 text-sm uppercase tracking-[0.16em] text-[var(--text-muted)] transition-colors hover:text-[var(--text)] lg:self-center"
            >
              {t('View Achievement', '查看成就')}
            </a>
          </div>

          {moscowVideos.length ? (
            <div className="mt-6 border-t border-[var(--line)] pt-6">
              <div className="mb-4 space-y-1">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {t('Moscow Performance Reels', '莫斯科演出影片')}
                </p>
                <p className="text-sm leading-6 text-[var(--text-muted)]">
                  {t(
                    'Moscow competition footage, organized as quick-view cards beneath the latest achievement.',
                    '將莫斯科賽事影片整理成精簡卡片，延伸顯示在最新成就下方。'
                  )}
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {moscowVideos.map((video) => (
                  <a
                    key={video.id}
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface-soft)] text-left transition-colors hover:bg-[var(--surface)]"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={t(video.title, video.titleZh)}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="space-y-2 p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        {t(video.metaLabel, video.metaLabelZh)}
                      </p>
                      <h3 className="text-base leading-snug text-[var(--text)]">
                        {t(video.title, video.titleZh)}
                      </h3>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
