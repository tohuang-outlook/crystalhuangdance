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
}

export const siteConfig = {
  name: 'Crystal Huang',
  title: 'Dancer',
  tagline: 'Dance is the hidden language of the soul',
  heroSubtitle:
    'Ballet · Contemporary · Jazz · Lyrical · Hip Hop · Musical Theatre',
  bio: `Prix de Lausanne 2024 Prize Winner. Dancer · ABT JKO School · Bayer Ballet Academy. Ballet, contemporary, jazz, and beyond.`,
  aboutParagraphs: [
    `Crystal Huang, 15, is having a remarkable year. In 2024, she became a Prize Winner at the prestigious Prix de Lausanne — one of only nine dancers worldwide awarded a scholarship. She also earned the Female Contemporary Dance Award at the same competition, and went on to win Second Place in the Senior Division at YAGP Finals in New York and the Grand Prix at the South Africa International Ballet Competition.`,
    `Trained initially in commercial dance at The Rock Center for Dance in Las Vegas, Crystal discovered her passion for ballet and transferred to Bayer Ballet Academy to study under the Vaganova method. Her hard work paid off, earning her a scholarship to the American Ballet Theatre's Jacqueline Kennedy Onassis School in New York, where she continues to pursue her dream of becoming a principal dancer.`,
    `Crystal believes that dance is not just about technical perfection — it's about making the audience feel something. With a motto to always make every performance tell a story, she brings love, discipline, and artistry to the stage.`,
  ],
  // TODO: 換成姐姐的真實 email
  email: 'crystal@example.com',
  social: {
    // TODO: 換成姐姐的真實社交連結
    instagram: '#',
    youtube: '#',
    tiktok: '#',
  },
};

export const danceStyles: DanceStyle[] = [
  {
    name: 'Ballet',
    description: 'Classical ballet with precision, grace, and storytelling through movement.',
    icon: '🩰',
    image: '/crystal-ballet.jpg',
  },
  {
    name: 'Contemporary',
    description: 'Expressive and fluid movement that blends modern techniques with emotion.',
    icon: '🌊',
    image: '/crystal-contemporary.jpg',
  },
  {
    name: 'Jazz',
    description: 'High-energy, rhythmic, and dynamic choreography with attitude.',
    icon: '⭐',
    image: '/crystal-jazz.jpg',
  },
  {
    name: 'Lyrical',
    description: 'Story-driven choreography that interprets lyrics through graceful motion.',
    icon: '💫',
    image: '/crystal-lyrical.jpg',
  },
  {
    name: 'Hip Hop',
    description: 'Urban grooves, sharp isolations, and powerful stage presence.',
    icon: '🔥',
    image: '',
  },
  {
    name: 'Musical Theatre',
    description: 'Theatrical performance combining dance, acting, and stagecraft.',
    icon: '🎭',
    image: '',
  },
];

export const achievements: Achievement[] = [
  {
    year: '2024',
    title: 'Prix de Lausanne Prize Winner',
    description: 'One of nine worldwide — awarded scholarship to top partner schools',
  },
  {
    year: '2024',
    title: 'Female Contemporary Dance Award',
    description: 'Special award for contemporary performance at Prix de Lausanne 2024',
  },
  {
    year: '2024',
    title: 'YAGP Senior Division Silver Medalist',
    description: '2nd Place — Youth America Grand Prix Finals, New York',
  },
  {
    year: '2024',
    title: 'Grand Prix — SA International Ballet Competition',
    description: 'Top honor at the South Africa International Ballet Competition',
  },
  {
    year: '2023',
    title: 'National Commercial Dance Champion',
    description: 'Won two of the biggest commercial dance conventions in the US',
  },
];

export const galleryImages = [
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
