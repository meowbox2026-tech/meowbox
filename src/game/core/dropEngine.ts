export interface DropTile { id: number; type: string }
export type DropBoard = (DropTile | null)[][]
export interface DropCell { x: number; y: number }
export interface DropWave { board: DropBoard; after: DropBoard; cells: DropCell[]; combo: number; points: number }
export interface DropState {
  board: DropBoard
  current: string
  next: string
  queue: string[]
  nextId: number
  moves: number
  cleared: number
  score: number
  bestCombo: number
  target: number
  phase: 'playing' | 'completed' | 'failed'
}
export interface DropResult { accepted: boolean; state: DropState; landed: DropBoard; waves: DropWave[] }
export const DROP_CATS = ['orange', 'blue', 'white'] as const
export const DROP_NAMES: Record<string, string> = { orange: '橘子', blue: '小灰', white: '奶霜' }
const clone = (board: DropBoard): DropBoard => board.map(row => row.map(tile => tile && { ...tile }))

export function createDropState(options: { board?: DropBoard; current?: string; target?: number } = {}): DropState {
  const board = options.board ? clone(options.board) : Array.from({ length: 8 }, () => Array<DropTile | null>(6).fill(null))
  if (!board.length || !board[0].length || board.some(row => row.length !== board[0].length)) throw new Error('Invalid drop board')
  if (!options.board) {
    board[7][0] = { id: 1, type: 'orange' }
    board[7][1] = { id: 2, type: 'orange' }
    board[6][0] = { id: 3, type: 'blue' }
    board[6][1] = { id: 4, type: 'white' }
  }
  return {
    board, current: options.current ?? 'orange', next: 'blue',
    queue: ['blue', 'white', 'white', 'orange', 'orange', 'orange', 'blue', 'white', 'blue'],
    nextId: Math.max(0, ...board.flat().map(tile => tile?.id ?? 0)) + 1,
    moves: 0, cleared: 0, score: 0, bestCombo: 0, target: options.target ?? 18, phase: 'playing'
  }
}

export function landingRow(board: DropBoard, column: number): number {
  if (!Number.isInteger(column) || column < 0 || column >= board[0].length) return -1
  for (let y = board.length - 1; y >= 0; y--) if (!board[y][column]) return y
  return -1
}

export function findDropMatches(board: DropBoard): DropCell[] {
  const matches = new Map<string, DropCell>()
  for (let y = 0; y < board.length; y++) for (let x = 0; x < board[0].length; x++) {
    const type = board[y][x]?.type
    if (!type) continue
    for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [-1, 1]]) {
      if (board[y - dy]?.[x - dx]?.type === type) continue
      const run: DropCell[] = []
      let nx = x; let ny = y
      while (board[ny]?.[nx]?.type === type) { run.push({ x: nx, y: ny }); nx += dx; ny += dy }
      if (run.length >= 3) run.forEach(cell => matches.set(`${cell.x}:${cell.y}`, cell))
    }
  }
  return [...matches.values()]
}

function gravity(board: DropBoard): DropBoard {
  const next = clone(board)
  for (let x = 0; x < board[0].length; x++) {
    const tiles = board.map(row => row[x]).filter((tile): tile is DropTile => tile !== null)
    for (let y = board.length - 1; y >= 0; y--) next[y][x] = tiles.pop() ?? null
  }
  return next
}

function bag(random: () => number): string[] {
  const cats: string[] = DROP_CATS.flatMap(cat => [cat, cat, cat])
  for (let i = cats.length - 1; i > 0; i--) {
    const sample = random()
    const j = Math.max(0, Math.min(i, Math.floor((Number.isFinite(sample) ? sample : 0) * (i + 1))))
    ;[cats[i], cats[j]] = [cats[j], cats[i]]
  }
  return cats
}

export function dropCat(state: DropState, column: number, random: () => number = Math.random): DropResult {
  const y = landingRow(state.board, column)
  if (state.phase !== 'playing' || y < 0) return { accepted: false, state, landed: state.board, waves: [] }
  let board = clone(state.board)
  board[y][column] = { id: state.nextId, type: state.current }
  const landed = clone(board)
  const waves: DropWave[] = []
  let cleared = state.cleared; let score = state.score
  while (true) {
    const cells = findDropMatches(board)
    if (!cells.length) break
    const before = clone(board)
    cells.forEach(({ x, y }) => { board[y][x] = null })
    board = gravity(board)
    const combo = waves.length + 1
    const points = cells.length * 10 * combo
    waves.push({ board: before, after: clone(board), cells, combo, points })
    cleared += cells.length; score += points
  }
  const queue = state.queue.length ? [...state.queue] : bag(random)
  // A top-row survivor loses, even when the target is reached on the same move.
  const phase = board[0].some(Boolean) ? 'failed' : cleared >= state.target ? 'completed' : 'playing'
  return {
    accepted: true, landed, waves,
    state: { ...state, board, current: state.next, next: queue.shift()!, queue, nextId: state.nextId + 1,
      moves: state.moves + 1, cleared, score, bestCombo: Math.max(state.bestCombo, waves.length), phase }
  }
}
