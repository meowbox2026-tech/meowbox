import { arrangeCats, findPlanningMatchGroups, resolvePlanning, type PlanningLevel } from './planningEngine'

/** Authoring metrics: a dependent wave clears a line that did not exist before the preceding drop. */
export function measurePlanningCascades(level: PlanningLevel) {
  const board = arrangeCats(level, level.solution)
  if (!board) throw new Error(`Level ${level.id} solution does not fit`)
  const result = resolvePlanning(board)
  let dependentWaves = 0
  let longestChain = 0
  let chain = 0
  let delayedTrayCats = 0
  const trayIds = new Set(level.cats.map(cat => cat.id))
  const signature = (ids: number[]) => [...ids].sort((a, b) => a - b).join(',')
  const opening = findPlanningMatchGroups(board)
  for (let index = 0; index < result.frames.length; index += 2) {
    const frame = result.frames[index]
    const previous = result.frames[index - 2]
    const existed = previous && findPlanningMatchGroups(previous.board).some(group =>
      signature(group.cells.map(({ x, y }) => previous.board[y][x]!.id)) === signature(frame.clearing))
    if (previous && !existed) {
      dependentWaves += 1
      chain += 1
      delayedTrayCats += frame.clearing.filter(id => trayIds.has(id)).length
    } else {
      chain = 0
    }
    longestChain = Math.max(longestChain, chain)
  }
  return { remaining: result.remaining, waves: result.waves, openingGroups: opening.length,
    dependentWaves, longestChain, delayedTrayCats }
}
