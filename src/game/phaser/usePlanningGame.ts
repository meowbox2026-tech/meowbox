import { useCallback, useEffect, useReducer } from 'react'
import { usePageSuspended } from '../../app/usePageSuspended'
import { arrangeCats } from '../core/planningEngine'
import { canCompletePlanningAsync, findSafePlacementAsync, shouldValidatePlacementImmediately } from '../core/planningSolvability'
import { getPlanningLevel } from '../data/planningLevels'
import { freshPlanning, planningReducer, type PlanningState, type PlanningAction } from './planningState'

export function usePlanningGame(paused: boolean, levelId = 1) {
  const level = getPlanningLevel(levelId)
  const [state, dispatch] = useReducer(
    (current: PlanningState, action: PlanningAction) => planningReducer(current, action, level),
    undefined,
    () => freshPlanning(level)
  )
  const send = useCallback((action: PlanningAction) => {
    if (action.type === 'place' && shouldValidatePlacementImmediately(level)) {
      dispatch({ type: 'place-pending', x: action.x, y: action.y })
      return
    }
    if (action.type === 'hint') {
      dispatch({ type: 'hint-pending' })
      return
    }
    dispatch(action)
  }, [level])
  const hidden = usePageSuspended()
  useEffect(() => {
    if (!state.validatingPlacement) return
    const controller = new AbortController()
    const placements = [...state.placements, state.validatingPlacement]
    void canCompletePlanningAsync(level, placements, controller.signal).then(safe => {
      if (!controller.signal.aborted) dispatch({ type: 'placement-result', safe: safe !== false })
    }).catch(() => {
      if (!controller.signal.aborted) dispatch({ type: 'placement-result', safe: true })
    })
    return () => controller.abort()
  }, [level, state.placements, state.validatingPlacement])
  useEffect(() => {
    if (!state.pendingHint) return
    const controller = new AbortController()
    void findSafePlacementAsync(level, state.placements, controller.signal).then(hintCell => {
      if (!controller.signal.aborted) dispatch({ type: 'hint-result', hintCell })
    }).catch(() => {
      if (!controller.signal.aborted) dispatch({ type: 'hint-result' })
    })
    return () => controller.abort()
  }, [level, state.pendingHint, state.placements])
  useEffect(() => {
    if (state.phase !== 'running' || paused || hidden) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const clearing = state.result!.frames[state.frame].clearing.length > 0
    const timer = window.setTimeout(() => dispatch({ type: 'tick' }), reduced ? 120 : clearing ? 400 : 300)
    return () => window.clearTimeout(timer)
  }, [state.phase, state.frame, paused, hidden])
  const arranged = arrangeCats(state.puzzle, state.placements)!
  const frame = state.result?.frames[state.frame]
  return {
    level, state, dispatch: send, board: frame?.board ?? arranged, cats: state.puzzle.cats,
    clearing: frame?.clearing ?? [], wave: state.completedWaves + (frame?.wave ?? 0),
    hidden
  }
}
