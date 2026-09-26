import bundledLevelData from '../content/levels.json'
import bundledManifest from '../content/manifest.json'
import { validateAuthoredPlanningLevel } from '../core/planningValidation'
import type { PlanningLevel } from '../core/planningEngine'
import { PLANNING_LEVEL_ONE_SOLUTION } from './planningLevelOne'

const levelData = bundledLevelData as unknown as PlanningLevel[]

function validateLevelSequence(levels: PlanningLevel[]): PlanningLevel[] {
  if (!Array.isArray(levels) || levels.length === 0 || levels.length > 500) {
    throw new Error('Planning content must contain between 1 and 500 levels.')
  }
  return levels.map((level, index) => {
    if (level.id !== index + 1) throw new Error(`Planning level IDs must be sequential; expected ${index + 1}.`)
    return validateAuthoredPlanningLevel(level)
  })
}

export const BUNDLED_PLANNING_LEVELS = validateLevelSequence(levelData)
export const BUNDLED_CONTENT_VERSION = bundledManifest.version
export let PLANNING_LEVELS: PlanningLevel[] = [...BUNDLED_PLANNING_LEVELS]
export let MAX_PLANNING_LEVEL = PLANNING_LEVELS.length

export function replacePlanningLevels(levels: PlanningLevel[]): void {
  if (levels.length < BUNDLED_PLANNING_LEVELS.length || levels.length > 500
    || levels.some((level, index) => level.id !== index + 1)) {
    throw new Error('Remote planning levels must preserve existing IDs and append new levels in order.')
  }
  PLANNING_LEVELS = [...levels]
  MAX_PLANNING_LEVEL = PLANNING_LEVELS.length
}

export function getPlanningLevel(id: number): PlanningLevel {
  return PLANNING_LEVELS.find(level => level.id === id) ?? PLANNING_LEVELS[0]
}

export const PLANNING_LEVEL_ONE = BUNDLED_PLANNING_LEVELS[0]
export { PLANNING_LEVEL_ONE_SOLUTION }
