import { siteConfig, trainingTimeline } from '../data/siteData';
import { useLanguage } from '../context/LanguageContext';

export default function About() {
  const { t, lang } = useLanguage();

  const aboutParagraphsZh = [
    `Crystal Huang，16歲，在舞蹈領域締造了令人矚目的成就。2024年，她成為備受尊崇的洛桑國際芭蕾舞比賽得獎者——全球九位獲得獎學金的舞者之一——並同時榮獲該賽事的女子當代舞蹈特別獎。同年，她在紐約 YAGP 總決賽高級組獲得銀牌，並在南非國際芭蕾舞比賽奪得大獎。2025年，她更獲頒 T.O.P. 亞裔美國傑出舞者獎。`,
    `Crystal 的訓練歷程與她的成就同樣多元。她在 Fremont 的 Yoko 舞蹈學院展開舞蹈之路，在拉斯維加斯的 The Rock Center for Dance 接受大量訓練，後來在 Bayer Ballet Academy 深研 Vaganova 教學法。2024-25學年就讀美國芭蕾舞劇院 Jacqueline Kennedy Onassis 學校（Upper 3），師承 Stella Abrera 與 Yan Chen 等名師。2025年9月起，她以培訓生身分加入舊金山芭蕾舞學校（Level 8），接受 Pascal Molat、Grace Holmes 與 Dana Genshaft 的指導。`,
    `除比賽外，Crystal 已踏上全球舞台——從西西里島到日本、比利時到南非——並以 NYCDA 全國青少年女子傑出舞者及舞蹈獎最佳舞者身分巡迴演出。她也為美國各地的舞者編排獨舞和群舞作品，將她對舞蹈的熱愛與藝術傳承下去。她相信舞蹈在於讓觀眾有所感動，並以愛、紀律與藝術精神投入每一次演出。`,
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
