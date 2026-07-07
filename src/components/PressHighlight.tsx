import { useLanguage } from '../context/LanguageContext';

const pressHighlights = [
  {
    source: 'XV Moscow International Ballet Competition',
    sourceZh: '第十五屆莫斯科國際芭蕾舞大賽',
    date: 'July 2026',
    dateZh: '2026 年 7 月',
    title: '2026 XV Moscow Ballet Competition Award Ceremony',
    titleZh: '2026 第十五屆莫斯科芭蕾舞大賽頒獎典禮',
    description:
      'Crystal Huang 2026 XV Moscow Ballet Competition - Junior Group, Girls, Solo First Prize and Gold Medal Winner',
    descriptionZh: 'Crystal Huang 榮獲 2026 第十五屆莫斯科芭蕾舞大賽青少年女子獨舞組第一名與金牌。',
    href: 'https://www.youtube.com/shorts/uNTARMFtDm8',
    imageSrc: '/crystal-press-moscow-award-ceremony.png',
    imageAlt: 'Crystal Huang at the 2026 XV Moscow Ballet Competition award ceremony',
    imageHref: 'https://www.youtube.com/shorts/uNTARMFtDm8',
  },
  {
    source: '2026 Moscow VX International Ballet Competition',
    sourceZh: '2026 莫斯科 VX 國際芭蕾舞大賽',
    date: 'July 2026',
    dateZh: '2026 年 7 月',
    title: '2026 VX Moscow International Ballet Competition.',
    titleZh: '2026 VX 莫斯科國際芭蕾舞大賽',
    description: 'Junior Group Girls Solo 1st Prize and Gold Medal - Crystal Huang',
    descriptionZh: 'Crystal Huang 榮獲青少年女子群舞獨舞組第一名與金牌。',
    href: 'https://moscowballetcompetition.com/en/news/obyavleny-imena-pobediteley-xv-mezhdunarodnogo-konkursa-artistov-baleta-v-moskve/',
    imageSrc: '/crystal-press-moscow-vx-interview.png',
    imageAlt: 'Crystal Huang interview at the 2026 Moscow VX International Ballet Competition',
    imageHref: 'https://www.youtube.com/watch?v=MVD2iFEuJHw',
  },
  {
    source: 'Teen World of Arts Feature',
    sourceZh: 'Teen World of Arts 專訪',
    date: 'February 2024',
    dateZh: '2024 年 2 月',
    title: 'Prix de Lausanne Interview',
    titleZh: '洛桑國際芭蕾舞比賽專訪',
    description:
      'Crystal Huang was featured in Teen World of Arts following her recognition at the 2024 Prix de Lausanne, where she received both Prize Winner distinction and the Contemporary Dance Award.',
    descriptionZh:
      'Crystal Huang 於 2024 年洛桑國際芭蕾舞比賽獲得 Prize Winner 與當代舞特別獎後，接受 Teen World of Arts 專訪。',
    href: 'https://teenworldarts.com/magazine/crystal-huang-prix-de-lausanne',
    imageSrc: '/crystal-press-prix.jpg',
    imageAlt: 'Crystal Huang at Prix de Lausanne',
  },
  {
    source: 'Los Altos Town Crier',
    sourceZh: 'Los Altos Town Crier 報導',
    date: 'May 2024',
    dateZh: '2024 年 5 月',
    title: 'ABT Scholarship Feature',
    titleZh: 'ABT 獎學金報導',
    description:
      'Los Altos Town Crier highlighted Crystal’s scholarship milestone with American Ballet Theatre, tracing her early studio training and rising professional trajectory.',
    descriptionZh:
      'Los Altos Town Crier 報導 Crystal 獲得 American Ballet Theatre 獎學金的重要里程碑，並回顧她早期的舞蹈訓練與持續上升的專業發展。',
    href: 'https://www.losaltosonline.com/schools/dancer-from-mv-studio-lands-scholarship-at-american-ballet-theatre/article_8a493d68-1d1e-11ef-b665-abc30a49a1d4.html',
    imageSrc: '/crystal-press-prix.jpg',
    imageAlt: 'Crystal Huang press feature',
  },
  {
    source: 'The T.O.P. Awards',
    sourceZh: 'The T.O.P. Awards',
    date: '2025',
    dateZh: '2025 年',
    title: 'Artist Spotlight',
    titleZh: '藝術家焦點',
    description:
      'The T.O.P. Awards artist page presents Crystal’s profile within its distinguished roster, spotlighting her recognition and ongoing work as a young performer.',
    descriptionZh:
      'The T.O.P. Awards 藝術家頁面將 Crystal 納入其焦點陣容，突顯她作為年輕表演者所獲得的肯定與持續發展。',
    href: 'https://www.thetopawards.com/artists/crystal-huang',
    imageSrc: '/crystal-press-prix.jpg',
    imageAlt: 'Crystal Huang artist spotlight',
  },
  {
    source: 'Pointe Magazine',
    sourceZh: 'Pointe Magazine',
    date: '2024',
    dateZh: '2024 年',
    title: 'Daily Routine Feature',
    titleZh: '日常訓練特輯',
    description:
      "Pointe Magazine spotlights Crystal Huang's daily routine, offering a closer look at the structure, discipline, and training rhythm behind her development as a young ballet artist.",
    descriptionZh:
      'Pointe Magazine 聚焦 Crystal Huang 的日常訓練節奏，呈現她作為年輕芭蕾舞者在生活、紀律與養成上的細節。',
    href: 'https://pointemagazine.com/crystal-huang-daily-routine/#gsc.tab=0',
    imageSrc: '/crystal-press-prix.jpg',
    imageAlt: 'Crystal Huang daily routine feature',
  },
];

export default function PressHighlight() {
  const { t } = useLanguage();
  const [featuredHighlight, ...supportingHighlights] = pressHighlights;
  const secondaryHighlights = supportingHighlights.slice(0, 3);

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

        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <article className="hover-float-card rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] px-6 py-7 sm:px-8 sm:py-8">
            <p className="eyebrow">{t('Featured Article', '焦點文章')}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
              {t(featuredHighlight.source, featuredHighlight.sourceZh)}
            </p>
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              {t(featuredHighlight.date, featuredHighlight.dateZh)}
            </p>
            <h3 className="mt-4 max-w-3xl text-4xl leading-tight sm:text-5xl">
              {t(featuredHighlight.title, featuredHighlight.titleZh)}
            </h3>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--text-muted)]">
              {t(featuredHighlight.description, featuredHighlight.descriptionZh)}
            </p>
            <a
              href={featuredHighlight.href}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center rounded-full border border-[var(--line)] bg-[rgba(250,247,242,0.72)] px-5 py-3 text-sm uppercase tracking-[0.18em] text-[var(--text)] transition-colors hover:bg-[rgba(250,247,242,0.95)]"
            >
              {t('Read the feature', '閱讀專訪')}
            </a>
            <a
              href={featuredHighlight.imageHref ?? featuredHighlight.href}
              target="_blank"
              rel="noreferrer"
              className="mt-8 block aspect-[3/2] overflow-hidden rounded-[1.5rem] border border-[var(--line)] transition-transform hover:scale-[1.01]"
              aria-label={t('Watch interview video', '觀看訪談影片')}
            >
              <img
                src={featuredHighlight.imageSrc}
                alt={featuredHighlight.imageAlt}
                className="h-full w-full object-cover object-center"
              />
            </a>
          </article>

          <div className="grid gap-5">
            {secondaryHighlights.map((item) => (
              <article
                key={item.href}
                className="hover-float-card overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)]"
              >
                <a
                  href={item.imageHref ?? item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block aspect-[16/9] overflow-hidden border-b border-[var(--line)]"
                  aria-label={t('Open featured press image', '開啟焦點媒體圖片')}
                >
                  <img
                    src={item.imageSrc}
                    alt={item.imageAlt}
                    className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-[1.03]"
                  />
                </a>
                <div className="px-6 py-6">
                  <p className="eyebrow">{t(item.source, item.sourceZh)}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    {t(item.date, item.dateZh)}
                  </p>
                  <h3 className="mt-3 text-2xl leading-tight">{t(item.title, item.titleZh)}</h3>
                  <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
                    {t(item.description, item.descriptionZh)}
                  </p>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center rounded-full border border-[var(--line)] bg-[rgba(250,247,242,0.72)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--text)] transition-colors hover:bg-[rgba(250,247,242,0.95)]"
                  >
                    {t('Read the feature', '閱讀專訪')}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
