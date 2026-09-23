import { arrangeCats, resolvePlanning, type Placement, type PlanningLevel, type PlanningResult } from '../core/planningEngine'

export interface PlanningState {
  puzzle: PlanningLevel
  placements: Placement[]
  selected: number | undefined
  phase: 'editing' | 'running' | 'failed' | 'completed'
  failures: number
  undoUses: number
  hintUses: number
  hintCell?: Placement
  completedWaves: number
  frame: number
  result?: PlanningResult
}
export type PlanningAction = { type: 'select' | 'remove'; id: number } | { type: 'place'; x: number; y: number }
  | { type: 'undo' | 'clear' | 'hint' | 'start' | 'tick' | 'ad-undo' | 'restart' }

export const freshPlanning = (level: PlanningLevel): PlanningState => ({
  puzzle: level, placements: [], selected: level.cats[0]?.id, phase: 'editing',
  failures: 0, undoUses: 1, hintUses: 1, completedWaves: 0, frame: 0
})

function finish(state: PlanningState): PlanningState {
  const won = state.result?.remaining === 0
  return { ...state, phase: won ? 'completed' : 'failed', failures: state.failures + (won ? 0 : 1) }
}

export function planningReducer(state: PlanningState, action: PlanningAction, original: PlanningLevel): PlanningState {
  if (action.type === 'restart') return freshPlanning(original)
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
