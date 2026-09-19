import { useState, type CSSProperties } from 'react'
import { getCatAssetPath } from '../data/catAssets'
import { DROP_NAMES, landingRow, type DropBoard as Board, type DropWave } from '../core/dropEngine'
import type { CatAsset } from '../types'

export function DropBoard({ board, previous, current, busy, paused, wave, tutorial, hintColumn, onDrop }: {
  board: Board; previous: Board; current: string; busy: boolean; paused: boolean
  wave?: DropWave; tutorial: boolean; hintColumn?: number; onDrop: (column: number) => void
}) {
  const [hover, setHover] = useState<number | undefined>()
  const [lastColumn, setLastColumn] = useState(2)
  const width = board[0].length
  const height = board.length
  const active = hintColumn ?? hover ?? (tutorial ? 2 : lastColumn)
  const row = active === undefined ? -1 : landingRow(board, active)
  const danger = board[1].some(Boolean)
  const oldPositions = new Map(previous.flatMap((line, y) => line.flatMap(tile => tile ? [[tile.id, y] as const] : [])))
  return <div className={`drop-box${danger ? ' is-danger' : ''}${paused ? ' is-paused' : ''}`}>
    <div className="drop-ceiling"><span>{danger ? '⚠ 小心！快到頂端了' : '別超過這條線喔'}</span></div>
    <div className="drop-grid" style={{ '--cols': width, '--rows': height, aspectRatio: `${width} / ${height}` } as CSSProperties} aria-label="貓咪紙箱">
      {board.flatMap((line, y) => line.map((_, x) => <div className={`drop-cell${x === active && !busy ? ' is-guide' : ''}`} key={`${x}:${y}`} />))}
      {!busy && row >= 0 && active !== undefined && <div className="drop-ghost" style={{ left: `${active / width * 100}%`, top: `${row / height * 100}%` }} aria-hidden="true">
        <img src={getCatAssetPath(current as CatAsset)} alt="" /><span>↓</span>
      </div>}
      {board.flatMap((line, y) => line.map((tile, x) => {
        if (!tile) return null
        const clearing = wave?.cells.some(cell => cell.x === x && cell.y === y)
        const oldY = oldPositions.get(tile.id) ?? -1
        return <div key={tile.id} className={`drop-cat${clearing ? ' is-clearing' : ''}`} style={{
          left: `${x / width * 100}%`, top: `${y / height * 100}%`,
          '--fall': `${(oldY - y) * 100}%`
        } as CSSProperties}>
          <div className="drop-cat__fall" key={`${tile.id}-${y}`}><img src={getCatAssetPath(tile.type as CatAsset)} alt={DROP_NAMES[tile.type] ?? tile.type} draggable={false} />
          {clearing && <span className="drop-sparkles" aria-hidden="true">✦ ♡ ✧</span>}</div>
        </div>
      }))}
      <div className="drop-columns">
        {Array.from({ length: width }, (_, x) => <button key={x} type="button" aria-label={`第 ${x + 1} 欄，放下${DROP_NAMES[current] ?? '貓咪'}`}
          disabled={busy || paused} onPointerEnter={() => setHover(x)} onPointerLeave={() => setHover(undefined)}
          onFocus={() => setHover(x)} onBlur={() => setHover(undefined)} onClick={() => { setLastColumn(x); onDrop(x) }}><span>{hintColumn === x ? '★' : x + 1}</span></button>)}
      </div>
      {wave && <div key={wave.combo} className="drop-combo" role="status">{wave.combo === 1 ? '喵！配對成功' : `COMBO ×${wave.combo}`}<small>+{wave.points} ♡</small></div>}
    </div>
    <div className="drop-box-label">MEOWBOX <span>♡ 一箱小幸福</span></div>
  </div>
}
