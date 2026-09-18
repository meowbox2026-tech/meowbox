import { describe, expect, it } from 'vitest'
import { cellsTouch, getPlacedCells, getShapeCells, pointKey } from './shapes'
import type { CatDefinition } from '../types'

const defaultVisual = {
  anchor: { x: 0.5, y: 0.5 },
  offset: { x: 0, y: 0 },
  bleed: { top: 0, right: 0, bottom: 0, left: 0 }
}
const lineCat: CatDefinition = {
  id: 'line',
  name: 'Line',
  skin: 'orange',
  shape: 'line3',
  type: 'normal',
  occupancyMask: [[1, 1, 1]],
  ...defaultVisual
}
const stretchCat: CatDefinition = {
  id: 'stretch',
  name: 'Stretch',
  skin: 'gray',
  shape: 'line2',
  type: 'stretch',
  stretchLengths: [2, 3, 4],
  occupancyMask: [[1, 1]],
  ...defaultVisual
}

describe('shape helpers', () => {
  it('rotates a horizontal cat into a normalized vertical shape', () => {
    expect(getShapeCells(lineCat, { origin: { x: 0, y: 0 }, rotation: 1 })).toEqual([
      { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }
    ])
  })

  it('uses the selected stretch length when calculating occupied cells', () => {
    expect(getPlacedCells(stretchCat, { origin: { x: 2, y: 1 }, rotation: 0, stretchLength: 4 })).toEqual([
      { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }
    ])
  })

  it('uses the explicit occupancy mask instead of the transparent artwork bounds', () => {
    const lCat: CatDefinition = {
      id: 'l-mask',
      name: 'L mask',
      skin: 'black',
      shape: 'line4',
      type: 'normal',
      occupancyMask: [
        [1, 0],
        [1, 0],
        [1, 1]
      ],
      ...defaultVisual
    }

    expect(getShapeCells(lCat)).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 }
    ])
    expect(getShapeCells(lCat, { origin: { x: 0, y: 0 }, rotation: 1 })).toEqual([
      { x: 2, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 1 }
    ])
  })

  it('detects orthogonal touching but not diagonals', () => {
    expect(cellsTouch([{ x: 1, y: 1 }], [{ x: 2, y: 1 }])).toBe(true)
    expect(cellsTouch([{ x: 1, y: 1 }], [{ x: 2, y: 2 }])).toBe(false)
    expect(pointKey({ x: 3, y: 5 })).toBe('3:5')
  })
})
