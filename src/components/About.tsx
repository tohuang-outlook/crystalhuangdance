import { useEffect, useMemo, useState } from 'react';
import { siteConfig, trainingTimeline } from '../data/siteData';
import { useLanguage } from '../context/LanguageContext';
import { fetchArtistProfile, type ArtistProfileRecord } from '../services/artistProfile';

function createFallbackProfile(): ArtistProfileRecord {
  return {
    coverIdentity: siteConfig.coverIdentity,
    coverIdentityZh: siteConfig.coverIdentityZh,
    coverStatement: siteConfig.coverStatement,
    coverStatementZh: siteConfig.coverStatementZh,
    aboutParagraph1: siteConfig.aboutParagraphs[0] ?? '',
    aboutParagraph1Zh: siteConfig.aboutParagraphsZh[0] ?? '',
    aboutParagraph2: siteConfig.aboutParagraphs[1] ?? '',
    aboutParagraph2Zh: siteConfig.aboutParagraphsZh[1] ?? '',
    aboutParagraph3: siteConfig.aboutParagraphs[2] ?? '',
    aboutParagraph3Zh: siteConfig.aboutParagraphsZh[2] ?? '',
  };
}

export default function About() {
  const { t, lang } = useLanguage();
  const [profile, setProfile] = useState<ArtistProfileRecord>(createFallbackProfile);
  const paragraphs = useMemo(
    () =>
      lang === 'zh'
        ? [profile.aboutParagraph1Zh, profile.aboutParagraph2Zh, profile.aboutParagraph3Zh]
        : [profile.aboutParagraph1, profile.aboutParagraph2, profile.aboutParagraph3],
    [lang, profile]
  );

  useEffect(() => {
    let isActive = true;

    async function loadArtistProfile() {
      try {
        const response = await fetchArtistProfile();

        if (!isActive || !response) {
          return;
        }

        setProfile(response);
      } catch {
        // Keep the static profile fallback if the public endpoint is unavailable.
      }
    }

    void loadArtistProfile();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section id="about" className="section-padding section-divider relative">
      <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[rgba(166,124,82,0.06)] blur-3xl" />

      <div className="container-max relative z-10 grid gap-16 lg:grid-cols-[0.95fr_1.05fr]">
        <div id="profile" className="space-y-6">
          <p className="eyebrow">{t('Artist Profile', '藝術家簡介')}</p>
          <h2 className="text-4xl sm:text-5xl">{t('Artist Profile', '藝術家簡介')}</h2>
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="max-w-xl text-base leading-8 text-[var(--text-muted)]">
              {paragraph}
            </p>
          ))}
        </div>

        <div id="archive" className="space-y-6">
          <p className="eyebrow">{t('Training Archive', '訓練檔案')}</p>
          <h2 className="text-4xl sm:text-5xl">{t('Training Archive', '訓練檔案')}</h2>
          <div className="space-y-4">
            {trainingTimeline.map((training) => (
              <article
                key={`${training.period}-${training.school}`}
                className="grid gap-2 border-t border-[var(--line)] py-4 sm:grid-cols-[11rem_1fr]"
              >
                <p className="text-sm uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  {training.period}
                </p>
                <div className="space-y-1">
                  <h3 className="text-lg text-[var(--text)]">{training.school}</h3>
                  <p className="text-sm leading-6 text-[var(--text-muted)]">
                    {training.teachers}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
