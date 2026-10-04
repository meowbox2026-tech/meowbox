import type { CSSProperties } from 'react'
import type { DropBoard } from '../../game/core/dropEngine'
import type { PlanningTransfer } from '../../game/core/planningDualBox'
import { getCatAssetPath } from '../../game/data/catAssets'
import { TRANSFER_STAGGER_MS } from '../../game/phaser/planningTransferTiming'
import type { CatAsset } from '../../game/types'

interface Props { board: DropBoard; transfers: PlanningTransfer[]; start: number; columns: number; rows: number }
/** Departure ghosts complement the destination cat's emerge-and-fall animation. */
export function PlanningTransferAnimation({ board, transfers, start, columns, rows }: Props) {
  return <div className="dual-box__transfer-layer" aria-hidden="true">
    {transfers.map((event, index) => {
      if (event.from.x < start || event.from.x >= start + columns) return null
      const cat = board.flat().find(tile => tile?.id === event.catId)
      if (!cat) return null
      const style = { left: `${(event.from.x - start) * (100 / columns)}%`, top: `${event.from.y * (100 / rows)}%`,
        '--transfer-delay': `${index * TRANSFER_STAGGER_MS}ms` } as CSSProperties
      return <div key={event.catId} className="dual-box__departing-cat" style={style}>
        <img src={getCatAssetPath(cat.type as CatAsset)} alt="" />
      </div>
    })}
  </div>
}
