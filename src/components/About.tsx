import { trainingTimeline } from '../data/siteData';
import { Award, Music, Heart, GraduationCap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function About() {
  const { t, lang } = useLanguage();

  const highlights = [
    {
      icon: Award,
      title: t('Years of Training', '訓練年資'),
      value: '15+',
      description: t("Since age 3 at Yoko's Dance Academy", '自3歲起於Yoko舞蹈學院'),
    },
    {
      icon: Music,
      title: t('Dance Styles', '舞蹈風格'),
      value: '8',
      description: t('Ballet, Contemporary, Jazz & more', '芭蕾、當代、爵士等'),
    },
    {
      icon: Heart,
      title: t('Students Taught', '教導學生'),
      value: '100+',
      description: t('Inspiring the next generation', '啟發下一代'),
    },
  ];

  const aboutParagraphsZh = [
    `Crystal Huang，16歲，在舞蹈領域締造了令人矚目的成就。2024年，她成為備受尊崇的洛桑國際芭蕾舞比賽得獎者——全球九位獲得獎學金的舞者之一——並同時榮獲該賽事的女子當代舞蹈特別獎。同年，她在紐約 YAGP 總決賽高級組獲得銀牌，並在南非國際芭蕾舞比賽奪得大獎。2025年，她更獲頒 T.O.P. 亞裔美國傑出舞者獎。`,
    `Crystal 的訓練歷程與她的成就同樣多元。她在 Fremont 的 Yoko 舞蹈學院展開舞蹈之路，在拉斯維加斯的 The Rock Center for Dance 接受大量訓練，後來在 Bayer Ballet Academy 深研 Vaganova 教學法。2024-25學年就讀美國芭蕾舞劇院 Jacqueline Kennedy Onassis 學校（Upper 3），師承 Stella Abrera 與 Yan Chen 等名師。2025年9月起，她以培訓生身分加入舊金山芭蕾舞學校（Level 8），接受 Pascal Molat、Grace Holmes 與 Dana Genshaft 的指導。`,
    `除比賽外，Crystal 已踏上全球舞台——從西西里島到日本、比利時到南非——並以 NYCDA 全國青少年女子傑出舞者及舞蹈獎最佳舞者身分巡迴演出。她也為美國各地的舞者編排獨舞和群舞作品，將她對舞蹈的熱愛與藝術傳承下去。她相信舞蹈在於讓觀眾有所感動，並以愛、紀律與藝術精神投入每一次演出。`,
  ];

  const aboutParagraphsEn = [
    `Crystal Huang, 16, is having a remarkable journey in dance. In 2024, she became a Prize Winner at the prestigious Prix de Lausanne — one of only nine dancers worldwide awarded a scholarship — and won the Female Contemporary Dance Award at the same competition. That same year, she earned the Silver Medal in the Senior Division at YAGP Finals in New York and the Grand Prix at the South Africa International Ballet Competition. In 2025, she was honored with the T.O.P. Award as Asian American Outstanding Dancer.`,
    `Crystal's training journey is as diverse as her achievements. She began at Yoko's Dance Academy in Fremont, trained extensively at The Rock Center for Dance in Las Vegas, and later studied under the Vaganova method at Bayer Ballet Academy. She spent the 2024-25 season at American Ballet Theatre's Jacqueline Kennedy Onassis School (Upper 3) under teachers including Stella Abrera and Yan Chen. As of September 2025, she has joined San Francisco Ballet School as a Trainee (Level 8), training with Pascal Molat, Grace Holmes, and Dana Genshaft.`,
    `Beyond competition, Crystal has performed on global stages — from Sicily to Japan, Belgium to South Africa — and has toured extensively as NYCDA National Teen Outstanding Dancer and The Dance Awards Best Dancer. She has also choreographed solo and group works for dancers across the U.S., sharing her artistry and love for dance with the next generation. She believes dance is about making the audience feel something, and brings love, discipline, and artistry to every performance.`,
  ];

  const paragraphs = lang === 'zh' ? aboutParagraphsZh : aboutParagraphsEn;

  return (
    <section id="about" className="section-padding relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="container-max relative z-10">
        <div className="text-center mb-16">
          <p className="text-blue-300 tracking-[0.2em] uppercase text-sm mb-4 font-medium">
            {t('About Me', '關於我')}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            {t('The', '')}{' '}
            <span className="gradient-text">{t('Story', '故事')}</span>{' '}
            {t('Behind the Dance', '背後的舞蹈人生')}
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Image side */}
          <div className="relative lg:sticky lg:top-24">
            <div className="relative rounded-2xl overflow-hidden glow-border">
              <img
                src="/crystal-hero.jpg"
                alt="Crystal Huang dancing"
                className="w-full h-[500px] object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/60 via-transparent to-transparent" />
            </div>
            <div className="absolute -top-4 -left-4 w-full h-full rounded-2xl border border-blue-500/20 -z-10" />
          </div>

          {/* Text side */}
          <div className="space-y-6">
            {paragraphs.map((paragraph, i) => (
              <p key={i} className="text-gray-300 leading-relaxed text-lg">
                {paragraph}
              </p>
            ))}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="text-center p-4 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  <item.icon className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                  <div className="text-2xl font-bold gradient-text">{item.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{item.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Training Timeline */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              {t('Training', '訓練')} <span className="gradient-text">{t('Journey', '歷程')}</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              {t(
                "From Yoko's Dance to San Francisco Ballet School — a path of dedication.",
                '從 Yoko 舞蹈學院到舊金山芭蕾舞學校——一條充滿熱忱的道路。'
              )}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trainingTimeline.map((training, i) => (
              <div
                key={i}
                className={`p-5 rounded-xl border transition-all duration-300 ${
                  training.highlight
                    ? 'bg-blue-500/[0.05] border-blue-500/20 hover:bg-blue-500/[0.08]'
                    : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <GraduationCap
                    size={18}
                    className={`mt-0.5 shrink-0 ${training.highlight ? 'text-blue-400' : 'text-gray-500'}`}
                  />
                  <div>
                    <p className="text-xs text-blue-300/70 font-medium">{training.period}</p>
                    <h3 className="text-white font-semibold text-sm mt-0.5">{training.school}</h3>
                  </div>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed pl-9">{training.teachers}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
