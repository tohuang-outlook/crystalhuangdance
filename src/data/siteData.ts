export interface DanceStyle {
  name: string;
  description: string;
  icon: string;
  image: string;
}

export interface Achievement {
  year: string;
  title: string;
  description: string;
  highlight?: boolean;
  latest?: boolean;
}

export interface ArchiveTimelineEntry {
  date: string;
  dateZh: string;
  title: string;
  titleZh: string;
  location: string;
  locationZh: string;
}

export interface ArchiveMediaItem {
  title: string;
  titleZh: string;
  subtitle: string;
  subtitleZh: string;
  image: string;
  imageAlt: string;
  imageAltZh: string;
  video?: string;
}

export interface GroupChoreographyEntry {
  season: string;
  seasonZh: string;
  organization: string;
  organizationZh: string;
  work: string;
  workZh: string;
}

export interface CredentialTag {
  label: string;
  labelZh: string;
}

export interface ArchiveEntryPoint {
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  href: string;
}

export interface SiteConfig {
  name: string;
  title: string;
  tagline: string;
  heroSubtitle: string;
  bio: string;
  aboutParagraphs: string[];
  coverIdentity: string;
  coverIdentityZh: string;
  coverStatement: string;
  coverStatementZh: string;
  identityStrip: CredentialTag[];
  archiveEntryPoints: ArchiveEntryPoint[];
  email: string;
  social: {
    instagram: string;
    youtube: string;
    tiktok: string;
  };
}

export const siteConfig: SiteConfig = {
  name: 'Crystal Huang',
  title: 'Dancer',
  tagline: 'Dance is the hidden language of the soul',
  heroSubtitle: 'Ballet · Contemporary · Jazz · Lyrical · Hip Hop · Musical Theatre',
  bio: `San Francisco Ballet School Trainee with elite training, touring experience, and international performance credits across ballet, contemporary, and commercial work.`,
  aboutParagraphs: [
    `Crystal Huang is a San Francisco Ballet School trainee whose recent work spans elite conservatory training, international gala appearances, and national touring experience. Her current dossier includes Prix de Lausanne 2024 Prize Winner #4 and Contemporary Dance Award Winner, YAGP NYC Finals Senior Women Silver Medal Winner, SAIBC Senior Women Grand Prix Winner, and the 2025 T.O.P. Asian American Outstanding Dancer honor.`,
    `Her training path bridges classical rigor and wide stylistic range. She began at Yoko's Dance and Performing Arts Academy, trained extensively at The Rock Center for Dance and Nevada School of Ballet, refined her classical foundation at Bayer Ballet Academy, studied at the American Ballet Theatre Jacqueline Kennedy Onassis School, and now continues her development at San Francisco Ballet School under a distinguished faculty.`,
    `Alongside competition and conservatory work, Crystal has toured nationally as an NYCDA Outstanding Dancer, The Dance Awards Best Dancer, and Radix Core Performer, while also appearing in performances and galas across New York, Italy, Belgium, Switzerland, South Africa, China, and Japan. Her professional profile also includes choreography, master class teaching, and creative work for younger dancers across the United States.`,
  ],
  coverIdentity: 'San Francisco Ballet School Trainee',
  coverIdentityZh: '舊金山芭蕾舞學校培訓生',
  coverStatement:
    'San Francisco Ballet School trainee with international performance, touring, and competition experience across ballet, contemporary, and commercial work.',
  coverStatementZh:
    '具備國際演出、巡演與競賽經歷的舊金山芭蕾舞學校培訓生，橫跨古典芭蕾、當代與商業演出。',
  identityStrip: [
    { label: 'San Francisco Ballet School Trainee', labelZh: '舊金山芭蕾舞學校培訓生' },
    { label: 'ABT JKO School', labelZh: 'ABT JKO 學校' },
    { label: 'Prix de Lausanne Prize Winner', labelZh: '洛桑國際芭蕾舞比賽得獎者' },
    { label: 'Contemporary Dance Award', labelZh: '當代舞蹈特別獎' },
  ],
  archiveEntryPoints: [
    {
      title: 'Press Highlight',
      titleZh: '媒體亮點',
      description: 'Featured interviews, awards coverage, and recent spotlight stories.',
      descriptionZh: '精選訪談、得獎報導與近期焦點媒體內容。',
      href: '#press',
    },
    {
      title: 'Archive Timeline',
      titleZh: '檔案時間線',
      description: 'Training history, milestones, and development across seasons.',
      descriptionZh: '依時間整理的訓練歷程、里程碑與成長軌跡。',
      href: '#archive',
    },
    {
      title: 'Artist Profile',
      titleZh: '舞者檔案',
      description: 'Background, current identity, and professional profile overview.',
      descriptionZh: '背景介紹、當前身份與專業檔案總覽。',
      href: '#profile',
    },
    {
      title: 'Artistic Range',
      titleZh: '藝術風格跨度',
      description: 'Classical foundations and contemporary range.',
      descriptionZh: '古典基礎與當代延展能力。',
      href: '#styles',
    },
    {
      title: 'Media',
      titleZh: '影像',
      description: 'Performance reels and artistic range media.',
      descriptionZh: '精選演出影片與舞作媒體內容。',
      href: '#videos',
    },
    {
      title: 'Master Class and Choreographer',
      titleZh: '大師課與編舞',
      description: 'Master classes, teaching work, and choreography documentation.',
      descriptionZh: '大師課、教學工作與編舞內容整理。',
      href: '#gallery',
    },
  ],
  email: 'crystalhuangdance@yahoo.com',
  social: {
    instagram: 'https://www.instagram.com/crystalhuangdance/',
    youtube: 'https://www.youtube.com/@crystalhuangdance',
    tiktok: 'https://www.tiktok.com/@crystalhuangdance',
  },
};

export const danceStyles: DanceStyle[] = [
  {
    name: 'Ballet',
    description:
      'Classical ballet with precision, grace, and storytelling through movement. Trained under Vaganova method and performed variations from Le Corsaire, La Bayadère, Gamzatti, and Don Quixote.',
    icon: '🩰',
    image: '/crystal-ballet.jpg',
  },
  {
    name: 'Contemporary',
    description:
      'Expressive and fluid movement blending modern techniques with raw emotion. Deeply inspired by training at Juilliard Summer Intensive and NDT Summer Intensive.',
    icon: '🌊',
    image: '/crystal-contemporary.jpg',
  },
  {
    name: 'Jazz',
    description:
      'High-energy, rhythmic, and dynamic choreography with attitude. Extensively trained under industry legends including Brian Friedman, Brooke Pierotti, and Dana Foglia.',
    icon: '⭐',
    image: '/crystal-jazz.jpg',
  },
  {
    name: 'Lyrical',
    description:
      'Story-driven choreography interpreting lyrics through graceful motion. Built a strong foundation under Mark Meismer, Robert Duran, and Suzie Taylor.',
    icon: '💫',
    image: '/crystal-lyrical.jpg',
  },
  {
    name: 'Hip Hop',
    description:
      'Urban grooves, sharp isolations, and powerful stage presence. Trained with Tricia Miranda, Randi Kemper, Hefa Tuita, and Tabitha & Napoleon D\'umo.',
    icon: '🔥',
    image: '/crystal-hiphop.jpg',
  },
  {
    name: 'Musical Theatre',
    description:
      'Theatrical performance combining dance, acting, and stagecraft. Performed in Radio City Christmas Spectacular as Clara & Ellie, and trained under Al Blackstone and Eddie Strachan.',
    icon: '🎭',
    image: '/crystal-musical.jpg',
  },
  {
    name: 'Contemporary Fusion',
    description:
      'A blend of contemporary with other movement styles. Mentored by Tessandra Chavez, Chaz Buzan, and Jason Parsons.',
    icon: '🌀',
    image: '/crystal-contemporary-fusion.jpg',
  },
  {
    name: 'Tap',
    description:
      'Rhythmic footwork and musicality. Trained under Danny Wallace, Jason Janas, Sarah Reich, and Anthony Morigerato.',
    icon: '👞',
    image: '/crystal-tap.jpg',
  },
  {
    name: 'Ballroom',
    description:
      'Partnering, musical phrasing, and ballroom technique shaped through training with Ashly Costa, Erica Marr, Lacey Schwimmer, Jenna Johnson, Val Chmerkovskiy, Britt Cherry, and Britt Stewart.',
    icon: '🪩',
    image: '/crystal-ballroom.jpg',
  },
];

export const achievements: Achievement[] = [
  {
    year: '2026',
    title: 'XV Moscow International Ballet Competition — Junior Group Girls Solo First Prize & Gold Medal Winner',
    description:
      'Won First Prize and Gold Medal in the junior group girls solo division at the XV Moscow International Ballet Competition.',
    highlight: true,
    latest: true,
  },
  {
    year: '2025',
    title: 'T.O.P. Awards — 2025 Asian American Outstanding Dancer',
    description:
      'Honored as the 2025 Asian American Outstanding Dancer.',
    highlight: true,
  },
  {
    year: '2024',
    title: 'SAIBC International Finals — Senior Women Grand Prix Winner',
    description:
      'Top honor in the senior women division at the South Africa International Ballet Competition.',
    highlight: true,
  },
  {
    year: '2024',
    title: 'YAGP NYC Finals — Senior Women Silver Medal Winner',
    description:
      'Silver Medal winner in the senior women division at YAGP New York City Finals.',
    highlight: true,
  },
  {
    year: '2024',
    title: 'Prix de Lausanne — Prize Winner #4 & Contemporary Dance Award Winner',
    description:
      'Recognized as Prize Winner #4 and recipient of the Contemporary Dance Award at Prix de Lausanne.',
    highlight: true,
  },
  {
    year: '2024',
    title: 'YoungArts — Winner of Distinction in Ballet',
    description:
      'National recognition from YoungArts for distinction in ballet.',
  },
  {
    year: '2023',
    title: 'NYCDA Nationals — Teen Female Outstanding Dancer Winner',
    description:
      'National titleholder at NYCDA Finals with subsequent touring appearances.',
  },
  {
    year: '2023',
    title: 'The Dance Awards Las Vegas Nationals — Teen Female Best Dancer Winner',
    description:
      'Teen Female Best Dancer title at the Las Vegas nationals and nationwide touring appearances.',
  },
  {
    year: '2023',
    title: 'YAGP Tampa Finals — Junior Bronze Medal Winner',
    description:
      'Bronze Medal winner at YAGP Tampa Finals in the junior division.',
  },
  {
    year: '2022',
    title: 'YAGP Tampa Finals — Junior Bronze Medal Winner',
    description:
      'Bronze Medal winner at YAGP Tampa Finals in the junior division.',
  },
  {
    year: '2021',
    title: 'The Dance Awards Las Vegas Nationals — Junior Female Best Dancer Winner',
    description:
      'Junior Female Best Dancer titleholder with touring appearances through the 2021–22 season.',
  },
  {
    year: '2021',
    title: 'Radix Nationals — Junior Female Core Performer Winner',
    description:
      'National junior titleholder at Radix Dance Convention.',
  },
  {
    year: '2019',
    title: 'The Dance Awards Las Vegas Nationals — Mini Female Best Dancer Winner',
    description:
      'Won the mini female Best Dancer title in Las Vegas at age 10.',
  },
  {
    year: '2019',
    title: 'Radix Nationals — Mini Female Core Performer Winner',
    description:
      'National mini titleholder at Radix Dance Convention.',
  },
  {
    year: '2019',
    title: 'KAR Anaheim Finals — Junior Intermediate Solo National Champion & Miss Junior Dance America',
    description:
      'Captured the national champion title and Miss Junior Dance America at KAR Anaheim Finals.',
  },
  {
    year: '2019',
    title: 'Showstopper Anaheim Finals — Junior Competitive National Champion',
    description:
      'Junior Competitive National Champion at the Anaheim finals.',
  },
  {
    year: '2019',
    title: 'StarPower Anaheim Finals — Junior Competitive Grand Champion & Title Winner',
    description:
      'Junior Competitive Grand Champion and title winner at the Anaheim finals.',
  },
  {
    year: '2018',
    title: 'KAR Nationals Anaheim — Junior Solo 1st Overall & Miss Junior KAR',
    description:
      'Junior solo 1st Overall and Miss Junior KAR at KAR Nationals in Anaheim.',
  },
  {
    year: '2018',
    title: 'Showbiz Nationals Anaheim — Junior Solo Grand Champion & Miss Showbiz',
    description:
      'Junior solo Grand Champion and Miss Showbiz at Showbiz Nationals Anaheim.',
  },
  {
    year: '2018',
    title: 'Showstopper Nationals Anaheim — Junior Solo 1st Overall',
    description:
      'Junior solo 1st Overall at Showstopper Nationals Anaheim.',
  },
  {
    year: '2017',
    title: 'StarPower Talent Nationals Las Vegas — Mini Solo Grand Champion & Miss Petite StarPower',
    description:
      'Mini solo Grand Champion and Miss Petite StarPower in Las Vegas.',
  },
];

export const trainingTimeline = [
  {
    period: 'Sep 2025 – Present',
    school: 'San Francisco Ballet School (Level 8 / Trainee)',
    teachers:
      'Pascal Molat, Grace Holmes, Dana Genshaft, Karen Gabay, Viktor Plotnikov, Larissa Ponomarenko',
  },
  {
    period: 'Sep 2024 – May 2025',
    school: 'American Ballet Theatre School (Upper 3)',
    teachers:
      'Stella Abrera, Yan Chen, Ruben Martin, Anne Jung',
  },
  {
    period: 'Aug 2024',
    school: 'Netherlands Dans Theater Summer Intensive',
    teachers:
      'Thiago Bordin, Ami Shulman, Conner Chew, Jiri Pokorny, Surimu Fukushi, Anne Jung, Nova Valkenhoff',
    highlight: true,
  },
  {
    period: 'Sep 2023 – Aug 2024',
    school: 'Bayer Ballet Academy',
    teachers:
      'Inna Bayer, Tilt Helimets, Stanislav Feco, Mikhail Kaniskin, Vasily Medvedev',
  },
  {
    period: 'Jul 2023',
    school: 'Juilliard Summer Intensive',
    teachers:
      'Alicia Graf Mack, Mario Alberto Zambrano, Roderick George',
    highlight: true,
  },
  {
    period: 'Aug 2018 – Aug 2024',
    school: 'The Rock Center for Dance — Las Vegas',
    teachers:
      'Quinn Callahan, Courtney Combs, Suzanne Swanson, Jim Nowakowski, Jaylene, Russel Corpis',
  },
  {
    period: 'Jan 2020 – Dec 2023',
    school: 'Nevada School of Ballet',
    teachers: 'Ella Gourkova, Sergey Popov',
  },
  {
    period: 'Feb 2011 – Aug 2018',
    school: 'Yoko\'s Dance and Performing Arts Academy',
    teachers:
      'Megan Ellis, Erin Le Moyne, Ashley Anderson, Danny Wallace',
  },
];

export const masterClassTimeline: ArchiveTimelineEntry[] = [
  {
    date: 'April 2026',
    dateZh: '2026 年 4 月',
    title: 'Ballet Master Class at UC Berkeley Ballet Company',
    titleZh: '加州大學柏克萊芭蕾舞團芭蕾大師課',
    location: 'Berkeley, CA',
    locationZh: '加州柏克萊',
  },
  {
    date: 'March 2026',
    dateZh: '2026 年 3 月',
    title: 'Ballet Master Class at YAGP',
    titleZh: 'YAGP 芭蕾大師課',
    location: 'San Francisco, CA',
    locationZh: '加州舊金山',
  },
  {
    date: 'Aug. 2025',
    dateZh: '2025 年 8 月',
    title: 'Ballet Master Class at ZDP Academy',
    titleZh: 'ZDP Academy 芭蕾大師課',
    location: 'Boston, MA',
    locationZh: '麻州波士頓',
  },
  {
    date: 'Aug. 2025',
    dateZh: '2025 年 8 月',
    title: 'Jazz Master Class at T.O.P Award',
    titleZh: 'T.O.P Award 爵士大師課',
    location: 'T.O.P Award',
    locationZh: 'T.O.P Award',
  },
  {
    date: 'July 2025',
    dateZh: '2025 年 7 月',
    title: 'Contemporary Master Class at The Rock Center',
    titleZh: 'The Rock Center 現代舞大師課',
    location: 'Henderson, NV',
    locationZh: '內華達州亨德森',
  },
  {
    date: 'July 2025',
    dateZh: '2025 年 7 月',
    title: "Contemporary Master Class at Li's Ballet",
    titleZh: "Li's Ballet 現代舞大師課",
    location: 'Temple City, CA',
    locationZh: '加州天普市',
  },
  {
    date: 'June 2025',
    dateZh: '2025 年 6 月',
    title: 'Jazz Master Class at OAEC Academy',
    titleZh: 'OAEC Academy 爵士大師課',
    location: 'Houston, TX',
    locationZh: '德州休士頓',
  },
  {
    date: 'June 2024',
    dateZh: '2024 年 6 月',
    title: 'Contemporary Master Class at OAEC Academy',
    titleZh: 'OAEC Academy 現代舞大師課',
    location: 'Houston, TX',
    locationZh: '德州休士頓',
  },
];

export const masterClassMoments: ArchiveMediaItem[] = [
  {
    title: 'Ballet Master Class at UC Berkeley Ballet Company',
    titleZh: '加州大學柏克萊芭蕾舞團芭蕾大師課',
    subtitle: 'Berkeley, CA · April 2026',
    subtitleZh: '加州柏克萊 · 2026 年 4 月',
    image: '/crystal-masterclass-uc-berkeley.jpg',
    imageAlt: 'Crystal Huang in a master class or choreographic setting',
    imageAltZh: 'Crystal Huang 在大師課或編舞指導場合中的影像',
    video: '/crystal-masterclass-uc-berkeley.mp4',
  },
  {
    title: 'Ballet Master Class at YAGP',
    titleZh: 'YAGP 芭蕾大師課',
    subtitle: 'San Francisco, CA · March 2026',
    subtitleZh: '加州舊金山 · 2026 年 3 月',
    image: '/crystal-masterclass-yagp.jpg',
    imageAlt: 'Crystal Huang in a master class or choreographic setting',
    imageAltZh: 'Crystal Huang 在大師課或編舞指導場合中的影像',
    video: '/crystal-masterclass-yagp.mp4',
  },
  {
    title: 'Ballet Master Class at ZDP Academy',
    titleZh: 'ZDP Academy 芭蕾大師課',
    subtitle: 'Boston, MA · Aug. 2025',
    subtitleZh: '麻州波士頓 · 2025 年 8 月',
    image: '/crystal-masterclass-zdp.jpg',
    imageAlt: 'Crystal Huang in a master class or choreographic setting',
    imageAltZh: 'Crystal Huang 在大師課或編舞指導場合中的影像',
    video: '/crystal-masterclass-zdp.mp4',
  },
  {
    title: 'Jazz Master Class at T.O.P Award',
    titleZh: 'T.O.P Award 爵士大師課',
    subtitle: 'T.O.P Award · Aug. 2025',
    subtitleZh: 'T.O.P Award · 2025 年 8 月',
    image: '/crystal-masterclass-top.jpg',
    imageAlt: 'Crystal Huang in a master class or choreographic setting',
    imageAltZh: 'Crystal Huang 在大師課或編舞指導場合中的影像',
    video: '/crystal-masterclass-top.mp4',
  },
  {
    title: 'Contemporary Master Class at The Rock Center',
    titleZh: 'The Rock Center 現代舞大師課',
    subtitle: 'Henderson, NV · July 2025',
    subtitleZh: '內華達州亨德森 · 2025 年 7 月',
    image: '/crystal-masterclass-rock-center.jpg',
    imageAlt: 'Crystal Huang in a master class or choreographic setting',
    imageAltZh: 'Crystal Huang 在大師課或編舞指導場合中的影像',
    video: '/crystal-masterclass-rock-center.mp4',
  },
  {
    title: "Contemporary Master Class at Li's Ballet",
    titleZh: "Li's Ballet 現代舞大師課",
    subtitle: 'Temple City, CA · July 2025',
    subtitleZh: '加州天普市 · 2025 年 7 月',
    image: '/crystal-masterclass-lis-ballet.jpg',
    imageAlt: 'Crystal Huang in a master class or choreographic setting',
    imageAltZh: 'Crystal Huang 在大師課或編舞指導場合中的影像',
    video: '/crystal-masterclass-lis-ballet.mp4',
  },
  {
    title: 'Jazz Master Class at OAEC Academy',
    titleZh: 'OAEC Academy 爵士大師課',
    subtitle: 'Houston, TX · June 2025',
    subtitleZh: '德州休士頓 · 2025 年 6 月',
    image: '/crystal-masterclass-oaec-jazz.jpg',
    imageAlt: 'Crystal Huang in a master class or choreographic setting',
    imageAltZh: 'Crystal Huang 在大師課或編舞指導場合中的影像',
    video: '/crystal-masterclass-oaec-jazz.mp4',
  },
  {
    title: 'Contemporary Master Class at OAEC Academy',
    titleZh: 'OAEC Academy 現代舞大師課',
    subtitle: 'Houston, TX · June 2024',
    subtitleZh: '德州休士頓 · 2024 年 6 月',
    image: '/crystal-masterclass-oaec-contemporary.jpg',
    imageAlt: 'Crystal Huang in a master class or choreographic setting',
    imageAltZh: 'Crystal Huang 在大師課或編舞指導場合中的影像',
    video: '/crystal-masterclass-oaec-contemporary.mp4',
  },
];

export const groupChoreographyEntries: GroupChoreographyEntry[] = [
  {
    season: '2025/26',
    seasonZh: '2025/26',
    organization: 'SFB School',
    organizationZh: 'SFB School',
    work: 'TBD',
    workZh: 'TBD',
  },
  {
    season: '2024/25',
    seasonZh: '2024/25',
    organization: 'ABT School',
    organizationZh: 'ABT School',
    work: 'Synergy',
    workZh: 'Synergy',
  },
  {
    season: '2024/25',
    seasonZh: '2024/25',
    organization: "Yoko's Dance",
    organizationZh: "Yoko's Dance",
    work: 'Yearning Heart',
    workZh: 'Yearning Heart',
  },
];

export const groupChoreographyMoments: ArchiveMediaItem[] = [
  {
    title: 'SFB School — TBD',
    titleZh: 'SFB School — TBD',
    subtitle: '2025/26 Group Choreography',
    subtitleZh: '2025/26 群體編舞作品',
    image: '/crystal-group-sfb-tbd.jpg',
    imageAlt: 'SFB School group choreography photo',
    imageAltZh: 'SFB School 群體編舞照片',
  },
  {
    title: 'ABT School — Synergy',
    titleZh: 'ABT School — Synergy',
    subtitle: '2024/25 Group Choreography',
    subtitleZh: '2024/25 群體編舞作品',
    image: '/crystal-group-abt-synergy.jpg',
    imageAlt: 'Crystal Huang in a group choreography setting',
    imageAltZh: 'Crystal Huang 在群體編舞作品中的影像',
    video: '/crystal-group-abt-synergy.mp4',
  },
  {
    title: "Yoko's Dance — Yearning Heart",
    titleZh: "Yoko's Dance — Yearning Heart",
    subtitle: '2024/25 Group Choreography',
    subtitleZh: '2024/25 群體編舞作品',
    image: '/crystal-group-yokos-yearning-heart.jpg',
    imageAlt: 'Crystal Huang in a group choreography setting',
    imageAltZh: 'Crystal Huang 在群體編舞作品中的影像',
    video: '/crystal-group-yokos-yearning-heart.mp4',
  },
];
