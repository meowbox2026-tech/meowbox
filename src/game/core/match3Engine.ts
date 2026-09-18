export type Match3TileType = string

export interface Match3Point {
  x: number
  y: number
}

export interface Match3Tile {
  id: number
  type: Match3TileType
}

export type Match3Board = Array<Array<Match3Tile | null>>

export interface Match3ClearCell extends Match3Point {
  type: Match3TileType
}

export interface Match3ClearEvent {
  cascade: number
  cells: Match3ClearCell[]
}

export interface Match3ResolutionStep {
  board: Match3Board
  clearEvent: Match3ClearEvent
  nextBoard: Match3Board
}

export type Match3Phase = 'playing'

export interface Match3State {
  board: Match3Board
  width: number
  height: number
  tileTypes: Match3TileType[]
  moves: number
  cleared: number
  cascades: number
  phase: Match3Phase
}

export interface CreateMatch3StateOptions {
  width: number
  height: number
  tileTypes: Match3TileType[]
  board?: Match3Board
  random?: () => number
}

export type Match3SwapFailure = 'outside' | 'not-adjacent' | 'empty' | 'no-match'

export interface Match3SwapResult {
  accepted: boolean
  state: Match3State
  reason?: Match3SwapFailure
  clearedCount: number
  cascades: number
  clearEvents: Match3ClearEvent[]
  resolutionSteps: Match3ResolutionStep[]
}

export function createMatch3State(options: CreateMatch3StateOptions): Match3State {
  validateDimensions(options.width, options.height)
  validateTileTypes(options.tileTypes)

  const board = options.board
    ? cloneBoard(options.board)
    : createMatch3Board(options.width, options.height, options.tileTypes, options.random ?? Math.random)

  validateBoard(board, options.width, options.height)

  return {
    board,
    width: options.width,
    height: options.height,
    tileTypes: [...options.tileTypes],
    moves: 0,
    cleared: 0,
    cascades: 0,
    phase: 'playing'
  }
}

export function createMatch3Board(
  width: number,
  height: number,
  tileTypes: Match3TileType[],
  random: () => number = Math.random
): Match3Board {
  validateDimensions(width, height)
  validateTileTypes(tileTypes)

  const board: Match3Board = Array.from({ length: height }, () => Array<Match3Tile | null>(width).fill(null))
  let nextId = 1

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const availableTypes = tileTypes.filter((type) => !wouldCreateMatch(board, x, y, type))
      const choices = availableTypes.length > 0 ? availableTypes : tileTypes
      const type = choices[randomIndex(random, choices.length)]
      board[y][x] = { id: nextId, type }
      nextId += 1
    }
  }

  return board
}

export function findMatchCells(board: Match3Board): Match3Point[] {
  const matches = new Map<string, Match3Point>()
  const height = board.length
  const width = board[0]?.length ?? 0

  for (let y = 0; y < height; y += 1) {
    let runStart = 0
    for (let x = 1; x <= width; x += 1) {
      const previous = board[y][x - 1]
      const current = x < width ? board[y][x] : null
      if (previous && current && previous.type === current.type) continue

      if (previous && x - runStart >= 3) {
        for (let runX = runStart; runX < x; runX += 1) {
          addMatch(matches, runX, y)
        }
      }
      runStart = x
    }
  }

  for (let x = 0; x < width; x += 1) {
    let runStart = 0
    for (let y = 1; y <= height; y += 1) {
      const previous = board[y - 1]?.[x]
      const current = y < height ? board[y]?.[x] : null
      if (previous && current && previous.type === current.type) continue

      if (previous && y - runStart >= 3) {
        for (let runY = runStart; runY < y; runY += 1) {
          addMatch(matches, x, runY)
        }
      }
      runStart = y
    }
  }

  return [...matches.values()].sort((left, right) => left.y - right.y || left.x - right.x)
}

export function areMatch3PointsAdjacent(first: Match3Point, second: Match3Point): boolean {
  return Math.abs(first.x - second.x) + Math.abs(first.y - second.y) === 1
}

export function swapMatch3Tiles(
  state: Match3State,
  first: Match3Point,
  second: Match3Point,
  random: () => number = Math.random
): Match3SwapResult {
  if (!isInside(state, first) || !isInside(state, second)) {
    return rejected(state, 'outside')
  }
  if (!areMatch3PointsAdjacent(first, second)) {
    return rejected(state, 'not-adjacent')
  }
  if (!state.board[first.y][first.x] || !state.board[second.y][second.x]) {
    return rejected(state, 'empty')
  }

  const swapped = cloneBoard(state.board)
  const firstTile = swapped[first.y][first.x]
  swapped[first.y][first.x] = swapped[second.y][second.x]
  swapped[second.y][second.x] = firstTile

  if (findMatchCells(swapped).length === 0) {
    return rejected(state, 'no-match')
  }

  const resolution = resolveMatches(swapped, state.tileTypes, random)
  const nextState: Match3State = {
    ...state,
    board: resolution.board,
    moves: state.moves + 1,
    cleared: state.cleared + resolution.clearedCount,
    cascades: state.cascades + resolution.cascades
  }

  return {
    accepted: true,
    state: nextState,
    clearedCount: resolution.clearedCount,
    cascades: resolution.cascades,
    clearEvents: resolution.clearEvents,
    resolutionSteps: resolution.resolutionSteps
  }
}

interface Match3Resolution {
  board: Match3Board
  clearedCount: number
  cascades: number
  clearEvents: Match3ClearEvent[]
  resolutionSteps: Match3ResolutionStep[]
}

function resolveMatches(
  source: Match3Board,
  tileTypes: Match3TileType[],
  random: () => number
): Match3Resolution {
  const board = cloneBoard(source)
  let clearedCount = 0
  let cascades = 0
  const clearEvents: Match3ClearEvent[] = []
  const resolutionSteps: Match3ResolutionStep[] = []
  let nextId = getNextTileId(board)

  while (true) {
    const matches = findMatchCells(board)
    if (matches.length === 0) break

    cascades += 1
    clearedCount += matches.length
    const boardBeforeClear = cloneBoard(board)
    const clearEvent = {
      cascade: cascades,
      cells: matches.flatMap(({ x, y }) => {
        const tile = board[y][x]
        return tile ? [{ x, y, type: tile.type }] : []
      })
    }
    clearEvents.push(clearEvent)
    matches.forEach(({ x, y }) => {
      board[y][x] = null
    })

    for (let x = 0; x < board[0].length; x += 1) {
      const existingTiles = board
        .map((row) => row[x])
        .filter((tile): tile is Match3Tile => tile !== null)

      for (let y = board.length - 1; y >= 0; y -= 1) {
        board[y][x] = existingTiles.pop() ?? null
      }

      for (let y = 0; y < board.length; y += 1) {
        if (board[y][x]) continue
        const type = chooseRefillType(board, x, y, tileTypes, random)
        board[y][x] = { id: nextId, type }
        nextId += 1
      }
    }

    resolutionSteps.push({
      board: boardBeforeClear,
      clearEvent,
      nextBoard: cloneBoard(board)
    })
  }

  return { board, clearedCount, cascades, clearEvents, resolutionSteps }
}

function chooseRefillType(
  board: Match3Board,
  x: number,
  y: number,
  tileTypes: Match3TileType[],
  random: () => number
): Match3TileType {
  const start = randomIndex(random, tileTypes.length)

  for (let offset = 0; offset < tileTypes.length; offset += 1) {
    const type = tileTypes[(start + offset) % tileTypes.length]
    if (!wouldCreateMatch(board, x, y, type)) return type
  }

  return tileTypes[start]
}

function wouldCreateMatch(board: Match3Board, x: number, y: number, type: Match3TileType): boolean {
  const horizontal = x >= 2
    && board[y][x - 1]?.type === type
    && board[y][x - 2]?.type === type
  const vertical = y >= 2
    && board[y - 1]?.[x]?.type === type
    && board[y - 2]?.[x]?.type === type
  return horizontal || vertical
}

function addMatch(matches: Map<string, Match3Point>, x: number, y: number): void {
  matches.set(`${x}:${y}`, { x, y })
}

function cloneBoard(board: Match3Board): Match3Board {
  return board.map((row) => row.map((tile) => tile ? { ...tile } : null))
}

function getNextTileId(board: Match3Board): number {
  return board.flat().reduce((highest, tile) => Math.max(highest, tile?.id ?? 0), 0) + 1
}

function randomIndex(random: () => number, length: number): number {
  const sampled = random()
  const value = Number.isFinite(sampled) ? sampled : 0
  return Math.min(length - 1, Math.max(0, Math.floor(value * length)))
}

function isInside(state: Match3State, point: Match3Point): boolean {
  return point.x >= 0 && point.x < state.width && point.y >= 0 && point.y < state.height
}

function rejected(state: Match3State, reason: Match3SwapFailure): Match3SwapResult {
  return { accepted: false, state, reason, clearedCount: 0, cascades: 0, clearEvents: [], resolutionSteps: [] }
}

function validateDimensions(width: number, height: number): void {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    throw new Error('A match-3 board needs positive integer dimensions.')
  }
}

function validateTileTypes(tileTypes: Match3TileType[]): void {
  if (new Set(tileTypes).size < 3) {
    throw new Error('A match-3 board needs at least three tile types.')
  }
}

function validateBoard(board: Match3Board, width: number, height: number): void {
  if (board.length !== height || board.some((row) => row.length !== width)) {
    throw new Error('The match-3 board dimensions do not match the requested size.')
  }
}
