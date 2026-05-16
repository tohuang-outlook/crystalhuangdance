import { danceStyles } from '../data/siteData';
import { useLanguage } from '../context/LanguageContext';

const descriptionsZh: Record<string, string> = {
  'Ballet': '以精準、優雅和肢體敘事為核心的古典芭蕾。依據 Vaganova 教學法受訓，並演出《海盜》、《印度》、《加姆扎蒂》和《唐吉訶德》等變奏。',
  'Contemporary': '融合現代技巧與原始情感的流暢表達性動作。深受茱莉亞學院暑期密集班和荷蘭舞蹈劇場暑期班的啟發。',
  'Jazz': '充滿活力、節奏感和動感的高能量編舞。曾師從業界傳奇人物 Brian Friedman、Brooke Pierotti 和 Dana Foglia 等名師。',
  'Lyrical': '以優美動作詮釋歌詞的故事性編舞。在 Mark Meismer、Robert Duran 和 Suzie Taylor 的指導下奠定扎實基礎。',
  'Hip Hop': '城市律動、精準隔離和強大的舞台魅力。曾師從 Tricia Miranda、Randi Kemper、Hefa Tuita 以及 Tabitha & Napoleon D\'umo。',
  'Musical Theatre': '結合舞蹈、表演和舞台技藝的劇場演出。曾在《Radio City 聖誕奇景》中飾演 Clara & Ellie，並師從 Al Blackstone 和 Eddie Strachan。',
  'Contemporary Fusion': '當代與其他動作風格的融合。曾受 Tessandra Chavez、Chaz Buzan 和 Jason Parsons 指導。',
  'Tap': '節奏感十足的踢踏舞。師從 Danny Wallace、Jason Janas、Sarah Reich 和 Anthony Morigerato。',
};

export default function DanceStyles() {
  const { t } = useLanguage();

  return (
    <section id="styles" className="section-padding bg-white/[0.02]">
      <div className="container-max">
        <div className="text-center mb-16">
          <p className="text-blue-300 tracking-[0.2em] uppercase text-sm mb-4 font-medium">
            {t('What I Do', '我的專長')}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            {t('Dance', '舞蹈')} <span className="gradient-text">{t('Styles', '風格')}</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            {t(
              "From classical foundations to contemporary expression, here are the disciplines I've mastered and teach.",
              '從古典基礎到當代表達，這些是我精通並教授的舞蹈領域。'
            )}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {danceStyles.map((style) => (
            <div
              key={style.name}
              className="group relative rounded-2xl overflow-hidden bg-white/[0.03] border border-white/5 hover:border-blue-500/30 transition-all duration-500"
            >
              {style.image ? (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={style.image}
                    alt={style.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/20 to-transparent" />
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center bg-white/[0.02]">
                  <div className="text-center">
                    <span className="text-5xl block mb-2">{style.icon}</span>
                    <p className="text-gray-500 text-xs italic">{t('Photo coming soon', '照片即將上線')}</p>
                  </div>
                </div>
              )}

              <div className="relative z-10 p-6">
                <h3 className="text-xl font-semibold mb-3 text-white group-hover:gradient-text transition-all">
                  {style.name}
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {t(style.description, descriptionsZh[style.name] ?? style.description)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
