import { describe, expect, it } from 'vitest'
import { CAT_ASSET_PATHS, getCatAssetPath, getCatTextureKey } from './catAssets'

describe('cat artwork registry', () => {
  it('keeps every supplied cat artwork on a compressed WebP path', () => {
    const assets = Object.values(CAT_ASSET_PATHS)

    expect(assets).toHaveLength(13)
    expect(new Set(assets).size).toBe(assets.length)
    assets.forEach((path) => expect(path).toMatch(/^\/assets\/cats\/.+\.webp$/))
  })

  it('builds stable Phaser texture keys from the artwork id', () => {
    expect(getCatTextureKey('amberSit')).toBe('cat-amberSit')
    expect(getCatAssetPath('whiteCurl')).toBe('/assets/cats/white-curl.webp')
  })
})
