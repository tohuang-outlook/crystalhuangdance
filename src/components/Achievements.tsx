import { achievements } from '../data/siteData';
import { useLanguage } from '../context/LanguageContext';

const titlesZh: Record<string, string> = {
  'XV Moscow International Ballet Competition — Junior Group Girls Solo First Prize & Gold Medal Winner':
    '第十五屆莫斯科國際芭蕾舞大賽 — 青少年女子獨舞組第一名暨金牌',
  'T.O.P. Awards — 2025 Asian American Outstanding Dancer':
    'T.O.P. Awards — 2025 亞裔美國傑出舞者',
  'SAIBC International Finals — Senior Women Grand Prix Winner':
    'SAIBC 國際總決賽 — 高級女子組大獎',
  'YAGP NYC Finals — Senior Women Silver Medal Winner':
    'YAGP 紐約總決賽 — 高級女子組銀牌',
  'Prix de Lausanne — Prize Winner #4 & Contemporary Dance Award Winner':
    '洛桑國際芭蕾舞比賽 — 第四名得獎者暨當代舞特別獎',
  'YoungArts — Winner of Distinction in Ballet':
    'YoungArts — 芭蕾傑出得獎者',
  'NYCDA Nationals — Teen Female Outstanding Dancer Winner':
    'NYCDA 全國賽 — 青少年女子傑出舞者',
  'The Dance Awards Las Vegas Nationals — Teen Female Best Dancer Winner':
    'The Dance Awards 拉斯維加斯總決賽 — 青少年女子最佳舞者',
  'YAGP Tampa Finals — Junior Bronze Medal Winner':
    'YAGP 坦帕總決賽 — 青少年組銅牌',
  'The Dance Awards Las Vegas Nationals — Junior Female Best Dancer Winner':
    'The Dance Awards 拉斯維加斯總決賽 — 青少年女子最佳舞者',
  'Radix Nationals — Junior Female Core Performer Winner':
    'Radix 全國賽 — 青少年女子核心表演者',
  'The Dance Awards Las Vegas Nationals — Mini Female Best Dancer Winner':
    'The Dance Awards 拉斯維加斯總決賽 — 幼年女子最佳舞者',
  'Radix Nationals — Mini Female Core Performer Winner':
    'Radix 全國賽 — 幼年女子核心表演者',
  'KAR Anaheim Finals — Junior Intermediate Solo National Champion & Miss Junior Dance America':
    'KAR 阿納海姆總決賽 — 青少年中級獨舞全國冠軍暨 Miss Junior Dance America',
  'Showstopper Anaheim Finals — Junior Competitive National Champion':
    'Showstopper 阿納海姆總決賽 — 青少年競技組全國冠軍',
  'StarPower Anaheim Finals — Junior Competitive Grand Champion & Title Winner':
    'StarPower 阿納海姆總決賽 — 青少年競技組總冠軍暨頭銜得主',
  'KAR Nationals Anaheim — Junior Solo 1st Overall & Miss Junior KAR':
    'KAR 全國賽阿納海姆站 — 青少年獨舞總冠軍暨 Miss Junior KAR',
  'Showbiz Nationals Anaheim — Junior Solo Grand Champion & Miss Showbiz':
    'Showbiz 全國賽阿納海姆站 — 青少年獨舞總冠軍暨 Miss Showbiz',
  'Showstopper Nationals Anaheim — Junior Solo 1st Overall':
    'Showstopper 全國賽阿納海姆站 — 青少年獨舞總冠軍',
  'StarPower Talent Nationals Las Vegas — Mini Solo Grand Champion & Miss Petite StarPower':
    'StarPower Talent 拉斯維加斯全國賽 — 幼年獨舞總冠軍暨 Miss Petite StarPower',
};

const descriptionsZh: Record<string, string> = {
  'XV Moscow International Ballet Competition — Junior Group Girls Solo First Prize & Gold Medal Winner':
    '於第十五屆莫斯科國際芭蕾舞大賽獲得青少年女子獨舞組第一名與金牌。',
  'T.O.P. Awards — 2025 Asian American Outstanding Dancer':
    '獲頒 2025 年亞裔美國傑出舞者榮譽。',
  'SAIBC International Finals — Senior Women Grand Prix Winner':
    '南非國際芭蕾舞比賽高級女子組最高榮譽。',
  'YAGP NYC Finals — Senior Women Silver Medal Winner':
    '於 YAGP 紐約總決賽高級女子組獲銀牌。',
  'Prix de Lausanne — Prize Winner #4 & Contemporary Dance Award Winner':
    '於 2024 洛桑國際芭蕾舞比賽獲 Prize Winner #4，並同時獲得當代舞特別獎。',
  'YoungArts — Winner of Distinction in Ballet':
    '獲美國國家青年藝術基金會授予芭蕾 Winner of Distinction。',
  'NYCDA Nationals — Teen Female Outstanding Dancer Winner':
    '贏得 NYCDA 全國賽青少年女子傑出舞者頭銜並展開巡演。',
  'The Dance Awards Las Vegas Nationals — Teen Female Best Dancer Winner':
    '於拉斯維加斯總決賽奪得青少年女子最佳舞者並展開全美巡演。',
  'YAGP Tampa Finals — Junior Bronze Medal Winner':
    '於 YAGP 坦帕總決賽青少年組獲銅牌。',
  'The Dance Awards Las Vegas Nationals — Junior Female Best Dancer Winner':
    '於拉斯維加斯總決賽奪得青少年女子最佳舞者並於 2021 至 2022 年巡演。',
  'Radix Nationals — Junior Female Core Performer Winner':
    '獲得 Radix 全國賽青少年女子核心表演者頭銜。',
  'The Dance Awards Las Vegas Nationals — Mini Female Best Dancer Winner':
    '10 歲時即奪下拉斯維加斯總決賽幼年女子最佳舞者。',
  'Radix Nationals — Mini Female Core Performer Winner':
    '獲得 Radix 全國賽幼年女子核心表演者頭銜。',
  'KAR Anaheim Finals — Junior Intermediate Solo National Champion & Miss Junior Dance America':
    '於 KAR 阿納海姆總決賽獲青少年中級獨舞全國冠軍及 Miss Junior Dance America。',
  'Showstopper Anaheim Finals — Junior Competitive National Champion':
    '於 Showstopper 阿納海姆總決賽獲青少年競技組全國冠軍。',
  'StarPower Anaheim Finals — Junior Competitive Grand Champion & Title Winner':
    '於 StarPower 阿納海姆總決賽獲青少年競技組總冠軍及頭銜得主。',
  'KAR Nationals Anaheim — Junior Solo 1st Overall & Miss Junior KAR':
    '於 KAR 全國賽阿納海姆站獲青少年獨舞總冠軍及 Miss Junior KAR。',
  'Showbiz Nationals Anaheim — Junior Solo Grand Champion & Miss Showbiz':
    '於 Showbiz 全國賽阿納海姆站獲青少年獨舞總冠軍及 Miss Showbiz。',
  'Showstopper Nationals Anaheim — Junior Solo 1st Overall':
    '於 Showstopper 全國賽阿納海姆站獲青少年獨舞總冠軍。',
  'StarPower Talent Nationals Las Vegas — Mini Solo Grand Champion & Miss Petite StarPower':
    '於 StarPower Talent 拉斯維加斯全國賽獲幼年獨舞總冠軍及 Miss Petite StarPower。',
};

export default function Achievements() {
  const { t } = useLanguage();

  return (
    <section id="distinctions" className="section-padding section-divider">
      <div className="container-max space-y-10">
        <div className="space-y-4">
          <p className="eyebrow">{t('Archive Timeline', '完整檔案時間線')}</p>
          <h2 className="text-4xl sm:text-5xl">{t('Archive Timeline', '完整檔案時間線')}</h2>
          <p className="max-w-2xl text-base leading-8 text-[var(--text-muted)]">
            {t(
              'A chronological archive of major distinctions, awards, and formative milestones.',
              '依時間整理的重要榮譽、獎項與關鍵養成里程碑。'
            )}
          </p>
        </div>

        <div className="space-y-6">
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
