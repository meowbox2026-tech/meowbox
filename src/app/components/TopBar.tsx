import type { ReactNode } from 'react'
import { ArtworkButton } from './ArtworkButton'
import { GameImage } from './GameImage'
import { ECONOMY_UI_ENABLED } from '../config'

interface TopBarProps {
  coins: number
  onBack?: () => void
  onSettings?: () => void
  level?: number
  stars?: number
  moves?: number
  onPause?: () => void
  status?: ReactNode
}

export function TopBar({ coins, onBack, onSettings, level, stars, moves, onPause, status }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="top-bar__left">
        {onBack && <ArtworkButton asset="bask" className="top-bar__round" onClick={onBack} aria-label="返回" />}
        {level && <div className="level-pill" aria-label={`關卡 ${level}`}>
          <GameImage asset="levelcard" className="level-pill__art" alt="" aria-hidden="true" />
          <span>關卡</span>
          <strong>{level}</strong>
        </div>}
      </div>
      {status && <div className="top-bar__status">{status}</div>}
      {stars !== undefined && <div className="star-meter" aria-label={`${stars} 顆星`}>{[1, 2, 3].map((star) => <GameImage asset="stars" key={star} className={star <= stars ? 'is-earned' : ''} alt="" aria-hidden="true" />)}</div>}
      {moves !== undefined && <div className="moves-pill">步數 <strong>{moves}</strong></div>}
      <div className="top-bar__right">
        {ECONOMY_UI_ENABLED && <div className="coin-pill" aria-label={`${coins.toLocaleString()} Paw Coins`}><GameImage asset="cat+" className="coin-pill__art" alt="" aria-hidden="true" /><strong>{coins.toLocaleString()}</strong></div>}
        {onSettings && <ArtworkButton asset="setting" className="top-bar__round" onClick={onSettings} aria-label="設定" />}
        {onPause && <ArtworkButton asset="stop" className="top-bar__round" onClick={onPause} aria-label="暫停" />}
      </div>
    </header>
  )
}
