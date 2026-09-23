import { arrangeCats, resolvePlanning, type Placement, type PlanningLevel } from './planningEngine'
import type { DropBoard } from './dropEngine'

export const IMMEDIATE_PLACEMENT_VALIDATION_MAX_LEVEL = 20

interface SearchContext {
  level: PlanningLevel
  memo: Map<string, boolean>
}

const copyBoard = (board: DropBoard): DropBoard => board.map(row => row.map(cat => cat && { ...cat }))

const prefixKey = (placements: Placement[]): string => placements.map(({ catId, x, y }) => `${catId}@${x},${y}`).join('|')

const isAuthoredPrefix = (level: PlanningLevel, placements: Placement[]): boolean => placements.every((placement, index) => {
  const authored = level.solution[index]
  return authored?.catId === placement.catId && authored.x === placement.x && authored.y === placement.y
})

function placeNext(board: DropBoard, level: PlanningLevel, placements: Placement[], x: number, y: number): DropBoard | undefined {
  if (board[y]?.[x]) return undefined
  const cat = level.cats[placements.length]
  if (!cat) return undefined
  const next = copyBoard(board)
  next[y][x] = { ...cat, placementOrder: placements.length + 1 }
  return next
}

function canComplete(board: DropBoard, placements: Placement[], context: SearchContext): boolean {
  const key = prefixKey(placements)
  const cached = context.memo.get(key)
  if (cached !== undefined) return cached
  if (placements.length === context.level.cats.length) {
    const solved = resolvePlanning(board).remaining === 0
    context.memo.set(key, solved)
    return solved
  }

  // The authored route is a fast path, but not the only accepted route.
  if (isAuthoredPrefix(context.level, placements)) {
    const authoredBoard = arrangeCats(context.level, context.level.solution)
    if (authoredBoard && resolvePlanning(authoredBoard).remaining === 0) {
      context.memo.set(key, true)
      return true
    }
  }

  const nextCat = context.level.cats[placements.length]
  for (let y = 0; y < context.level.height; y += 1) for (let x = 0; x < context.level.width; x += 1) {
    if (board[y][x]) continue
    const nextBoard = placeNext(board, context.level, placements, x, y)
    if (!nextBoard) continue
    const nextPlacements = [...placements, { catId: nextCat.id, x, y }]
    if (canComplete(nextBoard, nextPlacements, context)) {
      context.memo.set(key, true)
      return true
    }
  }

  context.memo.set(key, false)
  return false
}

/**
 * Returns true only when at least one complete placement sequence clears the
 * board under the same ordered resolver used by the game.
 */
export function canCompletePlanning(level: PlanningLevel, placements: Placement[]): boolean {
  const board = arrangeCats(level, placements)
  if (!board) return false
  return canComplete(board, placements, { level, memo: new Map() })
}

export function shouldValidatePlacementImmediately(level: PlanningLevel): boolean {
  return level.id <= IMMEDIATE_PLACEMENT_VALIDATION_MAX_LEVEL
}

/** Finds a safe cell for the currently selected cat without assuming one unique answer. */
export function findSafePlacement(level: PlanningLevel, placements: Placement[]): Placement | undefined {
  const cat = level.cats[placements.length]
  if (!cat) return undefined
  const board = arrangeCats(level, placements)
  if (!board) return undefined
  for (let y = 0; y < level.height; y += 1) for (let x = 0; x < level.width; x += 1) {
    if (board[y][x]) continue
    const candidate = [...placements, { catId: cat.id, x, y }]
    if (canCompletePlanning(level, candidate)) return candidate.at(-1)
  }
  return undefined
}
