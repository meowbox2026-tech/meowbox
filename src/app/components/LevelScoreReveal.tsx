import { useEffect, useState } from 'react'
import { formatLevelTime } from '../../game/core/levelTiming'
import { GameImage } from './GameImage'

interface LevelScoreRevealProps {
  elapsedMs: number
  stars: 1 | 2 | 3
  timeLabel: string
  starsLabel: string
}

const TIME_REVEAL_MS = 720
const STAR_REVEAL_DELAY_MS = 180

export function LevelScoreReveal({ elapsedMs, stars, timeLabel, starsLabel }: LevelScoreRevealProps) {
  const [revealedMs, setRevealedMs] = useState(0)

  useEffect(() => {
    setRevealedMs(0)
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const progress = Math.min(1, (Date.now() - startedAt) / TIME_REVEAL_MS)
      setRevealedMs(Math.round(elapsedMs * progress))
      if (progress >= 1) window.clearInterval(timer)
    }, 40)

    return () => window.clearInterval(timer)
  }, [elapsedMs])

  return <div className="planning-score-reveal" data-testid="score-reveal">
    <div className="planning-score-reveal__time" aria-live="polite">
      <span>{timeLabel}</span>
      <strong data-testid="result-time">{formatLevelTime(revealedMs)}</strong>
    </div>
    <div className="planning-score-reveal__stars" aria-label={starsLabel}>
      {[1, 2, 3].map((star) => <GameImage
        key={star}
        asset="stars"
        alt=""
        aria-hidden="true"
        className={star <= stars ? 'is-earned' : ''}
        style={{ animationDelay: `${star * STAR_REVEAL_DELAY_MS}ms` }}
      />)}
    </div>
  </div>
}
