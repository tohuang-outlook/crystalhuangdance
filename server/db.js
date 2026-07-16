import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const schemaPath = new URL('./sql/schema.sql', import.meta.url);
const defaultComingUpEvents = [
  {
    dateLabel: 'July 2026',
    title: 'Press Play Pro Assistant',
    location: 'Las Vegas',
    sortOrder: 0,
  },
  {
    dateLabel: 'July 2026',
    title: 'YAGP Gala',
    location: 'Beijing',
    sortOrder: 1,
  },
  {
    dateLabel: 'July-August 2026',
    title: 'AEDC Performance and Master Class',
    location: 'Shanghai / Taipei / Hong Kong',
    sortOrder: 2,
  },
];
const defaultHeroEntryPoints = [
  ['Press Highlight', '媒體亮點', 'Featured interviews, awards coverage, and recent spotlight stories.', '精選訪談、得獎報導與近期焦點媒體內容。', '#press'],
  ['Archive Timeline', '檔案時間線', 'Training history, milestones, and development across seasons.', '依時間整理的訓練歷程、里程碑與成長軌跡。', '#archive-timeline'],
  ['Artist Profile', '舞者檔案', 'Background, current identity, and professional profile overview.', '背景介紹、當前身份與專業檔案總覽。', '#profile'],
  ['Artistic Range', '藝術風格跨度', 'Classical foundations and contemporary range.', '古典基礎與當代延展能力。', '#styles'],
  ['Media', '影像', 'Performance reels and artistic range media.', '精選演出影片與舞作媒體內容。', '#videos'],
  ['Master Class and Choreographer', '大師課與編舞', 'Master classes, teaching work, and choreography documentation.', '大師課、教學工作與編舞紀錄。', '#gallery'],
].map(([title, titleZh, description, descriptionZh, href], sortOrder) => ({ title, titleZh, description, descriptionZh, href, sortOrder }));
const defaultFeaturedReels = [
  {
    placement: 'featured',
    youtubeId: '_1p3Udn_SZY',
    videoSrc: null,
    metaLabel: 'XV Moscow Ballet Competition · July 2026',
    metaLabelZh: '莫斯科國際芭蕾舞大賽 · 2026年7月',
    title: '2026 XV Moscow Ballet Competition, Round 2 Contemporary',
    titleZh: '2026 第十五屆莫斯科國際芭蕾舞大賽第二輪當代舞',
    description:
      'Crystal Huang performs her round 2 contemporary selection at the XV Moscow Ballet Competition in July 2026.',
    descriptionZh:
      'Crystal Huang 於 2026 年 7 月在第十五屆莫斯科國際芭蕾舞大賽演出第二輪當代舞作品。',
    thumbnail: '/crystal-press-moscow-vx.png',
    sortOrder: 0,
  },
  {
    placement: 'featured',
    youtubeId: 'ZINiS_mTgd0',
    videoSrc: null,
    metaLabel: 'XV Moscow Ballet Competition Gala · July 2026',
    metaLabelZh: '莫斯科國際芭蕾舞大賽晚會演出 · 2026年7月',
    title: '2026 XV Moscow International Ballet Competition Gala Performance',
    titleZh: '2026 第十五屆莫斯科國際芭蕾舞大賽晚會演出',
    description:
      'Crystal Huang performs in the 2026 XV Moscow International Ballet Competition gala presentation.',
    descriptionZh:
      'Crystal Huang 於 2026 年第十五屆莫斯科國際芭蕾舞大賽晚會演出中登台演出。',
    thumbnail: '/crystal-press-moscow-gala-2.png',
    sortOrder: 1,
  },
  {
    placement: 'featured',
    youtubeId: 'e2Z9UXevvIg',
    videoSrc: '/crystal-prix-de-lausanne.mp4',
    metaLabel: 'Prix de Lausanne · 2024',
    metaLabelZh: '洛桑國際芭蕾舞比賽 · 2024',
    title: 'Prix de Lausanne 2024 Contemporary Dance Award and Prize Winner',
    titleZh: '2024 洛桑國際芭蕾舞比賽當代舞特別獎與得獎者',
    description:
      "Contemporary variation that earned Crystal the Female Contemporary Dance Award at one of the world's most prestigious ballet competitions.",
    descriptionZh:
      '贏得洛桑女子當代舞蹈特別獎的演出片段，這是全球最具聲望的芭蕾舞比賽之一。',
    thumbnail: '/crystal-contemporary.jpg',
    sortOrder: 2,
  },
  {
    placement: 'supporting',
    youtubeId: 'JpP-JRj3LMw',
    videoSrc: null,
    metaLabel: 'XV Moscow Ballet Competition · July 2026',
    metaLabelZh: '莫斯科國際芭蕾舞大賽 · 2026年7月',
    title: '2026 XV Moscow Ballet Competition, Junior Solo Round 3 - Harlequinade Variation',
    titleZh: '2026 第十五屆莫斯科國際芭蕾舞大賽少年女子獨舞第三輪 - Harlequinade 變奏',
    description:
      'Crystal Huang performs the Harlequinade variation in junior solo round 3 at the 2026 XV Moscow Ballet Competition.',
    descriptionZh:
      'Crystal Huang 於 2026 年第十五屆莫斯科國際芭蕾舞大賽少年女子獨舞第三輪演出 Harlequinade 變奏。',
    thumbnail: '/crystal-press-moscow-harlequinade.png',
    sortOrder: 0,
  },
  {
    placement: 'supporting',
    youtubeId: '3i5ap93thF0',
    videoSrc: null,
    metaLabel: 'XV Moscow Ballet Competition · July 2026',
    metaLabelZh: '莫斯科國際芭蕾舞大賽 · 2026年7月',
    title: '2026 XV Moscow Ballet Competition, Junior Solo Round 3 - Sugar Plum Fairy Variation',
    titleZh: '2026 第十五屆莫斯科國際芭蕾舞大賽少年女子獨舞第三輪 - 糖梅仙子變奏',
    description:
      'Crystal Huang performs the Sugar Plum Fairy variation in junior solo round 3 at the 2026 XV Moscow Ballet Competition.',
    descriptionZh:
      'Crystal Huang 於 2026 年第十五屆莫斯科國際芭蕾舞大賽少年女子獨舞第三輪演出糖梅仙子變奏。',
    thumbnail: '/crystal-press-moscow-sugar-plum.png',
    sortOrder: 1,
  },
  {
    placement: 'supporting',
    youtubeId: 'iA3sQ5TDgu0',
    videoSrc: null,
    metaLabel: 'XV Moscow Ballet Competition · July 2026',
    metaLabelZh: '莫斯科國際芭蕾舞大賽 · 2026年7月',
    title: '2026 XV Moscow Ballet Competition, Junior Solo Round 1 - Gulnare Variation',
    titleZh: '2026 第十五屆莫斯科國際芭蕾舞大賽少年女子獨舞第一輪 - Gulnare 變奏',
    description:
      'Crystal Huang performs the Gulnare variation in junior solo round 1 at the 2026 XV Moscow Ballet Competition.',
    descriptionZh:
      'Crystal Huang 於 2026 年第十五屆莫斯科國際芭蕾舞大賽少年女子獨舞第一輪演出 Gulnare 變奏。',
    thumbnail: '/crystal-press-moscow-gulnare-2.png',
    sortOrder: 2,
  },
];
const defaultPressHighlights = [
  {
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
    sortOrder: 0,
  },
  {
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
    sortOrder: 1,
  },
  {
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
    imageHref: null,
    sortOrder: 2,
  },
  {
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
    imageHref: null,
    sortOrder: 3,
  },
  {
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
    imageHref: null,
    sortOrder: 4,
  },
  {
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
    imageHref: null,
    sortOrder: 5,
  },
];
const defaultAchievementEntries = [
  {
    year: '2026',
    title: 'XV Moscow International Ballet Competition — Junior Group Girls Solo First Prize & Gold Medal Winner',
    titleZh: '第十五屆莫斯科國際芭蕾舞大賽 — 青少年女子獨舞組第一名暨金牌',
    description:
      'Won First Prize and Gold Medal in the junior group girls solo division at the XV Moscow International Ballet Competition.',
    descriptionZh: '於第十五屆莫斯科國際芭蕾舞大賽獲得青少年女子獨舞組第一名與金牌。',
    highlight: 1,
    latest: 1,
    sortOrder: 0,
  },
  {
    year: '2025',
    title: 'T.O.P. Awards — 2025 Asian American Outstanding Dancer',
    titleZh: 'T.O.P. Awards — 2025 亞裔美國傑出舞者',
    description: 'Honored as the 2025 Asian American Outstanding Dancer.',
    descriptionZh: '獲頒 2025 年亞裔美國傑出舞者榮譽。',
    highlight: 1,
    latest: 0,
    sortOrder: 1,
  },
  {
    year: '2024',
    title: 'SAIBC International Finals — Senior Women Grand Prix Winner',
    titleZh: 'SAIBC 國際總決賽 — 高級女子組大獎',
    description:
      'Top honor in the senior women division at the South Africa International Ballet Competition.',
    descriptionZh: '南非國際芭蕾舞比賽高級女子組最高榮譽。',
    highlight: 1,
    latest: 0,
    sortOrder: 2,
  },
  {
    year: '2024',
    title: 'YAGP NYC Finals — Senior Women Silver Medal Winner',
    titleZh: 'YAGP 紐約總決賽 — 高級女子組銀牌',
    description: 'Silver Medal winner in the senior women division at YAGP New York City Finals.',
    descriptionZh: '於 YAGP 紐約總決賽高級女子組獲銀牌。',
    highlight: 1,
    latest: 0,
    sortOrder: 3,
  },
  {
    year: '2024',
    title: 'Prix de Lausanne — Prize Winner #4 & Contemporary Dance Award Winner',
    titleZh: '洛桑國際芭蕾舞比賽 — 第四名得獎者暨當代舞特別獎',
    description:
      'Recognized as Prize Winner #4 and recipient of the Contemporary Dance Award at Prix de Lausanne.',
    descriptionZh: '於 2024 洛桑國際芭蕾舞比賽獲 Prize Winner #4，並同時獲得當代舞特別獎。',
    highlight: 1,
    latest: 0,
    sortOrder: 4,
  },
  {
    year: '2024',
    title: 'YoungArts — Winner of Distinction in Ballet',
    titleZh: 'YoungArts — 芭蕾傑出得獎者',
    description: 'National recognition from YoungArts for distinction in ballet.',
    descriptionZh: '獲美國國家青年藝術基金會授予芭蕾 Winner of Distinction。',
    highlight: 0,
    latest: 0,
    sortOrder: 5,
  },
  {
    year: '2023',
    title: 'NYCDA Nationals — Teen Female Outstanding Dancer Winner',
    titleZh: 'NYCDA 全國賽 — 青少年女子傑出舞者',
    description: 'National titleholder at NYCDA Finals with subsequent touring appearances.',
    descriptionZh: '贏得 NYCDA 全國賽青少年女子傑出舞者頭銜並展開巡演。',
    highlight: 0,
    latest: 0,
    sortOrder: 6,
  },
  {
    year: '2023',
    title: 'The Dance Awards Las Vegas Nationals — Teen Female Best Dancer Winner',
    titleZh: 'The Dance Awards 拉斯維加斯總決賽 — 青少年女子最佳舞者',
    description:
      'Teen Female Best Dancer title at the Las Vegas nationals and nationwide touring appearances.',
    descriptionZh: '於拉斯維加斯總決賽奪得青少年女子最佳舞者並展開全美巡演。',
    highlight: 0,
    latest: 0,
    sortOrder: 7,
  },
  {
    year: '2023',
    title: 'YAGP Tampa Finals — Junior Bronze Medal Winner',
    titleZh: 'YAGP 坦帕總決賽 — 青少年組銅牌',
    description: 'Bronze Medal winner at YAGP Tampa Finals in the junior division.',
    descriptionZh: '於 YAGP 坦帕總決賽青少年組獲銅牌。',
    highlight: 0,
    latest: 0,
    sortOrder: 8,
  },
  {
    year: '2022',
    title: 'YAGP Tampa Finals — Junior Bronze Medal Winner',
    titleZh: 'YAGP 坦帕總決賽 — 青少年組銅牌',
    description: 'Bronze Medal winner at YAGP Tampa Finals in the junior division.',
    descriptionZh: '於 YAGP 坦帕總決賽青少年組獲銅牌。',
    highlight: 0,
    latest: 0,
    sortOrder: 9,
  },
  {
    year: '2021',
    title: 'The Dance Awards Las Vegas Nationals — Junior Female Best Dancer Winner',
    titleZh: 'The Dance Awards 拉斯維加斯總決賽 — 青少年女子最佳舞者',
    description:
      'Junior Female Best Dancer titleholder with touring appearances through the 2021–22 season.',
    descriptionZh: '於拉斯維加斯總決賽奪得青少年女子最佳舞者並於 2021 至 2022 年巡演。',
    highlight: 0,
    latest: 0,
    sortOrder: 10,
  },
  {
    year: '2021',
    title: 'Radix Nationals — Junior Female Core Performer Winner',
    titleZh: 'Radix 全國賽 — 青少年女子核心表演者',
    description: 'National junior titleholder at Radix Dance Convention.',
    descriptionZh: '獲得 Radix 全國賽青少年女子核心表演者頭銜。',
    highlight: 0,
    latest: 0,
    sortOrder: 11,
  },
  {
    year: '2019',
    title: 'The Dance Awards Las Vegas Nationals — Mini Female Best Dancer Winner',
    titleZh: 'The Dance Awards 拉斯維加斯總決賽 — 幼年女子最佳舞者',
    description: 'Won the mini female Best Dancer title in Las Vegas at age 10.',
    descriptionZh: '10 歲時即奪下拉斯維加斯總決賽幼年女子最佳舞者。',
    highlight: 0,
    latest: 0,
    sortOrder: 12,
  },
  {
    year: '2019',
    title: 'Radix Nationals — Mini Female Core Performer Winner',
    titleZh: 'Radix 全國賽 — 幼年女子核心表演者',
    description: 'National mini titleholder at Radix Dance Convention.',
    descriptionZh: '獲得 Radix 全國賽幼年女子核心表演者頭銜。',
    highlight: 0,
    latest: 0,
    sortOrder: 13,
  },
];
const defaultArtistProfile = {
  id: 1,
  coverIdentity: 'San Francisco Ballet School Trainee',
  coverIdentityZh: '舊金山芭蕾舞學校培訓生',
  coverStatement:
    'San Francisco Ballet School trainee with international performance, touring, and competition experience across ballet, contemporary, and commercial work.',
  coverStatementZh:
    '具備國際演出、巡演與競賽經歷的舊金山芭蕾舞學校培訓生，橫跨古典芭蕾、當代與商業演出。',
  aboutParagraph1:
    "Crystal Huang is a San Francisco Ballet School trainee whose recent work spans elite conservatory training, international gala appearances, and national touring experience. Her current dossier includes 2026 XV Moscow Ballet Competition, Junior Group, Girls, Solo First Prize and Gold Medal Winner, Prix de Lausanne 2024 Prize Winner #4 and Contemporary Dance Award Winner, YAGP NYC Finals Senior Women Silver Medal Winner, SAIBC Senior Women Grand Prix Winner, and the 2025 T.O.P. Asian American Outstanding Dancer honor.",
  aboutParagraph1Zh:
    'Crystal Huang 現為舊金山芭蕾舞學校培訓生，近年的發展橫跨菁英舞蹈教育、國際舞台演出與全美巡演。她的代表經歷包括 2024 洛桑國際芭蕾舞比賽 Prize Winner #4 與當代舞特別獎、YAGP 紐約總決賽高級女子組銀牌、SAIBC 高級女子組大獎，以及 2025 年 T.O.P. 亞裔美國傑出舞者榮譽。',
  aboutParagraph2:
    "Her training path bridges classical rigor and wide stylistic range. She began at Yoko's Dance and Performing Arts Academy, trained extensively at The Rock Center for Dance and Nevada School of Ballet, refined her classical foundation at Bayer Ballet Academy, studied at the American Ballet Theatre Jacqueline Kennedy Onassis School, and now continues her development at San Francisco Ballet School under a distinguished faculty.",
  aboutParagraph2Zh:
    '她的訓練路徑兼具古典基礎與跨風格延展性。自 Yoko\'s Dance and Performing Arts Academy 啟蒙後，先後於 The Rock Center for Dance 與 Nevada School of Ballet 接受密集訓練，之後在 Bayer Ballet Academy 深化古典技法，並於 American Ballet Theatre Jacqueline Kennedy Onassis School 進一步進修，現持續於 San Francisco Ballet School 跟隨多位資深教師精進。',
  aboutParagraph3:
    'Alongside competition and conservatory work, Crystal has toured nationally as an NYCDA Outstanding Dancer, The Dance Awards Best Dancer, and Radix Core Performer, while also appearing in performances and galas across New York, Italy, Belgium, Switzerland, South Africa, China, and Japan. Her professional profile also includes choreography, master class teaching, and creative work for younger dancers across the United States.',
  aboutParagraph3Zh:
    '除比賽與學院訓練外，Crystal 亦曾以 NYCDA Outstanding Dancer、The Dance Awards Best Dancer 與 Radix Core Performer 身分於全美巡演，並參與紐約、義大利、比利時、瑞士、南非、中國與日本等地的演出與 gala。她的專業履歷也延伸至編舞、工作坊與教學型創作，持續將舞台經驗轉化為對年輕舞者的創作與分享。',
};
const defaultMasterClassTimelineEntries = [
  {
    dateLabel: 'April 2026',
    dateLabelZh: '2026 年 4 月',
    title: 'Ballet Master Class at UC Berkeley Ballet Company',
    titleZh: '加州大學柏克萊芭蕾舞團芭蕾大師課',
    location: 'Berkeley, CA',
    locationZh: '加州柏克萊',
    sortOrder: 0,
  },
  {
    dateLabel: 'March 2026',
    dateLabelZh: '2026 年 3 月',
    title: 'Ballet Master Class at YAGP',
    titleZh: 'YAGP 芭蕾大師課',
    location: 'San Francisco, CA',
    locationZh: '加州舊金山',
    sortOrder: 1,
  },
  {
    dateLabel: 'August 2025',
    dateLabelZh: '2025 年 8 月',
    title: 'Ballet Master Class at ZDP Academy',
    titleZh: 'ZDP Academy 芭蕾大師課',
    location: 'Boston, MA',
    locationZh: '麻州波士頓',
    sortOrder: 2,
  },
  {
    dateLabel: 'August 2025',
    dateLabelZh: '2025 年 8 月',
    title: 'Jazz Master Class at T.O.P Award',
    titleZh: 'T.O.P Award 爵士大師課',
    location: 'T.O.P Award',
    locationZh: 'T.O.P Award',
    sortOrder: 3,
  },
  {
    dateLabel: 'July 2025',
    dateLabelZh: '2025 年 7 月',
    title: 'Contemporary Master Class at The Rock Center',
    titleZh: 'The Rock Center 現代舞大師課',
    location: 'Henderson, NV',
    locationZh: '內華達州亨德森',
    sortOrder: 4,
  },
  {
    dateLabel: 'July 2025',
    dateLabelZh: '2025 年 7 月',
    title: "Contemporary Master Class at Li's Ballet",
    titleZh: "Li's Ballet 現代舞大師課",
    location: 'Temple City, CA',
    locationZh: '加州天普市',
    sortOrder: 5,
  },
  {
    dateLabel: 'June 2025',
    dateLabelZh: '2025 年 6 月',
    title: 'Jazz Master Class at OAEC Academy',
    titleZh: 'OAEC Academy 爵士大師課',
    location: 'Houston, TX',
    locationZh: '德州休士頓',
    sortOrder: 6,
  },
  {
    dateLabel: 'June 2024',
    dateLabelZh: '2024 年 6 月',
    title: 'Contemporary Master Class at OAEC Academy',
    titleZh: 'OAEC Academy 現代舞大師課',
    location: 'Houston, TX',
    locationZh: '德州休士頓',
    sortOrder: 7,
  },
];
const defaultMasterClassMoments = [
  {
    title: 'Ballet Master Class at UC Berkeley Ballet Company',
    titleZh: '加州大學柏克萊芭蕾舞團芭蕾大師課',
    subtitle: 'Berkeley, CA · April 2026',
    subtitleZh: '加州柏克萊 · 2026 年 4 月',
    imageSrc: '/crystal-masterclass-uc-berkeley.jpg',
    imageAlt: 'Crystal Huang in a master class or choreographic setting',
    imageAltZh: 'Crystal Huang 在大師課或編舞指導場合中的影像',
    videoSrc: '/crystal-masterclass-uc-berkeley.mp4',
    sortOrder: 0,
  },
  {
    title: 'Ballet Master Class at YAGP',
    titleZh: 'YAGP 芭蕾大師課',
    subtitle: 'San Francisco, CA · March 2026',
    subtitleZh: '加州舊金山 · 2026 年 3 月',
    imageSrc: '/crystal-masterclass-yagp.jpg',
    imageAlt: 'Crystal Huang in a master class or choreographic setting',
    imageAltZh: 'Crystal Huang 在大師課或編舞指導場合中的影像',
    videoSrc: '/crystal-masterclass-yagp.mp4',
    sortOrder: 1,
  },
  {
    title: 'Ballet Master Class at ZDP Academy',
    titleZh: 'ZDP Academy 芭蕾大師課',
    subtitle: 'Boston, MA · Aug. 2025',
    subtitleZh: '麻州波士頓 · 2025 年 8 月',
    imageSrc: '/crystal-masterclass-zdp.jpg',
    imageAlt: 'Crystal Huang in a master class or choreographic setting',
    imageAltZh: 'Crystal Huang 在大師課或編舞指導場合中的影像',
    videoSrc: '/crystal-masterclass-zdp.mp4',
    sortOrder: 2,
  },
  {
    title: 'Jazz Master Class at T.O.P Award',
    titleZh: 'T.O.P Award 爵士大師課',
    subtitle: 'T.O.P Award · Aug. 2025',
    subtitleZh: 'T.O.P Award · 2025 年 8 月',
    imageSrc: '/crystal-masterclass-top.jpg',
    imageAlt: 'Crystal Huang in a master class or choreographic setting',
    imageAltZh: 'Crystal Huang 在大師課或編舞指導場合中的影像',
    videoSrc: '/crystal-masterclass-top.mp4',
    sortOrder: 3,
  },
  {
    title: 'Contemporary Master Class at The Rock Center',
    titleZh: 'The Rock Center 現代舞大師課',
    subtitle: 'Henderson, NV · July 2025',
    subtitleZh: '內華達州亨德森 · 2025 年 7 月',
    imageSrc: '/crystal-masterclass-rock-center.jpg',
    imageAlt: 'Crystal Huang in a master class or choreographic setting',
    imageAltZh: 'Crystal Huang 在大師課或編舞指導場合中的影像',
    videoSrc: '/crystal-masterclass-rock-center.mp4',
    sortOrder: 4,
  },
  {
    title: "Contemporary Master Class at Li's Ballet",
    titleZh: "Li's Ballet 現代舞大師課",
    subtitle: 'Temple City, CA · July 2025',
    subtitleZh: '加州天普市 · 2025 年 7 月',
    imageSrc: '/crystal-masterclass-lis-ballet.jpg',
    imageAlt: 'Crystal Huang in a master class or choreographic setting',
    imageAltZh: 'Crystal Huang 在大師課或編舞指導場合中的影像',
    videoSrc: '/crystal-masterclass-lis-ballet.mp4',
    sortOrder: 5,
  },
  {
    title: 'Jazz Master Class at OAEC Academy',
    titleZh: 'OAEC Academy 爵士大師課',
    subtitle: 'Houston, TX · June 2025',
    subtitleZh: '德州休士頓 · 2025 年 6 月',
    imageSrc: '/crystal-masterclass-oaec-jazz.jpg',
    imageAlt: 'Crystal Huang in a master class or choreographic setting',
    imageAltZh: 'Crystal Huang 在大師課或編舞指導場合中的影像',
    videoSrc: '/crystal-masterclass-oaec-jazz.mp4',
    sortOrder: 6,
  },
  {
    title: 'Contemporary Master Class at OAEC Academy',
    titleZh: 'OAEC Academy 現代舞大師課',
    subtitle: 'Houston, TX · June 2024',
    subtitleZh: '德州休士頓 · 2024 年 6 月',
    imageSrc: '/crystal-masterclass-oaec-contemporary.jpg',
    imageAlt: 'Crystal Huang in a master class or choreographic setting',
    imageAltZh: 'Crystal Huang 在大師課或編舞指導場合中的影像',
    videoSrc: '/crystal-masterclass-oaec-contemporary.mp4',
    sortOrder: 7,
  },
];
const defaultGroupChoreographyEntries = [
  {
    seasonLabel: '2025/26',
    seasonLabelZh: '2025/26',
    organization: 'SFB School',
    organizationZh: 'SFB School',
    workTitle: 'TBD',
    workTitleZh: 'TBD',
    sortOrder: 0,
  },
  {
    seasonLabel: '2024/25',
    seasonLabelZh: '2024/25',
    organization: 'ABT School',
    organizationZh: 'ABT School',
    workTitle: 'Synergy',
    workTitleZh: 'Synergy',
    sortOrder: 1,
  },
  {
    seasonLabel: '2024/25',
    seasonLabelZh: '2024/25',
    organization: "Yoko's Dance",
    organizationZh: "Yoko's Dance",
    workTitle: 'Yearning Heart',
    workTitleZh: 'Yearning Heart',
    sortOrder: 2,
  },
];
const defaultGroupChoreographyMoments = [
  {
    title: 'SFB School — TBD',
    titleZh: 'SFB School — TBD',
    subtitle: '2025/26 Group Choreography',
    subtitleZh: '2025/26 群體編舞作品',
    imageSrc: '/crystal-group-sfb-tbd.jpg',
    imageAlt: 'SFB School group choreography photo',
    imageAltZh: 'SFB School 群體編舞照片',
    videoSrc: null,
    sortOrder: 0,
  },
  {
    title: 'ABT School — Synergy',
    titleZh: 'ABT School — Synergy',
    subtitle: '2024/25 Group Choreography',
    subtitleZh: '2024/25 群體編舞作品',
    imageSrc: '/crystal-group-abt-synergy.jpg',
    imageAlt: 'Crystal Huang in a group choreography setting',
    imageAltZh: 'Crystal Huang 在群體編舞作品中的影像',
    videoSrc: '/crystal-group-abt-synergy.mp4',
    sortOrder: 1,
  },
  {
    title: "Yoko's Dance — Yearning Heart",
    titleZh: "Yoko's Dance — Yearning Heart",
    subtitle: '2024/25 Group Choreography',
    subtitleZh: '2024/25 群體編舞作品',
    imageSrc: '/crystal-group-yokos-yearning-heart.jpg',
    imageAlt: 'Crystal Huang in a group choreography setting',
    imageAltZh: 'Crystal Huang 在群體編舞作品中的影像',
    videoSrc: '/crystal-group-yokos-yearning-heart.mp4',
    sortOrder: 2,
  },
];
function ensureParentDirectory(filename) {
  if (filename === ':memory:') {
    return;
  }

  fs.mkdirSync(path.dirname(filename), { recursive: true });
}

function ensureColumn(db, tableName, columnName, definition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const hasColumn = columns.some((column) => column.name === columnName);

  if (!hasColumn) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

export function createDatabase(filename) {
  ensureParentDirectory(filename);

  const db = new Database(filename);
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  db.pragma('foreign_keys = ON');
  db.exec(schemaSql);

  ensureColumn(db, 'users', 'role', "TEXT NOT NULL DEFAULT 'user'");
  ensureColumn(db, 'users', 'updated_at', "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP");
  ensureColumn(db, 'videos', 'original_filename', 'TEXT');
  ensureColumn(db, 'videos', 'duration_seconds', 'INTEGER');
  ensureColumn(db, 'videos', 'file_size_bytes', 'INTEGER');
  ensureColumn(db, 'videos', 'updated_at', "TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP");
  ensureColumn(db, 'password_reset_tokens', 'used_at', 'TEXT');

  const statements = {
    listHeroEntryPoints: db.prepare(`SELECT id, title, title_zh AS titleZh, description, description_zh AS descriptionZh, href, is_visible AS isVisible, sort_order AS sortOrder, created_at AS createdAt, updated_at AS updatedAt FROM hero_entry_points ORDER BY sort_order ASC, id ASC`),
    countHeroEntryPoints: db.prepare('SELECT COUNT(*) AS count FROM hero_entry_points'),
    findHeroEntryPointById: db.prepare(`SELECT id, title, title_zh AS titleZh, description, description_zh AS descriptionZh, href, is_visible AS isVisible, sort_order AS sortOrder, created_at AS createdAt, updated_at AS updatedAt FROM hero_entry_points WHERE id = ?`),
    createHeroEntryPoint: db.prepare(`INSERT INTO hero_entry_points (title, title_zh, description, description_zh, href, is_visible, sort_order) VALUES (@title, @titleZh, @description, @descriptionZh, @href, @isVisible, @sortOrder) RETURNING id, title, title_zh AS titleZh, description, description_zh AS descriptionZh, href, is_visible AS isVisible, sort_order AS sortOrder, created_at AS createdAt, updated_at AS updatedAt`),
    updateHeroEntryPoint: db.prepare(`UPDATE hero_entry_points SET title=@title, title_zh=@titleZh, description=@description, description_zh=@descriptionZh, href=@href, is_visible=@isVisible, sort_order=@sortOrder, updated_at=CURRENT_TIMESTAMP WHERE id=@id RETURNING id, title, title_zh AS titleZh, description, description_zh AS descriptionZh, href, is_visible AS isVisible, sort_order AS sortOrder, created_at AS createdAt, updated_at AS updatedAt`),
    deleteHeroEntryPoint: db.prepare('DELETE FROM hero_entry_points WHERE id = ? RETURNING id'),
    updateHeroEntryPointSortOrder: db.prepare('UPDATE hero_entry_points SET sort_order=@sortOrder, updated_at=CURRENT_TIMESTAMP WHERE id=@id'),
    createContactInquiry: db.prepare(
      `INSERT INTO contact_inquiries (name, email, interest, message)
       VALUES (@name, @email, @interest, @message)
       RETURNING id, name, email, interest, message, status, created_at AS createdAt, updated_at AS updatedAt`
    ),
    listContactInquiries: db.prepare(
      `SELECT id, name, email, interest, message, status, created_at AS createdAt, updated_at AS updatedAt
       FROM contact_inquiries ORDER BY created_at DESC, id DESC`
    ),
    updateContactInquiryStatus: db.prepare(
      `UPDATE contact_inquiries SET status = @status, updated_at = CURRENT_TIMESTAMP WHERE id = @id
       RETURNING id, name, email, interest, message, status, created_at AS createdAt, updated_at AS updatedAt`
    ),
    deleteContactInquiry: db.prepare(
      `DELETE FROM contact_inquiries WHERE id = ? RETURNING id`
    ),
    createUser: db.prepare(
      `INSERT INTO users (email, password_hash, role)
       VALUES (@email, @passwordHash, @role)
       RETURNING id, email, role`
    ),
    findUserByEmail: db.prepare(
      'SELECT id, email, role, password_hash AS passwordHash FROM users WHERE email = ?'
    ),
    findUserById: db.prepare('SELECT id, email, role FROM users WHERE id = ?'),
    setUserRoleByEmail: db.prepare(
      `UPDATE users
       SET role = @role,
           updated_at = CURRENT_TIMESTAMP
       WHERE email = @email
       RETURNING id, email, role`
    ),
    updateUserPasswordHash: db.prepare(
      `UPDATE users
       SET password_hash = @passwordHash,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @userId
       RETURNING id, email, role`
    ),
    createVideo: db.prepare(
      `INSERT INTO videos (
          user_id,
          title,
          source_type,
          source_url,
          file_path,
          original_filename,
          duration_seconds,
          file_size_bytes,
          status
        ) VALUES (
          @userId,
          @title,
          @sourceType,
          @sourceUrl,
          @filePath,
          @originalFilename,
          @durationSeconds,
          @fileSizeBytes,
          @status
        ) RETURNING
          id,
          user_id AS userId,
          title,
          source_type AS sourceType,
          source_url AS sourceUrl,
          file_path AS filePath,
          original_filename AS originalFilename,
          duration_seconds AS durationSeconds,
          file_size_bytes AS fileSizeBytes,
          status,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    listVideosByUser: db.prepare(
      `SELECT
          id,
          user_id AS userId,
          title,
          source_type AS sourceType,
          source_url AS sourceUrl,
          file_path AS filePath,
          original_filename AS originalFilename,
          duration_seconds AS durationSeconds,
          file_size_bytes AS fileSizeBytes,
          status,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM videos
       WHERE user_id = ?
       ORDER BY datetime(created_at) DESC, id DESC`
    ),
    listUsersWithUploadCounts: db.prepare(
      `SELECT
          users.id,
          users.email,
          users.role,
          users.created_at AS createdAt,
          users.updated_at AS updatedAt,
          COUNT(videos.id) AS uploadCount
       FROM users
       LEFT JOIN videos ON videos.user_id = users.id
       GROUP BY users.id
       ORDER BY datetime(users.created_at) DESC, users.id DESC`
    ),
    listAllVideosWithUploader: db.prepare(
      `SELECT
          videos.id,
          videos.user_id AS userId,
          videos.title,
          videos.source_type AS sourceType,
          videos.source_url AS sourceUrl,
          videos.file_path AS filePath,
          videos.original_filename AS originalFilename,
          videos.duration_seconds AS durationSeconds,
          videos.file_size_bytes AS fileSizeBytes,
          videos.status,
          videos.created_at AS createdAt,
          videos.updated_at AS updatedAt,
          users.id AS uploaderId,
          users.email AS uploaderEmail,
          users.role AS uploaderRole
       FROM videos
       INNER JOIN users ON users.id = videos.user_id
       ORDER BY datetime(videos.created_at) DESC, videos.id DESC`
    ),
    deleteVideoById: db.prepare(
      `DELETE FROM videos
       WHERE id = ?
       RETURNING
         id,
         user_id AS userId,
         title,
         source_type AS sourceType,
         source_url AS sourceUrl,
         file_path AS filePath,
         original_filename AS originalFilename,
         duration_seconds AS durationSeconds,
         file_size_bytes AS fileSizeBytes,
         status,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
    deleteVideosByUserId: db.prepare(
      `DELETE FROM videos
       WHERE user_id = ?
       RETURNING
         id,
         user_id AS userId,
         title,
         source_type AS sourceType,
         source_url AS sourceUrl,
         file_path AS filePath,
         original_filename AS originalFilename,
         duration_seconds AS durationSeconds,
         file_size_bytes AS fileSizeBytes,
         status,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
    deleteUserById: db.prepare(
      `DELETE FROM users
       WHERE id = ?
       RETURNING id, email, role`
    ),
    insertPasswordResetToken: db.prepare(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES (@userId, @tokenHash, @expiresAt)
       RETURNING
         id,
         user_id AS userId,
         token_hash AS tokenHash,
         expires_at AS expiresAt,
         created_at AS createdAt,
         used_at AS usedAt`
    ),
    findPasswordResetTokenByHash: db.prepare(
      `SELECT
         id,
         user_id AS userId,
         token_hash AS tokenHash,
         expires_at AS expiresAt,
         created_at AS createdAt,
         used_at AS usedAt
       FROM password_reset_tokens
       WHERE token_hash = ?`
    ),
    deletePasswordResetTokensByUserId: db.prepare(
      'DELETE FROM password_reset_tokens WHERE user_id = ?'
    ),
    deletePasswordResetTokenById: db.prepare('DELETE FROM password_reset_tokens WHERE id = ?'),
    deleteExpiredPasswordResetTokens: db.prepare(
      'DELETE FROM password_reset_tokens WHERE expires_at <= ?'
    ),
    listComingUpEvents: db.prepare(
      `SELECT
          id,
          date_label AS dateLabel,
          title,
          location,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM coming_up_events
       ORDER BY sort_order ASC, id ASC`
    ),
    countComingUpEvents: db.prepare('SELECT COUNT(*) AS count FROM coming_up_events'),
    findComingUpEventById: db.prepare(
      `SELECT
          id,
          date_label AS dateLabel,
          title,
          location,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM coming_up_events
       WHERE id = ?`
    ),
    createComingUpEvent: db.prepare(
      `INSERT INTO coming_up_events (date_label, title, location, sort_order)
       VALUES (@dateLabel, @title, @location, @sortOrder)
       RETURNING
         id,
         date_label AS dateLabel,
         title,
         location,
         sort_order AS sortOrder,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
    updateComingUpEvent: db.prepare(
      `UPDATE coming_up_events
       SET date_label = @dateLabel,
           title = @title,
           location = @location,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id
       RETURNING
         id,
         date_label AS dateLabel,
         title,
         location,
         sort_order AS sortOrder,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
    deleteComingUpEvent: db.prepare(
      `DELETE FROM coming_up_events
       WHERE id = ?
       RETURNING
         id,
         date_label AS dateLabel,
         title,
         location,
         sort_order AS sortOrder,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
    updateComingUpEventSortOrder: db.prepare(
      `UPDATE coming_up_events
       SET sort_order = @sortOrder,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id`
    ),
    listInvestorUpdates: db.prepare(
      `SELECT
          id,
          category,
          title,
          summary,
          href,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM investor_updates
       ORDER BY
         CASE category
           WHEN 'investment-page' THEN 0
           WHEN 'monthly-reports' THEN 1
           WHEN 'real-time-quote' THEN 2
           ELSE 99
         END ASC,
         sort_order ASC,
         id ASC`
    ),
    countInvestorUpdatesByCategory: db.prepare(
      'SELECT COUNT(*) AS count FROM investor_updates WHERE category = ?'
    ),
    findInvestorUpdateById: db.prepare(
      `SELECT
          id,
          category,
          title,
          summary,
          href,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM investor_updates
       WHERE id = ?`
    ),
    createInvestorUpdate: db.prepare(
      `INSERT INTO investor_updates (category, title, summary, href, sort_order)
       VALUES (@category, @title, @summary, @href, @sortOrder)
       RETURNING
         id,
         category,
         title,
         summary,
         href,
         sort_order AS sortOrder,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
    updateInvestorUpdate: db.prepare(
      `UPDATE investor_updates
       SET category = @category,
           title = @title,
           summary = @summary,
           href = @href,
           sort_order = @sortOrder,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id
       RETURNING
         id,
         category,
         title,
         summary,
         href,
         sort_order AS sortOrder,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
    deleteInvestorUpdate: db.prepare(
      `DELETE FROM investor_updates
       WHERE id = ?
       RETURNING
         id,
         category,
         title,
         summary,
         href,
         sort_order AS sortOrder,
         created_at AS createdAt,
         updated_at AS updatedAt`
    ),
    updateInvestorUpdateSortOrder: db.prepare(
      `UPDATE investor_updates
       SET sort_order = @sortOrder,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id`
    ),
    listFeaturedReels: db.prepare(
      `SELECT
          id,
          placement,
          youtube_id AS youtubeId,
          video_src AS videoSrc,
          meta_label AS metaLabel,
          meta_label_zh AS metaLabelZh,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          thumbnail,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM featured_reels
       ORDER BY
         CASE placement
           WHEN 'featured' THEN 0
           WHEN 'supporting' THEN 1
           ELSE 99
         END ASC,
         sort_order ASC,
         id ASC`
    ),
    countFeaturedReelsByPlacement: db.prepare(
      'SELECT COUNT(*) AS count FROM featured_reels WHERE placement = ?'
    ),
    findFeaturedReelById: db.prepare(
      `SELECT
          id,
          placement,
          youtube_id AS youtubeId,
          video_src AS videoSrc,
          meta_label AS metaLabel,
          meta_label_zh AS metaLabelZh,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          thumbnail,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM featured_reels
       WHERE id = ?`
    ),
    createFeaturedReel: db.prepare(
      `INSERT INTO featured_reels (
          placement,
          youtube_id,
          video_src,
          meta_label,
          meta_label_zh,
          title,
          title_zh,
          description,
          description_zh,
          thumbnail,
          sort_order
        ) VALUES (
          @placement,
          @youtubeId,
          @videoSrc,
          @metaLabel,
          @metaLabelZh,
          @title,
          @titleZh,
          @description,
          @descriptionZh,
          @thumbnail,
          @sortOrder
        )
       RETURNING
          id,
          placement,
          youtube_id AS youtubeId,
          video_src AS videoSrc,
          meta_label AS metaLabel,
          meta_label_zh AS metaLabelZh,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          thumbnail,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    updateFeaturedReel: db.prepare(
      `UPDATE featured_reels
       SET placement = @placement,
           youtube_id = @youtubeId,
           video_src = @videoSrc,
           meta_label = @metaLabel,
           meta_label_zh = @metaLabelZh,
           title = @title,
           title_zh = @titleZh,
           description = @description,
           description_zh = @descriptionZh,
           thumbnail = @thumbnail,
           sort_order = @sortOrder,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id
       RETURNING
          id,
          placement,
          youtube_id AS youtubeId,
          video_src AS videoSrc,
          meta_label AS metaLabel,
          meta_label_zh AS metaLabelZh,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          thumbnail,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    deleteFeaturedReel: db.prepare(
      `DELETE FROM featured_reels
       WHERE id = ?
       RETURNING
          id,
          placement,
          youtube_id AS youtubeId,
          video_src AS videoSrc,
          meta_label AS metaLabel,
          meta_label_zh AS metaLabelZh,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          thumbnail,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    updateFeaturedReelSortOrder: db.prepare(
      `UPDATE featured_reels
       SET sort_order = @sortOrder,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id`
    ),
    listPressHighlights: db.prepare(
      `SELECT
          id,
          source,
          source_zh AS sourceZh,
          date_label AS dateLabel,
          date_label_zh AS dateLabelZh,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          href,
          image_src AS imageSrc,
          image_alt AS imageAlt,
          image_alt_zh AS imageAltZh,
          image_href AS imageHref,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM press_highlights
       ORDER BY sort_order ASC, id ASC`
    ),
    countPressHighlights: db.prepare('SELECT COUNT(*) AS count FROM press_highlights'),
    findPressHighlightById: db.prepare(
      `SELECT
          id,
          source,
          source_zh AS sourceZh,
          date_label AS dateLabel,
          date_label_zh AS dateLabelZh,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          href,
          image_src AS imageSrc,
          image_alt AS imageAlt,
          image_alt_zh AS imageAltZh,
          image_href AS imageHref,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM press_highlights
       WHERE id = ?`
    ),
    createPressHighlight: db.prepare(
      `INSERT INTO press_highlights (
          source,
          source_zh,
          date_label,
          date_label_zh,
          title,
          title_zh,
          description,
          description_zh,
          href,
          image_src,
          image_alt,
          image_alt_zh,
          image_href,
          sort_order
        ) VALUES (
          @source,
          @sourceZh,
          @dateLabel,
          @dateLabelZh,
          @title,
          @titleZh,
          @description,
          @descriptionZh,
          @href,
          @imageSrc,
          @imageAlt,
          @imageAltZh,
          @imageHref,
          @sortOrder
        )
       RETURNING
          id,
          source,
          source_zh AS sourceZh,
          date_label AS dateLabel,
          date_label_zh AS dateLabelZh,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          href,
          image_src AS imageSrc,
          image_alt AS imageAlt,
          image_alt_zh AS imageAltZh,
          image_href AS imageHref,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    updatePressHighlight: db.prepare(
      `UPDATE press_highlights
       SET source = @source,
           source_zh = @sourceZh,
           date_label = @dateLabel,
           date_label_zh = @dateLabelZh,
           title = @title,
           title_zh = @titleZh,
           description = @description,
           description_zh = @descriptionZh,
           href = @href,
           image_src = @imageSrc,
           image_alt = @imageAlt,
           image_alt_zh = @imageAltZh,
           image_href = @imageHref,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id
       RETURNING
          id,
          source,
          source_zh AS sourceZh,
          date_label AS dateLabel,
          date_label_zh AS dateLabelZh,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          href,
          image_src AS imageSrc,
          image_alt AS imageAlt,
          image_alt_zh AS imageAltZh,
          image_href AS imageHref,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    deletePressHighlight: db.prepare(
      `DELETE FROM press_highlights
       WHERE id = ?
       RETURNING
          id,
          source,
          source_zh AS sourceZh,
          date_label AS dateLabel,
          date_label_zh AS dateLabelZh,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          href,
          image_src AS imageSrc,
          image_alt AS imageAlt,
          image_alt_zh AS imageAltZh,
          image_href AS imageHref,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    updatePressHighlightSortOrder: db.prepare(
      `UPDATE press_highlights
       SET sort_order = @sortOrder,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id`
    ),
    listAchievementEntries: db.prepare(
      `SELECT
          id,
          year,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          highlight,
          latest,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM achievement_entries
       ORDER BY sort_order ASC, id ASC`
    ),
    countAchievementEntries: db.prepare('SELECT COUNT(*) AS count FROM achievement_entries'),
    findAchievementEntryById: db.prepare(
      `SELECT
          id,
          year,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          highlight,
          latest,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM achievement_entries
       WHERE id = ?`
    ),
    createAchievementEntry: db.prepare(
      `INSERT INTO achievement_entries (
          year,
          title,
          title_zh,
          description,
          description_zh,
          highlight,
          latest,
          sort_order
        ) VALUES (
          @year,
          @title,
          @titleZh,
          @description,
          @descriptionZh,
          @highlight,
          @latest,
          @sortOrder
        )
       RETURNING
          id,
          year,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          highlight,
          latest,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    updateAchievementEntry: db.prepare(
      `UPDATE achievement_entries
       SET year = @year,
           title = @title,
           title_zh = @titleZh,
           description = @description,
           description_zh = @descriptionZh,
           highlight = @highlight,
           latest = @latest,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id
       RETURNING
          id,
          year,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          highlight,
          latest,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    deleteAchievementEntry: db.prepare(
      `DELETE FROM achievement_entries
       WHERE id = ?
       RETURNING
          id,
          year,
          title,
          title_zh AS titleZh,
          description,
          description_zh AS descriptionZh,
          highlight,
          latest,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    clearLatestAchievementFlag: db.prepare(
      `UPDATE achievement_entries
       SET latest = 0,
           updated_at = CURRENT_TIMESTAMP
       WHERE latest != 0`
    ),
    updateAchievementEntrySortOrder: db.prepare(
      `UPDATE achievement_entries
       SET sort_order = @sortOrder,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id`
    ),
    listMasterClassTimelineEntries: db.prepare(
      `SELECT
          id,
          date_label AS dateLabel,
          date_label_zh AS dateLabelZh,
          title,
          title_zh AS titleZh,
          location,
          location_zh AS locationZh,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM master_class_timeline_entries
       ORDER BY sort_order ASC, id ASC`
    ),
    countMasterClassTimelineEntries: db.prepare(
      'SELECT COUNT(*) AS count FROM master_class_timeline_entries'
    ),
    findMasterClassTimelineEntryById: db.prepare(
      `SELECT
          id,
          date_label AS dateLabel,
          date_label_zh AS dateLabelZh,
          title,
          title_zh AS titleZh,
          location,
          location_zh AS locationZh,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM master_class_timeline_entries
       WHERE id = ?`
    ),
    createMasterClassTimelineEntry: db.prepare(
      `INSERT INTO master_class_timeline_entries (
          date_label,
          date_label_zh,
          title,
          title_zh,
          location,
          location_zh,
          sort_order
        ) VALUES (
          @dateLabel,
          @dateLabelZh,
          @title,
          @titleZh,
          @location,
          @locationZh,
          @sortOrder
        )
       RETURNING
          id,
          date_label AS dateLabel,
          date_label_zh AS dateLabelZh,
          title,
          title_zh AS titleZh,
          location,
          location_zh AS locationZh,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    updateMasterClassTimelineEntry: db.prepare(
      `UPDATE master_class_timeline_entries
       SET date_label = @dateLabel,
           date_label_zh = @dateLabelZh,
           title = @title,
           title_zh = @titleZh,
           location = @location,
           location_zh = @locationZh,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id
       RETURNING
          id,
          date_label AS dateLabel,
          date_label_zh AS dateLabelZh,
          title,
          title_zh AS titleZh,
          location,
          location_zh AS locationZh,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    deleteMasterClassTimelineEntry: db.prepare(
      `DELETE FROM master_class_timeline_entries
       WHERE id = ?
       RETURNING
          id,
          date_label AS dateLabel,
          date_label_zh AS dateLabelZh,
          title,
          title_zh AS titleZh,
          location,
          location_zh AS locationZh,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    updateMasterClassTimelineEntrySortOrder: db.prepare(
      `UPDATE master_class_timeline_entries
       SET sort_order = @sortOrder,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id`
    ),
    listMasterClassMoments: db.prepare(
      `SELECT
          id,
          title,
          title_zh AS titleZh,
          subtitle,
          subtitle_zh AS subtitleZh,
          image_src AS imageSrc,
          image_alt AS imageAlt,
          image_alt_zh AS imageAltZh,
          video_src AS videoSrc,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM master_class_moments
       ORDER BY sort_order ASC, id ASC`
    ),
    countMasterClassMoments: db.prepare('SELECT COUNT(*) AS count FROM master_class_moments'),
    findMasterClassMomentById: db.prepare(
      `SELECT
          id,
          title,
          title_zh AS titleZh,
          subtitle,
          subtitle_zh AS subtitleZh,
          image_src AS imageSrc,
          image_alt AS imageAlt,
          image_alt_zh AS imageAltZh,
          video_src AS videoSrc,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM master_class_moments
       WHERE id = ?`
    ),
    createMasterClassMoment: db.prepare(
      `INSERT INTO master_class_moments (
          title,
          title_zh,
          subtitle,
          subtitle_zh,
          image_src,
          image_alt,
          image_alt_zh,
          video_src,
          sort_order
        ) VALUES (
          @title,
          @titleZh,
          @subtitle,
          @subtitleZh,
          @imageSrc,
          @imageAlt,
          @imageAltZh,
          @videoSrc,
          @sortOrder
        )
       RETURNING
          id,
          title,
          title_zh AS titleZh,
          subtitle,
          subtitle_zh AS subtitleZh,
          image_src AS imageSrc,
          image_alt AS imageAlt,
          image_alt_zh AS imageAltZh,
          video_src AS videoSrc,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    updateMasterClassMoment: db.prepare(
      `UPDATE master_class_moments
       SET title = @title,
           title_zh = @titleZh,
           subtitle = @subtitle,
           subtitle_zh = @subtitleZh,
           image_src = @imageSrc,
           image_alt = @imageAlt,
           image_alt_zh = @imageAltZh,
           video_src = @videoSrc,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id
       RETURNING
          id,
          title,
          title_zh AS titleZh,
          subtitle,
          subtitle_zh AS subtitleZh,
          image_src AS imageSrc,
          image_alt AS imageAlt,
          image_alt_zh AS imageAltZh,
          video_src AS videoSrc,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    deleteMasterClassMoment: db.prepare(
      `DELETE FROM master_class_moments
       WHERE id = ?
       RETURNING
          id,
          title,
          title_zh AS titleZh,
          subtitle,
          subtitle_zh AS subtitleZh,
          image_src AS imageSrc,
          image_alt AS imageAlt,
          image_alt_zh AS imageAltZh,
          video_src AS videoSrc,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    updateMasterClassMomentSortOrder: db.prepare(
      `UPDATE master_class_moments
       SET sort_order = @sortOrder,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id`
    ),
    listGroupChoreographyEntries: db.prepare(
      `SELECT
          id,
          season_label AS seasonLabel,
          season_label_zh AS seasonLabelZh,
          organization,
          organization_zh AS organizationZh,
          work_title AS workTitle,
          work_title_zh AS workTitleZh,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM group_choreography_entries
       ORDER BY sort_order ASC, id ASC`
    ),
    countGroupChoreographyEntries: db.prepare(
      'SELECT COUNT(*) AS count FROM group_choreography_entries'
    ),
    findGroupChoreographyEntryById: db.prepare(
      `SELECT
          id,
          season_label AS seasonLabel,
          season_label_zh AS seasonLabelZh,
          organization,
          organization_zh AS organizationZh,
          work_title AS workTitle,
          work_title_zh AS workTitleZh,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM group_choreography_entries
       WHERE id = ?`
    ),
    createGroupChoreographyEntry: db.prepare(
      `INSERT INTO group_choreography_entries (
          season_label,
          season_label_zh,
          organization,
          organization_zh,
          work_title,
          work_title_zh,
          sort_order
        ) VALUES (
          @seasonLabel,
          @seasonLabelZh,
          @organization,
          @organizationZh,
          @workTitle,
          @workTitleZh,
          @sortOrder
        )
       RETURNING
          id,
          season_label AS seasonLabel,
          season_label_zh AS seasonLabelZh,
          organization,
          organization_zh AS organizationZh,
          work_title AS workTitle,
          work_title_zh AS workTitleZh,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    updateGroupChoreographyEntry: db.prepare(
      `UPDATE group_choreography_entries
       SET season_label = @seasonLabel,
           season_label_zh = @seasonLabelZh,
           organization = @organization,
           organization_zh = @organizationZh,
           work_title = @workTitle,
           work_title_zh = @workTitleZh,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id
       RETURNING
          id,
          season_label AS seasonLabel,
          season_label_zh AS seasonLabelZh,
          organization,
          organization_zh AS organizationZh,
          work_title AS workTitle,
          work_title_zh AS workTitleZh,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    deleteGroupChoreographyEntry: db.prepare(
      `DELETE FROM group_choreography_entries
       WHERE id = ?
       RETURNING
          id,
          season_label AS seasonLabel,
          season_label_zh AS seasonLabelZh,
          organization,
          organization_zh AS organizationZh,
          work_title AS workTitle,
          work_title_zh AS workTitleZh,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    updateGroupChoreographyEntrySortOrder: db.prepare(
      `UPDATE group_choreography_entries
       SET sort_order = @sortOrder,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id`
    ),
    listGroupChoreographyMoments: db.prepare(
      `SELECT
          id,
          title,
          title_zh AS titleZh,
          subtitle,
          subtitle_zh AS subtitleZh,
          image_src AS imageSrc,
          image_alt AS imageAlt,
          image_alt_zh AS imageAltZh,
          video_src AS videoSrc,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM group_choreography_moments
       ORDER BY sort_order ASC, id ASC`
    ),
    countGroupChoreographyMoments: db.prepare(
      'SELECT COUNT(*) AS count FROM group_choreography_moments'
    ),
    findGroupChoreographyMomentById: db.prepare(
      `SELECT
          id,
          title,
          title_zh AS titleZh,
          subtitle,
          subtitle_zh AS subtitleZh,
          image_src AS imageSrc,
          image_alt AS imageAlt,
          image_alt_zh AS imageAltZh,
          video_src AS videoSrc,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
       FROM group_choreography_moments
       WHERE id = ?`
    ),
    createGroupChoreographyMoment: db.prepare(
      `INSERT INTO group_choreography_moments (
          title,
          title_zh,
          subtitle,
          subtitle_zh,
          image_src,
          image_alt,
          image_alt_zh,
          video_src,
          sort_order
        ) VALUES (
          @title,
          @titleZh,
          @subtitle,
          @subtitleZh,
          @imageSrc,
          @imageAlt,
          @imageAltZh,
          @videoSrc,
          @sortOrder
        )
       RETURNING
          id,
          title,
          title_zh AS titleZh,
          subtitle,
          subtitle_zh AS subtitleZh,
          image_src AS imageSrc,
          image_alt AS imageAlt,
          image_alt_zh AS imageAltZh,
          video_src AS videoSrc,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    updateGroupChoreographyMoment: db.prepare(
      `UPDATE group_choreography_moments
       SET title = @title,
           title_zh = @titleZh,
           subtitle = @subtitle,
           subtitle_zh = @subtitleZh,
           image_src = @imageSrc,
           image_alt = @imageAlt,
           image_alt_zh = @imageAltZh,
           video_src = @videoSrc,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id
       RETURNING
          id,
          title,
          title_zh AS titleZh,
          subtitle,
          subtitle_zh AS subtitleZh,
          image_src AS imageSrc,
          image_alt AS imageAlt,
          image_alt_zh AS imageAltZh,
          video_src AS videoSrc,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    deleteGroupChoreographyMoment: db.prepare(
      `DELETE FROM group_choreography_moments
       WHERE id = ?
       RETURNING
          id,
          title,
          title_zh AS titleZh,
          subtitle,
          subtitle_zh AS subtitleZh,
          image_src AS imageSrc,
          image_alt AS imageAlt,
          image_alt_zh AS imageAltZh,
          video_src AS videoSrc,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt`
    ),
    updateGroupChoreographyMomentSortOrder: db.prepare(
      `UPDATE group_choreography_moments
       SET sort_order = @sortOrder,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id`
    ),
    getArtistProfile: db.prepare(
      `SELECT
          id,
          cover_identity AS coverIdentity,
          cover_identity_zh AS coverIdentityZh,
          cover_statement AS coverStatement,
          cover_statement_zh AS coverStatementZh,
          about_paragraph_1 AS aboutParagraph1,
          about_paragraph_1_zh AS aboutParagraph1Zh,
          about_paragraph_2 AS aboutParagraph2,
          about_paragraph_2_zh AS aboutParagraph2Zh,
          about_paragraph_3 AS aboutParagraph3,
          about_paragraph_3_zh AS aboutParagraph3Zh,
          updated_at AS updatedAt
       FROM artist_profile
       WHERE id = 1`
    ),
    upsertArtistProfile: db.prepare(
      `INSERT INTO artist_profile (
          id,
          cover_identity,
          cover_identity_zh,
          cover_statement,
          cover_statement_zh,
          about_paragraph_1,
          about_paragraph_1_zh,
          about_paragraph_2,
          about_paragraph_2_zh,
          about_paragraph_3,
          about_paragraph_3_zh,
          updated_at
        ) VALUES (
          1,
          @coverIdentity,
          @coverIdentityZh,
          @coverStatement,
          @coverStatementZh,
          @aboutParagraph1,
          @aboutParagraph1Zh,
          @aboutParagraph2,
          @aboutParagraph2Zh,
          @aboutParagraph3,
          @aboutParagraph3Zh,
          CURRENT_TIMESTAMP
        )
        ON CONFLICT(id) DO UPDATE SET
          cover_identity = excluded.cover_identity,
          cover_identity_zh = excluded.cover_identity_zh,
          cover_statement = excluded.cover_statement,
          cover_statement_zh = excluded.cover_statement_zh,
          about_paragraph_1 = excluded.about_paragraph_1,
          about_paragraph_1_zh = excluded.about_paragraph_1_zh,
          about_paragraph_2 = excluded.about_paragraph_2,
          about_paragraph_2_zh = excluded.about_paragraph_2_zh,
          about_paragraph_3 = excluded.about_paragraph_3,
          about_paragraph_3_zh = excluded.about_paragraph_3_zh,
          updated_at = CURRENT_TIMESTAMP
        RETURNING
          id,
          cover_identity AS coverIdentity,
          cover_identity_zh AS coverIdentityZh,
          cover_statement AS coverStatement,
          cover_statement_zh AS coverStatementZh,
          about_paragraph_1 AS aboutParagraph1,
          about_paragraph_1_zh AS aboutParagraph1Zh,
          about_paragraph_2 AS aboutParagraph2,
          about_paragraph_2_zh AS aboutParagraph2Zh,
          about_paragraph_3 AS aboutParagraph3,
          about_paragraph_3_zh AS aboutParagraph3Zh,
          updated_at AS updatedAt`
    ),
  };

  const deleteUserWithVideos = db.transaction((userId) => {
    const videos = statements.deleteVideosByUserId.all(userId);
    const user = statements.deleteUserById.get(userId);

    if (!user) {
      return null;
    }

    return { user, videos };
  });

  const replacePasswordResetToken = db.transaction(({ userId, tokenHash, expiresAt }) => {
    statements.deletePasswordResetTokensByUserId.run(userId);
    return statements.insertPasswordResetToken.get({ userId, tokenHash, expiresAt });
  });

  const resetUserPassword = db.transaction(({ userId, passwordHash }) => {
    const user = statements.updateUserPasswordHash.get({ userId, passwordHash });

    if (!user) {
      return null;
    }

    statements.deletePasswordResetTokensByUserId.run(userId);
    return user;
  });

  const reorderComingUpEvents = db.transaction((orderedIds) => {
    orderedIds.forEach((id, index) => {
      statements.updateComingUpEventSortOrder.run({
        id,
        sortOrder: index,
      });
    });

    return statements.listComingUpEvents.all();
  });

  const reorderInvestorUpdates = db.transaction((category, orderedIds) => {
    orderedIds.forEach((id, index) => {
      statements.updateInvestorUpdateSortOrder.run({
        id,
        sortOrder: index,
      });
    });

    return statements
      .listInvestorUpdates
      .all()
      .filter((entry) => entry.category === category);
  });

  const reorderFeaturedReels = db.transaction((placement, orderedIds) => {
    orderedIds.forEach((id, index) => {
      statements.updateFeaturedReelSortOrder.run({
        id,
        sortOrder: index,
      });
    });

    return statements
      .listFeaturedReels
      .all()
      .filter((entry) => entry.placement === placement);
  });

  const reorderPressHighlights = db.transaction((orderedIds) => {
    orderedIds.forEach((id, index) => {
      statements.updatePressHighlightSortOrder.run({
        id,
        sortOrder: index,
      });
    });

    return statements.listPressHighlights.all();
  });

  const reorderAchievementEntries = db.transaction((orderedIds) => {
    orderedIds.forEach((id, index) => {
      statements.updateAchievementEntrySortOrder.run({
        id,
        sortOrder: index,
      });
    });

    return statements.listAchievementEntries.all();
  });

  const reorderMasterClassTimelineEntries = db.transaction((orderedIds) => {
    orderedIds.forEach((id, index) => {
      statements.updateMasterClassTimelineEntrySortOrder.run({
        id,
        sortOrder: index,
      });
    });

    return statements.listMasterClassTimelineEntries.all();
  });

  const reorderMasterClassMoments = db.transaction((orderedIds) => {
    orderedIds.forEach((id, index) => {
      statements.updateMasterClassMomentSortOrder.run({
        id,
        sortOrder: index,
      });
    });

    return statements.listMasterClassMoments.all();
  });

  const reorderGroupChoreographyEntries = db.transaction((orderedIds) => {
    orderedIds.forEach((id, index) => {
      statements.updateGroupChoreographyEntrySortOrder.run({
        id,
        sortOrder: index,
      });
    });

    return statements.listGroupChoreographyEntries.all();
  });

  const reorderGroupChoreographyMoments = db.transaction((orderedIds) => {
    orderedIds.forEach((id, index) => {
      statements.updateGroupChoreographyMomentSortOrder.run({
        id,
        sortOrder: index,
      });
    });

    return statements.listGroupChoreographyMoments.all();
  });

  const createAchievementEntry = db.transaction((entry) => {
    if (entry.latest) {
      statements.clearLatestAchievementFlag.run();
    }

    return statements.createAchievementEntry.get(entry);
  });

  const updateAchievementEntry = db.transaction((entry) => {
    if (entry.latest) {
      statements.clearLatestAchievementFlag.run();
    }

    return statements.updateAchievementEntry.get(entry) ?? null;
  });

  function seedComingUpEvents() {
    const { count } = statements.countComingUpEvents.get();

    if (Number(count) > 0) {
      return;
    }

    for (const event of defaultComingUpEvents) {
      statements.createComingUpEvent.get(event);
    }
  }

  function seedFeaturedReels() {
    const featuredCount = statements.countFeaturedReelsByPlacement.get('featured');
    const supportingCount = statements.countFeaturedReelsByPlacement.get('supporting');

    if (Number(featuredCount.count) + Number(supportingCount.count) > 0) {
      return;
    }

    for (const reel of defaultFeaturedReels) {
      statements.createFeaturedReel.get(reel);
    }
  }

  function seedPressHighlights() {
    const { count } = statements.countPressHighlights.get();

    if (Number(count) > 0) {
      return;
    }

    for (const highlight of defaultPressHighlights) {
      statements.createPressHighlight.get(highlight);
    }
  }

  function seedAchievementEntries() {
    const { count } = statements.countAchievementEntries.get();

    if (Number(count) > 0) {
      return;
    }

    for (const entry of defaultAchievementEntries) {
      statements.createAchievementEntry.get(entry);
    }
  }

  function seedArtistProfile() {
    const existing = statements.getArtistProfile.get();

    if (existing) {
      return;
    }

    statements.upsertArtistProfile.get(defaultArtistProfile);
  }

  function seedMasterClassTimelineEntries() {
    const { count } = statements.countMasterClassTimelineEntries.get();

    if (Number(count) > 0) {
      return;
    }

    for (const entry of defaultMasterClassTimelineEntries) {
      statements.createMasterClassTimelineEntry.get(entry);
    }
  }

  function seedMasterClassMoments() {
    const { count } = statements.countMasterClassMoments.get();

    if (Number(count) > 0) {
      return;
    }

    for (const moment of defaultMasterClassMoments) {
      statements.createMasterClassMoment.get(moment);
    }
  }

  function seedGroupChoreographyEntries() {
    const { count } = statements.countGroupChoreographyEntries.get();

    if (Number(count) > 0) {
      return;
    }

    for (const entry of defaultGroupChoreographyEntries) {
      statements.createGroupChoreographyEntry.get(entry);
    }
  }

  function seedGroupChoreographyMoments() {
    const { count } = statements.countGroupChoreographyMoments.get();

    if (Number(count) > 0) {
      return;
    }

    for (const moment of defaultGroupChoreographyMoments) {
      statements.createGroupChoreographyMoment.get(moment);
    }
  }

  function seedHeroEntryPoints() {
    const { count } = statements.countHeroEntryPoints.get();
    if (Number(count) > 0) return;
    for (const entry of defaultHeroEntryPoints) statements.createHeroEntryPoint.get({ ...entry, isVisible: 1 });
  }

  seedComingUpEvents();
  seedHeroEntryPoints();
  seedFeaturedReels();
  seedPressHighlights();
  seedAchievementEntries();
  seedArtistProfile();
  seedMasterClassTimelineEntries();
  seedMasterClassMoments();
  seedGroupChoreographyEntries();
  seedGroupChoreographyMoments();

  return {
    raw: db,
    listHeroEntryPoints() { return statements.listHeroEntryPoints.all().map((entry) => ({ ...entry, isVisible: Boolean(entry.isVisible) })); },
    countHeroEntryPoints() { return Number(statements.countHeroEntryPoints.get().count); },
    findHeroEntryPointById(id) { const entry = statements.findHeroEntryPointById.get(id); return entry ? { ...entry, isVisible: Boolean(entry.isVisible) } : null; },
    createHeroEntryPoint(entry) { const created = statements.createHeroEntryPoint.get({ ...entry, isVisible: entry.isVisible ? 1 : 0 }); return { ...created, isVisible: Boolean(created.isVisible) }; },
    updateHeroEntryPoint(entry) { const updated = statements.updateHeroEntryPoint.get({ ...entry, isVisible: entry.isVisible ? 1 : 0 }); return updated ? { ...updated, isVisible: Boolean(updated.isVisible) } : null; },
    deleteHeroEntryPoint(id) { return statements.deleteHeroEntryPoint.get(id) ?? null; },
    reorderHeroEntryPoints(orderedIds) { const update = db.transaction(() => orderedIds.forEach((id, sortOrder) => statements.updateHeroEntryPointSortOrder.run({ id, sortOrder }))); update(); return this.listHeroEntryPoints(); },
    createContactInquiry(inquiry) {
      return statements.createContactInquiry.get(inquiry);
    },
    listContactInquiries() {
      return statements.listContactInquiries.all();
    },
    updateContactInquiryStatus(id, status) {
      return statements.updateContactInquiryStatus.get({ id, status }) ?? null;
    },
    deleteContactInquiry(id) {
      return statements.deleteContactInquiry.get(id) ?? null;
    },
    createUser({ email, passwordHash, role = 'user' }) {
      return statements.createUser.get({ email, passwordHash, role });
    },
    findUserByEmail(email) {
      return statements.findUserByEmail.get(email) ?? null;
    },
    findUserById(id) {
      return statements.findUserById.get(id) ?? null;
    },
    setUserRoleByEmail(email, role) {
      return statements.setUserRoleByEmail.get({ email, role }) ?? null;
    },
    createPasswordResetToken(passwordResetToken) {
      return replacePasswordResetToken(passwordResetToken);
    },
    findPasswordResetTokenByHash(tokenHash) {
      return statements.findPasswordResetTokenByHash.get(tokenHash) ?? null;
    },
    deletePasswordResetTokenById(tokenId) {
      statements.deletePasswordResetTokenById.run(tokenId);
    },
    deleteExpiredPasswordResetTokens(expiresAt) {
      statements.deleteExpiredPasswordResetTokens.run(expiresAt);
    },
    resetUserPassword(resetRequest) {
      return resetUserPassword(resetRequest);
    },
    createVideo(video) {
      return statements.createVideo.get(video);
    },
    listVideosByUser(userId) {
      return statements.listVideosByUser.all(userId);
    },
    listUsersWithUploadCounts() {
      return statements.listUsersWithUploadCounts.all().map((user) => ({
        ...user,
        uploadCount: Number(user.uploadCount),
      }));
    },
    listAllVideosWithUploader() {
      return statements.listAllVideosWithUploader.all();
    },
    deleteVideoById(videoId) {
      return statements.deleteVideoById.get(videoId) ?? null;
    },
    deleteUserWithVideos(userId) {
      return deleteUserWithVideos(userId);
    },
    listComingUpEvents() {
      return statements.listComingUpEvents.all();
    },
    findComingUpEventById(id) {
      return statements.findComingUpEventById.get(id) ?? null;
    },
    createComingUpEvent(event) {
      return statements.createComingUpEvent.get(event);
    },
    updateComingUpEvent(event) {
      return statements.updateComingUpEvent.get(event) ?? null;
    },
    deleteComingUpEvent(eventId) {
      return statements.deleteComingUpEvent.get(eventId) ?? null;
    },
    reorderComingUpEvents(orderedIds) {
      return reorderComingUpEvents(orderedIds);
    },
    listInvestorUpdates() {
      return statements.listInvestorUpdates.all();
    },
    countInvestorUpdatesByCategory(category) {
      const { count } = statements.countInvestorUpdatesByCategory.get(category);
      return Number(count);
    },
    findInvestorUpdateById(id) {
      return statements.findInvestorUpdateById.get(id) ?? null;
    },
    createInvestorUpdate(update) {
      return statements.createInvestorUpdate.get(update);
    },
    updateInvestorUpdate(update) {
      return statements.updateInvestorUpdate.get(update) ?? null;
    },
    deleteInvestorUpdate(updateId) {
      return statements.deleteInvestorUpdate.get(updateId) ?? null;
    },
    reorderInvestorUpdates(category, orderedIds) {
      return reorderInvestorUpdates(category, orderedIds);
    },
    listFeaturedReels() {
      return statements.listFeaturedReels.all();
    },
    countFeaturedReelsByPlacement(placement) {
      const { count } = statements.countFeaturedReelsByPlacement.get(placement);
      return Number(count);
    },
    findFeaturedReelById(id) {
      return statements.findFeaturedReelById.get(id) ?? null;
    },
    createFeaturedReel(reel) {
      return statements.createFeaturedReel.get(reel);
    },
    updateFeaturedReel(reel) {
      return statements.updateFeaturedReel.get(reel) ?? null;
    },
    deleteFeaturedReel(reelId) {
      return statements.deleteFeaturedReel.get(reelId) ?? null;
    },
    reorderFeaturedReels(placement, orderedIds) {
      return reorderFeaturedReels(placement, orderedIds);
    },
    listPressHighlights() {
      return statements.listPressHighlights.all();
    },
    countPressHighlights() {
      const { count } = statements.countPressHighlights.get();
      return Number(count);
    },
    findPressHighlightById(id) {
      return statements.findPressHighlightById.get(id) ?? null;
    },
    createPressHighlight(highlight) {
      return statements.createPressHighlight.get(highlight);
    },
    updatePressHighlight(highlight) {
      return statements.updatePressHighlight.get(highlight) ?? null;
    },
    deletePressHighlight(highlightId) {
      return statements.deletePressHighlight.get(highlightId) ?? null;
    },
    reorderPressHighlights(orderedIds) {
      return reorderPressHighlights(orderedIds);
    },
    listAchievementEntries() {
      return statements.listAchievementEntries.all().map((entry) => ({
        ...entry,
        highlight: Boolean(entry.highlight),
        latest: Boolean(entry.latest),
      }));
    },
    countAchievementEntries() {
      const { count } = statements.countAchievementEntries.get();
      return Number(count);
    },
    findAchievementEntryById(id) {
      const entry = statements.findAchievementEntryById.get(id);
      return entry
        ? {
            ...entry,
            highlight: Boolean(entry.highlight),
            latest: Boolean(entry.latest),
          }
        : null;
    },
    createAchievementEntry(entry) {
      const created = createAchievementEntry({
        ...entry,
        highlight: entry.highlight ? 1 : 0,
        latest: entry.latest ? 1 : 0,
      });
      return {
        ...created,
        highlight: Boolean(created.highlight),
        latest: Boolean(created.latest),
      };
    },
    updateAchievementEntry(entry) {
      const updated = updateAchievementEntry({
        ...entry,
        highlight: entry.highlight ? 1 : 0,
        latest: entry.latest ? 1 : 0,
      });
      return updated
        ? {
            ...updated,
            highlight: Boolean(updated.highlight),
            latest: Boolean(updated.latest),
          }
        : null;
    },
    deleteAchievementEntry(entryId) {
      const deleted = statements.deleteAchievementEntry.get(entryId);
      return deleted
        ? {
            ...deleted,
            highlight: Boolean(deleted.highlight),
            latest: Boolean(deleted.latest),
          }
        : null;
    },
    reorderAchievementEntries(orderedIds) {
      return reorderAchievementEntries(orderedIds).map((entry) => ({
        ...entry,
        highlight: Boolean(entry.highlight),
        latest: Boolean(entry.latest),
      }));
    },
    getArtistProfile() {
      return statements.getArtistProfile.get() ?? null;
    },
    upsertArtistProfile(profile) {
      return statements.upsertArtistProfile.get(profile);
    },
    listMasterClassTimelineEntries() {
      return statements.listMasterClassTimelineEntries.all();
    },
    countMasterClassTimelineEntries() {
      const { count } = statements.countMasterClassTimelineEntries.get();
      return Number(count);
    },
    findMasterClassTimelineEntryById(id) {
      return statements.findMasterClassTimelineEntryById.get(id) ?? null;
    },
    createMasterClassTimelineEntry(entry) {
      return statements.createMasterClassTimelineEntry.get(entry);
    },
    updateMasterClassTimelineEntry(entry) {
      return statements.updateMasterClassTimelineEntry.get(entry) ?? null;
    },
    deleteMasterClassTimelineEntry(entryId) {
      return statements.deleteMasterClassTimelineEntry.get(entryId) ?? null;
    },
    reorderMasterClassTimelineEntries(orderedIds) {
      return reorderMasterClassTimelineEntries(orderedIds);
    },
    listMasterClassMoments() {
      return statements.listMasterClassMoments.all();
    },
    countMasterClassMoments() {
      const { count } = statements.countMasterClassMoments.get();
      return Number(count);
    },
    findMasterClassMomentById(id) {
      return statements.findMasterClassMomentById.get(id) ?? null;
    },
    createMasterClassMoment(moment) {
      return statements.createMasterClassMoment.get(moment);
    },
    updateMasterClassMoment(moment) {
      return statements.updateMasterClassMoment.get(moment) ?? null;
    },
    deleteMasterClassMoment(momentId) {
      return statements.deleteMasterClassMoment.get(momentId) ?? null;
    },
    reorderMasterClassMoments(orderedIds) {
      return reorderMasterClassMoments(orderedIds);
    },
    listGroupChoreographyEntries() {
      return statements.listGroupChoreographyEntries.all();
    },
    countGroupChoreographyEntries() {
      const { count } = statements.countGroupChoreographyEntries.get();
      return Number(count);
    },
    findGroupChoreographyEntryById(id) {
      return statements.findGroupChoreographyEntryById.get(id) ?? null;
    },
    createGroupChoreographyEntry(entry) {
      return statements.createGroupChoreographyEntry.get(entry);
    },
    updateGroupChoreographyEntry(entry) {
      return statements.updateGroupChoreographyEntry.get(entry) ?? null;
    },
    deleteGroupChoreographyEntry(entryId) {
      return statements.deleteGroupChoreographyEntry.get(entryId) ?? null;
    },
    reorderGroupChoreographyEntries(orderedIds) {
      return reorderGroupChoreographyEntries(orderedIds);
    },
    listGroupChoreographyMoments() {
      return statements.listGroupChoreographyMoments.all();
    },
    countGroupChoreographyMoments() {
      const { count } = statements.countGroupChoreographyMoments.get();
      return Number(count);
    },
    findGroupChoreographyMomentById(id) {
      return statements.findGroupChoreographyMomentById.get(id) ?? null;
    },
    createGroupChoreographyMoment(moment) {
      return statements.createGroupChoreographyMoment.get(moment);
    },
    updateGroupChoreographyMoment(moment) {
      return statements.updateGroupChoreographyMoment.get(moment) ?? null;
    },
    deleteGroupChoreographyMoment(momentId) {
      return statements.deleteGroupChoreographyMoment.get(momentId) ?? null;
    },
    reorderGroupChoreographyMoments(orderedIds) {
      return reorderGroupChoreographyMoments(orderedIds);
    },
    close() {
      db.close();
    },
  };
}
