import { arrangeCats, resolvePlanning, type PlanningLevel } from '../../src/game/core/planningEngine'
import { findDropMatches, type DropBoard } from '../../src/game/core/dropEngine'
import { analyzePlanningLevel } from '../../src/game/core/planningDifficulty'
import { validateAuthoredPlanningLevel } from '../../src/game/core/planningValidation'
import type { CatAsset } from '../../src/game/types'

type Point = [number, number]
type Placed = 0 | 1 | 2
type Pattern = { cells: [Point, Point, Point]; placed: Placed; type: CatAsset }

const TYPES: CatAsset[] = ['orange', 'blue', 'white', 'fishLover']
const directions: Array<[number, number, number, number, number, number]> = [
  [1, 0, 0, 5, 0, 7], [0, 1, 0, 7, 0, 5], [1, 1, 0, 5, 0, 5], [1, -1, 0, 5, 2, 7]
]

function randomInt(max: number): number { return Math.floor(Math.random() * max) }

function makeRandomPattern(type: CatAsset): Pattern {
  const [dx, dy, minX, maxX, minY, maxY] = directions[randomInt(directions.length)]
  const x = minX + randomInt(maxX - minX + 1)
  const y = minY + randomInt(maxY - minY + 1)
  const cells: Point[] = [0, 1, 2].map(step => [x + dx * step, y + dy * step])
  if (dy === -1) cells.reverse()
  return { cells: cells as [Point, Point, Point], placed: randomInt(3) as Placed, type }
}

function buildLevel(id: number, patterns: Pattern[], fixedTarget: number): PlanningLevel | undefined {
  const board: DropBoard = Array.from({ length: 8 }, () => Array<null | { id: number; type: CatAsset }>(8).fill(null))
  const fixed = new Map<string, CatAsset>()
  const solutionCells = new Set<string>()
  const cats = patterns.map((pattern, index) => ({ id: id * 100 + index + 1, type: pattern.type }))
  const solution: PlanningLevel['solution'] = []
  for (const [groupIndex, pattern] of patterns.entries()) {
    const placed = pattern.cells[pattern.placed]
    const placedKey = `${placed[0]}:${placed[1]}`
    if (fixed.has(placedKey) || solutionCells.has(placedKey)) return undefined
    solutionCells.add(placedKey)
    solution.push({ catId: cats[groupIndex].id, x: placed[0], y: placed[1] })
    for (const [cellIndex, [x, y]] of pattern.cells.entries()) {
      if (cellIndex === pattern.placed) continue
      const key = `${x}:${y}`
      if (solutionCells.has(key)) return undefined
      const existing = fixed.get(key)
      if (existing && existing !== pattern.type) return undefined
      fixed.set(key, pattern.type)
    }
  }
  if (fixed.size !== fixedTarget) return undefined
  fixed.forEach((type, key) => {
    const [x, y] = key.split(':').map(Number)
    board[y][x] = { id: board.flat().filter(Boolean).length + 1, type }
  })
  if (findDropMatches(board).length) return undefined
  const level = { id, width: 8, height: 8, board, cats, solution }
  try {
    return validateAuthoredPlanningLevel(level)
  } catch {
    return undefined
  }
}

function generatePatterns(groupCount: number, fixedTarget: number): Pattern[] | undefined {
  const targetOverlap = groupCount * 2 - fixedTarget
  for (let retry = 0; retry < 30; retry += 1) {
    const patterns: Pattern[] = []
    const fixed = new Map<string, CatAsset>()
    const solutions = new Set<string>()
    let failed = false
    for (let index = 0; index < groupCount; index += 1) {
      let selected: Pattern | undefined
      for (let candidate = 0; candidate < 500; candidate += 1) {
        const pattern = makeRandomPattern(TYPES[index % TYPES.length])
        const placed = pattern.cells[pattern.placed]
        const placedKey = `${placed[0]}:${placed[1]}`
        if (fixed.has(placedKey) || solutions.has(placedKey)) continue
        const fixedCells = pattern.cells.filter((_, cellIndex) => cellIndex !== pattern.placed)
        if (fixedCells.some(([x, y]) => solutions.has(`${x}:${y}`))) continue
        const overlaps = fixedCells.filter(([x, y]) => fixed.has(`${x}:${y}`)).length
        if (fixed.size + 2 - overlaps > fixedTarget || [...fixed.values()].length + 2 - overlaps < 2 * (index + 1) - targetOverlap) continue
        if (fixedCells.some(([x, y]) => fixed.has(`${x}:${y}`) && fixed.get(`${x}:${y}`) !== pattern.type)) continue
        selected = pattern
        break
      }
      if (!selected) { failed = true; break }
      patterns.push(selected)
      const placed = selected.cells[selected.placed]
      solutions.add(`${placed[0]}:${placed[1]}`)
      selected.cells.forEach(([x, y], cellIndex) => {
        if (cellIndex !== selected!.placed) fixed.set(`${x}:${y}`, selected!.type)
      })
    }
    if (!failed && fixed.size === fixedTarget) return patterns
  }
  return undefined
}

function layoutKey(level: PlanningLevel): string {
  const occupied = new Set<string>()
  level.board.forEach((row, y) => row.forEach((cell, x) => { if (cell) occupied.add(`${x}:${y}`) }))
  level.solution.forEach(({ x, y }) => occupied.add(`${x}:${y}`))
  return [...occupied].sort().join('|')
}

function printCandidate(level: PlanningLevel, patterns: Pattern[]): void {
  const result = resolvePlanning(arrangeCats(level, level.solution)!)
  const report = analyzePlanningLevel(level)
  console.log(JSON.stringify({
    fixed: level.board.flat().filter(Boolean).length,
    waves: result.waves,
    score: report && Math.round((report.searchPressure + report.chainPressure + report.gravityPressure + report.directionPressure + report.constraintTightness) * 100) / 100,
    gravity: report.gravityDistance,
    alternatives: report.localAlternativeRate,
    patterns: patterns.map(pattern => ({ type: pattern.type, cells: pattern.cells, placed: pattern.placed }))
  }, null, 2))
  console.log(level.board.map((row, y) => row.map((cell, x) => cell ? cell.type[0].toUpperCase() : level.solution.some(point => point.x === x && point.y === y) ? '*' : '.').join('')).join('\n'))
  console.log('solution', level.solution.map(({ x, y }) => `${x}:${y}`).join(' '))
}

const requestedId = Number(process.env.MEOWBOX_SEARCH_LEVEL ?? 23)
const spec = {
  id: requestedId,
  groups: Number(process.env.MEOWBOX_SEARCH_GROUPS ?? 18),
  fixed: Number(process.env.MEOWBOX_SEARCH_FIXED ?? 36)
}
const attempts = Number(process.env.MEOWBOX_SEARCH_ATTEMPTS ?? 300000)
let built = 0
for (let attempt = 0; attempt < attempts; attempt += 1) {
  const patterns = generatePatterns(spec.groups, spec.fixed)
  if (!patterns) continue
  const level = buildLevel(spec.id, patterns, spec.fixed)
  if (!level) continue
  built += 1
  const report = analyzePlanningLevel(level)
  if (report.lineDirections.length < 3 || report.waves < 8) continue
  console.log(`attempts=${attempt + 1} built=${built}`)
  console.log(`\nCANDIDATE ${spec.id}`)
  printCandidate(level, patterns)
  break
}
