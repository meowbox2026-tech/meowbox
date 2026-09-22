export type CatTrait = 'none' | 'scratch' | 'hungry'

export interface CatToken {
  type: string
  trait: CatTrait
}

export interface ScratchPost {
  id: string
  x: number
  y: number
  hp: number
}

export interface FishTreat {
  id: string
  x: number
  y: number
}

export interface CatTunnel {
  id: string
  entryColumn: number
  exitColumn: number
}

export interface DropPatrol {
  columns: number[]
  index: number
  dropsUntilMove: number
}

export interface DropGoals {
  rescued: number
  scratchPosts: number
  fishTreats: number
}

export interface DropProgress {
  rescued: number
  scratchPosts: number
  fishTreats: number
}

export function token(type: string, trait: CatTrait = 'none'): CatToken {
  return { type, trait }
}
