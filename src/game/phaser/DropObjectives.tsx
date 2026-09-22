import { format, useStrings } from '../../i18n'
import type { DropGoals, DropProgress } from '../core/dropTypes'

export function DropObjectives({ goals, progress, patrolDrops, patrolColumn }: { goals: DropGoals; progress: DropProgress; patrolDrops?: number; patrolColumn?: number }) {
  const strings = useStrings()
  return <div className="drop-objectives" aria-label={strings.game.objectivesLabel}>
    <span>{format(strings.game.objectiveRescue, { done: progress.rescued, target: goals.rescued })}</span>
    {goals.scratchPosts > 0 && <span>{format(strings.game.objectiveScratch, { done: progress.scratchPosts, target: goals.scratchPosts })}</span>}
    {goals.fishTreats > 0 && <span>{format(strings.game.objectiveFish, { done: progress.fishTreats, target: goals.fishTreats })}</span>}
    {patrolDrops !== undefined && <span className={patrolDrops <= 1 ? 'is-urgent' : ''}>{format(strings.game.patrolCounter, { count: patrolDrops })}</span>}
    {patrolColumn !== undefined && <span>{format(strings.game.patrolNext, { column: patrolColumn + 1 })}</span>}
  </div>
}
