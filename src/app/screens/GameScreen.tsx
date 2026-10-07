import { MAX_PLANNING_LEVEL } from '../../game/data/planningLevels'
import { PlanningGameScreen } from './PlanningGameScreen'

interface GameScreenProps {
  levelId: number
  previewMode?: boolean
  active?: boolean
  onHome: () => void
  onSettings: () => void
  onLevelSelect: () => void
  onNextLevel: (levelId: number) => void
  onToast: (message: string) => void
  onPlayAction: () => void | Promise<void>
  onWatchUndoAd: () => Promise<boolean>
  onWatchHintAd?: () => Promise<boolean>
}

/** The active game is bounded to the authored 1–90 mainline. */
export function GameScreen({ levelId, previewMode = false, active = true, onHome, onSettings, onLevelSelect, onNextLevel, onPlayAction, onWatchUndoAd, onWatchHintAd }: GameScreenProps) {
  const activeLevelId = Math.min(MAX_PLANNING_LEVEL, Math.max(1, levelId))
  return <PlanningGameScreen
    levelId={activeLevelId}
    previewMode={previewMode}
    active={active}
    onHome={onHome}
    onSettings={onSettings}
    onLevelSelect={onLevelSelect}
    onNextLevel={onNextLevel}
    onPlayAction={onPlayAction}
    onWatchUndoAd={onWatchUndoAd}
    onWatchHintAd={onWatchHintAd ?? onWatchUndoAd}
  />
}
