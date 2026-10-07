import type { PlanningLevel } from '../core/planningEngine'
import { EXPANDED_DUAL_BOX_LEVELS } from './planningDualBoxExpanded'
import { DUAL_BOX_WORLD_2 } from './planningDualBoxWorld2'
import { getPlanningLevel } from './planningLevels'

/**
 * Levels 31–90 are bundled dual-box stages. Remote content cannot carry dual-box
 * fields yet, so these stay bundled and take precedence over remote single-box data.
 */
export function getMainlineLevel(id: number): PlanningLevel {
  return DUAL_BOX_WORLD_2.get(id) ?? EXPANDED_DUAL_BOX_LEVELS.get(id) ?? getPlanningLevel(id)
}
