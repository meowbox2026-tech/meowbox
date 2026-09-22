import { arrangeCats, resolvePlanning, type Placement, type PlanningLevel, type PlanningResult } from '../core/planningEngine'

export interface PlanningState {
  puzzle: PlanningLevel
  placements: Placement[]
  selected: number | undefined
  phase: 'editing' | 'running' | 'failed' | 'completed'
  failures: number
  retries: number
  undoUses: number
  hintUses: number
  hintCell?: Placement
  completedWaves: number
  frame: number
  result?: PlanningResult
}
export type PlanningAction = { type: 'select' | 'remove'; id: number } | { type: 'place'; x: number; y: number }
  | { type: 'undo' | 'clear' | 'hint' | 'start' | 'tick' | 'edit' | 'ad-retry' | 'ad-undo' | 'restart' }

export const freshPlanning = (level: PlanningLevel): PlanningState => ({
  puzzle: level, placements: [], selected: level.cats[0]?.id, phase: 'editing',
  failures: 0, retries: 2, undoUses: 1, hintUses: 1, completedWaves: 0, frame: 0
})

export function stoppedBoard(state: PlanningState) {
  return state.result?.frames.at(-1)?.board ?? arrangeCats(state.puzzle, state.placements)!
}

export function canResumePlanning(state: PlanningState): boolean {
  const ownIds = new Set(state.puzzle.cats.map(cat => cat.id))
  return state.phase === 'failed' && stoppedBoard(state).some(row => row.some(cat => cat && ownIds.has(cat.id)))
}

function resume(state: PlanningState, ad: boolean): PlanningState {
  if (!canResumePlanning(state) || (ad ? state.retries !== 0 : state.retries <= 0)) return state
  const stopped = stoppedBoard(state)
  const survivors = new Set(stopped.flat().filter(cat => cat !== null).map(cat => cat.id))
  const cats = state.puzzle.cats.filter(cat => survivors.has(cat.id))
  const ownIds = new Set(cats.map(cat => cat.id))
  // Keep original cats at their stopping positions; never resurrect eliminated cats.
  const board = stopped.map(row => row.map(cat => cat && !ownIds.has(cat.id) ? { ...cat } : null))
  const placements = state.placements.filter(p => ownIds.has(p.catId)).map(p => {
    const y = stopped.findIndex(row => row.some(cat => cat?.id === p.catId))
    return { catId: p.catId, y, x: stopped[y].findIndex(cat => cat?.id === p.catId) }
  })
  return {
    ...state, puzzle: { ...state.puzzle, board, cats }, placements, selected: undefined,
    phase: 'editing', retries: ad ? 0 : state.retries - 1,
    completedWaves: state.completedWaves + (state.result?.waves ?? 0), result: undefined, frame: 0
  }
}

function finish(state: PlanningState): PlanningState {
  const won = state.result?.remaining === 0
  return { ...state, phase: won ? 'completed' : 'failed', failures: state.failures + (won ? 0 : 1) }
}

export function planningReducer(state: PlanningState, action: PlanningAction, original: PlanningLevel): PlanningState {
  if (action.type === 'restart') return freshPlanning(original)
  if (action.type === 'edit') return resume(state, false)
  if (action.type === 'ad-retry') return resume(state, true)
  if (action.type === 'tick' && state.phase === 'running') {
    return state.frame + 1 < state.result!.frames.length ? { ...state, frame: state.frame + 1 } : finish(state)
  }
  if (state.phase !== 'editing') return state
  if (action.type === 'ad-undo') return { ...state, undoUses: state.undoUses + 1 }
  const level = state.puzzle
  switch (action.type) {
    case 'select':
      return state
    case 'hint': {
      if (state.hintUses <= 0 || state.selected === undefined) return state
      const hintCell = level.solution.find(item => item.catId === state.selected)
      return hintCell ? { ...state, hintUses: state.hintUses - 1, hintCell: { ...hintCell } } : state
    }
    case 'remove':
      return state.undoUses > 0 && state.placements.at(-1)?.catId === action.id
        ? { ...state, placements: state.placements.slice(0, -1), selected: action.id, undoUses: state.undoUses - 1, hintCell: undefined } : state
    case 'undo':
      return state.undoUses > 0 && state.placements.length
        ? { ...state, selected: state.placements.at(-1)!.catId, placements: state.placements.slice(0, -1), undoUses: state.undoUses - 1, hintCell: undefined } : state
    case 'clear':
      return { ...state, placements: [], selected: level.cats[0]?.id, hintCell: undefined }
    case 'place': {
      if (state.selected === undefined) return state
      const placements = [...state.placements, { catId: state.selected, x: action.x, y: action.y }]
      if (!arrangeCats(level, placements)) return state
      return { ...state, placements, selected: level.cats[placements.length]?.id, hintCell: undefined }
    }
    case 'start': {
      if (state.placements.length !== level.cats.length) return state
      const board = arrangeCats(level, state.placements)
      if (!board) return state
      const next: PlanningState = { ...state, phase: 'running', frame: 0, hintCell: undefined, result: resolvePlanning(board) }
      return next.result!.frames.length ? next : finish(next)
    }
    default: return state
  }
}
