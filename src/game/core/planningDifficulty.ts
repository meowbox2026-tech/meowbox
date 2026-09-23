import { arrangeCats, resolvePlanning, type PlanningLevel } from './planningEngine'
import type { DropBoard, DropCell } from './dropEngine'

export type PlanningDirection = 'horizontal' | 'vertical' | 'diagonal' | 'mixed'
export type PlanningLineDirection = Exclude<PlanningDirection, 'mixed'>
export type PlanningDifficultyBand = 'tutorial' | 'foundation' | 'standard' | 'advanced' | 'expert' | 'unfair'

export interface PlanningDifficultyWeights {
  searchPressure: number
  constraintTightness: number
  chainPressure: number
  gravityPressure: number
  directionPressure: number
  densityPressure: number
  palettePressure: number
}

export const DEFAULT_PLANNING_DIFFICULTY_WEIGHTS: PlanningDifficultyWeights = {
  searchPressure: 0.25,
  constraintTightness: 0.1,
  chainPressure: 0.2,
  gravityPressure: 0.2,
  directionPressure: 0.1,
  densityPressure: 0.1,
  palettePressure: 0.05
}

export interface PlanningDifficultyMetrics {
  levelId: number
  valid: boolean
  warnings: string[]
  initialCats: number
  trayCats: number
  totalCats: number
  typeCount: number
  finalOccupancy: number
  emptyCellsBeforePlacement: number
  solutionSearchSpaceLog10: number
  waves: number
  directions: PlanningDirection[]
  lineDirections: PlanningLineDirection[]
  waveDirections: PlanningDirection[]
  directionSwitches: number
  gravityMoves: number
  gravityDistance: number
  localMutationAttempts: number
  localMutationSolutions: number
  localAlternativeRate: number
  forcedPlacementRate: number
  searchPressure: number
  constraintTightness: number
  chainPressure: number
  gravityPressure: number
  directionPressure: number
  densityPressure: number
  palettePressure: number
}

export interface PlanningDifficultyTarget {
  chapter: 1 | 2 | 3 | 4 | 5
  minimum: number
  maximum: number
}

export interface ScoredPlanningDifficulty extends PlanningDifficultyMetrics {
  score: number
  band: PlanningDifficultyBand
  target: PlanningDifficultyTarget
}

const clamp = (value: number, minimum = 0, maximum = 1): number => Math.max(minimum, Math.min(maximum, value))
const SEARCH_SPACE_LOG10_CAP = 30
const CHAIN_BASE_WAVES = 2
const CHAIN_WAVE_CAP = 12
const GRAVITY_DISTANCE_PER_CAT = 2
const MINIMUM_PALETTE_SIZE = 3
const PALETTE_SIZE_CAP = 2
const MAX_DIFFICULTY_JUMP = 10
const BRITTLE_FORCED_RATE = 0.85
const BRITTLE_ALTERNATIVE_RATE = 0.01

const copyBoard = (board: DropBoard): DropBoard => board.map(row => row.map(tile => tile && { ...tile }))

const countCats = (board: DropBoard): number => board.flat().filter(Boolean).length

function getPositions(board: DropBoard): Map<number, DropCell> {
  const positions = new Map<number, DropCell>()
  board.forEach((row, y) => row.forEach((tile, x) => {
    if (tile) positions.set(tile.id, { x, y })
  }))
  return positions
}

function orderedPlacementLog10(availableCells: number, placements: number): number {
  if (placements < 0 || placements > availableCells) return Number.POSITIVE_INFINITY
  let result = 0
  for (let index = 0; index < placements; index += 1) result += Math.log10(availableCells - index)
  return result
}

function isSameCell(first: DropCell, second: DropCell): boolean {
  return first.x === second.x && first.y === second.y
}

function findEmptyCells(board: DropBoard): DropCell[] {
  const empty: DropCell[] = []
  board.forEach((row, y) => row.forEach((tile, x) => {
    if (!tile) empty.push({ x, y })
  }))
  return empty
}

function getLineDirections(cells: DropCell[]): PlanningLineDirection[] {
  const occupied = new Set(cells.map(cell => `${cell.x}:${cell.y}`))
  const directions: Array<[number, number, PlanningLineDirection]> = [
    [1, 0, 'horizontal'], [0, 1, 'vertical'], [1, 1, 'diagonal'], [1, -1, 'diagonal']
  ]
  const found: PlanningLineDirection[] = []
  cells.forEach(cell => directions.forEach(([dx, dy, direction]) => {
    const line = [0, 1, 2].map(step => `${cell.x + dx * step}:${cell.y + dy * step}`)
    if (line.every(key => occupied.has(key)) && !found.includes(direction)) found.push(direction)
  }))
  return found
}

function getClearingCells(board: DropBoard, clearing: number[]): DropCell[] {
  const ids = new Set(clearing)
  const cells: DropCell[] = []
  board.forEach((row, y) => row.forEach((tile, x) => {
    if (tile && ids.has(tile.id)) cells.push({ x, y })
  }))
  return cells
}

function getDirectionMetrics(frames: Array<{ board: DropBoard; clearing: number[] }>): {
  directions: PlanningDirection[]
  lineDirections: PlanningLineDirection[]
  waveDirections: PlanningDirection[]
  directionSwitches: number
} {
  const waveDirections: PlanningDirection[] = []
  const directions: PlanningDirection[] = []
  const lineDirections: PlanningLineDirection[] = []
  frames.filter(frame => frame.clearing.length > 0).forEach(frame => {
    const lines = getLineDirections(getClearingCells(frame.board, frame.clearing))
    const direction: PlanningDirection = lines.length === 1 ? lines[0] : 'mixed'
    waveDirections.push(direction)
    if (!directions.includes(direction)) directions.push(direction)
    lines.forEach(line => {
      if (!lineDirections.includes(line)) lineDirections.push(line)
      if (!directions.includes(line)) directions.push(line)
    })
  })
  let directionSwitches = 0
  for (let index = 1; index < waveDirections.length; index += 1) {
    if (waveDirections[index] !== waveDirections[index - 1]) directionSwitches += 1
  }
  return { directions, lineDirections, waveDirections, directionSwitches }
}

function getGravityMetrics(frames: Array<{ board: DropBoard; clearing: number[] }>): {
  gravityMoves: number
  gravityDistance: number
} {
  let gravityMoves = 0
  let gravityDistance = 0
  for (let index = 0; index + 1 < frames.length; index += 2) {
    const before = getPositions(frames[index].board)
    const after = getPositions(frames[index + 1].board)
    const cleared = new Set(frames[index].clearing)
    before.forEach((position, id) => {
      const settled = after.get(id)
      if (!settled || cleared.has(id) || isSameCell(position, settled)) return
      gravityMoves += 1
      gravityDistance += Math.max(0, settled.y - position.y)
    })
  }
  return { gravityMoves, gravityDistance }
}

function countLocalMutations(level: PlanningLevel, solutionBoard: DropBoard): {
  attempts: number
  solutions: number
  forcedPlacements: number
} {
  const emptyCells = findEmptyCells(solutionBoard)
  let solutions = 0
  let forcedPlacements = 0

  for (const placement of level.solution) {
    const tile = solutionBoard[placement.y]?.[placement.x]
    if (!tile) {
      forcedPlacements += 1
      continue
    }
    let placementAlternatives = 0
    for (const emptyCell of emptyCells) {
      const candidate = copyBoard(solutionBoard)
      candidate[placement.y][placement.x] = null
      candidate[emptyCell.y][emptyCell.x] = { ...tile }
      if (resolvePlanning(candidate).remaining === 0) {
        solutions += 1
        placementAlternatives += 1
      }
    }
    if (placementAlternatives === 0) forcedPlacements += 1
  }

  return {
    attempts: level.solution.length * emptyCells.length,
    solutions,
    forcedPlacements
  }
}

function emptyMetrics(level: PlanningLevel, warnings: string[]): PlanningDifficultyMetrics {
  const area = level.width * level.height
  const initialCats = countCats(level.board)
  const trayCats = level.cats.length
  const totalCats = initialCats + trayCats
  const availableCells = Math.max(0, area - initialCats)
  const searchSpaceLog10 = orderedPlacementLog10(availableCells, trayCats)
  return {
    levelId: level.id,
    valid: false,
    warnings,
    initialCats,
    trayCats,
    totalCats,
    typeCount: new Set(level.cats.map(cat => cat.type)).size,
    finalOccupancy: area ? totalCats / area : 1,
    emptyCellsBeforePlacement: availableCells,
    solutionSearchSpaceLog10: Number.isFinite(searchSpaceLog10) ? searchSpaceLog10 : 0,
    waves: 0,
    directions: [],
    lineDirections: [],
    waveDirections: [],
    directionSwitches: 0,
    gravityMoves: 0,
    gravityDistance: 0,
    localMutationAttempts: 0,
    localMutationSolutions: 0,
    localAlternativeRate: 0,
    forcedPlacementRate: 1,
    searchPressure: clamp(searchSpaceLog10 / SEARCH_SPACE_LOG10_CAP),
    constraintTightness: 1,
    chainPressure: 0,
    gravityPressure: 0,
    directionPressure: 0,
    densityPressure: clamp(totalCats / area),
    palettePressure: clamp((new Set(level.cats.map(cat => cat.type)).size - MINIMUM_PALETTE_SIZE) / PALETTE_SIZE_CAP)
  }
}

export function analyzePlanningLevel(level: PlanningLevel): PlanningDifficultyMetrics {
  const solutionBoard = arrangeCats(level, level.solution)
  if (!solutionBoard) return emptyMetrics(level, ['authored-solution-does-not-fit'])

  const result = resolvePlanning(solutionBoard)
  const warnings: string[] = []
  if (result.remaining !== 0) warnings.push('authored-solution-does-not-clear')
  const area = level.width * level.height
  const initialCats = countCats(level.board)
  const trayCats = level.cats.length
  const totalCats = initialCats + trayCats
  const emptyCellsBeforePlacement = Math.max(0, area - initialCats)
  const solutionSearchSpaceLog10 = orderedPlacementLog10(emptyCellsBeforePlacement, trayCats)
  const directionMetrics = getDirectionMetrics(result.frames)
  const gravityMetrics = getGravityMetrics(result.frames)
  const mutations = countLocalMutations(level, solutionBoard)
  const localAlternativeRate = mutations.attempts ? mutations.solutions / mutations.attempts : 0
  const forcedPlacementRate = trayCats ? mutations.forcedPlacements / trayCats : 1
  const chainPressure = clamp((result.waves - CHAIN_BASE_WAVES) / CHAIN_WAVE_CAP)
  const gravityPressure = clamp(gravityMetrics.gravityDistance / Math.max(1, totalCats * GRAVITY_DISTANCE_PER_CAT))
  const directionCoverage = clamp((directionMetrics.lineDirections.length - 1) / 2)
  const directionSwitchRate = result.waves > 1 ? directionMetrics.directionSwitches / (result.waves - 1) : 0

  return {
    levelId: level.id,
    valid: result.remaining === 0,
    warnings,
    initialCats,
    trayCats,
    totalCats,
    typeCount: new Set(level.cats.map(cat => cat.type)).size,
    finalOccupancy: area ? totalCats / area : 1,
    emptyCellsBeforePlacement,
    solutionSearchSpaceLog10: Number.isFinite(solutionSearchSpaceLog10) ? solutionSearchSpaceLog10 : 0,
    waves: result.waves,
    directions: directionMetrics.directions,
    lineDirections: directionMetrics.lineDirections,
    waveDirections: directionMetrics.waveDirections,
    directionSwitches: directionMetrics.directionSwitches,
    gravityMoves: gravityMetrics.gravityMoves,
    gravityDistance: gravityMetrics.gravityDistance,
    localMutationAttempts: mutations.attempts,
    localMutationSolutions: mutations.solutions,
    localAlternativeRate,
    forcedPlacementRate,
    searchPressure: clamp(solutionSearchSpaceLog10 / SEARCH_SPACE_LOG10_CAP),
    constraintTightness: clamp(1 - localAlternativeRate),
    chainPressure,
    gravityPressure,
    directionPressure: clamp(directionCoverage * 0.65 + directionSwitchRate * 0.35),
    densityPressure: clamp(totalCats / area),
    palettePressure: clamp((new Set(level.cats.map(cat => cat.type)).size - MINIMUM_PALETTE_SIZE) / PALETTE_SIZE_CAP)
  }
}

export function scorePlanningLevel(
  metrics: PlanningDifficultyMetrics,
  weights: PlanningDifficultyWeights = DEFAULT_PLANNING_DIFFICULTY_WEIGHTS
): number {
  if (!metrics.valid) return 100
  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
  if (totalWeight <= 0) return 0
  const weightedScore = (
    metrics.searchPressure * weights.searchPressure
    + metrics.constraintTightness * weights.constraintTightness
    + metrics.chainPressure * weights.chainPressure
    + metrics.gravityPressure * weights.gravityPressure
    + metrics.directionPressure * weights.directionPressure
    + metrics.densityPressure * weights.densityPressure
    + metrics.palettePressure * weights.palettePressure
  ) / totalWeight
  return Math.round(clamp(weightedScore) * 1000) / 10
}

export function getPlanningDifficultyBand(score: number): PlanningDifficultyBand {
  if (score < 20) return 'tutorial'
  if (score < 35) return 'foundation'
  if (score < 50) return 'standard'
  if (score < 65) return 'advanced'
  if (score < 80) return 'expert'
  return 'unfair'
}

export function getPlanningDifficultyTarget(levelId: number): PlanningDifficultyTarget {
  if (levelId <= 3) return { chapter: 1, minimum: 28, maximum: 38 }
  if (levelId <= 10) return { chapter: 2, minimum: 35, maximum: 55 }
  if (levelId <= 15) return { chapter: 3, minimum: 44, maximum: 62 }
  if (levelId <= 20) return { chapter: 4, minimum: 52, maximum: 78 }
  return { chapter: 5, minimum: 65, maximum: 82 }
}

export function scorePlanningReport(metrics: PlanningDifficultyMetrics): ScoredPlanningDifficulty {
  const score = scorePlanningLevel(metrics)
  return { ...metrics, score, band: getPlanningDifficultyBand(score), target: getPlanningDifficultyTarget(metrics.levelId) }
}

export function getPlanningProgressionWarnings(reports: ScoredPlanningDifficulty[]): string[] {
  const warnings: string[] = []
  reports.forEach((report, index) => {
    if (!report.valid) warnings.push(`level-${report.levelId}-invalid-solution`)
    if (report.score < report.target.minimum || report.score > report.target.maximum) {
      warnings.push(`level-${report.levelId}-outside-target-band`)
    }
    const previous = reports[index - 1]
    if (!previous) return
    const change = report.score - previous.score
    if (change > MAX_DIFFICULTY_JUMP) warnings.push(`level-${report.levelId}-jump-too-large`)
    if (change < -MAX_DIFFICULTY_JUMP) warnings.push(`level-${report.levelId}-drop-too-large`)
  })
  return warnings
}

export function getPlanningReadabilityWarnings(reports: ScoredPlanningDifficulty[]): string[] {
  return reports
    .filter(report => report.valid
      && report.forcedPlacementRate >= BRITTLE_FORCED_RATE
      && report.localAlternativeRate <= BRITTLE_ALTERNATIVE_RATE)
    .map(report => `level-${report.levelId}-solution-too-brittle`)
}
