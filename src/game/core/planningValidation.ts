import { findDropMatches } from './dropEngine'
import { arrangeCats, resolvePlanning, type PlanningLevel } from './planningEngine'

/** Fails at data-load time so a condition card can never describe a bad level. */
export function validateAuthoredPlanningLevel(level: PlanningLevel): PlanningLevel {
  const openingMatches = findDropMatches(level.board)
  if (openingMatches.length) throw new Error(`Planning level ${level.id} has an opening match at ${openingMatches.map(cell => `${cell.x}:${cell.y}`).join(',')}`)
  const solved = arrangeCats(level, level.solution)
  if (!solved || resolvePlanning(solved).remaining !== 0) throw new Error(`Planning level ${level.id} authored solution does not clear`)
  return level
}
