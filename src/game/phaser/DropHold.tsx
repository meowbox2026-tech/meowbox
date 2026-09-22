import { getCatAssetPath } from '../data/catAssets'
import { format, getDropCatName, useLocale, useStrings } from '../../i18n'
import type { CatAsset } from '../types'
import type { CatToken } from '../core/dropTypes'

export function DropHold({ token, uses, locked, disabled, onHold }: {
  token?: CatToken
  uses: number
  locked: boolean
  disabled: boolean
  onHold: () => void
}) {
  const strings = useStrings()
  const locale = useLocale()
  const label = token ? format(strings.game.holdStored, { name: getDropCatName(token.type, locale) }) : strings.game.holdEmpty
  return <section className={`drop-hold${locked ? ' is-locked' : ''}`} aria-label={strings.game.holdLabel}>
    <div className="drop-hold__slot">
      {token && <img src={getCatAssetPath(token.type as CatAsset)} alt={label} draggable={false} />}
      {!token && <span aria-hidden="true">＋</span>}
      <small>{label}</small>
    </div>
    <button type="button" disabled={disabled || uses <= 0 || locked} onClick={onHold}>
      {strings.game.holdAction} <b>{uses}</b>
    </button>
  </section>
}
