import { arrangeCats, resolvePlanning, type Placement, type PlanningLevel, type PlanningResult } from '../core/planningEngine'
import { canCompletePlanning, findSafePlacement, shouldValidatePlacementImmediately } from '../core/planningSolvability'

export type PlanningFailureReason = 'placement' | 'resolution'

export interface PlanningState {
  puzzle: PlanningLevel
  placements: Placement[]
  selected: number | undefined
  phase: 'editing' | 'running' | 'failed' | 'completed'
  lives: number
  failures: number
  undoUses: number
  hintUses: number
  hintCell?: Placement
  validatingPlacement?: Placement
  pendingHint: boolean
  completedWaves: number
  frame: number
  result?: PlanningResult
  failureReason?: PlanningFailureReason
}
export type PlanningAction = { type: 'select' | 'remove'; id: number } | { type: 'place' | 'place-pending'; x: number; y: number }
  | { type: 'placement-result'; safe: boolean } | { type: 'hint-pending' } | { type: 'hint-result'; hintCell?: Placement }
  | { type: 'undo' | 'clear' | 'hint' | 'start' | 'tick' | 'restart' }

export const PLANNING_STARTING_LIVES = 3

export const freshPlanning = (level: PlanningLevel): PlanningState => ({
  puzzle: level, placements: [], selected: level.cats[0]?.id, phase: 'editing',
  lives: PLANNING_STARTING_LIVES, failures: 0, undoUses: 1, hintUses: 1, pendingHint: false, completedWaves: 0, frame: 0
})

function spendLife(state: PlanningState, failureReason: PlanningFailureReason): PlanningState {
  const lives = Math.max(0, state.lives - 1)
  const failures = state.failures + 1
  const reset = {
    ...state,
    lives,
    failures,
    placements: [],
    selected: state.puzzle.cats[0]?.id,
    undoUses: 1,
    hintCell: undefined,
    validatingPlacement: undefined,
    pendingHint: false,
    completedWaves: 0,
    frame: 0,
    result: undefined,
    failureReason
  }
  if (lives === 0 && failureReason === 'resolution') return { ...state, phase: 'failed', lives, failures, failureReason }
  if (lives === 0) return { ...reset, phase: 'failed' }
  return { ...reset, phase: 'editing' }
}

function finish(state: PlanningState): PlanningState {
  const won = state.result?.remaining === 0
  return won ? { ...state, phase: 'completed', failureReason: undefined } : spendLife(state, 'resolution')
}

export function planningReducer(state: PlanningState, action: PlanningAction, original: PlanningLevel): PlanningState {
  if (action.type === 'restart') return freshPlanning(original)
  if (action.type === 'tick' && state.phase === 'running') {
    return state.frame + 1 < state.result!.frames.length ? { ...state, frame: state.frame + 1 } : finish(state)
  }
  if (state.phase !== 'editing') return state
  const level = state.puzzle
  switch (action.type) {
    case 'select':
      return state
    case 'hint': {
      if (state.validatingPlacement || state.pendingHint) return state
      if (state.hintUses <= 0 || state.selected === undefined) return state
      const hintCell = shouldValidatePlacementImmediately(level)
        ? findSafePlacement(level, state.placements)
        : level.solution.find(item => item.catId === state.selected)
      return hintCell ? { ...state, hintUses: state.hintUses - 1, hintCell: { ...hintCell } } : state
    }
    case 'hint-pending':
      return state.validatingPlacement || state.pendingHint || state.hintUses <= 0 || state.selected === undefined
        ? state
        : { ...state, pendingHint: true, hintCell: undefined }
    case 'hint-result':
      if (!state.pendingHint) return state
      return action.hintCell
        ? { ...state, pendingHint: false, hintUses: state.hintUses - 1, hintCell: { ...action.hintCell } }
        : { ...state, pendingHint: false }
    case 'remove':
      if (state.validatingPlacement || state.pendingHint) return state
      return state.undoUses > 0 && state.placements.at(-1)?.catId === action.id
        ? { ...state, placements: state.placements.slice(0, -1), selected: action.id, undoUses: state.undoUses - 1, hintCell: undefined, failureReason: undefined } : state
    case 'undo':
      if (state.validatingPlacement || state.pendingHint) return state
      return state.undoUses > 0 && state.placements.length
        ? { ...state, selected: state.placements.at(-1)!.catId, placements: state.placements.slice(0, -1), undoUses: state.undoUses - 1, hintCell: undefined, failureReason: undefined } : state
    case 'clear':
      if (state.validatingPlacement || state.pendingHint) return state
      return { ...state, placements: [], selected: level.cats[0]?.id, hintCell: undefined, failureReason: undefined }
    case 'place-pending': {
      if (state.validatingPlacement || state.pendingHint || state.selected === undefined) return state
      const placement = { catId: state.selected, x: action.x, y: action.y }
      return arrangeCats(level, [...state.placements, placement])
        ? { ...state, validatingPlacement: placement, hintCell: undefined, failureReason: undefined }
        : state
    }
    case 'placement-result': {
      if (!state.validatingPlacement) return state
      if (!action.safe) return spendLife(state, 'placement')
      const placements = [...state.placements, state.validatingPlacement]
      return { ...state, validatingPlacement: undefined, placements, selected: level.cats[placements.length]?.id, hintCell: undefined, failureReason: undefined }
    }
    case 'place': {
      if (state.validatingPlacement || state.pendingHint) return state
      if (state.selected === undefined) return state
      const placements = [...state.placements, { catId: state.selected, x: action.x, y: action.y }]
      if (!arrangeCats(level, placements)) return state
      if (shouldValidatePlacementImmediately(level) && !canCompletePlanning(level, placements)) {
        return spendLife(state, 'placement')
      }
      return { ...state, placements, selected: level.cats[placements.length]?.id, hintCell: undefined, failureReason: undefined }
    }
    case 'start': {
      if (state.validatingPlacement || state.pendingHint) return state
      if (state.placements.length !== level.cats.length) return state
      const board = arrangeCats(level, state.placements)
      if (!board) return state
      const next: PlanningState = { ...state, phase: 'running', frame: 0, hintCell: undefined, failureReason: undefined, result: resolvePlanning(board) }
      return next.result!.frames.length ? next : finish(next)
    }
    default: return state
  }
}
