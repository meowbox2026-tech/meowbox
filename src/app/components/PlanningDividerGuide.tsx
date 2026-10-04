import type { DropBoard } from '../../game/core/dropEngine'
import type { PlanningDivider } from '../../game/core/planningDivider'
import type { Locale } from '../../i18n/locale'

const copy = {
  'zh-TW': { title: '剪開隔板', closed: '隔板擋住連線', opened: '✂ 隔板已拆除！',
    hint: '橘子：6 排 2 欄 → 奶霜：7 排 4 欄', rule: '先消掉 ✂ 貓咪，兩邊才能一起連線。', key: '剪刀貓', wall: '隔板' },
  en: { title: 'Cut the Divider', closed: 'Divider blocks matches', opened: '✂ Divider removed!',
    hint: 'Orange: row 6, col 2 → White: row 7, col 4', rule: 'Rescue the ✂ cat to connect both sides.', key: 'Scissors cat', wall: 'Divider' },
  ja: { title: '仕切りを切ろう', closed: '仕切りがつながりを遮る', opened: '✂ 仕切りを撤去！',
    hint: 'オレンジ：6行2列 → 白猫：7行4列', rule: '✂の猫を消すと両側がつながります。', key: 'ハサミ猫', wall: '仕切り' }
}
export function PlanningDividerGuide({ locale, closed }: { locale: Locale; closed: boolean }) {
  const text = copy[locale]
  return <section className="divider-guide" aria-label={text.title}>
    <div><strong>{text.title}</strong><b role="status">{closed ? text.closed : text.opened}</b></div>
    <p>{text.hint}</p><small>{text.rule}</small>
  </section>
}
export function PlanningDividerOverlay({ config, initialBoard, closed, opening, paused, locale }: {
  config: PlanningDivider; initialBoard: DropBoard; closed: boolean; opening: boolean; paused: boolean; locale: Locale
}) {
  return <div className="divider-overlay" data-paused={paused || undefined}>
    {(closed || opening) && <div role="img" aria-label={copy[locale].wall}
      className={`divider-wall${opening ? ' is-opening' : ''}`} style={{ left: `${config.splitAt * 12.5}%` }}>
      <span /><span /><b>✂</b>
    </div>}
    {closed && initialBoard.flatMap((row, y) => row.flatMap((cat, x) => cat && config.keyCatIds.includes(cat.id)
      ? <span key={cat.id} className="divider-key" aria-label={copy[locale].key}
        style={{ left: `${x * 12.5}%`, top: `${y * 12.5}%` }}>✂</span> : []))}
  </div>
}
