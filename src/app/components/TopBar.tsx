import type { ReactNode } from 'react'
import { format, useStrings } from '../../i18n'
import { ArtworkButton } from './ArtworkButton'
import { GameImage } from './GameImage'

interface TopBarProps {
  onBack?: () => void
  onSettings?: () => void
  level?: number
  stars?: number
  moves?: number
  onPause?: () => void
  status?: ReactNode
}

export function TopBar({ onBack, onSettings, level, stars, moves, onPause, status }: TopBarProps) {
  const strings = useStrings()
  return (
    <header className="top-bar">
      <div className="top-bar__left">
        {onBack && <ArtworkButton asset="bask" className="top-bar__round" onClick={onBack} aria-label={strings.topbar.back} />}
        {level !== undefined && <div className="level-pill" aria-label={format(strings.topbar.levelAria, { level })}>
          <GameImage asset="levelcard" className="level-pill__art" alt="" aria-hidden="true" />
          <strong>{level}</strong>
        </div>}
      </div>
      {status && <div className="top-bar__status">{status}</div>}
      {stars !== undefined && <div className="star-meter" aria-label={format(strings.topbar.starsAria, { stars })}>{[1, 2, 3].map((star) => <GameImage asset="stars" key={star} className={star <= stars ? 'is-earned' : ''} alt="" aria-hidden="true" />)}</div>}
      {moves !== undefined && <div className="moves-pill">{strings.topbar.moves} <strong>{moves}</strong></div>}
      <div className="top-bar__right">
        {onSettings && <ArtworkButton asset="setting" className="top-bar__round" onClick={onSettings} aria-label={strings.topbar.settings} />}
        {onPause && <ArtworkButton asset="stop" className="top-bar__round" onClick={onPause} aria-label={strings.topbar.pause} />}
      </div>
    </header>
  )
}
