import type { CSSProperties } from 'react'
import { PlanningTransferAnimation } from './PlanningTransferAnimation'
import { TRANSFER_STAGGER_MS } from '../../game/phaser/planningTransferTiming'
import { getCatAssetPath } from '../../game/data/catAssets'
import { canPlaceInDualBox, getDualBoxPortals, isDualBoxPortal } from '../../game/core/planningDualBox'
import type { PlanningDualBox, PlanningTransfer } from '../../game/core/planningDualBox'
import type { DropBoard } from '../../game/core/dropEngine'
import type { Placement } from '../../game/core/planningEngine'
import type { CatAsset } from '../../game/types'
import type { Locale } from '../../i18n/locale'

const copy = {
  'zh-TW': { title: '雙箱傳送', left: '左箱', right: '右箱', entry: '入口 A', exit: '出口 A',
    hint: '先消左箱支撐 → 貓咪落入通道 → 在右箱接出連鎖',
    note: '通道不能直接放貓；出口堵住時，入口會等待。', demo: '看傳送示範', moving: '貓咪正在穿過通道 A' },
  en: { title: 'Twin Box Tunnel', left: 'Left box', right: 'Right box', entry: 'Inlet A', exit: 'Outlet A',
    hint: 'Clear left supports → cats enter the tunnel → chain in the right box',
    note: 'Portals cannot be filled directly. A blocked outlet holds incoming cats.', demo: 'Watch a demo', moving: 'Cats are passing through tunnel A' },
  ja: { title: '二箱トンネル', left: '左の箱', right: '右の箱', entry: '入口 A', exit: '出口 A',
    hint: '左の支えを消す → トンネルへ落下 → 右で連鎖',
    note: '通路には直接置けません。出口が塞がると入口で待ちます。', demo: 'お手本を見る', moving: '猫がトンネル A を通っています' }
}
interface Props {
  config: PlanningDualBox; board: DropBoard; placements: Placement[]; clearing: number[]
  transfers: PlanningTransfer[]; paused?: boolean; locked: boolean; selected?: number; homeBox?: 'left' | 'right'; undoUses: number
  hintCell?: Placement; locale: Locale; onPlace: (x: number, y: number) => void
  onRemove: (id: number, x: number, y: number) => void; onDemo?: () => void; showIntro?: boolean
}
export function PlanningDualBoxBoard(props: Props) {
  const { config, board, locked, locale } = props
  const text = copy[locale]
  const columns = config.splitAt
  const rows = board.length
  const cellWidth = 100 / columns
  const cellHeight = 100 / rows
  const multiple = getDualBoxPortals(config).length > 1
  const reversed = getDualBoxPortals(config)[0].exit.x < config.splitAt
  const multiHint = { 'zh-TW': 'A 送往右箱、B 返回左箱；先替下一段安排落點。', en: 'A sends right; B returns left. Plan the next landing first.', ja: 'Aは右へ、Bは左へ。次の着地を先に考えよう。' }
  return <section style={{ '--box-columns': columns, '--box-rows': rows, '--box-cell-width': `${cellWidth}%`, '--box-cell-height': `${cellHeight}%` } as CSSProperties} className={`dual-box${columns > 4 ? ' dual-box--expanded' : ''}`} data-paused={props.paused || undefined} aria-label={text.title}>
    {props.showIntro && <div className="dual-box__intro"><strong>{text.title}</strong><p>{multiple ? (reversed ? ({ 'zh-TW': 'A 送往左箱、B 返回右箱；先替下一段安排落點。', en: 'A sends left; B returns right. Plan the next landing first.', ja: 'Aは左へ、Bは右へ。次の着地を先に考えよう。' })[locale] : multiHint[locale]) : text.hint}</p></div>}
    <div className="dual-box__pair">{[0, config.splitAt].map((start, boxIndex) =>
      <div className="dual-box__case" key={start} data-placement-allowed={locked || canPlaceInDualBox(config, props.homeBox, start)}>
        <div className="dual-box__heading">{boxIndex === 0 ? text.left : text.right}<span>{columns} × {rows}</span></div>
        <div className="dual-box__grid" aria-label={boxIndex === 0 ? text.left : text.right}>
          {board.flatMap((row, y) => row.slice(start, start + columns).map((cat, localX) => {
            const x = start + localX
            const portal = isDualBoxPortal(config, x, y)
            const thirdPortal = getDualBoxPortals(config).some(p => p.id === 'C' && [p.entry, p.exit].some(c => c.x === x && c.y === y))
            const returnPortal = getDualBoxPortals(config).some(p => p.id === 'B' && [p.entry, p.exit].some(c => c.x === x && c.y === y))
            const hint = props.hintCell?.x === x && props.hintCell?.y === y
            return <button key={`${x}:${y}`} className={`dual-box__cell${portal ? ' is-portal' : ''}${returnPortal ? ' is-return' : ''}${thirdPortal ? ' is-third' : ''}${hint ? ' is-hint' : ''}`}
              aria-label={`${boxIndex === 0 ? text.left : text.right} ${y + 1}, ${localX + 1}`}
              disabled={!canPlaceInDualBox(config, props.homeBox, x) || locked || props.selected === undefined || !!cat || portal}
              onClick={() => props.onPlace(x, y)} />
          }))}
          {getDualBoxPortals(config).flatMap(portal => [portal.entry, portal.exit].filter(cell => cell.x >= start && cell.x < start + columns).map(cell =>
            <span key={`${cell.x}:${cell.y}`} className={`dual-box__portal${portal.id === 'B' ? ' is-return' : portal.id === 'C' ? ' is-third' : ''}${props.transfers.some(event => (event.portalId ?? 'A') === portal.id) ? ' is-active' : ''}`}
              style={{ left: `${(cell.x - start) * cellWidth}%`, top: `${cell.y * cellHeight}%` }}>
              <b>{cell === portal.entry ? '↓' : '⇣'}</b><small>{(cell === portal.entry ? text.entry : text.exit).replace('A', portal.id)}</small>
            </span>))}
          {board.flatMap((row, y) => row.slice(start, start + columns).flatMap((cat, localX) => {
            if (!cat) return []
            const x = start + localX
            const order = props.placements.findIndex(p => p.catId === cat.id)
            const canRemove = !locked && props.undoUses > 0 && order === props.placements.length - 1 && order >= 0
            const className = `dual-box__cat${props.clearing.includes(cat.id) ? ' is-clearing' : ''}${props.transfers.some(event => event.catId === cat.id) ? ' is-transferring' : ''}`
            const content = <><img src={getCatAssetPath(cat.type as CatAsset)} alt="" />{order >= 0 && <b>{order + 1}</b>}</>
            const transferIndex = props.transfers.findIndex(event => event.catId === cat.id)
            const style = { left: `${localX * cellWidth}%`, top: `${y * cellHeight}%`,
              '--transfer-delay': `${Math.max(0, transferIndex) * TRANSFER_STAGGER_MS}ms`,
              '--transfer-drop': `${((props.transfers[transferIndex]?.exit?.y ?? config.exit.y) - y) * 100}%`
            } as CSSProperties
            return canRemove ? <button key={cat.id} className={className} style={style} aria-label={`↩ ${order + 1}`}
              onClick={() => props.onRemove(cat.id, x, y)}>{content}</button>
              : <div key={cat.id} className={className} style={style}>{content}</div>
          }))}
          <PlanningTransferAnimation board={board} transfers={props.transfers} start={start} columns={columns} rows={rows} />
        </div>
      </div>
    )}</div>
    <p className="dual-box__note" role="status">{props.transfers.length ? text.moving.replace('A', [...new Set(props.transfers.map(event => event.portalId ?? 'A'))].join(' / ')) : props.homeBox ? ({ 'zh-TW': '待放貓只能放進標示的箱子；跨箱必須經過通道。', en: 'Place each cat in its marked box. Use tunnels to cross between boxes.', ja: '猫は指定の箱に置きます。箱の間はトンネルで移動します。' })[locale] : text.note}</p>
    {props.onDemo && <button className="dual-box__demo" disabled={locked} onClick={props.onDemo}>{text.demo}</button>}
  </section>
}
