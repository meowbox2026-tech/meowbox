import { createTravelLevel } from './dropLevelFactory'
import { getWorldOneLevel } from './dropWorldOne'
import { WORLD_ONE_ROWS } from './dropWorldOneData'
import { WORLD_TWO_NAMES, WORLD_TWO_TABLE } from './dropWorldTwoData'
import { WORLD_THREE_NAMES, WORLD_THREE_TABLE } from './dropWorldThreeData'
import type { DropLevelDefinition } from './dropLevelTypes'

export type { DropLevelDefinition, DropLevelTableRow } from './dropLevelTypes'
export { advanceDropVariant, getStoredDropVariant } from './dropLevelLoader'
export { MAX_DROP_LEVEL } from './dropManifest'

const WORLD_ONE_LEVELS = WORLD_ONE_ROWS.map((row) => getWorldOneLevel(row.id))
const WORLD_TWO_LEVELS = WORLD_TWO_TABLE.map((row, index) => createTravelLevel(row, WORLD_TWO_NAMES[index], 2, 0))
const WORLD_THREE_LEVELS = WORLD_THREE_TABLE.map((row, index) => createTravelLevel(row, WORLD_THREE_NAMES[index], 3, 0))

export const DROP_LEVELS: DropLevelDefinition[] = [...WORLD_ONE_LEVELS, ...WORLD_TWO_LEVELS, ...WORLD_THREE_LEVELS]

const variantCache = new Map<string, DropLevelDefinition>()

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

export function getDropWorldLevels(world: 1 | 2 | 3): DropLevelDefinition[] {
  return DROP_LEVELS.filter((level) => level.world === world)
}
