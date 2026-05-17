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
}

export interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
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
  bio: `SF Ballet Trainee · ABT JKO School · Prix de Lausanne 2024 Prize Winner. Ballet, contemporary, jazz, and beyond.`,
  aboutParagraphs: [
    `Crystal Huang, 16, is having a remarkable journey in dance. In 2024, she became a Prize Winner at the prestigious Prix de Lausanne — one of only nine dancers worldwide awarded a scholarship — and won the Female Contemporary Dance Award at the same competition. That same year, she earned the Silver Medal in the Senior Division at YAGP Finals in New York and the Grand Prix at the South Africa International Ballet Competition. In 2025, she was honored with the T.O.P. Award as Asian American Outstanding Dancer.`,
    `Crystal's training journey is as diverse as her achievements. She began at Yoko's Dance Academy in Fremont, trained extensively at The Rock Center for Dance in Las Vegas, and later studied under the Vaganova method at Bayer Ballet Academy. She spent the 2024-25 season at American Ballet Theatre's Jacqueline Kennedy Onassis School (Upper 3) under teachers including Stella Abrera and Yan Chen. As of September 2025, she has joined San Francisco Ballet School as a Trainee (Level 8), training with Pascal Molat, Grace Holmes, and Dana Genshaft.`,
    `Beyond competition, Crystal has performed on global stages — from Sicily to Japan, Belgium to South Africa — and has toured extensively as NYCDA National Teen Outstanding Dancer and The Dance Awards Best Dancer. She has also choreographed solo and group works for dancers across the U.S., sharing her artistry and love for dance with the next generation. She believes dance is about making the audience feel something, and brings love, discipline, and artistry to every performance.`,
  ],
  coverIdentity: 'San Francisco Ballet School Trainee',
  coverIdentityZh: '舊金山芭蕾舞學校培訓生',
  coverStatement:
    'Emerging artist with elite training across ballet, contemporary, and commercial performance.',
  coverStatementZh:
    '橫跨古典芭蕾、當代與商業演出的新生代舞者，具備國際級訓練背景。',
  identityStrip: [
    { label: 'San Francisco Ballet School Trainee', labelZh: '舊金山芭蕾舞學校培訓生' },
    { label: 'ABT JKO School', labelZh: 'ABT JKO 學校' },
    { label: 'Prix de Lausanne Prize Winner', labelZh: '洛桑國際芭蕾舞比賽得獎者' },
    { label: 'Contemporary Dance Award', labelZh: '當代舞蹈特別獎' },
  ],
  archiveEntryPoints: [
    {
      title: 'Training',
      titleZh: '訓練',
      description: 'Elite institutions, teachers, and formative programs.',
      descriptionZh: '菁英學校、師資與重要養成計畫。',
      href: '#archive',
    },
    {
      title: 'Awards',
      titleZh: '榮譽',
      description: 'Major distinctions and competitive milestones.',
      descriptionZh: '重要獎項與比賽里程碑。',
      href: '#distinctions',
    },
    {
      title: 'Repertoire',
      titleZh: '舞作範圍',
      description: 'Classical foundations and contemporary range.',
      descriptionZh: '古典基礎與當代延展能力。',
      href: '#range',
    },
    {
      title: 'Media',
      titleZh: '影像',
      description: 'Performance reels and curated stills.',
      descriptionZh: '精選演出影片與影像。',
      href: '#media',
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
    image: '',
  },
  {
    name: 'Musical Theatre',
    description:
      'Theatrical performance combining dance, acting, and stagecraft. Performed in Radio City Christmas Spectacular as Clara & Ellie, and trained under Al Blackstone and Eddie Strachan.',
    icon: '🎭',
    image: '',
  },
  {
    name: 'Contemporary Fusion',
    description:
      'A blend of contemporary with other movement styles. Mentored by Tessandra Chavez, Chaz Buzan, and Jason Parsons.',
    icon: '🌀',
    image: '',
  },
  {
    name: 'Tap',
    description:
      'Rhythmic footwork and musicality. Trained under Danny Wallace, Jason Janas, Sarah Reich, and Anthony Morigerato.',
    icon: '👞',
    image: '',
  },
];

export const achievements: Achievement[] = [
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

export const galleryImages: GalleryImage[] = [
  {
    src: '/crystal-hero.jpg',
    alt: 'Crystal Huang ballet performance',
    caption: 'Stage Performance',
  },
  {
    src: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    alt: 'Dance studio practice',
    caption: 'In the Studio',
  },
  {
    src: 'https://images.unsplash.com/photo-1547153760-18fc86324498?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    alt: 'Contemporary dance',
    caption: 'Contemporary Flow',
  },
  {
    src: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    alt: 'Ballet shoes',
    caption: 'Behind the Scenes',
  },
  {
    src: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    alt: 'Dance team',
    caption: 'Team Rehearsal',
  },
  {
    src: 'https://images.unsplash.com/photo-1461783479566-2d546eae531f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    alt: 'Performance backstage',
    caption: 'Pre-Show Preparation',
  },
];
