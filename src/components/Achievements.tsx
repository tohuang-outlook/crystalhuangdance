import { achievements } from '../data/siteData';
import { Trophy, Award, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const titlesZh: Record<string, string> = {
  'T.O.P. Award — Asian American Outstanding Dancer': 'T.O.P. 獎 — 亞裔美國傑出舞者',
  'Prix de Lausanne Prize Winner': '洛桑國際芭蕾舞比賽得獎者',
  'Prix de Lausanne — Contemporary Dance Award': '洛桑比賽 — 當代舞蹈特別獎',
  'SAIBC International Finals — Senior Grand Prix Winner': '南非國際芭蕾舞比賽 — 高級組大獎',
  'YAGP NYC Finals — Senior Silver Medalist': 'YAGP 紐約總決賽 — 高級組銀牌',
  'YoungArts Winner of Distinction — Ballet': 'YoungArts 傑出得獎者 — 芭蕾',
  'NYCDA National Teen Female Outstanding Dancer Winner': 'NYCDA 全國青少年女子傑出舞者',
  'The Dance Awards — Teen Female Best Dancer Winner': '舞蹈獎 — 青少年女子最佳舞者',
  'YAGP Tampa Finals — Junior Bronze Medalist': 'YAGP 坦帕總決賽 — 青少年組銅牌',
  'The Dance Awards — Junior Female Best Dancer Winner': '舞蹈獎 — 青少年女子最佳舞者',
  'Radix National Junior Female Core Performer Winner': 'Radix 全國青少年女子核心表演者',
  'The Dance Awards — Mini Female Best Dancer Winner': '舞蹈獎 — 幼兒組女子最佳舞者',
  'Radix National Mini Female Core Performer Winner': 'Radix 全國幼兒女子核心表演者',
  'KAR Nationals — Junior Intermediate Solo National Champion': 'KAR 全國賽 — 青少年中級獨舞全國冠軍',
  'Showstopper & StarPower Nationals': 'Showstopper 與 StarPower 全國賽冠軍',
};

const descriptionsZh: Record<string, string> = {
  'T.O.P. Award — Asian American Outstanding Dancer': '榮獲年度亞裔美國傑出舞者殊榮。',
  'Prix de Lausanne Prize Winner': '全球九位獲得獎學金的舞者之一，入讀 ABT JKO 學校。',
  'Prix de Lausanne — Contemporary Dance Award': '榮獲 2024 洛桑比賽當代舞蹈特別獎。',
  'SAIBC International Finals — Senior Grand Prix Winner': '南非國際芭蕾舞比賽最高榮譽。',
  'YAGP NYC Finals — Senior Silver Medalist': '在紐約青年美洲大獎賽總決賽高級組獲得第二名。',
  'YoungArts Winner of Distinction — Ballet': '獲美國國家青年藝術基金會在芭蕾領域的全國認可。',
  'NYCDA National Teen Female Outstanding Dancer Winner': '在紐約市舞蹈聯盟總決賽獲得全國冠軍並巡迴演出。',
  'The Dance Awards — Teen Female Best Dancer Winner': '在拉斯維加斯獲得全國冠軍並在全美巡迴演出。',
  'YAGP Tampa Finals — Junior Bronze Medalist': '在青年美洲大獎賽坦帕站總決賽青少年組獲得銅牌。',
  'The Dance Awards — Junior Female Best Dancer Winner': '獲得全國青少年冠軍並在 2021-22 賽季巡迴演出。',
  'Radix National Junior Female Core Performer Winner': '在 Radix 舞蹈大會獲得全國青少年冠軍。',
  'The Dance Awards — Mini Female Best Dancer Winner': '10歲時獲得首個全國最佳舞者冠軍。',
  'Radix National Mini Female Core Performer Winner': '在 Radix 舞蹈大會獲得全國幼兒冠軍。',
  'KAR Nationals — Junior Intermediate Solo National Champion': '在 KAR 阿納海姆總決賽獲得第一名及青少年舞蹈美國小姐。',
  'Showstopper & StarPower Nationals': '在阿納海姆總決賽獲得青少年競技全國冠軍（Showstopper）及大冠軍/冠軍頭銜（StarPower）。',
};

export default function Achievements() {
  const { t } = useLanguage();

  return (
    <section id="achievements" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-500/[0.02] to-transparent" />

      <div className="container-max relative z-10">
        <div className="text-center mb-16">
          <p className="text-blue-300 tracking-[0.2em] uppercase text-sm mb-4 font-medium">
            {t('Milestones', '里程碑')}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            <span className="gold-text">{t('Achievements', '成就')}</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            {t(
              'A timeline of dedication, hard work, and moments of glory — from national conventions to international ballet stages.',
              '一條充滿奉獻、努力與榮耀的時間線——從全國大賽到國際芭蕾舞台。'
            )}
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/40 via-yellow-500/40 to-purple-500/40 md:-translate-x-px" />

          <div className="space-y-12">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`relative flex flex-col md:flex-row gap-6 md:gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div
                  className={`absolute left-4 md:left-1/2 top-0 w-5 h-5 -translate-x-1/2 rounded-full shadow-lg z-10 ${
                    achievement.highlight
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 shadow-yellow-500/40'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-blue-500/30'
                  }`}
                />

                <div className={`md:w-1/2 pl-14 md:pl-0 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold ${
                    achievement.highlight
                      ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-300'
                      : 'bg-white/[0.05] border-white/10 text-gray-400'
                  }`}>
                    {achievement.highlight ? <Award size={14} /> : <Trophy size={14} />}
                    {achievement.year}
                  </div>
                </div>

                <div className={`md:w-1/2 pl-14 md:pl-0 ${index % 2 === 0 ? 'md:pl-12' : 'md:pr-12 md:text-right'}`}>
                  <div className={`p-5 rounded-xl border transition-all duration-300 ${
                    achievement.highlight
                      ? 'bg-gradient-to-br from-yellow-500/[0.06] to-amber-500/[0.03] border-yellow-500/20 hover:bg-yellow-500/[0.09]'
                      : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                  }`}>
                    <h3 className={`text-lg font-semibold mb-2 flex items-center gap-2 ${
                      achievement.highlight ? 'text-yellow-200' : 'text-white'
                    }`}>
                      {achievement.highlight && <Sparkles size={16} className="text-yellow-400 shrink-0" />}
                      {t(achievement.title, titlesZh[achievement.title] ?? achievement.title)}
                    </h3>
                    <p className={`text-sm leading-relaxed ${achievement.highlight ? 'text-yellow-300/70' : 'text-gray-400'}`}>
                      {t(achievement.description, descriptionsZh[achievement.title] ?? achievement.description)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs mt-12">
          {t(
            'Plus numerous regional titles at KAR, Showstopper, StarPower, Showbiz, and more.',
            '另有多項 KAR、Showstopper、StarPower、Showbiz 等地區賽事冠軍頭銜。'
          )}
        </p>
      </div>
    </section>
  );
}
