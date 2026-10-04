import { canPlaceInDualBox, isDualBoxPortal } from './planningDualBox'
import { arrangeCats, resolvePlanning, type Placement, type PlanningLevel } from './planningEngine'
import type { DropBoard } from './dropEngine'

type SolvabilityWorkerRequest =
  | { kind: 'find-safe'; level: PlanningLevel; placements: Placement[] }
type SolvabilityWorkerResponse =
  | { kind: 'find-safe'; placement?: Placement }

interface SearchContext {
  level: PlanningLevel
  memo: Map<string, boolean>
}

export const PLANNING_CHECK_TIMEOUT_MS = 150

const copyBoard = (board: DropBoard): DropBoard => board.map(row => row.map(cat => cat && { ...cat }))

const prefixKey = (placements: Placement[]): string => placements.map(({ catId, x, y }) => `${catId}@${x},${y}`).join('|')

const isAuthoredPrefix = (level: PlanningLevel, placements: Placement[]): boolean => placements.every((placement, index) => {
  const authored = level.solution[index]
  return authored?.catId === placement.catId && authored.x === placement.x && authored.y === placement.y
})

function placeNext(board: DropBoard, level: PlanningLevel, placements: Placement[], x: number, y: number): DropBoard | undefined {
  if (board[y]?.[x] || isDualBoxPortal(level.dualBox, x, y)) return undefined
  const cat = level.cats[placements.length]
  if (!cat || !canPlaceInDualBox(level.dualBox, cat.homeBox, x)) return undefined
  const next = copyBoard(board)
  next[y][x] = { ...cat, placementOrder: placements.length + 1 }
  return next
}

function canComplete(board: DropBoard, placements: Placement[], context: SearchContext): boolean {
  const key = prefixKey(placements)
  const cached = context.memo.get(key)
  if (cached !== undefined) return cached
  if (placements.length === context.level.cats.length) {
    const solved = resolvePlanning(board, context.level.dualBox, context.level.gravityFlip, context.level.divider).remaining === 0
    context.memo.set(key, solved)
    return solved
  }

  // The authored route is a fast path, but not the only accepted route.
  if (isAuthoredPrefix(context.level, placements)) {
    const authoredBoard = arrangeCats(context.level, context.level.solution)
    if (authoredBoard && resolvePlanning(authoredBoard, context.level.dualBox, context.level.gravityFlip, context.level.divider).remaining === 0) {
      context.memo.set(key, true)
      return true
    }
  }

  const nextCat = context.level.cats[placements.length]
  for (let y = 0; y < context.level.height; y += 1) for (let x = 0; x < context.level.width; x += 1) {
    if (board[y][x]) continue
    const nextBoard = placeNext(board, context.level, placements, x, y)
    if (!nextBoard) continue
    const nextPlacements = [...placements, { catId: nextCat.id, x, y }]
    if (canComplete(nextBoard, nextPlacements, context)) {
      context.memo.set(key, true)
      return true
    }
  }

  context.memo.set(key, false)
  return false
}

/**
 * Returns true only when at least one complete placement sequence clears the
 * board under the same ordered resolver used by the game.
 */
export function canCompletePlanning(level: PlanningLevel, placements: Placement[]): boolean {
  const board = arrangeCats(level, placements)
  if (!board) return false
  return canComplete(board, placements, { level, memo: new Map() })
}

/** Finds a safe cell for the currently selected cat without assuming one unique answer. */
export function findSafePlacement(level: PlanningLevel, placements: Placement[]): Placement | undefined {
  const cat = level.cats[placements.length]
  if (!cat) return undefined
  if (knownCompletion(level, placements)) return level.solution[placements.length]
  const board = arrangeCats(level, placements)
  if (!board) return undefined
  for (let y = 0; y < level.height; y += 1) for (let x = 0; x < level.width; x += 1) {
    if (board[y][x]) continue
    const candidate = [...placements, { catId: cat.id, x, y }]
    if (canCompletePlanning(level, candidate)) return candidate.at(-1)
  }
  return undefined
}

function runSolvabilityWorker(request: SolvabilityWorkerRequest, signal?: AbortSignal): Promise<SolvabilityWorkerResponse | undefined> {
  if (typeof Worker === 'undefined' || signal?.aborted) return Promise.resolve(undefined)
  return new Promise((resolve) => {
    let worker: Worker
    try {
      worker = new Worker(new URL('./planningSolvability.worker.ts', import.meta.url), { type: 'module' })
    } catch {
      resolve(undefined)
      return
    }

    let settled = false
    const finish = (response: SolvabilityWorkerResponse | undefined) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      signal?.removeEventListener('abort', abort)
      worker.terminate()
      resolve(response)
    }
    const abort = () => finish(undefined)
    const timer = setTimeout(abort, PLANNING_CHECK_TIMEOUT_MS)
    worker.onmessage = (event: MessageEvent<SolvabilityWorkerResponse>) => finish(event.data)
    worker.onerror = () => finish(undefined)
    signal?.addEventListener('abort', abort, { once: true })
    worker.onmessageerror = abort
    try { worker.postMessage(request) } catch { finish(undefined) }
  })
}

/** Runs hint search off the UI thread so a dense level cannot freeze the board. */
export async function findSafePlacementAsync(level: PlanningLevel, placements: Placement[], signal?: AbortSignal): Promise<Placement | undefined> {
  if (signal?.aborted) return undefined
  if (knownCompletion(level, placements)) return level.solution[placements.length]
  const response = await runSolvabilityWorker({ kind: 'find-safe', level, placements }, signal)
  if (response?.kind === 'find-safe') return response.placement
  return undefined
}

/** A verified completion is positive evidence, never evidence against other routes. */
function knownCompletion(level: PlanningLevel, placements: Placement[]): boolean {
  const completion = [...placements, ...level.solution.slice(placements.length)]
  const board = arrangeCats(level, completion)
  return Boolean(board && resolvePlanning(board, level.dualBox, level.gravityFlip, level.divider).remaining === 0)
}
