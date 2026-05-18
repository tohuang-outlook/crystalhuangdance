import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { galleryImages } from '../data/siteData';
import { useLanguage } from '../context/LanguageContext';

const captionsZh: Record<string, string> = {
  'Stage Performance': '舞台演出',
  'In the Studio': '練舞室',
  'Contemporary Still': '當代定格',
  'Lyrical Line': '抒情線條',
  'Jazz Study': '爵士練習',
  'Classical Study': '古典習作',
};

export default function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { t } = useLanguage();
  const curatedImages = galleryImages.slice(0, 4);

  const goNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % curatedImages.length);
    }
  };

  const goPrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + curatedImages.length) % curatedImages.length);
    }
  };

  return (
    <section id="gallery" className="section-padding section-divider">
      <div className="container-max space-y-12">
        <div className="max-w-3xl space-y-4">
          <p className="eyebrow">
            {t('Master Class and Choreographer', '大師課與編舞指導')}
          </p>
          <h2 className="text-4xl sm:text-5xl">
            {t('Master Class and Choreographer', '大師課與編舞指導')}
          </h2>
          <p className="max-w-2xl text-base leading-8 text-[var(--text-muted)]">
            {t(
              'A focused visual archive of master classes, choreographic mentorship, and formative artist development.',
              '聚焦於大師課、編舞指導與藝術養成歷程的精選影像檔案。'
            )}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <button
            type="button"
            className="group relative overflow-hidden border border-[var(--line)]"
            onClick={() => setSelectedIndex(0)}
          >
            <img
              src={curatedImages[0].src}
              alt={curatedImages[0].alt}
              className="h-full min-h-[32rem] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(74,55,40,0.72)] via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-left">
              <p className="text-xs uppercase tracking-[0.22em] text-[rgba(250,247,242,0.82)]">
                {t('Primary Still', '主影像')}
              </p>
              <p className="mt-2 text-lg text-[var(--bg)]">
                {t(curatedImages[0].caption, captionsZh[curatedImages[0].caption] ?? curatedImages[0].caption)}
              </p>
            </div>
          </button>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
            {curatedImages.slice(1).map((image, index) => (
              <button
                key={image.src}
                type="button"
                className="group relative overflow-hidden border border-[var(--line)] text-left"
                onClick={() => setSelectedIndex(index + 1)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-60 w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(74,55,40,0.72)] via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-sm text-[var(--bg)]">
                    {t(image.caption, captionsZh[image.caption] ?? image.caption)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(74,55,40,0.88)]"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            className="absolute right-4 top-4 z-10 text-[rgba(250,247,242,0.82)] transition-colors hover:text-[var(--bg)]"
            onClick={() => setSelectedIndex(null)}
            aria-label="Close"
          >
            <X size={32} />
          </button>
          <button
            className="absolute left-4 z-10 text-[rgba(250,247,242,0.82)] transition-colors hover:text-[var(--bg)]"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous"
          >
            <ChevronLeft size={40} />
          </button>
          <button
            className="absolute right-4 z-10 text-[rgba(250,247,242,0.82)] transition-colors hover:text-[var(--bg)]"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Next"
          >
            <ChevronRight size={40} />
          </button>
          <img
            src={curatedImages[selectedIndex].src}
            alt={curatedImages[selectedIndex].alt}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
