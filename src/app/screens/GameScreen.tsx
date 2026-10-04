import { MAX_PLANNING_LEVEL } from '../../game/data/planningLevels'
import { PlanningGameScreen } from './PlanningGameScreen'

interface GameScreenProps {
  levelId: number
  previewMode?: boolean
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
export function GameScreen({ levelId, previewMode = false, onHome, onSettings, onLevelSelect, onNextLevel, onPlayAction, onWatchUndoAd, onWatchHintAd }: GameScreenProps) {
  const activeLevelId = Math.min(MAX_PLANNING_LEVEL, Math.max(1, levelId))
  return <PlanningGameScreen
    levelId={activeLevelId}
    previewMode={previewMode}
    onHome={onHome}
    onSettings={onSettings}
    onLevelSelect={onLevelSelect}
    onNextLevel={onNextLevel}
    onPlayAction={onPlayAction}
    onWatchUndoAd={onWatchUndoAd}
    onWatchHintAd={onWatchHintAd ?? onWatchUndoAd}
  />
}
