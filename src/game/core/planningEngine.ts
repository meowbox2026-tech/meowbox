import { findDropMatches, type DropBoard, type DropCell } from './dropEngine'
import { clearPlanningSupport } from './planningGravity'
import type { CatAsset } from '../types'
import type { PlanningObjective } from './planningObjective'

export interface PlanningCat { id: number; type: CatAsset }
export interface Placement { catId: number; x: number; y: number }
export interface PlanningLevel {
  id: number
  width: number
  height: number
  board: DropBoard
  cats: PlanningCat[]
  solution: Placement[]
  objective?: PlanningObjective
}
export interface PlanningFrame { board: DropBoard; clearing: number[]; wave: number }
export interface PlanningResult { frames: PlanningFrame[]; remaining: number; waves: number }
export interface PlanningMatchGroup { cells: DropCell[] }

const copy = (board: DropBoard): DropBoard => board.map(row => row.map(cat => cat && { ...cat }))

/** Editing places a cat in the exact empty cell; matching never runs while editing. */
export function arrangeCats(level: PlanningLevel, placements: Placement[]): DropBoard | undefined {
  const board = copy(level.board)
  const used = new Set<number>()
  for (const [index, placement] of placements.entries()) {
    const cat = level.cats.find(item => item.id === placement.catId)
    if (!cat || used.has(cat.id)) return undefined
    if (!Number.isInteger(placement.x) || !Number.isInteger(placement.y)) return undefined
    if (placement.x < 0 || placement.x >= level.width || placement.y < 0 || placement.y >= level.height) return undefined
    if (board[placement.y][placement.x]) return undefined
    board[placement.y][placement.x] = { ...cat, placementOrder: index + 1 }
    used.add(cat.id)
  }
  return board
}

/** Each step clears one selected group, then drops cats that lost their support. */
export function resolvePlanning(board: DropBoard): PlanningResult {
  let current = copy(board)
  const frames: PlanningFrame[] = []
  let waves = 0
  while (true) {
    const groups = findPlanningMatchGroups(current)
    if (!groups.length) break
    const matches = chooseMatchGroup(groups, current).cells
    waves += 1
    frames.push({ board: copy(current), clearing: matches.map(({ x, y }) => current[y][x]!.id), wave: waves })
    current = clearPlanningSupport(current, matches)
    frames.push({ board: copy(current), clearing: [], wave: waves })
  }
  return { frames, remaining: current.flat().filter(Boolean).length, waves }
}

export function findPlanningMatchGroups(board: DropBoard): PlanningMatchGroup[] {
  const matches = findDropMatches(board)
  const remaining = new Map(matches.map(cell => [`${cell.x}:${cell.y}`, cell]))
  const groups: PlanningMatchGroup[] = []

  while (remaining.size) {
    const first = remaining.values().next().value as DropCell
    const type = board[first.y][first.x]?.type
    const pending = [first]
    const cells: DropCell[] = []
    while (pending.length) {
      const cell = pending.pop()!
      if (!remaining.delete(`${cell.x}:${cell.y}`)) continue
      cells.push(cell)
      for (const neighbor of remaining.values()) {
        if (board[neighbor.y][neighbor.x]?.type !== type) continue
        if (Math.abs(cell.x - neighbor.x) <= 1 && Math.abs(cell.y - neighbor.y) <= 1) pending.push(neighbor)
      }
    }
    groups.push({ cells: cells.sort((left, right) => left.y - right.y || left.x - right.x) })
  }

  return groups
}

function chooseMatchGroup(groups: PlanningMatchGroup[], board: DropBoard): PlanningMatchGroup {
  // A placed cat's number is the public priority. Fixed cats have no number,
  // so their only tie-break is the visible top-to-bottom, left-to-right anchor.
  return [...groups].sort((left, right) => {
    const leftKey = groupSortKey(left, board)
    const rightKey = groupSortKey(right, board)
    return leftKey.priority - rightKey.priority || leftKey.y - rightKey.y || leftKey.x - rightKey.x
  })[0]
}

function groupSortKey(group: PlanningMatchGroup, board: DropBoard): { priority: number; y: number; x: number } {
  const priority = Math.min(...group.cells.map(({ x, y }) => {
    const order = board[y][x]?.placementOrder
    return order ?? Number.MAX_SAFE_INTEGER
  }))
  const anchor = group.cells[0]
  return { priority, y: anchor.y, x: anchor.x }
}
