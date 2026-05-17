import { useState } from 'react';
import { Play, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Video {
  id: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  thumbnail: string;
  featured?: boolean;
}

const videos: Video[] = [
  {
    id: 'e2Z9UXevvIg',
    title: 'Prix de Lausanne 2024 — Prize Winner Performance',
    titleZh: '2024 洛桑國際芭蕾舞比賽 — 當代舞蹈特別獎演出',
    description: 'Contemporary variation that earned Crystal the Female Contemporary Dance Award at one of the world\'s most prestigious ballet competitions.',
    descriptionZh: '贏得洛桑女子當代舞蹈特別獎的演出片段，這是全球最具聲望的芭蕾舞比賽之一。',
    thumbnail: '/crystal-contemporary.jpg',
    featured: true,
  },
  {
    id: 'Hd2hQd1PYG4',
    title: 'The Dance Awards 2023 — Teen Best Dancer Winner',
    titleZh: '美國舞蹈大獎賽 2023 — 青少年最佳舞者',
    description: "'Grasping Intentions' — the solo that won Crystal the Teen Female Best Dancer title at The Dance Awards Las Vegas 2023.",
    descriptionZh: '「Grasping Intentions」——讓 Crystal 奪得 2023 年美國舞蹈大獎賽青少年女子最佳舞者的獨舞。',
    thumbnail: '/Grasping_intentions.jpg',
  },
  {
    id: 'LCSPksYxP6U',
    title: 'YAGP 2023 Finals — Junior Women Medalist',
    titleZh: 'YAGP 2023 總決賽 — 少年女子組獎牌得主',
    description: 'Crystal Huang, age 14, performs variation from La Esmeralda at the YAGP 2023 Finals, where she won the Medal in the Junior Women\'s Age Division.',
    descriptionZh: 'Crystal 14歲時在 YAGP 2023 總決賽演出《艾斯梅拉達》變奏，榮獲少年女子組獎牌。',
    thumbnail: '/crystal-ballet.jpg',
  },
  {
    id: 'iEl9gdOaqr8',
    title: 'YoungArts 2024 — Winner of Distinction in Ballet',
    titleZh: '2024 YoungArts — 芭蕾傑出得獎者',
    description: 'National recognition in ballet from the National YoungArts Foundation 2024.',
    descriptionZh: '獲美國國家青年藝術基金會 2024 年芭蕾傑出獎項肯定。',
    thumbnail: '/crystal-YoungArt.jpg',
  },
  {
    id: 'TyUOTqG2eoY',
    title: 'NYCDA 2023 — National Teen Female Outstanding Dancer',
    titleZh: 'NYCDA 2023 — 全國青少年女子傑出舞者',
    description: 'Crystal wins the National Teen Female Outstanding Dancer title at NYCDA NYC Finals 2023.',
    descriptionZh: 'Crystal 在 2023 年 NYCDA 紐約總決賽奪得全國青少年女子傑出舞者冠軍。',
    thumbnail: '/Crystal-NYVDA I love you.jpg',
  },
  {
    id: 'MQqWEWPIk_4',
    title: 'The Dance Awards 2021 — Junior Female Best Dancer',
    titleZh: '美國舞蹈大獎賽 2021 — 少年女子最佳舞者',
    description: 'Crystal wins the Junior Female Best Dancer title at The Dance Awards Las Vegas Nationals 2021.',
    descriptionZh: 'Crystal 在 2021 年拉斯維加斯美國舞蹈大獎賽全國賽奪得少年女子最佳舞者冠軍。',
    thumbnail: '/Crystal-teenBD-moonlight.jpg',
  },
  {
    id: 'NAx5malU5Jc',
    title: 'Radix 2021 — National Junior Female Core Performer',
    titleZh: 'Radix 2021 — 全國青少年女子核心表演者',
    description: 'Crystal wins the National Junior Female Core Performer title at Radix Dance Convention 2021.',
    descriptionZh: 'Crystal 在 2021 年 Radix 舞蹈大會奪得全國青少年女子核心表演者冠軍。',
    thumbnail: '/Crystal Radix Junior CP give it.jpg',
  },
  {
    id: '0Hw23baOUWs',
    title: 'The Dance Awards 2019 — Mini Female Best Dancer',
    titleZh: '美國舞蹈大獎賽 2019 — 迷你組最佳舞者',
    description: 'Crystal wins the Mini Female Best Dancer title at The Dance Awards Las Vegas Nationals 2019, at just 10 years old.',
    descriptionZh: 'Crystal 僅10歲便在 2019 年拉斯維加斯美國舞蹈大獎賽全國賽奪得迷你組最佳舞者冠軍。',
    thumbnail: '/Crystal TDA mini BD Flat Red.jpg',
  },
  {
    id: '0Hw23baOUWs',
    title: 'Radix 2019 — National Mini Female Core Performer',
    titleZh: 'Radix 2019 — 全國迷你組核心表演者',
    description: 'Crystal wins the National Mini Female Core Performer title at Radix Dance Convention 2019.',
    descriptionZh: 'Crystal 在 2019 年 Radix 舞蹈大會奪得全國迷你組核心表演者冠軍。',
    thumbnail: '/crystal-contemporary.jpg',
  },
  {
    id: '0Hw23baOUWs',
    title: 'KAR 2019 — Junior Solo National Champion & Miss Junior Dance America',
    titleZh: 'KAR 2019 — 青少年獨舞全國冠軍暨青少年舞蹈美國小姐',
    description: 'Crystal wins 1st Overall and Miss Junior Dance America at KAR Anaheim Finals 2019.',
    descriptionZh: 'Crystal 在 2019 年 KAR 阿納海姆總決賽奪得第一名暨青少年舞蹈美國小姐頭銜。',
    thumbnail: '/crystal-ballet.jpg',
  },
  {
    id: '0Hw23baOUWs',
    title: 'Showstopper 2019 — Junior Competitive National Champion',
    titleZh: 'Showstopper 2019 — 青少年競技全國冠軍',
    description: 'Crystal wins the Junior Competitive National Champion title at Showstopper Anaheim Finals 2019.',
    descriptionZh: 'Crystal 在 2019 年 Showstopper 阿納海姆總決賽奪得青少年競技全國冠軍。',
    thumbnail: '/crystal-lyrical.jpg',
  },
  {
    id: '0Hw23baOUWs',
    title: 'StarPower 2019 — Junior Grand Champion & Title Winner',
    titleZh: 'StarPower 2019 — 青少年大冠軍暨冠軍頭銜',
    description: 'Crystal wins Junior Competitive Grand Champion and Title Winner at StarPower Anaheim Finals 2019.',
    descriptionZh: 'Crystal 在 2019 年 StarPower 阿納海姆總決賽奪得青少年競技大冠軍暨冠軍頭銜。',
    thumbnail: '/crystal-jazz.jpg',
  },
  {
    id: '0Hw23baOUWs',
    title: 'KAR 2018 — Junior Solo 1st Overall & Miss Junior KAR',
    titleZh: 'KAR 2018 — 青少年獨舞總冠軍暨 Miss Junior KAR',
    description: 'Crystal wins Junior Solo 1st Overall and Miss Junior KAR at KAR Nationals Anaheim 2018.',
    descriptionZh: 'Crystal 在 2018 年 KAR 阿納海姆全國賽奪得青少年獨舞總冠軍暨 Miss Junior KAR。',
    thumbnail: '/crystal-hero.jpg',
  },
  {
    id: '0Hw23baOUWs',
    title: 'Showbiz 2018 — Junior Solo Grand Champion & Miss Showbiz',
    titleZh: 'Showbiz 2018 — 青少年獨舞大冠軍暨 Miss Showbiz',
    description: 'Crystal wins Junior Solo Grand Champion and Miss Showbiz at Showbiz Nationals Anaheim 2018.',
    descriptionZh: 'Crystal 在 2018 年 Showbiz 阿納海姆全國賽奪得青少年獨舞大冠軍暨 Miss Showbiz。',
    thumbnail: '/crystal-contemporary.jpg',
  },
  {
    id: '0Hw23baOUWs',
    title: 'Showstopper 2018 — Junior Solo 1st Overall',
    titleZh: 'Showstopper 2018 — 青少年獨舞總冠軍',
    description: 'Crystal wins Junior Solo 1st Overall at Showstopper Nationals Anaheim 2018.',
    descriptionZh: 'Crystal 在 2018 年 Showstopper 阿納海姆全國賽奪得青少年獨舞總冠軍。',
    thumbnail: '/crystal-ballet.jpg',
  },
];

export default function Videos() {
  const { t } = useLanguage();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <section id="videos" className="section-padding relative">
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="container-max relative z-10">
        <div className="text-center mb-16">
          <p className="text-blue-300 tracking-[0.2em] uppercase text-sm mb-4 font-medium">
            {t('Watch', '觀看影片')}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            {t('Performance', '演出')} <span className="gradient-text">{t('Videos', '影片')}</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            {t(
              'Watch Crystal perform on international stages — from Prix de Lausanne to YAGP Finals.',
              '觀看 Crystal 在國際舞台上的精彩演出——從洛桑比賽到 YAGP 總決賽。'
            )}
          </p>
        </div>

        {/* Featured video — large */}
        {videos[0] && (
          <div className="mb-8">
            <div
              className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-video max-w-4xl mx-auto glow-border"
              onClick={() => setActiveVideo(videos[0].id)}
            >
              <img
                src={videos[0].thumbnail}
                alt={videos[0].title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
                  <Play size={32} className="text-white ml-1 fill-white" />
                </div>
              </div>

              {/* Featured badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold">
                  {t('Featured', '精選')}
                </span>
              </div>

              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white text-xl font-semibold mb-2">
                  {t(videos[0].title, videos[0].titleZh)}
                </h3>
                <p className="text-gray-300 text-sm line-clamp-2">
                  {t(videos[0].description, videos[0].descriptionZh)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Other videos — grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {videos.slice(1).map((video) => (
            <div
              key={video.id}
              className="group relative rounded-xl overflow-hidden cursor-pointer bg-white/[0.03] border border-white/5 hover:border-blue-500/30 transition-all duration-300"
              onClick={() => setActiveVideo(video.id)}
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                    <Play size={20} className="text-white ml-0.5 fill-white" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold mb-1 text-sm line-clamp-1">
                  {t(video.title, video.titleZh)}
                </h3>
                <p className="text-gray-400 text-xs line-clamp-2">
                  {t(video.description, video.descriptionZh)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* YouTube channel link */}
        <div className="text-center mt-10">
          <a
            href="https://www.youtube.com/@crystalhuangdance"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition-all duration-300"
          >
            <Play size={16} className="fill-white" />
            {t('View All Videos on YouTube', '在 YouTube 觀看所有影片')}
          </a>
        </div>
      </div>

      {/* Video lightbox / embed modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setActiveVideo(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10 p-2"
            onClick={() => setActiveVideo(null)}
            aria-label="Close"
          >
            <X size={32} />
          </button>

          <div
            className="w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0`}
              title="Crystal Huang performance"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}
