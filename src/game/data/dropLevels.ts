import { createTravelLevel } from './dropLevelFactory'
import { WORLD_ONE_LEVELS } from './dropWorldOne'
import { WORLD_TWO_LEVELS, WORLD_TWO_TABLE } from './dropWorldTwo'
import { WORLD_THREE_LEVELS, WORLD_THREE_TABLE } from './dropWorldThree'
import type { DropLevelDefinition } from './dropLevelTypes'

export type { DropLevelDefinition, DropLevelTableRow } from './dropLevelTypes'

export const MAX_DROP_LEVEL = 90
export const DROP_LEVELS: DropLevelDefinition[] = [...WORLD_ONE_LEVELS, ...WORLD_TWO_LEVELS, ...WORLD_THREE_LEVELS]

const variantCache = new Map<string, DropLevelDefinition>()
const VARIANT_SESSION_PREFIX = 'meowbox-drop-variant:'

export function getDropLevelById(id: number, variant = 0): DropLevelDefinition {
  const base = DROP_LEVELS.find((level) => level.id === id) ?? DROP_LEVELS[0]
  if (!base || base.world === 1 || variant <= 0) return base
  const index = Math.max(0, variant % base.variantCount)
  if (index === 0) return base
  const key = `${base.id}:${index}`
  const cached = variantCache.get(key)
  if (cached) return cached
  const table = base.world === 2 ? WORLD_TWO_TABLE : WORLD_THREE_TABLE
  const row = table.find((candidate) => candidate.id === base.id)
  if (!row) return base
  const level = createTravelLevel(row, base.name, base.world, index)
  variantCache.set(key, level)
  return level
}

export function getDropLevelVariants(id: number): DropLevelDefinition[] {
  const level = getDropLevelById(id)
  return Array.from({ length: level.variantCount }, (_, variant) => getDropLevelById(id, variant))
}

export function getStoredDropVariant(id: number): number {
  const base = DROP_LEVELS.find((level) => level.id === id)
  if (!base || base.variantCount <= 1) return 0
  try {
    const stored = Number(window.sessionStorage.getItem(`${VARIANT_SESSION_PREFIX}${id}`))
    return Number.isInteger(stored) && stored >= 0 ? stored % base.variantCount : 0
  } catch {
    // A blocked session store should not prevent a level from starting.
  }
  return 0
}

/** Advance only when the player explicitly replays the level. */
export function advanceDropVariant(id: number): number {
  const base = DROP_LEVELS.find((level) => level.id === id)
  if (!base || base.variantCount <= 1) return 0
  const next = (getStoredDropVariant(id) + 1) % base.variantCount
  try {
    window.sessionStorage.setItem(`${VARIANT_SESSION_PREFIX}${id}`, String(next))
  } catch {
    // A blocked session store should not prevent a level from restarting.
  }
  return next
}

export function getDropWorldLevels(world: 1 | 2 | 3): DropLevelDefinition[] {
  return DROP_LEVELS.filter((level) => level.world === world)
}
