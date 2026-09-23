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
  // A gravity-created group outranks any group that was already waiting.
  const cascadeGroups = new Set<string>()
  let movedCats = new Set<number>()
  let waves = 0
  while (true) {
    const groups = findPlanningMatchGroups(current)
    if (!groups.length) break
    const prioritizedCascades = groups.filter(group => {
      const key = matchGroupKey(group, current)
      return cascadeGroups.has(key) || group.cells.some(({ x, y }) => movedCats.has(current[y][x]!.id))
    })
    const selected = chooseMatchGroup(prioritizedCascades.length ? prioritizedCascades : groups, current)
    cascadeGroups.delete(matchGroupKey(selected, current))
    const matches = selected.cells
    waves += 1
    const clearedIds = matches.map(({ x, y }) => current[y][x]!.id)
    frames.push({ board: copy(current), clearing: clearedIds, wave: waves })
    const next = clearPlanningSupport(current, matches)
    movedCats = findMovedCats(current, next, new Set(clearedIds))
    for (const group of findPlanningMatchGroups(next)) {
      if (group.cells.some(({ x, y }) => movedCats.has(next[y][x]!.id))) {
        cascadeGroups.add(matchGroupKey(group, next))
      }
    }
    current = next
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

function matchGroupKey(group: PlanningMatchGroup, board: DropBoard): string {
  return group.cells.map(({ x, y }) => board[y][x]!.id).sort((left, right) => left - right).join(',')
}

function findMovedCats(before: DropBoard, after: DropBoard, clearedIds: Set<number>): Set<number> {
  const beforePositions = new Map<number, string>()
  const afterPositions = new Map<number, string>()
  for (let y = 0; y < before.length; y += 1) {
    for (let x = 0; x < before[y].length; x += 1) {
      const cat = before[y][x]
      if (cat) beforePositions.set(cat.id, `${x}:${y}`)
      const nextCat = after[y][x]
      if (nextCat) afterPositions.set(nextCat.id, `${x}:${y}`)
    }
  }
  return new Set([...beforePositions.entries()].filter(([id, position]) => {
    if (clearedIds.has(id)) return false
    return afterPositions.get(id) !== undefined && afterPositions.get(id) !== position
  }).map(([id]) => id))
}

function groupSortKey(group: PlanningMatchGroup, board: DropBoard): { priority: number; y: number; x: number } {
  const priority = Math.min(...group.cells.map(({ x, y }) => {
    const order = board[y][x]?.placementOrder
    return order ?? Number.MAX_SAFE_INTEGER
  }))
  const anchor = group.cells[0]
  return { priority, y: anchor.y, x: anchor.x }
}
