import type { CatAsset } from '../types'
import type { CatToken, CatTunnel, DropGoals, DropPatrol, FishTreat, ScratchPost } from '../core/dropTypes'
import type { DropBoard } from '../core/dropEngine'

export interface DropLevelDefinition {
  id: number
  world: 1 | 2 | 3
  name: string
  width: number
  height: number
  tileAssets: CatAsset[]
  timeLimit: number
  target: number
  initialRows: number
  initialCatCount: number
  seed: number
  threeStarMoves: number
  twoStarMoves: number
  previewCount: 2 | 3 | 4
  tutorial?: string
  initialBoard: DropBoard
  initialCurrent: CatAsset
  initialCurrentTrait: CatToken['trait']
  initialNext: CatAsset
  initialNextTrait: CatToken['trait']
  initialQueue: CatAsset[]
  initialQueueTraits: CatToken['trait'][]
  scratchPosts: ScratchPost[]
  fishTreats: FishTreat[]
  tunnels: CatTunnel[]
  patrol?: DropPatrol
  goals: DropGoals
  holdUses: number
  variant: number
  variantCount: number
  witness: number[]
}

export interface DropLevelTableRow {
  id: number
  seconds: number
  width: number
  height: number
  kinds: number
  initialCats: number
  rescued: number
  scratchSingle: number
  scratchDouble: number
  fish: number
  tunnels: number
  patrol: number
}
