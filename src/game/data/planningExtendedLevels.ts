import { findDropMatches, type DropBoard } from '../core/dropEngine'
import type { PlanningLevel, Placement } from '../core/planningEngine'
import { validateAuthoredPlanningLevel } from '../core/planningValidation'
import type { CatAsset } from '../types'

type Point = [x: number, y: number]
type PlacedCell = 0 | 1 | 2
type Pattern = { cells: [Point, Point, Point]; placed: PlacedCell; type: CatAsset }

const BOARD_SIZE = 8
const TYPES: CatAsset[] = ['orange', 'blue', 'white', 'fishLover']
const TARGET_COUNTS = [
  [36, 18], [37, 18], [38, 19], [39, 19], [40, 20]
] as const

const DIRECTIONS: Array<[dx: number, dy: number, minX: number, maxX: number, minY: number, maxY: number]> = [
  [1, 0, 0, 5, 0, 7],
  [0, 1, 0, 7, 0, 5],
  [1, 1, 0, 5, 0, 5],
  [1, -1, 0, 5, 2, 7]
]

/** A tiny deterministic generator keeps authored data readable without runtime randomness. */
class SeededRandom {
  private state: number

  constructor(seed: number) {
    this.state = seed >>> 0
  }

  next(): number {
    this.state = (this.state * 1664525 + 1013904223) >>> 0
    return this.state / 0x100000000
  }

  integer(maximum: number): number {
    return Math.floor(this.next() * maximum)
  }
}

function key([x, y]: Point): string {
  return `${x}:${y}`
}

function makePattern(type: CatAsset, random: SeededRandom, offset: number): Pattern {
  const direction = DIRECTIONS[(random.integer(DIRECTIONS.length) + offset) % DIRECTIONS.length]
  const [dx, dy, minX, maxX, minY, maxY] = direction
  const x = minX + random.integer(maxX - minX + 1)
  const y = minY + random.integer(maxY - minY + 1)
  const cells = [0, 1, 2].map(step => [x + dx * step, y + dy * step]) as [Point, Point, Point]
  if (dy < 0) cells.reverse()
  return { cells, placed: random.integer(3) as PlacedCell, type }
}

function generatePatterns(groupCount: number, fixedTarget: number, random: SeededRandom): Pattern[] | undefined {
  const requiredOverlap = groupCount * 2 - fixedTarget
  for (let restart = 0; restart < 30; restart += 1) {
    const patterns: Pattern[] = []
    const fixed = new Map<string, CatAsset>()
    const placed = new Set<string>()
    let failed = false

    for (let index = 0; index < groupCount; index += 1) {
      let selected: Pattern | undefined
      for (let attempt = 0; attempt < 500; attempt += 1) {
        const pattern = makePattern(TYPES[(index + restart) % TYPES.length], random, index + restart)
        const placedPoint = pattern.cells[pattern.placed]
        const placedKey = key(placedPoint)
        const fixedCells = pattern.cells.filter((_, cellIndex) => cellIndex !== pattern.placed)
        const fixedKeys = fixedCells.map(key)
        const overlaps = fixedKeys.filter(cellKey => fixed.has(cellKey)).length
        const nextFixedCount = fixed.size + fixedCells.length - overlaps
        const remainingGroups = groupCount - index - 1

        if (placed.has(placedKey) || fixed.has(placedKey)) continue
        if (fixedKeys.some(cellKey => placed.has(cellKey))) continue
        if (fixedCells.some(([x, y], cellIndex) => fixed.get(fixedKeys[cellIndex]) && fixed.get(fixedKeys[cellIndex]) !== pattern.type)) continue
        if (nextFixedCount > fixedTarget) continue
        if (nextFixedCount + remainingGroups * 2 < fixedTarget) continue
        if (nextFixedCount < 2 * (index + 1) - requiredOverlap) continue

        selected = pattern
        break
      }

      if (!selected) {
        failed = true
        break
      }

      patterns.push(selected)
      placed.add(key(selected.cells[selected.placed]))
      selected.cells.forEach(([x, y], cellIndex) => {
        if (cellIndex !== selected!.placed) fixed.set(`${x}:${y}`, selected!.type)
      })
    }

    if (!failed && fixed.size === fixedTarget) return patterns
  }
  return undefined
}

function makeBoard(patterns: Pattern[], id: number, extraFixed: number, random: SeededRandom): PlanningLevel | undefined {
  const board: DropBoard = Array.from({ length: BOARD_SIZE }, () => Array<null | { id: number; type: CatAsset }>(BOARD_SIZE).fill(null))
  const cats = patterns.map((pattern, index) => ({ id: id * 100 + index + 1, type: pattern.type }))
  const solution: Placement[] = []
  const solutionCells = new Set<string>()
  let fixedId = 1

  patterns.forEach((pattern, groupIndex) => {
    pattern.cells.forEach(([x, y], cellIndex) => {
      const cellKey = `${x}:${y}`
      if (cellIndex === pattern.placed) {
        if (solutionCells.has(cellKey) || board[y][x]) throw new Error(`Planning level ${id} placed overlap at ${cellKey}`)
        solutionCells.add(cellKey)
        solution.push({ catId: cats[groupIndex].id, x, y })
        return
      }
      if (solutionCells.has(cellKey)) throw new Error(`Planning level ${id} fixed overlap at ${cellKey}`)
      if (board[y][x] && board[y][x]!.type !== pattern.type) throw new Error(`Planning level ${id} type overlap at ${cellKey}`)
      if (!board[y][x]) {
        board[y][x] = { id: fixedId, type: pattern.type }
        fixedId += 1
      }
    })
  })

  const emptyCells: Point[] = []
  board.forEach((row, y) => row.forEach((cell, x) => {
    if (!cell && !solutionCells.has(`${x}:${y}`)) emptyCells.push([x, y])
  }))
  for (let extra = 0; extra < extraFixed; extra += 1) {
    let added = false
    for (let attempt = 0; attempt < 200; attempt += 1) {
      if (!emptyCells.length) return undefined
      const cellIndex = random.integer(emptyCells.length)
      const [x, y] = emptyCells[cellIndex]
      const type = TYPES[random.integer(TYPES.length)]
      board[y][x] = { id: fixedId, type }
      if (findDropMatches(board).length === 0) {
        fixedId += 1
        emptyCells.splice(cellIndex, 1)
        added = true
        break
      }
      board[y][x] = null
    }
    if (!added) return undefined
  }

  const level: PlanningLevel = { id, width: BOARD_SIZE, height: BOARD_SIZE, board, cats, solution }
  try {
    return validateAuthoredPlanningLevel(level)
  } catch {
    return undefined
  }
}

function silhouette(level: PlanningLevel): string {
  return level.board.map(row => row.map(cell => cell ? '#' : '.').join('')).join('/')
}

function buildExtendedLevel(id: number, fixedTarget: number, groupCount: number, seed: number): PlanningLevel | undefined {
  const baseFixedTarget = groupCount === 20 ? 38 : Math.min(fixedTarget, groupCount * 2)
  const random = new SeededRandom(seed)
  const patterns = generatePatterns(groupCount, baseFixedTarget, random)
  return patterns ? makeBoard(patterns, id, fixedTarget - baseFixedTarget, random) : undefined
}

// These seeds are the reviewed witnesses found by the offline authoring search.
// Runtime data is deterministic: it never searches or uses device randomness.
export const EXTENDED_LEVEL_SEEDS = [
  1301071820, 1301551935, 1301351016, 1388512505, 1301234262,
  1300779935, 1307286409, 1303870376, 1301499651, 1317532682,
  1301097813, 1311096566, 1303380516, 1311565818, 1311222357,
  1304947565, 1309521803, 1304070587, 1311361042, 1302647198,
  1303642048, 1304399328, 1302416634, 1319336593, 1433779037,
  1304918125, 1302879998, 1302512780, 1309668612, 1310219998,
  1310272487, 1309746889, 1304311511, 1318380630, 1342380175,
  1303281128, 1304695685, 1303742461, 1316853381, 1304267146,
  1305689622, 1303944498, 1307410076, 1306971587, 1319749909,
  1318392816, 1309979894, 1385017394, 1307677496, 1441481895,
  1306555029, 1364004430, 1306010649, 1307908265, 1311191706,
  1341027554, 1311653039, 1359758020, 1348280445, 1321218278
] as const

const usedSilhouettes = new Set<string>()

export const PLANNING_LEVELS_EXTENDED = EXTENDED_LEVEL_SEEDS.map((seed, index) => {
  const id = 31 + index
  const [fixed, tray] = TARGET_COUNTS[index % TARGET_COUNTS.length]
  const level = buildExtendedLevel(id, fixed, tray, seed)
  if (!level) throw new Error(`Unable to load authored planning level ${id}`)
  const signature = silhouette(level)
  if (usedSilhouettes.has(signature)) throw new Error(`Planning level ${id} repeats a board silhouette`)
  usedSilhouettes.add(signature)
  return level
})

export function buildExtendedLevelFromSeed(id: number, seed: number): PlanningLevel | undefined {
  const index = id - 31
  if (index < 0 || index >= EXTENDED_LEVEL_SEEDS.length) return undefined
  const [fixed, tray] = TARGET_COUNTS[index % TARGET_COUNTS.length]
  return buildExtendedLevel(id, fixed, tray, seed)
}

export const EXTENDED_LEVEL_COUNTS = PLANNING_LEVELS_EXTENDED.map(level => ({
  id: level.id,
  fixed: level.board.flat().filter(Boolean).length,
  tray: level.cats.length
}))

export function getExtendedLevel(id: number): PlanningLevel | undefined {
  return PLANNING_LEVELS_EXTENDED.find(level => level.id === id)
}

// Keep the authored witness observable to tests and design tooling without exposing mutable boards.
export function getExtendedSolution(levelId: number): readonly Placement[] {
  return getExtendedLevel(levelId)?.solution ?? []
}
