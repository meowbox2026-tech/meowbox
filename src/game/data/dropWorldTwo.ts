import { createTravelLevel } from './dropLevelFactory'
import { WORLD_TWO_NAMES, WORLD_TWO_TABLE } from './dropWorldTwoData'

export { WORLD_TWO_TABLE } from './dropWorldTwoData'

export function getWorldTwoLevel(id: number, variant = 0) {
  const row = WORLD_TWO_TABLE.find((candidate) => candidate.id === id) ?? WORLD_TWO_TABLE[0]
  const safeVariant = ((Math.floor(variant) % 3) + 3) % 3
  return createTravelLevel(row, WORLD_TWO_NAMES[row.id - 31], 2, safeVariant)
}
