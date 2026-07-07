import { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Video {
  id: string;
  videoSrc?: string;
  metaLabel: string;
  metaLabelZh: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  thumbnail: string;
}

const featuredVideos: Video[] = [
  {
    id: '_1p3Udn_SZY',
    metaLabel: 'XV Moscow Ballet Competition · July 2026',
    metaLabelZh: '莫斯科國際芭蕾舞大賽 · 2026年7月',
    title: 'XV Moscow Ballet Competition — Round 2 Contemporary',
    titleZh: '第十五屆莫斯科國際芭蕾舞大賽 — 第二輪當代舞',
    description:
      'Crystal Huang performs her round 2 contemporary selection at the XV Moscow Ballet Competition in July 2026.',
    descriptionZh:
      'Crystal Huang 於 2026 年 7 月在第十五屆莫斯科國際芭蕾舞大賽演出第二輪當代舞作品。',
    thumbnail: '/crystal-press-moscow-vx.png',
  },
  {
    id: 'UsRpfGIM3zw',
    metaLabel: 'XV Moscow Ballet Competition Gala · July 2026',
    metaLabelZh: '莫斯科國際芭蕾舞大賽晚會演出 · 2026年7月',
    title: '2026 XV Moscow International Ballet Competition Gala Performance',
    titleZh: '2026 第十五屆莫斯科國際芭蕾舞大賽晚會演出',
    description:
      'Crystal Huang performs in the 2026 XV Moscow International Ballet Competition gala presentation.',
    descriptionZh:
      'Crystal Huang 於 2026 年第十五屆莫斯科國際芭蕾舞大賽晚會演出中登台演出。',
    thumbnail: '/crystal-press-moscow-gala.png',
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
  },
];

const supportingVideos: Video[] = [
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
  },
];

export default function Videos() {
  const { t } = useLanguage();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const allVideos = [...featuredVideos, ...supportingVideos];
  const activeVideoData = allVideos.find((video) => video.id === activeVideo) ?? null;

  useEffect(() => {
    if (!activeVideo) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveVideo(null);
        return;
      }

      if (event.key === 'Tab') {
        const focusableElements = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), iframe, video[controls]'
        );

        if (!focusableElements?.length) {
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVideo]);

  return (
    <section id="videos" className="section-padding section-divider">
      <div className="container-max space-y-12">
        <div className="max-w-3xl space-y-4">
          <p className="eyebrow">{t('Featured Performance Reels', '精選演出影片')}</p>
          <h2 className="text-4xl sm:text-5xl">{t('Featured Performance Reels', '精選演出影片')}</h2>
          <p className="max-w-2xl text-base leading-8 text-[var(--text-muted)]">
            {t(
              'A curated set of performance documents selected for artistic review, auditions, and collaboration.',
              '為藝術審閱、試演與合作整理的精選演出紀錄。'
            )}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {featuredVideos.map((video) => (
              <button
                key={video.id}
                type="button"
                className="group relative overflow-hidden border border-[var(--line)] bg-[var(--surface)] text-left"
                onClick={() => setActiveVideo(video.id)}
              >
                <div className="absolute left-6 top-6 z-10 rounded-full border border-[var(--line)] bg-[rgba(250,247,242,0.78)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  {t('Featured Reel', '精選主片')}
                </div>
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={t(video.title, video.titleZh)}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(250,247,242,0.48)] bg-[rgba(74,55,40,0.48)] text-[var(--bg)] transition-transform duration-300 group-hover:scale-105">
                      <Play size={30} className="ml-1 fill-current" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(74,55,40,0.76)] via-transparent to-transparent" />
                </div>
                <div className="space-y-3 p-6">
                  <h3 className="text-2xl text-[var(--text)]">{t(video.title, video.titleZh)}</h3>
                  <p className="max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
                    {t(video.description, video.descriptionZh)}
                  </p>
                </div>
              </button>
            ))}
          </div>

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
                    alt={t(video.title, video.titleZh)}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-[rgba(74,55,40,0.24)]">
                    <Play size={18} className="ml-0.5 fill-[var(--bg)] text-[var(--bg)]" />
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

      {activeVideo && activeVideoData ? (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(74,55,40,0.88)] p-4"
          onClick={() => setActiveVideo(null)}
          role="dialog"
          aria-modal="true"
          aria-label={t(activeVideoData.title, activeVideoData.titleZh)}
        >
          <div
            className="w-full max-w-5xl overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-6 border-b border-[var(--line)] bg-[var(--surface)] px-5 py-4 sm:px-6">
              <div className="min-w-0 space-y-1">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
                  {t(activeVideoData.metaLabel, activeVideoData.metaLabelZh)}
                </p>
                <h3 className="text-2xl leading-tight text-[var(--text)]">
                  {t(activeVideoData.title, activeVideoData.titleZh)}
                </h3>
              </div>
              <button
                ref={closeButtonRef}
                className="shrink-0 text-sm uppercase tracking-[0.18em] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
                onClick={() => setActiveVideo(null)}
                aria-label={t('Close', '關閉')}
              >
                {t('Close', '關閉')}
              </button>
            </div>

            <div className="aspect-video w-full overflow-hidden bg-black">
              {activeVideoData.videoSrc ? (
                <video
                  src={activeVideoData.videoSrc}
                  title={t(activeVideoData.title, activeVideoData.titleZh)}
                  className="h-full w-full bg-black"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0`}
                  title={t(activeVideoData.title, activeVideoData.titleZh)}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
