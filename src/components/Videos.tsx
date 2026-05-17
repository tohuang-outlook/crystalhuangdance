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
    titleZh: '2024 洛桑國際芭蕾舞比賽 — 得獎演出',
    description:
      "Contemporary variation that earned Crystal the Female Contemporary Dance Award at one of the world's most prestigious ballet competitions.",
    descriptionZh:
      '贏得洛桑女子當代舞蹈特別獎的演出片段，這是全球最具聲望的芭蕾舞比賽之一。',
    thumbnail: '/crystal-hero.jpg',
    featured: true,
  },
  {
    id: 'wQkqb9c6ygc',
    title: 'The Dance Awards 2023 — Teen Best Dancer Winner',
    titleZh: '舞蹈獎 2023 — 青少年最佳舞者',
    description:
      "'Grasping Intentions' — the solo that won Crystal the Teen Female Best Dancer title at The Dance Awards Las Vegas 2023.",
    descriptionZh:
      '「Grasping Intentions」——讓 Crystal 奪得 2023 年舞蹈獎青少年女子最佳舞者的獨舞。',
    thumbnail: '/crystal-contemporary.jpg',
  },
  {
    id: 'FIe3dBF5N7E',
    title: 'Contemporary Solo — Studio Session',
    titleZh: '當代舞獨舞 — 工作室練習',
    description: "Behind-the-scenes look at Crystal's contemporary training and creative process.",
    descriptionZh: 'Crystal 當代舞訓練與創作過程的幕後花絮。',
    thumbnail: '/crystal-contemporary.jpg',
  },
];

export default function Videos() {
  const { t } = useLanguage();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const featuredVideo = videos.find((video) => video.featured) ?? videos[0];
  const supportingVideos = videos.filter((video) => video.id !== featuredVideo.id);

  return (
    <section id="videos" className="section-padding section-divider">
      <div className="container-max space-y-12">
        <div className="max-w-3xl space-y-4">
          <p className="eyebrow">{t('Featured Performance Reels', '精選演出影片')}</p>
          <h2 className="text-4xl sm:text-5xl">{t('Featured Performance Reels', '精選演出影片')}</h2>
          <p className="max-w-2xl text-base leading-8 text-[var(--text-muted)]">
            {t(
              'A curated set of performance documents for artistic review, auditions, and collaboration.',
              '為藝術審閱、試演與合作整理的精選演出紀錄。'
            )}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <button
            type="button"
            className="group relative overflow-hidden border border-[var(--line)] bg-[var(--surface)] text-left"
            onClick={() => setActiveVideo(featuredVideo.id)}
          >
            <img
              src={featuredVideo.thumbnail}
              alt={featuredVideo.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(17,16,13,0.88)] via-transparent to-transparent" />
            <div className="absolute left-6 top-6 rounded-full border border-[var(--line)] bg-[rgba(17,16,13,0.72)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {t('Featured Reel', '精選主片')}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-[rgba(17,16,13,0.52)] text-white transition-transform duration-300 group-hover:scale-105">
                <Play size={30} className="ml-1 fill-white" />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6">
              <h3 className="text-2xl text-[var(--text)]">
                {t(featuredVideo.title, featuredVideo.titleZh)}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
                {t(featuredVideo.description, featuredVideo.descriptionZh)}
              </p>
            </div>
          </button>

          <div className="space-y-4">
            {supportingVideos.map((video) => (
              <button
                key={video.id}
                type="button"
                className="group flex w-full gap-4 border border-[var(--line)] bg-[var(--surface)] p-4 text-left transition-colors hover:bg-[var(--surface-soft)]"
                onClick={() => setActiveVideo(video.id)}
              >
                <div className="relative h-28 w-40 shrink-0 overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                    <Play size={18} className="ml-0.5 fill-white text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg leading-tight text-[var(--text)]">
                    {t(video.title, video.titleZh)}
                  </h3>
                  <p className="text-sm leading-6 text-[var(--text-muted)]">
                    {t(video.description, video.descriptionZh)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <a
            href="https://www.youtube.com/@crystalhuangdance"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-5 py-3 text-sm uppercase tracking-[0.16em] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
          >
            <Play size={14} className="fill-current" />
            {t('View Full YouTube Archive', '查看完整 YouTube 檔案')}
          </a>
        </div>
      </div>

      {activeVideo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
          onClick={() => setActiveVideo(null)}
        >
          <button
            className="absolute right-4 top-4 z-10 p-2 text-white/80 transition-colors hover:text-white"
            onClick={() => setActiveVideo(null)}
            aria-label="Close"
          >
            <X size={32} />
          </button>

          <div
            className="aspect-video w-full max-w-5xl overflow-hidden rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0`}
              title="Crystal Huang performance"
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}
