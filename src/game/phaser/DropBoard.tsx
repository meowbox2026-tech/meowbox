import { type CSSProperties } from 'react'
import { getCatAssetPath } from '../data/catAssets'
import { type DropBoard as Board, type DropWave } from '../core/dropEngine'
import { format, getDropCatName, useLocale, useStrings } from '../../i18n'
import type { CatAsset } from '../types'

export function DropBoard({ board, previous, current, paused, wave, hintColumn, terminal = false, onDrop }: {
  board: Board; previous: Board; current: string; paused: boolean
  wave?: DropWave; hintColumn?: number; terminal?: boolean; onDrop: (column: number) => void
}) {
  const locale = useLocale()
  const strings = useStrings()
  const width = board[0].length
  const height = board.length
  const danger = board[1].some(Boolean)
  const oldPositions = new Map(previous.flatMap((line, y) => line.flatMap(tile => tile ? [[tile.id, y] as const] : [])))
  return <div className={`drop-box${danger ? ' is-danger' : ''}${paused ? ' is-paused' : ''}`}>
    <div className="drop-ceiling"><span>{danger ? strings.game.ceilingDanger : strings.game.ceilingSafe}</span></div>
    <div className="drop-grid" style={{ '--cols': width, '--rows': height, aspectRatio: `${width} / ${height}` } as CSSProperties} aria-label={strings.game.board}>
      {board.flatMap((line, y) => line.map((_, x) => <div className="drop-cell" key={`${x}:${y}`} />))}
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
        {Array.from({ length: width }, (_, x) => <button key={x} type="button" aria-label={format(strings.game.columnAction, { col: x + 1, name: getDropCatName(current, locale) })}
          disabled={paused || terminal} onClick={() => onDrop(x)}><span>{hintColumn === x ? '★' : x + 1}</span></button>)}
      </div>
      {wave && <div key={wave.combo} className="drop-combo" role="status">{wave.combo === 1 ? strings.game.comboSuccess : format(strings.game.combo, { count: wave.combo })}<small>+{wave.points} ♡</small></div>}
    </div>
    <div className="drop-box-label">MEOWBOX <span>{strings.game.boxTagline}</span></div>
  </div>
}
