import { siteConfig, trainingTimeline } from '../data/siteData';
import { useLanguage } from '../context/LanguageContext';

export default function About() {
  const { t, lang } = useLanguage();

  const aboutParagraphsZh = [
    `Crystal Huang 現為舊金山芭蕾舞學校培訓生，近年的發展橫跨菁英舞蹈教育、國際舞台演出與全美巡演。她的代表經歷包括 2024 洛桑國際芭蕾舞比賽 Prize Winner #4 與當代舞特別獎、YAGP 紐約總決賽高級女子組銀牌、SAIBC 高級女子組大獎，以及 2025 年 T.O.P. 亞裔美國傑出舞者榮譽。`,
    `她的訓練路徑兼具古典基礎與跨風格延展性。自 Yoko's Dance and Performing Arts Academy 啟蒙後，先後於 The Rock Center for Dance 與 Nevada School of Ballet 接受密集訓練，之後在 Bayer Ballet Academy 深化古典技法，並於 American Ballet Theatre Jacqueline Kennedy Onassis School 進一步進修，現持續於 San Francisco Ballet School 跟隨多位資深教師精進。`,
    `除比賽與學院訓練外，Crystal 亦曾以 NYCDA Outstanding Dancer、The Dance Awards Best Dancer 與 Radix Core Performer 身分於全美巡演，並參與紐約、義大利、比利時、瑞士、南非、中國與日本等地的演出與 gala。她的專業履歷也延伸至編舞、工作坊與教學型創作，持續將舞台經驗轉化為對年輕舞者的創作與分享。`,
  ];

  const paragraphs = lang === 'zh' ? aboutParagraphsZh : siteConfig.aboutParagraphs;

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
