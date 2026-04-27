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
  heroSubtitle: 'Ballet · Contemporary · Jazz',
  bio: `A passionate and dedicated dancer with years of training in classical ballet, contemporary, jazz, and more. Crystal brings joy, discipline, and artistry to every performance and class she leads.`,
  aboutParagraphs: [
    `From her first plié to commanding the stage, Crystal's journey in dance has been one of passion, perseverance, and grace. Trained in multiple disciplines, she has developed a unique style that blends classical technique with contemporary expression.`,
    `Whether performing under the spotlight or inspiring the next generation of dancers in the studio, Crystal believes that dance is not just movement — it's a conversation between the body, the music, and the soul.`,
  ],
  email: 'crystal@example.com',
  social: {
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
    image: '/crystal-hero.jpg',
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
    year: '2025',
    title: 'Regional Champion',
    description: 'First Place - Contemporary Solo, Regional Dance Competition',
  },
  {
    year: '2024',
    title: 'National Finalist',
    description: 'Top 5 - Ballet Division, National Youth Dance Championships',
  },
  {
    year: '2024',
    title: 'Scholarship Award',
    description: 'Full scholarship to prestigious summer intensive program',
  },
  {
    year: '2023',
    title: 'Gold Medalist',
    description: 'Classical Ballet - Gold Medal, State Dance Festival',
  },
  {
    year: '2023',
    title: 'Outstanding Performer',
    description: 'Recognized for exceptional stage presence and artistry',
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
