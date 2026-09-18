import { describe, expect, it } from 'vitest'
import {
  MODULAR_BOX_ASSET_KEYS,
  MODULAR_BOX_ASSETS,
  getModularBoxPieceForCell,
  REFERENCE_BOX_ASSET,
  REFERENCE_BOX_VISUAL_SPEC
} from './boxAssets'

describe('reference box artwork', () => {
  it('keeps the irregular cardboard artwork as a contained first-level visual asset', () => {
    expect(REFERENCE_BOX_ASSET).toEqual({
      key: 'reference-box',
      path: '/assets/boxes/reference-box.png'
    })
    expect(REFERENCE_BOX_VISUAL_SPEC).toEqual({
      levelId: 1,
      fit: 'contain',
      layer: 'behind-cats-and-in-front-of-floor'
    })
  })

  it('defines the nine 256px modules used to assemble the first-level box', () => {
    expect(MODULAR_BOX_ASSET_KEYS).toEqual([
      'floor',
      'top',
      'bottom',
      'left',
      'right',
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right'
    ])
    expect(Object.keys(MODULAR_BOX_ASSETS)).toHaveLength(9)
    expect(Object.values(MODULAR_BOX_ASSETS).every((asset) => asset.path.startsWith('/assets/boxes/modular/'))).toBe(true)
  })

  it('maps the first-level rectangle to the correct corner and edge pieces', () => {
    const isActive = (x: number, y: number) => x >= 0 && x < 4 && y >= 0 && y < 4

    expect(getModularBoxPieceForCell(0, 0, isActive)).toBe('top-left')
    expect(getModularBoxPieceForCell(1, 0, isActive)).toBe('top')
    expect(getModularBoxPieceForCell(3, 0, isActive)).toBe('top-right')
    expect(getModularBoxPieceForCell(0, 1, isActive)).toBe('left')
    expect(getModularBoxPieceForCell(3, 1, isActive)).toBe('right')
    expect(getModularBoxPieceForCell(0, 3, isActive)).toBe('bottom-left')
    expect(getModularBoxPieceForCell(1, 3, isActive)).toBe('bottom')
    expect(getModularBoxPieceForCell(3, 3, isActive)).toBe('bottom-right')
    expect(getModularBoxPieceForCell(1, 1, isActive)).toBeUndefined()
  })
})
