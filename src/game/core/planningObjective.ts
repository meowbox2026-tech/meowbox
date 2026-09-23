import { arrangeCats, resolvePlanning, type PlanningLevel } from './planningEngine'
import type { DropBoard, DropCell } from './dropEngine'

export type PlanningObjectiveDirection = 'horizontal' | 'vertical' | 'diagonal'

export interface PlanningObjective {
  lineCounts: Record<PlanningObjectiveDirection, number>
  groups: number
  totalClearingCells: number
  largestGroup: number
  gravityWaves: number
}

const DIRECTIONS: Array<[number, number, PlanningObjectiveDirection]> = [
  [1, 0, 'horizontal'], [0, 1, 'vertical'], [1, 1, 'diagonal'], [1, -1, 'diagonal']
]

const emptyObjective = (): PlanningObjective => ({
  lineCounts: { horizontal: 0, vertical: 0, diagonal: 0 },
  groups: 0,
  totalClearingCells: 0,
  largestGroup: 0,
  gravityWaves: 0
})

const cellKey = (cell: DropCell): string => `${cell.x}:${cell.y}`

function getCellsForIds(board: DropBoard, ids: number[]): DropCell[] {
  const wanted = new Set(ids)
  return board.flatMap((row, y) => row.flatMap((cat, x) => cat && wanted.has(cat.id) ? [{ x, y }] : []))
}

function countLines(board: DropBoard, cells: DropCell[], counts: PlanningObjective['lineCounts']): void {
  const included = new Set(cells.map(cellKey))
  for (const cell of cells) {
    const type = board[cell.y]?.[cell.x]?.type
    if (!type) continue
    for (const [dx, dy, direction] of DIRECTIONS) {
      const previous = `${cell.x - dx}:${cell.y - dy}`
      if (included.has(previous) && board[cell.y - dy]?.[cell.x - dx]?.type === type) continue
      let length = 0
      let x = cell.x
      let y = cell.y
      while (included.has(`${x}:${y}`) && board[y]?.[x]?.type === type) {
        length += 1
        x += dx
        y += dy
      }
      if (length >= 3) counts[direction] += 1
    }
  }
}

function movedAfterClear(before: DropBoard, after: DropBoard, clearing: number[]): boolean {
  const cleared = new Set(clearing)
  const positions = new Map<number, DropCell>()
  after.forEach((row, y) => row.forEach((cat, x) => { if (cat) positions.set(cat.id, { x, y }) }))
  return before.some((row, y) => row.some((cat, x) => {
    if (!cat || cleared.has(cat.id)) return false
    const next = positions.get(cat.id)
    return Boolean(next && (next.x !== x || next.y !== y))
  }))
}

/**
 * Summarizes the authored route with the same ordered resolver the player sees.
 * The summary is a hint about the level's designed pattern, not a hidden
 * second success condition; any complete route accepted by the solver wins.
 */
export function summarizePlanningObjective(level: PlanningLevel): PlanningObjective {
  const board = arrangeCats(level, level.solution)
  if (!board) return emptyObjective()
  const result = resolvePlanning(board)
  const objective = emptyObjective()
  result.frames.forEach((frame, index) => {
    if (!frame.clearing.length) return
    const cells = getCellsForIds(frame.board, frame.clearing)
    countLines(frame.board, cells, objective.lineCounts)
    objective.groups += 1
    objective.totalClearingCells += cells.length
    objective.largestGroup = Math.max(objective.largestGroup, cells.length)
    const after = result.frames[index + 1]?.board
    if (after && movedAfterClear(frame.board, after, frame.clearing)) objective.gravityWaves += 1
  })
  return objective
}

const objectiveCache = new WeakMap<PlanningLevel, PlanningObjective>()

export function getPlanningObjective(level: PlanningLevel): PlanningObjective {
  if (level.objective) return level.objective
  const cached = objectiveCache.get(level)
  if (cached) return cached
  const objective = summarizePlanningObjective(level)
  objectiveCache.set(level, objective)
  return objective
}
