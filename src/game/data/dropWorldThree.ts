import { createTravelLevel } from './dropLevelFactory'
import { WORLD_THREE_NAMES, WORLD_THREE_TABLE } from './dropWorldThreeData'

export { WORLD_THREE_TABLE } from './dropWorldThreeData'

export function getWorldThreeLevel(id: number, variant = 0) {
  const row = WORLD_THREE_TABLE.find((candidate) => candidate.id === id) ?? WORLD_THREE_TABLE[0]
  const safeVariant = ((Math.floor(variant) % 3) + 3) % 3
  return createTravelLevel(row, WORLD_THREE_NAMES[row.id - 61], 3, safeVariant)
}
