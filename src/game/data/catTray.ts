import type { CatDefinition, LevelDefinition, PuzzleState } from '../types'

export const CAT_GROUP_SIZE = 4

export function getVisibleCatGroup(level: LevelDefinition, state: PuzzleState): CatDefinition[] {
  let startIndex = 0

  while (startIndex < level.cats.length) {
    const group = level.cats.slice(startIndex, startIndex + CAT_GROUP_SIZE)
    if (!group.length || !group.every((cat) => Boolean(state.placements[cat.id]))) break
    startIndex += CAT_GROUP_SIZE
  }

  return level.cats.slice(startIndex, startIndex + CAT_GROUP_SIZE)
}
