import { WORLD_ONE_ROWS } from './dropWorldOneData'
import { WORLD_TWO_NAMES, WORLD_TWO_TABLE } from './dropWorldTwoData'
import { WORLD_THREE_NAMES, WORLD_THREE_TABLE } from './dropWorldThreeData'

export interface DropLevelManifestEntry {
  id: number
  world: 1 | 2 | 3
  name: string
  timeLimit: number
  width: number
  height: number
  kinds: number
  initialCatCount: number
  target: number
  variantCount: number
  previewCount: 2 | 3 | 4
  holdUses: number
  scratchPosts: number
  fishTreats: number
  tunnels: number
  patrol: boolean
}

const WORLD_ONE_MANIFEST: DropLevelManifestEntry[] = WORLD_ONE_ROWS.map((row) => ({
  id: row.id,
  world: 1,
  name: row.name,
  timeLimit: row.timeLimit,
  width: row.width,
  height: row.height,
  kinds: row.id <= 4 ? 4 : row.width + 1,
  initialCatCount: row.id === 1 ? 4 : row.id === 2 ? 4 : row.id === 3 ? 3 : row.id === 4 ? 5 : row.width * (row.id <= 15 ? 3 : row.id <= 25 ? 4 : 5),
  target: row.target,
  variantCount: 1,
  previewCount: 2,
  holdUses: 0,
  scratchPosts: 0,
  fishTreats: 0,
  tunnels: 0,
  patrol: false
}))

function travelManifest(
  row: (typeof WORLD_TWO_TABLE | typeof WORLD_THREE_TABLE)[number],
  world: 2 | 3,
  name: string
): DropLevelManifestEntry {
  return {
    id: row.id,
    world,
    name,
    timeLimit: row.seconds,
    width: row.width,
    height: row.height,
    kinds: row.kinds,
    initialCatCount: row.initialCats,
    target: row.rescued,
    variantCount: 3,
    previewCount: world === 3 && row.id >= 76 ? 4 : 3,
    holdUses: row.id >= 41 ? 2 : 0,
    scratchPosts: row.scratchSingle + row.scratchDouble,
    fishTreats: row.fish,
    tunnels: row.tunnels,
    patrol: row.patrol > 0
  }
}

export const DROP_LEVEL_MANIFEST: DropLevelManifestEntry[] = [
  ...WORLD_ONE_MANIFEST,
  ...WORLD_TWO_TABLE.map((row, index) => travelManifest(row, 2, WORLD_TWO_NAMES[index])),
  ...WORLD_THREE_TABLE.map((row, index) => travelManifest(row, 3, WORLD_THREE_NAMES[index]))
]

export const MAX_DROP_LEVEL = DROP_LEVEL_MANIFEST.length

export function getDropLevelManifest(id: number): DropLevelManifestEntry {
  return DROP_LEVEL_MANIFEST.find((level) => level.id === id) ?? DROP_LEVEL_MANIFEST[0]
}
