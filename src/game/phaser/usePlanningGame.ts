import { useEffect, useReducer } from 'react'
import { usePageSuspended } from '../../app/usePageSuspended'
import { arrangeCats } from '../core/planningEngine'
import { getPlanningLevel } from '../data/planningLevels'
import { canResumePlanning, freshPlanning, planningReducer, type PlanningState, type PlanningAction } from './planningState'

export function usePlanningGame(paused: boolean, levelId = 1) {
  const level = getPlanningLevel(levelId)
  const [state, dispatch] = useReducer(
    (current: PlanningState, action: PlanningAction) => planningReducer(current, action, level),
    undefined,
    () => freshPlanning(level)
  )
  const hidden = usePageSuspended()
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
    level, state, dispatch, board: frame?.board ?? arranged, cats: state.puzzle.cats,
    clearing: frame?.clearing ?? [], wave: state.completedWaves + (frame?.wave ?? 0),
    canResume: canResumePlanning(state), hidden
  }
}
