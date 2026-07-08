import { achievements } from '../data/siteData';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedAchievement } from '../lib/achievementLocalization';

export default function LatestAchievementBanner() {
  const { t } = useLanguage();
  const latestAchievement = achievements.find((achievement) => achievement.latest);

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
        </div>
      </div>
    </section>
  );
}
