import { getPlanningLevel } from './src/game/data/planningLevels'
import { arrangeCats, resolvePlanning } from './src/game/core/planningEngine'
import { clearPlanningSupport } from './src/game/core/planningGravity'
import { findDropMatches } from './src/game/core/dropEngine'

const level = getPlanningLevel(18)
console.log(`Level 18: ${level.cats.length} tray cats, fixed cats: ${level.board.flat().filter(Boolean).length}`)

// Show solution placements
console.log('\nSolution placements (in order):')
level.solution.forEach((p, i) => {
  const cat = level.cats.find(c => c.id === p.catId)
  console.log(`  Step ${i+1}: ${cat?.type} at (${p.x},${p.y}) catId=${p.catId}`)
})

// Arrange with solution
const board = arrangeCats(level, level.solution)
if (!board) {
  console.log('Failed to arrange')
  process.exit(1)
}

console.log('\nBoard after all placements (with placementOrder):')
board.forEach((row, y) => {
  row.forEach((cell, x) => {
    if (cell) console.log(`  (${x},${y}): ${cell.type} id=${cell.id} order=${cell.placementOrder}`)
  })
})

// Resolve with current engine (sequential by placement order)
const result = resolvePlanning(board)
console.log(`\n--- Current Engine (Sequential by Placement Order) ---`)
console.log(`Waves: ${result.waves}`)
console.log(`Remaining: ${result.remaining}`)
result.frames.forEach((f, i) => {
  if (f.clearing.length > 0) {
    console.log(`  Wave ${f.wave}: Cleared ${f.clearing.length} cats`)
  }
})

// Find all match groups (copied from planningEngine.ts)
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

// Simultaneous elimination
function resolvePlanningSimultaneous(board: any): any {
  let current = board.map((row: any) => row.map((cat: any) => cat && { ...cat }))
  const frames: any[] = []
  let waves = 0
  while (true) {
    const groups = findDropMatchGroups(current)
    if (!groups.length) break
    const allMatches = groups.flatMap(g => g.cells)
    waves += 1
    frames.push({ board: current.map((row: any) => row.map((cat: any) => cat && { ...cat })), clearing: allMatches.map(({ x, y }) => current[y][x]!.id), wave: waves })
    current = clearPlanningSupport(current, allMatches)
    frames.push({ board: current.map((row: any) => row.map((cat: any) => cat && { ...cat })), clearing: [], wave: waves })
  }
  return { frames, remaining: current.flat().filter(Boolean).length, waves }
}

const simResult = resolvePlanningSimultaneous(board)
console.log(`\n--- Simultaneous Elimination ---`)
console.log(`Waves: ${simResult.waves}`)
console.log(`Remaining: ${simResult.remaining}`)
simResult.frames.forEach((f: any, i: number) => {
  if (f.clearing.length > 0) {
    console.log(`  Wave ${f.wave}: Cleared ${f.clearing.length} cats`)
  }
})
