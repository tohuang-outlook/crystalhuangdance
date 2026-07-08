export type ReelEvent =
  | 'moscow'
  | 'prix'
  | 'dance-awards'
  | 'yagp'
  | 'youngarts'
  | 'nycda'
  | 'radix';

export type ReelPlacement = 'featured' | 'supporting';

export interface ReelVideo {
  id: string;
  videoSrc?: string;
  metaLabel: string;
  metaLabelZh: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  thumbnail: string;
  event: ReelEvent;
  placement: ReelPlacement;
}

export const reelVideos: ReelVideo[] = [
  {
    id: '_1p3Udn_SZY',
    metaLabel: 'XV Moscow Ballet Competition · July 2026',
    metaLabelZh: '莫斯科國際芭蕾舞大賽 · 2026年7月',
    title: '2026 XV Moscow Ballet Competition, Round 2 Contemporary',
    titleZh: '2026 第十五屆莫斯科國際芭蕾舞大賽第二輪當代舞',
    description:
      'Crystal Huang performs her round 2 contemporary selection at the XV Moscow Ballet Competition in July 2026.',
    descriptionZh:
      'Crystal Huang 於 2026 年 7 月在第十五屆莫斯科國際芭蕾舞大賽演出第二輪當代舞作品。',
    thumbnail: '/crystal-press-moscow-vx.png',
    event: 'moscow',
    placement: 'featured',
  },
  {
    id: 'ZINiS_mTgd0',
    metaLabel: 'XV Moscow Ballet Competition Gala · July 2026',
    metaLabelZh: '莫斯科國際芭蕾舞大賽晚會演出 · 2026年7月',
    title: '2026 XV Moscow International Ballet Competition Gala Performance',
    titleZh: '2026 第十五屆莫斯科國際芭蕾舞大賽晚會演出',
    description:
      'Crystal Huang performs in the 2026 XV Moscow International Ballet Competition gala presentation.',
    descriptionZh:
      'Crystal Huang 於 2026 年第十五屆莫斯科國際芭蕾舞大賽晚會演出中登台演出。',
    thumbnail: '/crystal-press-moscow-gala-2.png',
    event: 'moscow',
    placement: 'featured',
  },
  {
    id: 'e2Z9UXevvIg',
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
    event: 'prix',
    placement: 'featured',
  },
  {
    id: 'JpP-JRj3LMw',
    metaLabel: 'XV Moscow Ballet Competition · July 2026',
    metaLabelZh: '莫斯科國際芭蕾舞大賽 · 2026年7月',
    title: '2026 XV Moscow Ballet Competition, Junior Solo Round 3 - Harlequinade Variation',
    titleZh: '2026 第十五屆莫斯科國際芭蕾舞大賽少年女子獨舞第三輪 - Harlequinade 變奏',
    description:
      'Crystal Huang performs the Harlequinade variation in junior solo round 3 at the 2026 XV Moscow Ballet Competition.',
    descriptionZh:
      'Crystal Huang 於 2026 年第十五屆莫斯科國際芭蕾舞大賽少年女子獨舞第三輪演出 Harlequinade 變奏。',
    thumbnail: '/crystal-press-moscow-harlequinade.png',
    event: 'moscow',
    placement: 'supporting',
  },
  {
    id: '3i5ap93thF0',
    metaLabel: 'XV Moscow Ballet Competition · July 2026',
    metaLabelZh: '莫斯科國際芭蕾舞大賽 · 2026年7月',
    title: '2026 XV Moscow Ballet Competition, Junior Solo Round 3 - Sugar Plum Fairy Variation',
    titleZh: '2026 第十五屆莫斯科國際芭蕾舞大賽少年女子獨舞第三輪 - 糖梅仙子變奏',
    description:
      'Crystal Huang performs the Sugar Plum Fairy variation in junior solo round 3 at the 2026 XV Moscow Ballet Competition.',
    descriptionZh:
      'Crystal Huang 於 2026 年第十五屆莫斯科國際芭蕾舞大賽少年女子獨舞第三輪演出糖梅仙子變奏。',
    thumbnail: '/crystal-press-moscow-sugar-plum.png',
    event: 'moscow',
    placement: 'supporting',
  },
  {
    id: 'iA3sQ5TDgu0',
    metaLabel: 'XV Moscow Ballet Competition · July 2026',
    metaLabelZh: '莫斯科國際芭蕾舞大賽 · 2026年7月',
    title: '2026 XV Moscow Ballet Competition, Junior Solo Round 1 - Gulnare Variation',
    titleZh: '2026 第十五屆莫斯科國際芭蕾舞大賽少年女子獨舞第一輪 - Gulnare 變奏',
    description:
      'Crystal Huang performs the Gulnare variation in junior solo round 1 at the 2026 XV Moscow Ballet Competition.',
    descriptionZh:
      'Crystal Huang 於 2026 年第十五屆莫斯科國際芭蕾舞大賽少年女子獨舞第一輪演出 Gulnare 變奏。',
    thumbnail: '/crystal-press-moscow-gulnare-2.png',
    event: 'moscow',
    placement: 'supporting',
  },
  {
    id: 'ckEaotosfqs',
    metaLabel: 'The Dance Awards · 2023',
    metaLabelZh: '美國舞蹈大獎賽 · 2023',
    title: 'The Dance Awards 2023 — Teen Best Dancer Winner',
    titleZh: '美國舞蹈大獎賽 2023 — 青少年最佳舞者',
    description:
      "'Grasping Intentions' — the solo that won Crystal the Teen Female Best Dancer title at The Dance Awards Las Vegas 2023.",
    descriptionZh:
      '「Grasping Intentions」——讓 Crystal 奪得 2023 年美國舞蹈大獎賽青少年女子最佳舞者的獨舞。',
    thumbnail: '/Grasping_intentions.jpg',
    event: 'dance-awards',
    placement: 'supporting',
  },
  {
    id: 'LCSPksYxP6U',
    metaLabel: 'YAGP Finals · 2023',
    metaLabelZh: 'YAGP 總決賽 · 2023',
    title: 'YAGP 2023 Finals — Junior Women Medalist',
    titleZh: 'YAGP 2023 總決賽 — 少年女子組獎牌得主',
    description:
      "Crystal Huang, age 14, performs variation from La Esmeralda at the YAGP 2023 Finals, where she won the Medal in the Junior Women's Age Division.",
    descriptionZh:
      'Crystal 14歲時在 YAGP 2023 總決賽演出《艾斯梅拉達》變奏，榮獲少年女子組獎牌。',
    thumbnail: '/crystal-ballet.jpg',
    event: 'yagp',
    placement: 'supporting',
  },
  {
    id: 'iEl9gdOaqr8',
    metaLabel: 'YoungArts · 2024',
    metaLabelZh: 'YoungArts · 2024',
    title: 'YoungArts 2024 — Winner of Distinction in Ballet',
    titleZh: '2024 YoungArts — 芭蕾傑出得獎者',
    description: 'National recognition in ballet from the National YoungArts Foundation 2024.',
    descriptionZh: '獲美國國家青年藝術基金會 2024 年芭蕾傑出獎項肯定。',
    thumbnail: '/crystal-YoungArt.jpg',
    event: 'youngarts',
    placement: 'supporting',
  },
  {
    id: 'TyUOTqG2eoY',
    metaLabel: 'NYCDA Finals · 2023',
    metaLabelZh: 'NYCDA 總決賽 · 2023',
    title: 'NYCDA 2023 — National Teen Female Outstanding Dancer',
    titleZh: 'NYCDA 2023 — 全國青少年女子傑出舞者',
    description: 'Crystal wins the National Teen Female Outstanding Dancer title at NYCDA NYC Finals 2023.',
    descriptionZh: 'Crystal 在 2023 年 NYCDA 紐約總決賽奪得全國青少年女子傑出舞者冠軍。',
    thumbnail: '/Crystal-NYVDA_I_love_you.jpg',
    event: 'nycda',
    placement: 'supporting',
  },
  {
    id: 'MQqWEWPIk_4',
    metaLabel: 'The Dance Awards · 2021',
    metaLabelZh: '美國舞蹈大獎賽 · 2021',
    title: 'The Dance Awards 2021 — Junior Female Best Dancer',
    titleZh: '美國舞蹈大獎賽 2021 — 少年女子最佳舞者',
    description: 'Crystal wins the Junior Female Best Dancer title at The Dance Awards Las Vegas Nationals 2021.',
    descriptionZh: 'Crystal 在 2021 年拉斯維加斯美國舞蹈大獎賽全國賽奪得少年女子最佳舞者冠軍。',
    thumbnail: '/Crystal-teenBD-moonlight.jpg',
    event: 'dance-awards',
    placement: 'supporting',
  },
  {
    id: 'NAx5malU5Jc',
    metaLabel: 'Radix · 2021',
    metaLabelZh: 'Radix · 2021',
    title: 'Radix 2021 — National Junior Female Core Performer',
    titleZh: 'Radix 2021 — 全國青少年女子核心表演者',
    description: 'Crystal wins the National Junior Female Core Performer title at Radix Dance Convention 2021.',
    descriptionZh: 'Crystal 在 2021 年 Radix 舞蹈大會奪得全國青少年女子核心表演者冠軍。',
    thumbnail: '/Crystal_Radix_Junior_CP_give_it.jpg',
    event: 'radix',
    placement: 'supporting',
  },
  {
    id: 'y9wIR8E-REQ',
    metaLabel: 'The Dance Awards · 2019',
    metaLabelZh: '美國舞蹈大獎賽 · 2019',
    title: 'The Dance Awards 2019 — Mini Female Best Dancer',
    titleZh: '美國舞蹈大獎賽 2019 — 迷你組最佳舞者',
    description:
      'Crystal wins the Mini Female Best Dancer title at The Dance Awards Las Vegas Nationals 2019, at just 10 years old.',
    descriptionZh: 'Crystal 僅10歲便在 2019 年拉斯維加斯美國舞蹈大獎賽全國賽奪得迷你組最佳舞者冠軍。',
    thumbnail: '/Crystal_TDA_Mini_BD_Flat_Red.jpg',
    event: 'dance-awards',
    placement: 'supporting',
  },
  {
    id: 'VP_aWHWiLZ8',
    metaLabel: 'Radix · 2019',
    metaLabelZh: 'Radix · 2019',
    title: 'Radix 2019 — National Mini Female Core Performer',
    titleZh: 'Radix 2019 — 全國迷你組核心表演者',
    description: 'Crystal wins the National Mini Female Core Performer title at Radix Dance Convention 2019.',
    descriptionZh: 'Crystal 在 2019 年 Radix 舞蹈大會奪得全國迷你組核心表演者冠軍。',
    thumbnail: '/Crystal_Radix_mini_CP_Flat_Red.jpg',
    event: 'radix',
    placement: 'supporting',
  },
];
