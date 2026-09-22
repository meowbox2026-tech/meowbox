import { memo, type CSSProperties } from 'react'
import { getCatAssetPath } from '../data/catAssets'
import { landingRow, type DropBoard as Board, type DropWave } from '../core/dropEngine'
import { patrolColumn, resolveDropColumn } from '../core/dropRouting'
import type { CatTunnel, FishTreat, ScratchPost, DropPatrol } from '../core/dropTypes'
import { format, getDropCatName, useLocale, useStrings } from '../../i18n'
import type { CatAsset } from '../types'
import { DropMechanicsLayer } from './DropMechanicsLayer'

export const DropBoard = memo(function DropBoard({ board, previous, current, paused, wave, hintColumn, terminal = false, onDrop, scratchPosts = [], fishTreats = [], tunnels = [], patrol, routedColumn, routed = false, patrolMoved = false }: {
  board: Board; previous: Board; current: string; paused: boolean
  wave?: DropWave; hintColumn?: number; terminal?: boolean; onDrop: (column: number) => void
  scratchPosts?: ScratchPost[]; fishTreats?: FishTreat[]; tunnels?: CatTunnel[]; patrol?: DropPatrol
  routedColumn?: number; routed?: boolean; patrolMoved?: boolean
}) {
  const locale = useLocale()
  const strings = useStrings()
  const width = board[0].length
  const height = board.length
  const blockedColumn = patrolColumn({ patrol })
  const danger = board[1].some(Boolean)
  const oldPositions = new Map(previous.flatMap((line, y) => line.flatMap(tile => tile ? [[tile.id, y] as const] : [])))
  return <div className={`drop-box${danger ? ' is-danger' : ''}${paused ? ' is-paused' : ''}`}>
    <div className="drop-ceiling"><span>{danger ? strings.game.ceilingDanger : strings.game.ceilingSafe}</span></div>
    <div className="drop-grid" style={{ '--cols': width, '--rows': height, aspectRatio: `${width} / ${height}` } as CSSProperties} aria-label={strings.game.board}>
      {board.flatMap((line, y) => line.map((_, x) => <div className="drop-cell" key={`${x}:${y}`} />))}
      <DropMechanicsLayer width={width} height={height} scratchPosts={scratchPosts} fishTreats={fishTreats} tunnels={tunnels} patrol={patrol}
        wave={wave} routedColumn={routedColumn} routed={routed} patrolMoved={patrolMoved} />
      {board.flatMap((line, y) => line.map((tile, x) => {
        if (!tile) return null
        const clearing = wave?.cells.some(cell => cell.x === x && cell.y === y)
        const oldY = oldPositions.get(tile.id) ?? -1
        return <div key={tile.id} className={`drop-cat${clearing ? ' is-clearing' : ''}`} style={{
          left: `${x / width * 100}%`, top: `${y / height * 100}%`,
          '--fall': `${(oldY - y) * 100}%`
        } as CSSProperties}>
          <div className="drop-cat__fall" key={`${tile.id}-${y}`}><img src={getCatAssetPath(tile.type as CatAsset)} alt={getDropCatName(tile.type, locale)} draggable={false} />
          {clearing && <span className="drop-sparkles" aria-hidden="true">✦ ♡ ✧</span>}</div>
        </div>
      }))}
      <div className="drop-columns">
        {Array.from({ length: width }, (_, x) => {
          const tunnelExit = tunnels.find((tunnel) => tunnel.entryColumn === x)?.exitColumn
          const resolvedColumn = resolveDropColumn({ width, tunnels }, x)
          const routeBlocked = blockedColumn === x || (tunnelExit !== undefined && tunnelExit === blockedColumn)
          const landing = resolvedColumn === undefined ? -1 : landingRow(board, resolvedColumn, scratchPosts.filter((post) => post.hp > 0))
          return <button key={x} type="button" aria-label={format(strings.game.columnAction, { col: x + 1, name: getDropCatName(current, locale) })}
            data-route-column={resolvedColumn ?? ''} data-landing-row={landing}
            disabled={paused || terminal || routeBlocked} onClick={() => onDrop(x)}><span>{routeBlocked ? '🐾' : hintColumn === x ? '★' : x + 1}</span></button>
        })}
      </div>
      {wave && <div key={wave.combo} className="drop-combo" role="status">{wave.combo === 1 ? strings.game.comboSuccess : format(strings.game.combo, { count: wave.combo })}<small>+{wave.points} ♡</small></div>}
    </div>
    <div className="drop-box-label">MEOWBOX <span>{strings.game.boxTagline}</span></div>
  </div>
})
