export type CatSpriteSheetName = 'idle' | 'run' | 'peek-top'

export interface CatSpriteSheetDefinition {
  readonly path: string
  readonly columns: number
  readonly rows: number
  readonly frameCount: number
  readonly durationMs: number
}

export const CAT_SPRITE_SHEETS: Record<CatSpriteSheetName, CatSpriteSheetDefinition> = {
  idle: {
    path: '/assets/animations/cat-idle-sheet.png',
    columns: 4,
    rows: 2,
    frameCount: 8,
    durationMs: 1120
  },
  run: {
    path: '/assets/animations/cat-run-sheet.png',
    columns: 4,
    rows: 2,
    frameCount: 8,
    durationMs: 720
  },
  'peek-top': {
    path: '/assets/animations/cat-peek-top-sheet.png',
    columns: 8,
    rows: 1,
    frameCount: 8,
    durationMs: 2400
  }
}

export function getSpriteFramePosition(
  frameIndex: number,
  columns: number,
  rows: number
): { x: string; y: string } {
  if (!Number.isInteger(frameIndex) || frameIndex < 0 || frameIndex >= columns * rows) {
    throw new RangeError(`Sprite frame ${frameIndex} is outside a ${columns}×${rows} sheet`)
  }

  const column = frameIndex % columns
  const row = Math.floor(frameIndex / columns)
  const x = columns === 1 ? 0 : (column / (columns - 1)) * 100
  const y = rows === 1 ? 0 : (row / (rows - 1)) * 100

  return { x: `${x}%`, y: `${y}%` }
}
