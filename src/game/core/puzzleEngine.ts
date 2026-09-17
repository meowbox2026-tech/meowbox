import { cellsTouch, getPlacedCells, pointKey } from './shapes'
import { getLevelById } from '../data/levels'
import type {
  CatDefinition,
  CatPlacement,
  GridPoint,
  Hint,
  LevelDefinition,
  PlacementFailure,
  PuzzleActionResult,
  PuzzleSnapshot,
  PuzzleState
} from '../types'

export function createPuzzleState(level: LevelDefinition): PuzzleState {
  const stretchLengths = Object.fromEntries(level.cats
    .filter((cat) => cat.type === 'stretch')
    .map((cat) => [cat.id, cat.stretchLengths?.[0] ?? 2]))

  return {
    levelId: level.id,
    phase: 'playing',
    placements: {},
    stretchLengths,
    initialStretchLengths: stretchLengths,
    closedLids: [],
    movesRemaining: level.type === 'challenge' ? level.moves : undefined,
    initialMoves: level.type === 'challenge' ? level.moves : undefined,
    hintsUsed: 0,
    autoPlacesUsed: 0,
    history: []
  }
}

export function moveCat(
  state: PuzzleState,
  catId: string,
  origin: GridPoint,
  rotation = 0
): PuzzleActionResult {
  const level = getRequiredLevel(state)
  return moveCatOnLevel(level, state, catId, origin, rotation)
}

export function moveCatOnLevel(
  level: LevelDefinition,
  state: PuzzleState,
  catId: string,
  origin: GridPoint,
  rotation = 0,
  stretchLength?: number
): PuzzleActionResult {
  if (state.phase !== 'playing') return rejected(state, 'game-over')

  const cat = findCat(level, catId)
  if (!cat) return rejected(state, 'unknown-cat')

  const existingPlacement = state.placements[catId]
  const movableFailure = getMovableFailure(level, state, cat, existingPlacement)
  if (movableFailure) return rejected(state, movableFailure)

  const placement: CatPlacement = {
    origin,
    rotation,
    stretchLength: cat.type === 'stretch'
      ? stretchLength ?? state.stretchLengths[catId] ?? cat.stretchLengths?.[0]
      : undefined,
    locked: cat.type === 'sleeping'
  }
  const validationFailure = validatePlacement(level, state, cat, placement)
  if (validationFailure) return rejected(state, validationFailure)

  const previous = snapshot(state)
  const placed = {
    ...state,
    placements: { ...state.placements, [catId]: placement },
    history: [...state.history, previous],
    lastHint: undefined
  }
  const withMoves = consumeMove(placed)
  const resolved = resolveLids(level, withMoves)
  return accepted(resolvePhase(level, resolved))
}

export function undoLastAction(state: PuzzleState): PuzzleState {
  const previous = state.history.at(-1)
  if (!previous) return state

  return {
    ...state,
    ...restoreSnapshot(previous),
    phase: 'playing',
    history: state.history.slice(0, -1),
    lastHint: undefined
  }
}

export function restartPuzzle(state: PuzzleState): PuzzleState {
  return {
    ...state,
    phase: 'playing',
    placements: {},
    stretchLengths: { ...state.initialStretchLengths },
    closedLids: [],
    movesRemaining: state.initialMoves,
    hintsUsed: 0,
    autoPlacesUsed: 0,
    history: [],
    lastHint: undefined
  }
}

export function toggleStretchLength(state: PuzzleState, catId: string): PuzzleState {
  const level = getRequiredLevel(state)
  const cat = findCat(level, catId)
  if (!cat || cat.type !== 'stretch' || state.placements[catId]) return state

  const lengths = cat.stretchLengths ?? [2, 3, 4]
  const current = state.stretchLengths[catId] ?? lengths[0]
  const next = lengths[(lengths.indexOf(current) + 1) % lengths.length]
  return { ...state, stretchLengths: { ...state.stretchLengths, [catId]: next } }
}

export function wakeSleepingCat(state: PuzzleState, catId: string): PuzzleState {
  const current = state.placements[catId]
  if (!current?.locked) return state

  return {
    ...state,
    placements: { ...state.placements, [catId]: { ...current, locked: false } },
    history: [...state.history, snapshot(state)]
  }
}

export function addChallengeMoves(state: PuzzleState, amount: number): PuzzleState {
  const moves = Math.max(0, state.movesRemaining ?? 0) + Math.max(0, amount)
  return { ...state, movesRemaining: moves, phase: 'playing' }
}

export function getHint(state: PuzzleState): Hint | undefined {
  const level = getRequiredLevel(state)

  for (const cat of level.cats) {
    const solution = level.solution[cat.id]
    const current = state.placements[cat.id]
    if (!solution || placementsMatch(current, solution)) continue

    return { catId: cat.id, ...solution }
  }

  return undefined
}

export function revealHint(state: PuzzleState): PuzzleState {
  const hint = getHint(state)
  if (!hint) return state
  return { ...state, lastHint: hint, hintsUsed: state.hintsUsed + 1 }
}

export function autoPlaceCat(state: PuzzleState): PuzzleActionResult {
  const level = getRequiredLevel(state)
  const hint = getHint(state)
  if (!hint) return accepted(state)

  const result = moveCatOnLevel(level, state, hint.catId, hint.origin, hint.rotation, hint.stretchLength)
  if (!result.accepted) return result

  return accepted({ ...result.state, autoPlacesUsed: result.state.autoPlacesUsed + 1, lastHint: hint })
}

export function getPlacedCatCells(level: LevelDefinition, state: PuzzleState, catId: string): GridPoint[] {
  const cat = findCat(level, catId)
  const placement = state.placements[catId]
  return cat && placement ? getPlacedCells(cat, placement) : []
}

export function isPuzzleComplete(level: LevelDefinition, state: PuzzleState): boolean {
  if (Object.keys(state.placements).length !== level.cats.length) return false
  return stickyGroupsAreConnected(level, state)
}

function getRequiredLevel(state: PuzzleState): LevelDefinition {
  return getLevelById(state.levelId)
}

function findCat(level: LevelDefinition, catId: string): CatDefinition | undefined {
  return level.cats.find((cat) => cat.id === catId)
}

function getMovableFailure(
  level: LevelDefinition,
  state: PuzzleState,
  cat: CatDefinition,
  placement?: CatPlacement
): PlacementFailure | undefined {
  if (!placement) return undefined
  if (cat.type === 'sleeping' && placement.locked) return 'sleeping'

  const cells = getPlacedCells(cat, placement)
  const closedZone = level.board.lidZones?.find((zone) => state.closedLids.includes(zone.id) && cellsOverlap(cells, zone.cells))
  return closedZone ? 'lid-closed' : undefined
}

function validatePlacement(
  level: LevelDefinition,
  state: PuzzleState,
  cat: CatDefinition,
  placement: CatPlacement
): PlacementFailure | undefined {
  const cells = getPlacedCells(cat, placement)
  const activeCellKeys = getActiveCellKeys(level)
  const blockedCellKeys = getBlockedCellKeys(level)
  const occupied = getOccupiedCellKeys(level, state, cat.id)

  for (const cell of cells) {
    if (cell.x < 0 || cell.y < 0 || cell.x >= level.board.width || cell.y >= level.board.height) return 'outside'
    if (!activeCellKeys.has(pointKey(cell))) return 'inactive'
    if (blockedCellKeys.has(pointKey(cell))) return 'blocked'
    if (occupied.has(pointKey(cell))) return 'occupied'
  }

  return undefined
}

function getActiveCellKeys(level: LevelDefinition): Set<string> {
  if (!level.board.activeCells) {
    return new Set(Array.from({ length: level.board.width * level.board.height }, (_, index) => ({
      x: index % level.board.width,
      y: Math.floor(index / level.board.width)
    })).map(pointKey))
  }
  return new Set(level.board.activeCells.map(pointKey))
}

function getBlockedCellKeys(level: LevelDefinition): Set<string> {
  const blocked = level.board.blockedCells.map(pointKey)
  const describedObstacles = level.board.obstacles?.map((obstacle) => pointKey(obstacle.cell)) ?? []
  return new Set([...blocked, ...describedObstacles])
}

function getOccupiedCellKeys(level: LevelDefinition, state: PuzzleState, excludingCatId: string): Set<string> {
  const occupied = new Set<string>()
  Object.entries(state.placements).forEach(([catId, placement]) => {
    if (catId === excludingCatId) return
    const cat = findCat(level, catId)
    if (!cat) return
    getPlacedCells(cat, placement).forEach((cell) => occupied.add(pointKey(cell)))
  })
  return occupied
}

function consumeMove(state: PuzzleState): PuzzleState {
  if (state.movesRemaining === undefined) return state
  return { ...state, movesRemaining: Math.max(0, state.movesRemaining - 1) }
}

function resolveLids(level: LevelDefinition, state: PuzzleState): PuzzleState {
  const occupied = getOccupiedCellKeys(level, state, '')
  const newlyClosed = level.board.lidZones
    ?.filter((zone) => !state.closedLids.includes(zone.id))
    .filter((zone) => zone.cells.every((cell) => occupied.has(pointKey(cell))))
    .map((zone) => zone.id) ?? []

  return newlyClosed.length === 0 ? state : { ...state, closedLids: [...state.closedLids, ...newlyClosed] }
}

function resolvePhase(level: LevelDefinition, state: PuzzleState): PuzzleState {
  if (isPuzzleComplete(level, state)) return { ...state, phase: 'completed' }
  if (state.movesRemaining !== undefined && state.movesRemaining <= 0) return { ...state, phase: 'failed' }
  return state
}

function stickyGroupsAreConnected(level: LevelDefinition, state: PuzzleState): boolean {
  const groups = new Map<string, CatDefinition[]>()
  level.cats.filter((cat) => cat.type === 'sticky' && cat.stickyGroup).forEach((cat) => {
    const group = groups.get(cat.stickyGroup!) ?? []
    groups.set(cat.stickyGroup!, [...group, cat])
  })

  return [...groups.values()].every((cats) => {
    const first = cats[0]
    const connected = new Set<string>([first.id])
    let changed = true
    while (changed) {
      changed = false
      cats.forEach((cat) => {
        if (connected.has(cat.id)) return
        const catCells = getPlacedCatCells(level, state, cat.id)
        const touchesConnected = [...connected].some((connectedId) => cellsTouch(catCells, getPlacedCatCells(level, state, connectedId)))
        if (touchesConnected) {
          connected.add(cat.id)
          changed = true
        }
      })
    }
    return connected.size === cats.length
  })
}

function snapshot(state: PuzzleState): PuzzleSnapshot {
  return {
    placements: Object.fromEntries(Object.entries(state.placements).map(([id, placement]) => [id, clonePlacement(placement)])),
    stretchLengths: { ...state.stretchLengths },
    closedLids: [...state.closedLids],
    movesRemaining: state.movesRemaining,
    hintsUsed: state.hintsUsed,
    autoPlacesUsed: state.autoPlacesUsed
  }
}

function restoreSnapshot(state: PuzzleSnapshot): Omit<PuzzleState, 'levelId' | 'phase' | 'initialStretchLengths' | 'initialMoves' | 'history' | 'lastHint'> {
  return {
    placements: Object.fromEntries(Object.entries(state.placements).map(([id, placement]) => [id, clonePlacement(placement)])),
    stretchLengths: { ...state.stretchLengths },
    closedLids: [...state.closedLids],
    movesRemaining: state.movesRemaining,
    hintsUsed: state.hintsUsed,
    autoPlacesUsed: state.autoPlacesUsed
  }
}

function clonePlacement(placement: CatPlacement): CatPlacement {
  return { ...placement, origin: { ...placement.origin } }
}

function cellsOverlap(first: GridPoint[], second: GridPoint[]): boolean {
  const secondKeys = new Set(second.map(pointKey))
  return first.some((cell) => secondKeys.has(pointKey(cell)))
}

function placementsMatch(current: CatPlacement | undefined, solution: CatPlacement): boolean {
  if (!current) return false
  return current.origin.x === solution.origin.x
    && current.origin.y === solution.origin.y
    && current.rotation === solution.rotation
    && current.stretchLength === solution.stretchLength
}

function accepted(state: PuzzleState): PuzzleActionResult {
  return { accepted: true, state }
}

function rejected(state: PuzzleState, reason: PlacementFailure): PuzzleActionResult {
  return { accepted: false, state, reason }
}
