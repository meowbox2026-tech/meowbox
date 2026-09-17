import type { CatSkin } from '../../game/types'

interface CatPortraitProps {
  skin: CatSkin | string
  small?: boolean
  sleeping?: boolean
}

export function CatPortrait({ skin, small = false, sleeping = false }: CatPortraitProps) {
  return (
    <div className={`cat-portrait cat-portrait--${skin} ${small ? 'cat-portrait--small' : ''}`} aria-hidden="true">
      <span className="cat-portrait__ear cat-portrait__ear--left" />
      <span className="cat-portrait__ear cat-portrait__ear--right" />
      <span className="cat-portrait__face">{sleeping ? 'ᵕ ᵕ' : 'ᵔᴥᵔ'}</span>
      {sleeping && <span className="cat-portrait__sleep">zZ</span>}
    </div>
  )
}
