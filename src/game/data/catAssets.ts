import type { CatAsset, CatVisualSpec } from '../types'

export const CAT_ASSET_PATHS: Record<CatAsset, string> = {
  arrogant: '/assets/cats/arrogant.png',
  sunny: '/assets/cats/sunny.png',
  fishLover: '/assets/cats/fish-lover.png',
  orange: '/assets/cats/orange.png',
  white: '/assets/cats/white.png',
  blue: '/assets/cats/blue.png',
  alone: '/assets/cats/alone.png',
  sleeping: '/assets/cats/sleeping.png',
  box: '/assets/cats/box.png',
  mischievous: '/assets/cats/mischievous.png',
  boss: '/assets/cats/boss.png',
  sticky: '/assets/cats/sticky.png'
}

const DEFAULT_CAT_VISUAL_SPEC: CatVisualSpec = {
  anchor: { x: 0.5, y: 0.5 },
  offset: { x: 0, y: 0 },
  bleed: { top: 0.03, right: 0.03, bottom: 0.02, left: 0.03 }
}

export function getCatTextureKey(asset: CatAsset): string {
  return `cat-${asset}`
}

export function getCatAssetPath(asset: CatAsset): string {
  return CAT_ASSET_PATHS[asset]
}

export function getCatVisualSpec(_asset?: CatAsset): CatVisualSpec {
  return DEFAULT_CAT_VISUAL_SPEC
}
