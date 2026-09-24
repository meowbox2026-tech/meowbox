import { formatLevelTime } from '../../game/core/levelTiming'

interface LevelTimerDisplayProps {
  elapsedMs: number
  label: string
  paused?: boolean
  complete?: boolean
}

export function LevelTimerDisplay({ elapsedMs, label, paused = false, complete = false }: LevelTimerDisplayProps) {
  const time = formatLevelTime(elapsedMs)
  return <div
    className={`planning-timer planning-timer--top${paused ? ' is-paused' : ''}${complete ? ' is-complete' : ''}`}
    role="timer"
    aria-label={`${label} ${time}`}
  >
    <span className="planning-timer__icon" aria-hidden="true">⏱</span>
    <strong data-testid="level-timer-value">{time}</strong>
  </div>
}
