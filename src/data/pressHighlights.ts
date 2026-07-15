export interface PressHighlightEntry {
  id: number;
  source: string;
  sourceZh: string;
  dateLabel: string;
  dateLabelZh: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  imageAltZh: string;
  imageHref?: string | null;
}

export const pressHighlights: PressHighlightEntry[] = [
  {
    id: 1,
    source: 'XV Moscow International Ballet Competition',
    sourceZh: '第十五屆莫斯科國際芭蕾舞大賽',
    dateLabel: 'July 2026',
    dateLabelZh: '2026 年 7 月',
    title: '2026 XV Moscow Ballet Competition Award Ceremony',
    titleZh: '2026 第十五屆莫斯科芭蕾舞大賽頒獎典禮',
    description:
      'Crystal Huang 2026 XV Moscow Ballet Competition - Junior Group, Girls, Solo First Prize and Gold Medal Winner',
    descriptionZh: 'Crystal Huang 榮獲 2026 第十五屆莫斯科芭蕾舞大賽青少年女子獨舞組第一名與金牌。',
    href: 'https://www.youtube.com/shorts/uNTARMFtDm8',
    imageSrc: '/crystal-press-moscow-award-ceremony.png',
    imageAlt: 'Crystal Huang at the 2026 XV Moscow Ballet Competition award ceremony',
    imageAltZh: 'Crystal Huang 於 2026 第十五屆莫斯科芭蕾舞大賽頒獎典禮現場',
    imageHref: 'https://www.youtube.com/shorts/uNTARMFtDm8',
  },
  {
    id: 2,
    source: '2026 Moscow VX International Ballet Competition',
    sourceZh: '2026 莫斯科 VX 國際芭蕾舞大賽',
    dateLabel: 'July 2026',
    dateLabelZh: '2026 年 7 月',
    title: '2026 VX Moscow International Ballet Competition.',
    titleZh: '2026 VX 莫斯科國際芭蕾舞大賽',
    description: 'Junior Group Girls Solo 1st Prize and Gold Medal - Crystal Huang',
    descriptionZh: 'Crystal Huang 榮獲青少年女子群舞獨舞組第一名與金牌。',
    href: 'https://moscowballetcompetition.com/en/news/obyavleny-imena-pobediteley-xv-mezhdunarodnogo-konkursa-artistov-baleta-v-moskve/',
    imageSrc: '/crystal-press-moscow-vx-interview.png',
    imageAlt: 'Crystal Huang interview at the 2026 Moscow VX International Ballet Competition',
    imageAltZh: 'Crystal Huang 於 2026 Moscow VX 國際芭蕾舞大賽接受訪問',
    imageHref: 'https://www.youtube.com/watch?v=MVD2iFEuJHw',
  },
  {
    id: 3,
    source: 'Teen World of Arts Feature',
    sourceZh: 'Teen World of Arts 專訪',
    dateLabel: 'February 2024',
    dateLabelZh: '2024 年 2 月',
    title: 'Prix de Lausanne Interview',
    titleZh: '洛桑國際芭蕾舞比賽專訪',
    description:
      'Crystal Huang was featured in Teen World of Arts following her recognition at the 2024 Prix de Lausanne, where she received both Prize Winner distinction and the Contemporary Dance Award.',
    descriptionZh:
      'Crystal Huang 於 2024 年洛桑國際芭蕾舞比賽獲得 Prize Winner 與當代舞特別獎後，接受 Teen World of Arts 專訪。',
    href: 'https://teenworldarts.com/magazine/crystal-huang-prix-de-lausanne',
    imageSrc: '/crystal-press-prix.jpg',
    imageAlt: 'Crystal Huang at Prix de Lausanne',
    imageAltZh: 'Crystal Huang 於洛桑國際芭蕾舞比賽',
  },
  {
    id: 4,
    source: 'Los Altos Town Crier',
    sourceZh: 'Los Altos Town Crier 報導',
    dateLabel: 'May 2024',
    dateLabelZh: '2024 年 5 月',
    title: 'ABT Scholarship Feature',
    titleZh: 'ABT 獎學金報導',
    description:
      'Los Altos Town Crier highlighted Crystal’s scholarship milestone with American Ballet Theatre, tracing her early studio training and rising professional trajectory.',
    descriptionZh:
      'Los Altos Town Crier 報導 Crystal 獲得 American Ballet Theatre 獎學金的重要里程碑，並回顧她早期的舞蹈訓練與持續上升的專業發展。',
    href: 'https://www.losaltosonline.com/schools/dancer-from-mv-studio-lands-scholarship-at-american-ballet-theatre/article_8a493d68-1d1e-11ef-b665-abc30a49a1d4.html',
    imageSrc: '/crystal-press-abt-scholarship.jpeg',
    imageAlt: 'Crystal Huang performing in the ABT Scholarship Feature',
    imageAltZh: 'Crystal Huang 於 ABT 獎學金報導使用照片中的演出畫面',
  },
  {
    id: 5,
    source: 'The T.O.P. Awards',
    sourceZh: 'The T.O.P. Awards',
    dateLabel: '2025',
    dateLabelZh: '2025 年',
    title: 'Artist Spotlight',
    titleZh: '藝術家焦點',
    description:
      'The T.O.P. Awards artist page presents Crystal’s profile within its distinguished roster, spotlighting her recognition and ongoing work as a young performer.',
    descriptionZh:
      'The T.O.P. Awards 藝術家頁面將 Crystal 納入其焦點陣容，突顯她作為年輕表演者所獲得的肯定與持續發展。',
    href: 'https://www.thetopawards.com/artists/crystal-huang',
    imageSrc: '/crystal-press-artist-spotlight.png',
    imageAlt: 'Crystal Huang in the Artist Spotlight feature',
    imageAltZh: 'Crystal Huang 於 Artist Spotlight 特色報導',
  },
  {
    id: 6,
    source: 'Pointe Magazine',
    sourceZh: 'Pointe Magazine',
    dateLabel: '2024',
    dateLabelZh: '2024 年',
    title: 'Daily Routine Feature',
    titleZh: '日常訓練特輯',
    description:
      "Pointe Magazine spotlights Crystal Huang's daily routine, offering a closer look at the structure, discipline, and training rhythm behind her development as a young ballet artist.",
    descriptionZh:
      'Pointe Magazine 聚焦 Crystal Huang 的日常訓練節奏，呈現她作為年輕芭蕾舞者在生活、紀律與養成上的細節。',
    href: 'https://pointemagazine.com/crystal-huang-daily-routine/#gsc.tab=0',
    imageSrc: '/crystal-press-daily-routine.png',
    imageAlt: 'Crystal Huang in the Daily Routine Feature',
    imageAltZh: 'Crystal Huang 於 Daily Routine Feature 報導',
  },
];
