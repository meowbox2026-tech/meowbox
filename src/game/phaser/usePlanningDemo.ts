import { useEffect, useState } from 'react'
import type { PlanningLevel } from '../core/planningEngine'
import type { PlanningAction } from './planningState'

export const DEMO_PLACEMENT_MS = 1000

/** One visible placement per second; pause and hidden-page states suspend the demo. */
export function usePlanningDemo(level: PlanningLevel, placed: number, suspended: boolean, dispatch: (action: PlanningAction) => void) {
  const [activeLevel, setActiveLevel] = useState<number>()
  const active = activeLevel === level.id
  useEffect(() => {
    if (!active || suspended) return
    const timer = window.setTimeout(() => {
      const next = level.solution[placed]
      if (next) dispatch({ type: 'place', x: next.x, y: next.y })
      else {
        setActiveLevel(undefined)
        dispatch({ type: 'start' })
      }
    }, DEMO_PLACEMENT_MS)
    return () => window.clearTimeout(timer)
  }, [active, suspended, level, placed, dispatch])
  return {
    active,
    start: () => { dispatch({ type: 'clear' }); setActiveLevel(level.id) },
    cancel: () => setActiveLevel(undefined)
  }
}
