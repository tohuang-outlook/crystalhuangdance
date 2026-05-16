import { galleryImages } from '../data/siteData';
import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const captionsZh: Record<string, string> = {
  'Stage Performance': '舞台演出',
  'In the Studio': '練舞室',
  'Contemporary Flow': '當代流動',
  'Behind the Scenes': '幕後花絮',
  'Team Rehearsal': '團體排練',
  'Pre-Show Preparation': '演出前準備',
};

export default function Gallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { t } = useLanguage();

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);
  const goNext = () => {
    if (selectedIndex !== null)
      setSelectedIndex((selectedIndex + 1) % galleryImages.length);
  };
  const goPrev = () => {
    if (selectedIndex !== null)
      setSelectedIndex((selectedIndex - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <section id="gallery" className="section-padding bg-white/[0.02]">
      <div className="container-max">
        <div className="text-center mb-16">
          <p className="text-blue-300 tracking-[0.2em] uppercase text-sm mb-4 font-medium">
            {t('Moments', '精彩瞬間')}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">{t('Gallery', '相簿')}</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            {t(
              'A glimpse into the world of dance through captured moments.',
              '透過定格的瞬間，一窺舞蹈的美麗世界。'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl cursor-pointer aspect-[4/3]"
              onClick={() => openLightbox(index)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-medium text-sm">
                    {t(image.caption, captionsZh[image.caption] ?? image.caption)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10" onClick={closeLightbox} aria-label="Close">
            <X size={32} />
          </button>
          <button className="absolute left-4 text-white/80 hover:text-white transition-colors z-10" onClick={(e) => { e.stopPropagation(); goPrev(); }} aria-label="Previous">
            <ChevronLeft size={40} />
          </button>
          <button className="absolute right-4 text-white/80 hover:text-white transition-colors z-10" onClick={(e) => { e.stopPropagation(); goNext(); }} aria-label="Next">
            <ChevronRight size={40} />
          </button>
          <img
            src={galleryImages[selectedIndex].src}
            alt={galleryImages[selectedIndex].alt}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {selectedIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}
    </section>
  );
}
