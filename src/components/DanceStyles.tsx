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
};

export default function DanceStyles() {
  const { t } = useLanguage();

  const featuredStyles = danceStyles.filter((style) => style.image);
  const extendedStyles = danceStyles.filter((style) => !style.image);

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

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-6 sm:grid-cols-2">
            {featuredStyles.map((style) => (
              <article
                key={style.name}
                className="overflow-hidden border border-[var(--line)] bg-[var(--surface)]"
              >
                <img src={style.image} alt={style.name} className="h-64 w-full object-cover" />
                <div className="space-y-3 p-5">
                  <h3 className="text-2xl">{style.name}</h3>
                  <p className="text-sm leading-7 text-[var(--text-muted)]">
                    {t(style.description, descriptionsZh[style.name] ?? style.description)}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="border border-[var(--line)] bg-[var(--surface)] p-6">
            <p className="eyebrow mb-4">{t('Extended Vocabulary', '延伸語彙')}</p>
            <div className="space-y-5">
              {extendedStyles.map((style) => (
                <article
                  key={style.name}
                  className="border-t border-[var(--line)] pt-4 first:border-t-0 first:pt-0"
                >
                  <h3 className="text-xl">{style.name}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                    {t(style.description, descriptionsZh[style.name] ?? style.description)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
