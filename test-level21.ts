import { getPlanningLevel } from './src/game/data/planningLevels'
import { arrangeCats, resolvePlanning } from './src/game/core/planningEngine'
import { clearPlanningSupport } from './src/game/core/planningGravity'
import { findDropMatches } from './src/game/core/dropEngine'

const level = getPlanningLevel(LEVEL_NUM)
const board = arrangeCats(level, level.solution)
if (!board) { console.log('Failed to arrange'); process.exit(1) }

const result = resolvePlanning(board)
console.log(`Level LEVEL_NUM - Sequential: Waves=${result.waves}, Remaining=${result.remaining}`)

function findDropMatchGroups(board: any) {
  const matches = findDropMatches(board)
  const remaining = new Map(matches.map(cell => [`${cell.x}:${cell.y}`, cell]))
  const groups: any[] = []
  while (remaining.size) {
    const first = remaining.values().next().value
    const type = board[first.y][first.x]?.type
    const pending = [first]
    const cells: any[] = []
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

function resolvePlanningSimultaneous(board: any): any {
  let current = board.map((row: any) => row.map((cat: any) => cat && { ...cat }))
  let waves = 0
  while (true) {
    const groups = findDropMatchGroups(current)
    if (!groups.length) break
    const allMatches = groups.flatMap(g => g.cells)
    waves += 1
    current = clearPlanningSupport(current, allMatches)
  }
  return { remaining: current.flat().filter(Boolean).length, waves }
}

const simResult = resolvePlanningSimultaneous(board)
console.log(`Level LEVEL_NUM - Simultaneous: Waves=${simResult.waves}, Remaining=${simResult.remaining}`)
