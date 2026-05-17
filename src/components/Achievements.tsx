import { achievements, distinctionFeatures } from '../data/siteData';
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
    <section id="distinctions" className="section-padding section-divider">
      <div className="container-max space-y-16">
        <div className="space-y-4">
          <p className="eyebrow">{t('Selected Distinctions', '精選榮譽')}</p>
          <h2 className="text-4xl sm:text-5xl">{t('Selected Distinctions', '精選榮譽')}</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {distinctionFeatures.map((item) => (
            <article
              key={item.title}
              className="min-h-[18rem] border border-[var(--line)] bg-[var(--surface)] p-6"
            >
              <p className="text-sm uppercase tracking-[0.18em] text-[var(--accent)]">
                {item.year}
              </p>
              <h3 className="mt-6 text-2xl leading-tight">{t(item.title, item.titleZh)}</h3>
              <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
                {t(item.body, item.bodyZh)}
              </p>
            </article>
          ))}
        </div>

        <div className="space-y-6">
          <div className="space-y-2 border-t border-[var(--line)] pt-8">
            <p className="eyebrow">{t('Archive Timeline', '完整檔案時間線')}</p>
            <h3 className="text-3xl">{t('Archive Timeline', '完整檔案時間線')}</h3>
          </div>

          {achievements.map((achievement) => (
            <article
              key={`${achievement.year}-${achievement.title}`}
              className="grid gap-3 border-t border-[var(--line)] py-5 md:grid-cols-[7rem_1fr]"
            >
              <p className="text-sm uppercase tracking-[0.16em] text-[var(--text-muted)]">
                {achievement.year}
              </p>
              <div className="space-y-2">
                <h4 className="text-lg text-[var(--text)]">
                  {t(achievement.title, titlesZh[achievement.title] ?? achievement.title)}
                </h4>
                <p className="text-sm leading-7 text-[var(--text-muted)]">
                  {t(
                    achievement.description,
                    descriptionsZh[achievement.title] ?? achievement.description
                  )}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
