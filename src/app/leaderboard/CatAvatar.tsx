import { CAT_ASSET_PATHS } from '../../game/data/catAssets'
import type { CatAsset } from '../../game/types'

export function CatAvatar({ avatar = 'orange', framed = false }: { avatar?: CatAsset; framed?: boolean }) {
  return <span className={`player-avatar${framed ? ' player-avatar--framed' : ''}`}>
    <img src={CAT_ASSET_PATHS[avatar]} alt="" />
    {framed && <span className="player-avatar__frame" aria-hidden="true" />}
  </span>
}
