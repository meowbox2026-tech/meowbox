export type CatSkin = 'orange' | 'black' | 'gray' | 'white' | 'calico' | 'siamese' | 'ragdoll'

export type CatShape = 'dot' | 'line2' | 'line3' | 'line4' | 'square2' | 'l' | 't' | 'z'

export type CatType = 'normal' | 'sleeping' | 'sticky' | 'stretch'

export type CatAsset =
  | 'amberSit'
  | 'spottedSit'
  | 'blackPaws'
  | 'calicoStretch'
  | 'sphynxStretch'
  | 'grayStretch'
  | 'brownCurl'
  | 'orangeLounge'
  | 'ragdollSit'
  | 'grayCurl'
  | 'siameseStretch'
  | 'tabbyLounge'
  | 'whiteCurl'

export type ObstacleKind = 'tape' | 'yarn' | 'toy' | 'divider'

export type LevelDifficulty = 1 | 2 | 3 | 4 | 5

export type PuzzlePhase = 'playing' | 'completed' | 'failed'

export interface GridPoint {
  x: number
  y: number
}

export interface CatDefinition {
  id: string
  name: string
  skin: CatSkin
  shape: CatShape
  type: CatType
  visualAsset?: CatAsset
  stickyGroup?: string
  stretchLengths?: number[]
}

export interface LidZone {
  id: string
  cells: GridPoint[]
}

export interface BoardObstacle {
  cell: GridPoint
  kind: ObstacleKind
}

export interface BoardDefinition {
  width: number
  height: number
  activeCells?: GridPoint[]
  blockedCells: GridPoint[]
  obstacles?: BoardObstacle[]
  lidZones?: LidZone[]
}

export interface CatPlacement {
  origin: GridPoint
  rotation: number
  stretchLength?: number
  locked?: boolean
}

export interface LevelDefinition {
  id: number
  name: string
  type: 'normal' | 'challenge'
  difficulty: LevelDifficulty
  board: BoardDefinition
  cats: CatDefinition[]
  moves: number
  targetMoves?: number
  solution: Record<string, CatPlacement>
  tutorial?: string
}

export interface PuzzleSnapshot {
  placements: Record<string, CatPlacement>
  stretchLengths: Record<string, number>
  closedLids: string[]
  movesRemaining?: number
  hintsUsed: number
  autoPlacesUsed: number
}

export interface PuzzleState {
  levelId: number
  phase: PuzzlePhase
  placements: Record<string, CatPlacement>
  stretchLengths: Record<string, number>
  initialStretchLengths: Record<string, number>
  closedLids: string[]
  movesRemaining?: number
  initialMoves?: number
  hintsUsed: number
  autoPlacesUsed: number
  history: PuzzleSnapshot[]
  lastHint?: Hint
}

export interface Hint {
  catId: string
  origin: GridPoint
  rotation: number
  stretchLength?: number
}

export type PlacementFailure =
  | 'unknown-cat'
  | 'outside'
  | 'inactive'
  | 'blocked'
  | 'occupied'
  | 'sleeping'
  | 'lid-closed'
  | 'game-over'

export interface PuzzleActionResult {
  accepted: boolean
  state: PuzzleState
  reason?: PlacementFailure
}
