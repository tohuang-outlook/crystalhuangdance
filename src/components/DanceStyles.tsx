import { danceStyles } from '../data/siteData';
import { useLanguage } from '../context/LanguageContext';

const descriptionsZh: Record<string, string> = {
  Ballet:
    '以精準、優雅和肢體敘事為核心的古典芭蕾。依據 Vaganova 教學法受訓，並演出《海盜》、《印度》、《加姆扎蒂》和《唐吉訶德》等變奏。',
  Contemporary:
    '融合現代技巧與原始情感的流暢表達性動作。深受茱莉亞學院暑期密集班和荷蘭舞蹈劇場暑期班的啟發。',
  Jazz:
    '充滿活力、節奏感和動感的高能量編舞。曾師從業界傳奇人物 Brian Friedman、Brooke Pierotti 和 Dana Foglia 等名師。',
  Lyrical:
    '以優美動作詮釋歌詞的故事性編舞。在 Mark Meismer、Robert Duran 和 Suzie Taylor 的指導下奠定扎實基礎。',
  'Hip Hop':
    "城市律動、精準隔離和強大的舞台魅力。曾師從 Tricia Miranda、Randi Kemper、Hefa Tuita 以及 Tabitha & Napoleon D'umo。",
  'Musical Theatre':
    '結合舞蹈、表演和舞台技藝的劇場演出。曾在《Radio City 聖誕奇景》中飾演 Clara & Ellie，並師從 Al Blackstone 和 Eddie Strachan。',
  'Contemporary Fusion':
    '當代與其他動作風格的融合。曾受 Tessandra Chavez、Chaz Buzan 和 Jason Parsons 指導。',
  Tap: '節奏感十足的踢踏舞。師從 Danny Wallace、Jason Janas、Sarah Reich 和 Anthony Morigerato。',
  Ballroom:
    '雙人舞配合、音樂語感與 ballroom 技法，曾受 Ashly Costa、Erica Marr、Lacey Schwimmer、Jenna Johnson、Val Chmerkovskiy、Britt Cherry 與 Britt Stewart 指導。',
};

const framedStyles = new Set<string>();

const imagePositionClasses: Record<string, string> = {
  Jazz: 'object-[center_18%]',
  Lyrical: 'object-[center_28%]',
};

const imageScaleClasses: Record<string, string> = {
  Lyrical: 'scale-[1.02]',
};

export default function DanceStyles() {
  const { t } = useLanguage();

  return (
    <section id="styles" className="section-padding section-divider">
      <div className="container-max space-y-12">
        <div className="max-w-3xl space-y-4">
          <p className="eyebrow">{t('Artistic Range', '藝術範圍')}</p>
          <h2 className="text-4xl sm:text-5xl">{t('Artistic Range', '藝術範圍')}</h2>
          <p className="max-w-2xl text-base leading-8 text-[var(--text-muted)]">
            {t(
              'A repertoire shaped by classical rigor, contemporary fluency, and commercial performance range.',
              '以古典訓練、當代流動性與商業演出能力共同塑造的舞作範圍。'
            )}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {danceStyles.map((style) => (
            <article
              key={style.name}
              className="hover-float-card overflow-hidden border border-[var(--line)] bg-[var(--surface)]"
            >
              {framedStyles.has(style.name) ? (
                <div className="h-64 border-b border-[var(--line)] bg-[rgba(176,194,216,0.32)] p-3">
                  <img
                    src={style.image}
                    alt={style.name}
                    className="h-full w-full object-contain object-center"
                  />
                </div>
              ) : (
                <img
                  src={style.image}
                  alt={style.name}
                  className={`h-64 w-full object-cover ${imagePositionClasses[style.name] ?? 'object-center'} ${imageScaleClasses[style.name] ?? ''}`}
                />
              )}
              <div className="space-y-3 p-5">
                <h3 className="text-2xl">{style.name}</h3>
                <p className="text-sm leading-7 text-[var(--text-muted)]">
                  {t(style.description, descriptionsZh[style.name] ?? style.description)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
