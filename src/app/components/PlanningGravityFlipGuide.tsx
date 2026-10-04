import type { DropBoard } from '../../game/core/dropEngine'
import type { PlanningGravityDirection, PlanningGravityFlip } from '../../game/core/planningGravityFlip'
import type { Locale } from '../../i18n/locale'

const copy = {
  'zh-TW': { title: '翻轉重力', down: '↓ 現在往下掉', up: '↑ 現在往上掉', flip: '重力翻轉！貓咪往上飛',
    hint: '橘子：6 排 3 欄 → 奶霜：5 排 3 欄',
    rule: '消掉 ↕ 開關，貓咪就會往上掉。', target: '↑ 翻轉後，貓咪會往箱頂靠攏', switch: '重力開關' },
  en: { title: 'Gravity Flip', down: '↓ Falling down', up: '↑ Falling up', flip: 'Gravity flipped! Cats float upward',
    hint: 'Orange: row 6, col 3 → White: row 5, col 3',
    rule: 'Clear ↕ to make cats fall upward.', target: '↑ After the flip, cats gather at the top', switch: 'Gravity switch' },
  ja: { title: '重力反転', down: '↓ 下へ落下', up: '↑ 上へ落下', flip: '重力反転！猫が上へ',
    hint: 'オレンジ：6行3列 → 白猫：5行3列',
    rule: '↕を消すと、猫が上へ落下します。', target: '↑ 反転すると猫は箱の上へ集まります', switch: '重力スイッチ' }
}
interface Props { locale: Locale; gravity: PlanningGravityDirection; flipped: boolean }
export function PlanningGravityFlipGuide({ locale, gravity, flipped }: Props) {
  const text = copy[locale]
  return <section className="gravity-flip-guide" aria-label={text.title}>
    <div><strong>{text.title}</strong><b role="status">{flipped ? text.flip : gravity === 'up' ? text.up : text.down}</b></div>
    <p>{text.hint}</p><small>{text.rule}</small>
  </section>
}
export function PlanningGravitySwitches({ config, initialBoard, board, locale }: {
  config: PlanningGravityFlip; initialBoard: DropBoard; board: DropBoard; locale: Locale
}) {
  return <div className="gravity-switches">
    <span className="gravity-switches__target">{copy[locale].target}</span>
    {initialBoard.flatMap((row, y) => row.flatMap((cat, x) => cat && config.switchCatIds.includes(cat.id)
      ? <span key={cat.id} className={`gravity-switch${board.flat().some(item => item?.id === cat.id) ? '' : ' is-used'}`}
        style={{ left: `${x * 12.5}%`, top: `${y * 12.5}%` }} aria-label={copy[locale].switch}>↕</span> : []))}
  </div>
}
