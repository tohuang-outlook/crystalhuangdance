import { achievements } from '../data/siteData';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedAchievement } from '../lib/achievementLocalization';

export default function Achievements() {
  const { t } = useLanguage();

  return (
    <section id="distinctions" className="section-padding section-divider">
      <div id="archive-timeline" className="scroll-mt-28" aria-hidden="true" />
      <div className="container-max space-y-10">
        <div className="space-y-4">
          <p className="eyebrow">{t('Archive Timeline', '完整檔案時間線')}</p>
          <h2 className="text-4xl sm:text-5xl">{t('Archive Timeline', '完整檔案時間線')}</h2>
          <p className="max-w-2xl text-base leading-8 text-[var(--text-muted)]">
            {t(
              'A chronological archive of major distinctions, awards, and formative milestones.',
              '依時間整理的重要榮譽、獎項與關鍵養成里程碑。'
            )}
          </p>
        </div>

        <div className="space-y-6">
          {achievements.map((achievement) => {
            const localizedAchievement = getLocalizedAchievement(achievement, t);

            return (
              <article
                key={`${achievement.year}-${achievement.title}`}
                className="grid gap-3 border-t border-[var(--line)] py-5 md:grid-cols-[7rem_1fr]"
              >
                <p className="text-sm uppercase tracking-[0.16em] text-[var(--text-muted)]">
                  {achievement.year}
                </p>
                <div className="space-y-2">
                  <h4 className="text-lg text-[var(--text)]">
                    {localizedAchievement.title}
                  </h4>
                  <p className="text-sm leading-7 text-[var(--text-muted)]">
                    {localizedAchievement.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
