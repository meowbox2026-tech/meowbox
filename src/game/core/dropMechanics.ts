import type { DropBoard, DropCell, DropTile } from './dropEngine'
import type { FishTreat, ScratchPost } from './dropTypes'

export interface WaveEffects {
  scratchPosts: ScratchPost[]
  fishTreats: FishTreat[]
  damagedScratchPostIds: string[]
  collectedFishTreatIds: string[]
}

const orthogonal = (firstX: number, firstY: number, secondX: number, secondY: number): boolean =>
  Math.abs(firstX - secondX) + Math.abs(firstY - secondY) === 1

function isScratchTile(tile: DropTile | null): boolean {
  return tile?.trait === 'scratch'
}

function isHungryTile(tile: DropTile | null): boolean {
  return tile?.trait === 'hungry'
}

/** Calculate every effect from one immutable pre-clear snapshot. */
export function resolveWaveEffects(
  board: DropBoard,
  cells: DropCell[],
  scratchPosts: ScratchPost[],
  fishTreats: FishTreat[]
): WaveEffects {
  const damagedScratchPostIds: string[] = []
  const collectedFishTreatIds: string[] = []
  const matched = cells.map((cell) => ({ cell, tile: board[cell.y]?.[cell.x] ?? null }))

  for (const post of scratchPosts) {
    if (post.hp <= 0) continue
    const adjacent = matched.filter(({ cell }) => orthogonal(cell.x, cell.y, post.x, post.y))
    if (!adjacent.length) continue
    const damage = adjacent.some(({ tile }) => isScratchTile(tile)) ? 2 : 1
    const nextHp = Math.max(0, post.hp - damage)
    if (nextHp !== post.hp) damagedScratchPostIds.push(post.id)
  }

  for (const treat of fishTreats) {
    const collected = matched.some(({ cell, tile }) =>
      (cell.x === treat.x && cell.y === treat.y)
      || (isHungryTile(tile) && orthogonal(cell.x, cell.y, treat.x, treat.y)))
    if (collected) collectedFishTreatIds.push(treat.id)
  }

  const damaged = new Set(damagedScratchPostIds)
  const collected = new Set(collectedFishTreatIds)
  return {
    scratchPosts: scratchPosts.map((post) => damaged.has(post.id)
      ? { ...post, hp: Math.max(0, post.hp - (matched.some(({ cell, tile }) => orthogonal(cell.x, cell.y, post.x, post.y) && isScratchTile(tile)) ? 2 : 1)) }
      : { ...post }),
    fishTreats: fishTreats.filter((treat) => !collected.has(treat.id)).map((treat) => ({ ...treat })),
    damagedScratchPostIds,
    collectedFishTreatIds
  }
}
