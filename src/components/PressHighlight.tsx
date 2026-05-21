import { useLanguage } from '../context/LanguageContext';

const pressHighlights = [
  {
    source: 'Teen World of Arts Feature',
    sourceZh: 'Teen World of Arts 專訪',
    title: 'Prix de Lausanne Interview',
    titleZh: '洛桑國際芭蕾舞比賽專訪',
    description:
      'Crystal Huang was featured in Teen World of Arts following her recognition at the 2024 Prix de Lausanne, where she received both Prize Winner distinction and the Contemporary Dance Award.',
    descriptionZh:
      'Crystal Huang 於 2024 年洛桑國際芭蕾舞比賽獲得 Prize Winner 與當代舞特別獎後，接受 Teen World of Arts 專訪。',
    href: 'https://teenworldarts.com/magazine/crystal-huang-prix-de-lausanne',
  },
  {
    source: 'Los Altos Town Crier',
    sourceZh: 'Los Altos Town Crier 報導',
    title: 'ABT Scholarship Feature',
    titleZh: 'ABT 獎學金報導',
    description:
      'Los Altos Town Crier highlighted Crystal’s scholarship milestone with American Ballet Theatre, tracing her early studio training and rising professional trajectory.',
    descriptionZh:
      'Los Altos Town Crier 報導 Crystal 獲得 American Ballet Theatre 獎學金的重要里程碑，並回顧她早期的舞蹈訓練與持續上升的專業發展。',
    href: 'https://www.losaltosonline.com/schools/dancer-from-mv-studio-lands-scholarship-at-american-ballet-theatre/article_8a493d68-1d1e-11ef-b665-abc30a49a1d4.html',
  },
  {
    source: 'The T.O.P. Awards',
    sourceZh: 'The T.O.P. Awards',
    title: 'Artist Spotlight',
    titleZh: '藝術家焦點',
    description:
      'The T.O.P. Awards artist page presents Crystal’s profile within its distinguished roster, spotlighting her recognition and ongoing work as a young performer.',
    descriptionZh:
      'The T.O.P. Awards 藝術家頁面將 Crystal 納入其焦點陣容，突顯她作為年輕表演者所獲得的肯定與持續發展。',
    href: 'https://www.thetopawards.com/artists/crystal-huang',
  },
  {
    source: 'Pointe Magazine',
    sourceZh: 'Pointe Magazine',
    title: 'Daily Routine Feature',
    titleZh: '日常訓練特輯',
    description:
      "Pointe Magazine spotlights Crystal Huang's daily routine, offering a closer look at the structure, discipline, and training rhythm behind her development as a young ballet artist.",
    descriptionZh:
      'Pointe Magazine 聚焦 Crystal Huang 的日常訓練節奏，呈現她作為年輕芭蕾舞者在生活、紀律與養成上的細節。',
    href: 'https://pointemagazine.com/crystal-huang-daily-routine/#gsc.tab=0',
  },
];

export default function PressHighlight() {
  const { t } = useLanguage();

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

        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          {pressHighlights.map((item) => (
            <article
              key={item.href}
              className="hover-float-card rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] px-6 py-7 sm:px-8"
            >
              <p className="eyebrow">{t(item.source, item.sourceZh)}</p>
              <h3 className="mt-3 text-3xl leading-tight">{t(item.title, item.titleZh)}</h3>
              <p className="mt-5 text-base leading-8 text-[var(--text-muted)]">
                {t(item.description, item.descriptionZh)}
              </p>
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center rounded-full border border-[var(--line)] bg-[rgba(250,247,242,0.72)] px-5 py-3 text-sm uppercase tracking-[0.18em] text-[var(--text)] transition-colors hover:bg-[rgba(250,247,242,0.95)]"
              >
                {t('Read the feature', '閱讀專訪')}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
