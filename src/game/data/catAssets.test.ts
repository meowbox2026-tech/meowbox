import { describe, expect, it } from 'vitest'
import {
  CAT_ASSET_PATHS,
  getCatAssetPath,
  getCatTextureKey,
  getCatVisualSpec
} from './catAssets'
import type { CatAsset } from '../types'

describe('cat artwork registry', () => {
  it('keeps exactly the twelve supplied cat artworks on transparent PNG paths', () => {
    const assets = Object.values(CAT_ASSET_PATHS)

    expect(CAT_ASSET_PATHS).toEqual({
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
    })
    expect(assets).toHaveLength(12)
    expect(new Set(assets).size).toBe(assets.length)
    assets.forEach((path) => expect(path).toMatch(/^\/assets\/cats\/.+\.png$/))
  })

  it('builds stable Phaser texture keys from the artwork id', () => {
    expect(getCatTextureKey('sleeping')).toBe('cat-sleeping')
    expect(getCatTextureKey('fishLover')).toBe('cat-fishLover')
    expect(getCatAssetPath('box')).toBe('/assets/cats/box.png')
  })

  it('provides a valid visual placement contract for every supplied artwork', () => {
    const assets: CatAsset[] = [
      'arrogant', 'sunny', 'fishLover', 'orange', 'white', 'blue',
      'alone', 'sleeping', 'box', 'mischievous', 'boss', 'sticky'
    ]

    assets.forEach((asset) => {
      const spec = getCatVisualSpec(asset)
      expect(spec.anchor.x).toBeGreaterThanOrEqual(0)
      expect(spec.anchor.x).toBeLessThanOrEqual(1)
      expect(spec.anchor.y).toBeGreaterThanOrEqual(0)
      expect(spec.anchor.y).toBeLessThanOrEqual(1)
    })
  })
})
