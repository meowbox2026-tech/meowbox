import { EXPANDED_DUAL_BOX_LEVELS } from '../data/planningDualBoxExpanded'
import { DUAL_BOX_WORLD_2 } from '../data/planningDualBoxWorld2'
import { getTransferFrameDuration } from './planningTransferTiming'
import { useCallback, useEffect, useReducer } from 'react'
import { usePageSuspended } from '../../app/usePageSuspended'
import { arrangeCats } from '../core/planningEngine'
import { findSafePlacementAsync } from '../core/planningSolvability'
import { getPlanningLevel } from '../data/planningLevels'
import { freshPlanning, planningReducer, type PlanningState, type PlanningAction } from './planningState'

export function usePlanningGame(paused: boolean, levelId = 1, previewMode = false) {
  const level = (previewMode ? DUAL_BOX_WORLD_2.get(levelId) : undefined)
    ?? (previewMode ? EXPANDED_DUAL_BOX_LEVELS.get(levelId) : undefined)
    ?? getPlanningLevel(levelId)
  const [state, dispatch] = useReducer(
    (current: PlanningState, action: PlanningAction) => planningReducer(current, action, level),
    undefined,
    () => freshPlanning(level)
  )
  const send = useCallback((action: PlanningAction) => {
    if (action.type === 'hint') {
      dispatch({ type: 'hint-pending' })
      return
    }
    dispatch(action)
  }, [level])
  const hidden = usePageSuspended()
  useEffect(() => {
    if (!state.pendingHint || hidden) return
    const controller = new AbortController()
    void findSafePlacementAsync(level, state.placements, controller.signal).then(hintCell => {
      if (!controller.signal.aborted) dispatch({ type: 'hint-result', hintCell })
    }).catch(() => {
      if (!controller.signal.aborted) dispatch({ type: 'hint-result' })
    })
    return () => controller.abort()
  }, [level, state.pendingHint, state.placements, hidden])
  useEffect(() => {
    if (state.phase !== 'running' || paused || hidden) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const clearing = state.result!.frames[state.frame].clearing.length > 0
    const transferring = Boolean(state.result!.frames[state.frame].transfers?.length)
    const timer = window.setTimeout(() => dispatch({ type: 'tick' }), reduced ? 120 : (state.result!.frames[state.frame].flipped || state.result!.frames[state.frame].dividerOpened) ? 1400 : transferring ? getTransferFrameDuration(state.result!.frames[state.frame].transfers!.length) : clearing ? 400 : 300)
    return () => window.clearTimeout(timer)
  }, [state.phase, state.frame, paused, hidden])
  const arranged = arrangeCats(state.puzzle, state.placements)!
  const frame = state.result?.frames[state.frame]
  return {
    level, state, dispatch: send, dividerClosed: frame?.dividerClosed ?? Boolean(level.divider), dividerOpened: frame?.dividerOpened ?? false, gravity: frame?.gravity ?? 'down', flipped: frame?.flipped ?? false, board: frame?.board ?? arranged, cats: state.puzzle.cats,
    transfers: frame?.transfers ?? [], clearing: frame?.clearing ?? [], wave: state.completedWaves + (frame?.wave ?? 0),
    hidden
  }
}
