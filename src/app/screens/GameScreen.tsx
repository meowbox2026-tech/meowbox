import { MAX_PLANNING_LEVEL } from '../../game/data/planningLevels'
import { PlanningGameScreen } from './PlanningGameScreen'

interface GameScreenProps {
  levelId: number
  onHome: () => void
  onSettings: () => void
  onLevelSelect: () => void
  onNextLevel: (levelId: number) => void
  onToast: (message: string) => void
}

/** The active game is deliberately bounded to the authored 1–25 mainline. */
export function GameScreen({ levelId, onHome, onSettings, onLevelSelect, onNextLevel }: GameScreenProps) {
  const activeLevelId = Math.min(MAX_PLANNING_LEVEL, Math.max(1, levelId))
  return <PlanningGameScreen
    levelId={activeLevelId}
    onHome={onHome}
    onSettings={onSettings}
    onLevelSelect={onLevelSelect}
    onNextLevel={onNextLevel}
  />
}
