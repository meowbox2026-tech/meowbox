export const REFERENCE_BOX_ASSET = {
  key: 'reference-box',
  path: '/assets/boxes/reference-box.png'
} as const

export const REFERENCE_BOX_VISUAL_SPEC = {
  levelId: 1,
  fit: 'contain',
  layer: 'behind-cats-and-in-front-of-floor'
} as const

export const MODULAR_BOX_ASSET_KEYS = [
  'floor',
  'top',
  'bottom',
  'left',
  'right',
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right'
] as const

export type ModularBoxAssetKey = (typeof MODULAR_BOX_ASSET_KEYS)[number]

export const MODULAR_BOX_ASSETS: Record<ModularBoxAssetKey, { key: string; path: string }> = {
  floor: { key: 'box-floor', path: '/assets/boxes/modular/floor.png' },
  top: { key: 'box-top', path: '/assets/boxes/modular/top.png' },
  bottom: { key: 'box-bottom', path: '/assets/boxes/modular/bottom.png' },
  left: { key: 'box-left', path: '/assets/boxes/modular/left.png' },
  right: { key: 'box-right', path: '/assets/boxes/modular/right.png' },
  'top-left': { key: 'box-top-left', path: '/assets/boxes/modular/top-left.png' },
  'top-right': { key: 'box-top-right', path: '/assets/boxes/modular/top-right.png' },
  'bottom-left': { key: 'box-bottom-left', path: '/assets/boxes/modular/bottom-left.png' },
  'bottom-right': { key: 'box-bottom-right', path: '/assets/boxes/modular/bottom-right.png' }
}

export function getModularBoxPieceForCell(
  x: number,
  y: number,
  isActive: (x: number, y: number) => boolean
): ModularBoxAssetKey | undefined {
  if (!isActive(x, y)) return undefined

  const north = !isActive(x, y - 1)
  const east = !isActive(x + 1, y)
  const south = !isActive(x, y + 1)
  const west = !isActive(x - 1, y)

  if (north && west) return 'top-left'
  if (north && east) return 'top-right'
  if (south && west) return 'bottom-left'
  if (south && east) return 'bottom-right'
  if (north) return 'top'
  if (south) return 'bottom'
  if (west) return 'left'
  if (east) return 'right'
  return undefined
}
