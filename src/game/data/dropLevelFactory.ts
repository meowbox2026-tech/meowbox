import type { CatAsset } from '../types'
import { createDropState, dropCat, findDropMatches, type DropBoard, type DropState } from '../core/dropEngine'
import type { CatToken, CatTrait, CatTunnel, DropPatrol, FishTreat, ScratchPost } from '../core/dropTypes'
import type { DropLevelDefinition, DropLevelTableRow } from './dropLevelTypes'

export const ALL_DROP_CATS: CatAsset[] = [
  'arrogant', 'sunny', 'fishLover', 'orange', 'white', 'blue',
  'alone', 'sleeping', 'box', 'mischievous', 'boss', 'sticky'
]

export function createSeededRandom(seed: number): () => number {
  let state = (seed ^ 0x9e3779b9) >>> 0
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 0x100000000
  }
}

export function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]]
  }
  return shuffled
}

function cellKey(x: number, y: number): string { return `${x}:${y}` }

function safeColumns(row: DropLevelTableRow, posts: ScratchPost[]): number[] {
  if (posts.length) return [...new Set(posts.map((post) => (post.x + row.width - 1) % row.width))]
  return Array.from({ length: Math.min(3, row.width - 1) }, (_, index) => index)
}

function chooseAssets(row: DropLevelTableRow, variant: number): CatAsset[] {
  const start = (row.id * 3 + variant * 5) % ALL_DROP_CATS.length
  const rotated = [...ALL_DROP_CATS.slice(start), ...ALL_DROP_CATS.slice(0, start)]
  return rotated.slice(0, row.kinds)
}

function createScratchPosts(row: DropLevelTableRow, variant: number): ScratchPost[] {
  const total = row.scratchSingle + row.scratchDouble
  const posts: ScratchPost[] = []
  const used = new Set<string>()
  for (let index = 0; index < total; index += 1) {
    const x = (index % Math.min(3, Math.floor(row.width / 2))) * 2 + 1
    const y = row.height - 1 - Math.floor(index / Math.min(3, Math.floor(row.width / 2)))
    if (used.has(cellKey(x, y))) continue
    used.add(cellKey(x, y))
    posts.push({ id: `scratch-${row.id}-${variant}-${index}`, x, y, hp: index < row.scratchSingle ? 1 : 2 })
  }
  return posts
}

function createFishTreats(row: DropLevelTableRow, variant: number, posts: ScratchPost[], tunnels: CatTunnel[], board: DropBoard): FishTreat[] {
  const blocked = new Set([
    ...posts.map((post) => cellKey(post.x, post.y)),
    ...board.flatMap((line, y) => line.flatMap((tile, x) => tile ? [cellKey(x, y)] : []))
  ])
  const tunnelColumns = new Set(tunnels.flatMap((tunnel) => [tunnel.entryColumn, tunnel.exitColumn]))
  const safe = safeColumns(row, posts)
  const nonTunnel = Array.from({ length: row.width }, (_, column) => column).filter((column) => !tunnelColumns.has(column))
  // Prefer columns beside a scratch post, but include every non-tunnel column
  // so several treats do not form an unreachable vertical stack.
  const available = [...new Set([...safe, ...nonTunnel])].filter((column) => !tunnelColumns.has(column))
  const candidateCells = Array.from({ length: Math.min(3, row.height) }, (_, rowFromBottom) => row.height - 1 - rowFromBottom)
    .flatMap((y) => available.map((x) => ({ x, y })))
  const offset = available.length ? (variant * 3) % available.length : 0
  const rotatedCells = [...candidateCells.slice(offset), ...candidateCells.slice(0, offset)]
  const treats: FishTreat[] = []
  for (let index = 0; index < row.fish; index += 1) {
    const preferred = rotatedCells.find((cell) => !blocked.has(cellKey(cell.x, cell.y))
      && !treats.some((treat) => treat.x === cell.x && treat.y === cell.y)
    )
    if (preferred) treats.push({ id: `fish-${row.id}-${variant}-${index}`, ...preferred })
  }
  return treats
}

function createTunnels(row: DropLevelTableRow, variant: number): CatTunnel[] {
  const pairs: Array<[number, number]> = [[0, row.width - 1], [2, row.width - 3], [1, row.width - 2]]
  return pairs.slice(0, row.tunnels).map(([entryColumn, exitColumn], index) => {
    const shift = (variant + index) % 2 === 0 ? 0 : 1
    return {
      id: `tunnel-${row.id}-${variant}-${index}`,
      entryColumn: (entryColumn + shift) % row.width,
      exitColumn: (exitColumn + shift) % row.width
    }
  })
}

function createPatrol(row: DropLevelTableRow, variant: number): DropPatrol | undefined {
  if (!row.patrol) return undefined
  const columns = [0, Math.floor(row.width / 2), row.width - 1]
  const shift = variant % columns.length
  return { columns: [...columns.slice(shift), ...columns.slice(0, shift)], index: 0, dropsUntilMove: 4 }
}

export function createInitialBoard(row: DropLevelTableRow, assets: CatAsset[], posts: ScratchPost[], seed: number): DropBoard {
  const blocked = new Set(posts.map((post) => cellKey(post.x, post.y)))
  const reserved = new Set(safeColumns(row, posts))
  const positions = Array.from({ length: row.height * row.width }, (_, index) => ({
    x: index % row.width,
    y: row.height - 1 - Math.floor(index / row.width)
  })).filter((cell) => !blocked.has(cellKey(cell.x, cell.y)) && !reserved.has(cell.x) && cell.y > 0)
  for (let attempt = 0; attempt < 32; attempt += 1) {
    const board: DropBoard = Array.from({ length: row.height }, () => Array(row.width).fill(null))
    positions.slice(0, row.initialCats).forEach((position) => {
      const type = assets[(position.x + position.y * 2 + seed + attempt * 3) % assets.length]
      board[position.y][position.x] = { id: position.y * row.width + position.x + 1, type }
    })
    if (findDropMatches(board).length === 0) return board
  }
  throw new Error(`Unable to place ${row.initialCats} cats for level ${row.id}.`)
}

function traitAt(row: DropLevelTableRow, index: number, variant: number): CatTrait {
  if (row.id === 46 && index === 0) return 'scratch'
  if (row.id === 61 && index === 0) return 'hungry'
  const hasScratch = row.scratchSingle + row.scratchDouble > 0 && row.id >= 46
  const hasHungry = row.fish > 0 && row.id >= 61
  if (!hasScratch && !hasHungry) return 'none'
  if ((index + row.id + variant) % 10 !== 0) return 'none'
  if (hasScratch && hasHungry) return (index + variant) % 2 === 0 ? 'scratch' : 'hungry'
  return hasScratch ? 'scratch' : 'hungry'
}

function createTokens(row: DropLevelTableRow, assets: CatAsset[], variant: number): CatToken[] {
  const random = createSeededRandom(row.id * 97 + variant * 811)
  // Keep a generous, authored tail so a player can recover from a few
  // non-clearing drops without relying on a run-time solver. Each shuffled
  // cycle contains every authored cat once, so the first 2N tokens already
  // cover all N types without falling into a fixed ABC template.
  const tokenCount = Math.ceil((row.rescued + 90) / assets.length) * assets.length
  const tokens: CatToken[] = []
  const leadOrder = shuffle(assets, random)
  const leadCounts = new Map(leadOrder.map((type) => [type, 1]))
  const doubleGroups = Math.floor(assets.length / 2)
  for (let index = 0; index < doubleGroups; index += 1) leadCounts.set(leadOrder[index], 3)
  if (assets.length % 2 === 1) leadCounts.set(leadOrder[doubleGroups], 2)
  for (const type of leadOrder) {
    for (let copy = 0; copy < (leadCounts.get(type) ?? 1); copy += 1) {
      tokens.push({ type, trait: traitAt(row, tokens.length, variant) })
    }
  }
  let previousType = tokens.at(-1)?.type
  while (tokens.length < tokenCount) {
    const order = shuffle(assets, random)
    const firstDifferent = order.findIndex((type) => type !== previousType)
    if (firstDifferent > 0) {
      ;[order[0], order[firstDifferent]] = [order[firstDifferent], order[0]]
    }
    for (const type of order) {
      for (let copy = 0; copy < 3 && tokens.length < tokenCount; copy += 1) {
        tokens.push({ type, trait: traitAt(row, tokens.length, variant) })
      }
    }
    previousType = tokens.at(-1)?.type
  }
  return tokens
}

function stateForLevel(row: DropLevelTableRow, assets: CatAsset[], board: DropBoard, posts: ScratchPost[], fish: FishTreat[], tunnels: CatTunnel[], patrol: DropPatrol | undefined, tokens: CatToken[]): DropState {
  return createDropState({
    width: row.width,
    height: row.height,
    tileTypes: assets,
    board,
    currentToken: tokens[0],
    nextToken: tokens[1],
    queueTokens: tokens.slice(2),
    target: row.rescued,
    scratchPosts: posts,
    fishTreats: fish,
    tunnels,
    patrol,
    goals: { rescued: row.rescued, scratchPosts: posts.length, fishTreats: fish.length },
    holdUses: row.id >= 41 ? 2 : 0,
    previewCount: row.id >= 76 ? 4 : row.id >= 31 ? 3 : 2
  })
}

function objectiveColumns(state: DropState): number[] {
  const columns = [
    ...state.scratchPosts.filter((post) => post.hp > 0).flatMap((post) => [
      (post.x + state.width - 1) % state.width,
      (post.x + 1) % state.width
    ]),
    ...state.fishTreats.map((treat) => treat.x),
    ...(state.scratchPosts.length ? state.scratchPosts.map((post) => (post.x + state.width - 1) % state.width) : [0, 1, 2])
  ]
  return columns.filter((column, index) => column >= 0 && column < state.width && columns.indexOf(column) === index)
}

function simulateDrops(state: DropState, column: number, count: number): { state: DropState; moves: number[] } | undefined {
  let next = state
  const moves: number[] = []
  for (let index = 0; index < count && next.phase === 'playing'; index += 1) {
    const result = dropCat(next, column, () => 0.5)
    if (!result.accepted || result.state.phase === 'failed') return undefined
    moves.push(column)
    next = result.state
  }
  return { state: next, moves }
}

interface PlannedPath {
  state: DropState
  moves: number[]
}

function findGreedyWitness(initial: DropState): PlannedPath {
  let state = initial
  const moves: number[] = []
  for (let step = 0; step < 260 && state.phase === 'playing'; step += 1) {
    const preferred = objectiveColumns(state)
    const columns = [...preferred, ...Array.from({ length: state.width }, (_, column) => column).filter((column) => !preferred.includes(column))]
    const candidates = columns.map((column) => {
      const simulated = simulateDrops(state, column, 3)
      if (!simulated) return undefined
      const heights = simulated.state.board[0].map((_, x) => simulated.state.board.filter((row) => row[x]).length)
      return {
        column,
        state: simulated.state,
        moves: simulated.moves,
        objectiveGain: (simulated.state.progress.scratchPosts - state.progress.scratchPosts) * 5000
          + (simulated.state.progress.fishTreats - state.progress.fishTreats) * 5000
          + (simulated.state.cleared - state.cleared) * 10,
        preferred: preferred.indexOf(column) < 0 ? 999 : preferred.indexOf(column),
        height: Math.max(...heights)
      }
    }).filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate))
    candidates.sort((a, b) => b.objectiveGain - a.objectiveGain || a.preferred - b.preferred || a.height - b.height)
    if (candidates[0]) {
      state = candidates[0].state
      moves.push(...candidates[0].moves)
      continue
    }

    const single = columns.map((column) => ({ column, simulated: simulateDrops(state, column, 1) }))
      .find((candidate) => candidate.simulated)
    if (!single?.simulated) break
    state = single.simulated.state
    moves.push(...single.simulated.moves)
  }
  return { state, moves }
}

function findWitness(initial: DropState): number[] {
  const greedy = findGreedyWitness(initial)
  if (greedy.state.phase === 'completed') return greedy.moves
  return findBeamWitness(initial) ?? greedy.moves
}

interface SearchNode {
  state: DropState
  moves: number[]
}

function stateSignature(state: DropState): string {
  const board = state.board.flat().map((tile) => tile ? `${tile.type}:${tile.trait ?? 'none'}` : '_').join(',')
  const posts = state.scratchPosts.map((post) => `${post.id}:${post.hp}`).join(',')
  const fish = state.fishTreats.map((treat) => treat.id).join(',')
  const patrol = state.patrol ? `${state.patrol.index}:${state.patrol.dropsUntilMove}` : '-'
  return `${state.moves}|${state.current}:${state.currentTrait}|${state.next}:${state.nextTrait}|${state.queue.join(',')}|${state.queueTraits.join(',')}|${board}|${posts}|${fish}|${patrol}`
}

function searchScore(state: DropState): number {
  const heights = state.board[0].map((_, x) => state.board.filter((row) => row[x]).length)
  const heightPenalty = Math.max(...heights) * 24 + heights.reduce((sum, height) => sum + height * height, 0)
  return state.progress.scratchPosts * 10000
    + state.progress.fishTreats * 10000
    + state.progress.rescued * 10
    - heightPenalty
}

/** Small deterministic beam fallback for layouts where the greedy planner reaches a dead end. */
function findBeamWitness(initial: DropState): number[] | undefined {
  let frontier: SearchNode[] = [{ state: initial, moves: [] }]
  for (let depth = 0; depth < 240 && frontier.length; depth += 1) {
    const candidates: SearchNode[] = []
    for (const node of frontier) {
      const preferred = objectiveColumns(node.state)
      const columns = [...preferred, ...Array.from({ length: node.state.width }, (_, column) => column).filter((column) => !preferred.includes(column))]
      for (const column of columns) {
        const result = dropCat(node.state, column, () => .5)
        if (!result.accepted || result.state.phase === 'failed') continue
        const next: SearchNode = { state: result.state, moves: [...node.moves, column] }
        if (result.state.phase === 'completed') return next.moves
        candidates.push(next)
      }
    }
    candidates.sort((first, second) => searchScore(second.state) - searchScore(first.state) || first.moves.length - second.moves.length)
    const seen = new Set<string>()
    frontier = candidates.filter((candidate) => {
      const signature = stateSignature(candidate.state)
      if (seen.has(signature)) return false
      seen.add(signature)
      return true
    }).slice(0, 24)
  }
  return undefined
}

export function createTravelLevel(row: DropLevelTableRow, name: string, world: 2 | 3, variant: number): DropLevelDefinition {
  const seed = row.id * 1009 + variant * 7919
  const tileAssets = chooseAssets(row, variant)
  const scratchPosts = createScratchPosts(row, variant)
  const tunnels = createTunnels(row, variant)
  const patrol = createPatrol(row, variant)
  const initialBoard = createInitialBoard(row, tileAssets, scratchPosts, seed)
  const fishTreats = createFishTreats(row, variant, scratchPosts, tunnels, initialBoard)
  const tokens = createTokens(row, tileAssets, variant)
  // Solve against a neutral token stream so traits remain optional power, never
  // a hidden prerequisite for the authored route.
  const neutralTokens = tokens.map((item) => ({ ...item, trait: 'none' as const }))
  const witness = findWitness(stateForLevel(row, tileAssets, initialBoard, scratchPosts, fishTreats, tunnels, patrol, neutralTokens))
  return {
    id: row.id,
    world,
    name,
    width: row.width,
    height: row.height,
    tileAssets,
    timeLimit: row.seconds,
    target: row.rescued,
    initialRows: Math.ceil((row.initialCats + scratchPosts.length + fishTreats.length) / row.width),
    initialCatCount: row.initialCats,
    seed,
    threeStarMoves: Math.ceil(Math.max(1, witness.length) * 1.15),
    twoStarMoves: Math.ceil(Math.max(1, witness.length) * 1.35),
    previewCount: world === 3 && row.id >= 76 ? 4 : 3,
    tutorial: row.id === 31 || row.id === 36 || row.id === 41 || row.id === 46 || row.id === 51 || row.id === 61 || row.id === 71 || row.id === 76
      ? `mechanic-${row.id}` : undefined,
    initialBoard,
    initialCurrent: tokens[0].type as CatAsset,
    initialCurrentTrait: tokens[0].trait,
    initialNext: tokens[1].type as CatAsset,
    initialNextTrait: tokens[1].trait,
    initialQueue: tokens.slice(2).map((item) => item.type as CatAsset),
    initialQueueTraits: tokens.slice(2).map((item) => item.trait),
    scratchPosts,
    fishTreats,
    tunnels,
    patrol,
    goals: { rescued: row.rescued, scratchPosts: scratchPosts.length, fishTreats: fishTreats.length },
    holdUses: row.id >= 41 ? 2 : 0,
    variant,
    variantCount: 3,
    witness
  }
}
