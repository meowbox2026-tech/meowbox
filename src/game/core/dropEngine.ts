import { advancePatrol, createPatrol } from './dropPatrol'
import { isDropRouteBlocked, resolveDropColumn } from './dropRouting'
import { getDropProgress, hasCompletedDropObjectives } from './dropObjectives'
import { resolveWaveEffects } from './dropMechanics'
import type {
  CatToken,
  CatTrait,
  CatTunnel,
  DropGoals,
  DropPatrol,
  DropProgress,
  FishTreat,
  ScratchPost
} from './dropTypes'

export type { CatToken, CatTrait, CatTunnel, DropGoals, DropPatrol, DropProgress, FishTreat, ScratchPost }

export interface DropTile {
  id: number
  type: string
  trait?: CatTrait
}

export type DropBoard = (DropTile | null)[][]
export interface DropCell { x: number; y: number }
export interface DropTraitEffect { cell: DropCell; trait: CatTrait }
export interface DropWave {
  board: DropBoard
  after: DropBoard
  cells: DropCell[]
  combo: number
  points: number
  damagedScratchPostIds: string[]
  collectedFishTreatIds: string[]
  damagedScratchPosts: ScratchPost[]
  collectedFishTreats: FishTreat[]
  traitEffects: DropTraitEffect[]
}
export interface DropState {
  board: DropBoard
  width: number
  height: number
  tileTypes: string[]
  current: string
  currentTrait: CatTrait
  next: string
  nextTrait: CatTrait
  queue: string[]
  queueTraits: CatTrait[]
  nextId: number
  moves: number
  cleared: number
  score: number
  bestCombo: number
  target: number
  phase: 'playing' | 'completed' | 'failed'
  scratchPosts: ScratchPost[]
  fishTreats: FishTreat[]
  tunnels: CatTunnel[]
  patrol?: DropPatrol
  goals: DropGoals
  progress: DropProgress
  totalFishTreats: number
  holdToken?: CatToken
  holdUses: number
  holdLocked: boolean
  previewCount: 2 | 3 | 4
  variant: number
}

export type DropFailureReason = 'ceiling' | 'no-route'
export interface DropResult {
  accepted: boolean
  state: DropState
  landed: DropBoard
  waves: DropWave[]
  resolvedColumn?: number
  routed?: boolean
  failureReason?: DropFailureReason
  patrolMoved?: boolean
}

export const DROP_CATS = ['orange', 'blue', 'white'] as const
export const DROP_NAMES: Record<string, string> = {
  arrogant: '傲嬌', sunny: '陽陽', fishLover: '魚丸', orange: '橘子', white: '奶霜', blue: '小灰',
  alone: '小墨', sleeping: '睡覺', box: '紙箱', mischievous: '淘氣', boss: '老大', sticky: '黏黏'
}

const cloneBoard = (board: DropBoard): DropBoard => board.map((row) => row.map((tile) => tile && { ...tile }))
const clonePosts = (posts: ScratchPost[]): ScratchPost[] => posts.map((post) => ({ ...post }))
const cloneTreats = (treats: FishTreat[]): FishTreat[] => treats.map((treat) => ({ ...treat }))

export interface CreateDropStateOptions {
  board?: DropBoard
  width?: number
  height?: number
  tileTypes?: string[]
  current?: string
  currentTrait?: CatTrait
  currentToken?: CatToken
  next?: string
  nextTrait?: CatTrait
  nextToken?: CatToken
  queue?: string[]
  queueTraits?: CatTrait[]
  queueTokens?: CatToken[]
  target?: number
  scratchPosts?: ScratchPost[]
  fishTreats?: FishTreat[]
  tunnels?: CatTunnel[]
  patrol?: DropPatrol
  goals?: Partial<DropGoals>
  holdUses?: number
  holdToken?: CatToken
  holdLocked?: boolean
  previewCount?: 2 | 3 | 4
  variant?: number
}

export function createDropState(options: CreateDropStateOptions = {}): DropState {
  const width = options.width ?? options.board?.[0]?.length ?? 6
  const height = options.height ?? options.board?.length ?? 8
  const tileTypes = [...new Set(options.tileTypes ?? [...DROP_CATS])]
  if (tileTypes.length < 3) throw new Error('A drop board needs at least three cat types.')
  const board = options.board ? cloneBoard(options.board) : Array.from({ length: height }, () => Array<DropTile | null>(width).fill(null))
  if (!board.length || !board[0].length || board.some((row) => row.length !== board[0].length)) throw new Error('Invalid drop board')
  if (board.length !== height || board[0].length !== width) throw new Error('Drop board dimensions do not match the level.')
  if (!options.board) {
    board[height - 1][0] = { id: 1, type: tileTypes[0] }
    board[height - 1][1] = { id: 2, type: tileTypes[0] }
    board[Math.max(0, height - 2)][0] = { id: 3, type: tileTypes[1] }
    board[Math.max(0, height - 2)][1] = { id: 4, type: tileTypes[2] }
  }

  const currentToken = options.currentToken ?? { type: options.current ?? tileTypes[0], trait: options.currentTrait ?? 'none' }
  const nextToken = options.nextToken ?? { type: options.next ?? tileTypes[1], trait: options.nextTrait ?? 'none' }
  const queueTokens = options.queueTokens
    ?? (options.queue ?? createDefaultQueue(tileTypes)).map((type, index) => ({ type, trait: options.queueTraits?.[index] ?? 'none' }))
  const scratchPosts = clonePosts(options.scratchPosts ?? [])
  const fishTreats = cloneTreats(options.fishTreats ?? [])
  const goals: DropGoals = {
    rescued: options.goals?.rescued ?? options.target ?? 18,
    scratchPosts: options.goals?.scratchPosts ?? scratchPosts.length,
    fishTreats: options.goals?.fishTreats ?? fishTreats.length
  }
  const progress = getDropProgress(0, scratchPosts, fishTreats, goals.fishTreats)

  return {
    board,
    width,
    height,
    tileTypes,
    current: currentToken.type,
    currentTrait: currentToken.trait,
    next: nextToken.type,
    nextTrait: nextToken.trait,
    queue: queueTokens.map((item) => item.type),
    queueTraits: queueTokens.map((item) => item.trait),
    nextId: Math.max(0, ...board.flat().map((tile) => tile?.id ?? 0)) + 1,
    moves: 0,
    cleared: 0,
    score: 0,
    bestCombo: 0,
    target: goals.rescued,
    phase: 'playing',
    scratchPosts,
    fishTreats,
    tunnels: (options.tunnels ?? []).map((tunnel) => ({ ...tunnel })),
    patrol: createPatrol(options.patrol),
    goals,
    progress,
    totalFishTreats: fishTreats.length,
    holdToken: options.holdToken ? { ...options.holdToken } : undefined,
    holdUses: Math.max(0, options.holdUses ?? 0),
    holdLocked: options.holdLocked ?? false,
    previewCount: options.previewCount ?? 2,
    variant: options.variant ?? 0
  }
}

function createDefaultQueue(tileTypes: string[]): string[] {
  return tileTypes.flatMap((type) => [type, type, type]).slice(0, 12)
}

export function landingRow(board: DropBoard, column: number, blockedCells: readonly DropCell[] = []): number {
  if (!Number.isInteger(column) || column < 0 || column >= board[0].length) return -1
  const blocked = new Set(blockedCells.filter((cell) => cell.x === column).map((cell) => cell.y))
  // Only cells reachable from above are valid, even when the column has gaps.
  for (let y = 0; y < board.length; y += 1) if (blocked.has(y) || board[y][column]) return y - 1
  return board.length - 1
}

export function findDropMatches(board: DropBoard): DropCell[] {
  const matches = new Map<string, DropCell>()
  for (let y = 0; y < board.length; y += 1) for (let x = 0; x < board[0].length; x += 1) {
    const type = board[y][x]?.type
    if (!type) continue
    for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [-1, 1]]) {
      if (board[y - dy]?.[x - dx]?.type === type) continue
      const run: DropCell[] = []
      let nx = x
      let ny = y
      while (board[ny]?.[nx]?.type === type) {
        run.push({ x: nx, y: ny })
        nx += dx
        ny += dy
      }
      if (run.length >= 3) run.forEach((cell) => matches.set(`${cell.x}:${cell.y}`, cell))
    }
  }
  return [...matches.values()]
}

/** Preserve the legacy authored-shelf gravity contract when there are no blockers. */
function gravityWithoutBlockers(board: DropBoard, clearedCells: DropCell[]): DropBoard {
  const next = cloneBoard(board)
  const lowestClearedByColumn = new Map<number, number>()
  for (const { x, y } of clearedCells) {
    const lowest = lowestClearedByColumn.get(x)
    if (lowest === undefined || y > lowest) lowestClearedByColumn.set(x, y)
  }
  for (const [x, lowestCleared] of lowestClearedByColumn) {
    const support = board.slice(lowestCleared + 1).findIndex((row) => row[x] !== null)
    const settleBottom = support < 0 ? board.length - 1 : lowestCleared + support
    const tiles = board.slice(0, settleBottom + 1).map((row) => row[x]).filter((tile): tile is DropTile => tile !== null)
    for (let y = settleBottom; y >= 0; y -= 1) next[y][x] = tiles.pop() ?? null
  }
  return next
}

function gravity(board: DropBoard, clearedCells: DropCell[], blockers: ScratchPost[]): DropBoard {
  const activeBlockers = blockers.filter((post) => post.hp > 0)
  if (!activeBlockers.length) return gravityWithoutBlockers(board, clearedCells)
  const next = cloneBoard(board)
  const byColumn = new Map<number, number[]>()
  activeBlockers.forEach((post) => byColumn.set(post.x, [...(byColumn.get(post.x) ?? []), post.y].sort((a, b) => a - b)))
  const columns = new Set(clearedCells.map((cell) => cell.x))
  for (const x of columns) {
    const bounds = [-1, ...(byColumn.get(x) ?? []), board.length]
    for (let segment = 0; segment < bounds.length - 1; segment += 1) {
      const start = bounds[segment] + 1
      const end = bounds[segment + 1] - 1
      if (!clearedCells.some((cell) => cell.x === x && cell.y >= start && cell.y <= end)) continue
      const tiles = board.slice(start, end + 1).map((row) => row[x]).filter((tile): tile is DropTile => tile !== null)
      for (let y = start; y <= end; y += 1) next[y][x] = null
      for (let y = end; y >= start; y -= 1) next[y][x] = tiles.pop() ?? null
    }
  }
  return next
}

function bag(tileTypes: string[], random: () => number): string[] {
  const cats: string[] = tileTypes.flatMap((cat) => [cat, cat, cat])
  for (let i = cats.length - 1; i > 0; i -= 1) {
    const sample = random()
    const j = Math.max(0, Math.min(i, Math.floor((Number.isFinite(sample) ? sample : 0) * (i + 1))))
    ;[cats[i], cats[j]] = [cats[j], cats[i]]
  }
  return cats
}

function getNextQueue(state: DropState, random: () => number): { next: CatToken; queue: CatToken[] } {
  const queue = state.queue.length
    ? state.queue.map((type, index) => ({ type, trait: state.queueTraits[index] ?? 'none' as CatTrait }))
    : bag(state.tileTypes, random).map((type) => ({ type, trait: 'none' as CatTrait }))
  return { next: queue.shift()!, queue }
}

function hasLegalDrop(state: DropState): boolean {
  return Array.from({ length: state.width }, (_, input) => {
    const resolved = resolveDropColumn(state, input)
    return resolved !== undefined && !isDropRouteBlocked(state, input, resolved)
      && landingRow(state.board, resolved, state.scratchPosts.filter((post) => post.hp > 0)) >= 0
  }).some(Boolean)
}

export function dropCat(state: DropState, requestedColumn: number, random: () => number = Math.random): DropResult {
  const resolvedColumn = resolveDropColumn(state, requestedColumn)
  if (state.phase !== 'playing' || resolvedColumn === undefined || isDropRouteBlocked(state, requestedColumn, resolvedColumn)) {
    return { accepted: false, state, landed: state.board, waves: [] }
  }
  const y = landingRow(state.board, resolvedColumn, state.scratchPosts.filter((post) => post.hp > 0))
  if (y < 0) return { accepted: false, state, landed: state.board, waves: [], resolvedColumn }

  let board = cloneBoard(state.board)
  board[y][resolvedColumn] = { id: state.nextId, type: state.current, trait: state.currentTrait }
  const landed = cloneBoard(board)
  const waves: DropWave[] = []
  let scratchPosts = clonePosts(state.scratchPosts)
  let fishTreats = cloneTreats(state.fishTreats)
  let cleared = state.cleared
  let score = state.score
  while (true) {
    const cells = findDropMatches(board)
    if (!cells.length) break
    const before = cloneBoard(board)
    const effects = resolveWaveEffects(before, cells, scratchPosts, fishTreats)
    const damagedScratchPosts = scratchPosts.filter((post) => effects.damagedScratchPostIds.includes(post.id)).map((post) => ({ ...post }))
    const collectedFishTreats = fishTreats.filter((treat) => effects.collectedFishTreatIds.includes(treat.id)).map((treat) => ({ ...treat }))
    const traitEffects = cells.flatMap((cell) => {
      const trait = before[cell.y]?.[cell.x]?.trait
      return trait && trait !== 'none' ? [{ cell, trait }] : []
    })
    cells.forEach(({ x, y: cellY }) => { board[cellY][x] = null })
    scratchPosts = effects.scratchPosts
    fishTreats = effects.fishTreats
    board = gravity(board, cells, scratchPosts)
    const combo = waves.length + 1
    const points = cells.length * 10 * combo
    waves.push({
      board: before,
      after: cloneBoard(board),
      cells,
      combo,
      points,
      damagedScratchPostIds: effects.damagedScratchPostIds,
      collectedFishTreatIds: effects.collectedFishTreatIds,
      damagedScratchPosts,
      collectedFishTreats,
      traitEffects
    })
    cleared += cells.length
    score += points
  }

  const preview = getNextQueue(state, random)
  const progress = getDropProgress(cleared, scratchPosts, fishTreats, state.totalFishTreats)
  const overflow = board[0].some(Boolean)
  const completed = hasCompletedDropObjectives(state.goals, progress)
  const failedByCeiling = overflow
  let phase: DropState['phase'] = failedByCeiling ? 'failed' : completed ? 'completed' : 'playing'
  const nextPatrol = phase === 'playing' ? advancePatrol(state.patrol) : state.patrol && { ...state.patrol, columns: [...state.patrol.columns] }
  const patrolMoved = Boolean(state.patrol && nextPatrol && nextPatrol.index !== state.patrol.index)
  let failureReason: DropFailureReason | undefined = failedByCeiling ? 'ceiling' : undefined
  if (phase === 'playing' && state.patrol && !hasLegalDrop({ ...state, board, scratchPosts, patrol: nextPatrol })) {
    phase = 'failed'
    failureReason = 'no-route'
  }
  const nextState: DropState = {
    ...state,
    board,
    current: state.next,
    currentTrait: state.nextTrait,
    next: preview.next.type,
    nextTrait: preview.next.trait,
    queue: preview.queue.map((item) => item.type),
    queueTraits: preview.queue.map((item) => item.trait),
    nextId: state.nextId + 1,
    moves: state.moves + 1,
    cleared,
    score,
    bestCombo: Math.max(state.bestCombo, waves.length),
    phase,
    scratchPosts,
    fishTreats,
    patrol: nextPatrol,
    progress,
    holdLocked: false
  }
  return { accepted: true, state: nextState, landed, waves, resolvedColumn, routed: resolvedColumn !== requestedColumn, failureReason, patrolMoved }
}
