import { describe, expect, it } from 'vitest'
import { CAT_SPRITE_SHEETS, getSpriteFramePosition } from './spriteSheet'

describe('cat sprite sheets', () => {
  it('keeps the generated animation assets in one explicit registry', () => {
    expect(CAT_SPRITE_SHEETS.idle).toMatchObject({
      path: '/assets/animations/cat-idle-sheet.png',
      columns: 4,
      rows: 2,
      frameCount: 8
    })
    expect(CAT_SPRITE_SHEETS.run.frameCount).toBe(8)
    expect(CAT_SPRITE_SHEETS).not.toHaveProperty('paw')
    expect(CAT_SPRITE_SHEETS['peek-top']).toMatchObject({
      path: '/assets/animations/cat-peek-top-sheet.png',
      columns: 8,
      rows: 1,
      frameCount: 8,
      durationMs: 2400
    })
  })

  it('maps frames across rows using CSS background positions', () => {
    expect(getSpriteFramePosition(0, 4, 2)).toEqual({ x: '0%', y: '0%' })
    expect(getSpriteFramePosition(3, 4, 2)).toEqual({ x: '100%', y: '0%' })
    expect(getSpriteFramePosition(4, 4, 2)).toEqual({ x: '0%', y: '100%' })
    expect(getSpriteFramePosition(7, 4, 2)).toEqual({ x: '100%', y: '100%' })
    expect(getSpriteFramePosition(2, 4, 1)).toEqual({ x: '66.66666666666666%', y: '0%' })
  })

  it('rejects frames outside the sheet', () => {
    expect(() => getSpriteFramePosition(-1, 4, 2)).toThrow(RangeError)
    expect(() => getSpriteFramePosition(8, 4, 2)).toThrow(RangeError)
  })
})
