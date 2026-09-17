import { describe, expect, it } from 'vitest'
import { cellsTouch, getPlacedCells, getShapeCells, pointKey } from './shapes'
import type { CatDefinition } from '../types'

const lineCat: CatDefinition = { id: 'line', name: 'Line', skin: 'orange', shape: 'line3', type: 'normal' }
const stretchCat: CatDefinition = { id: 'stretch', name: 'Stretch', skin: 'gray', shape: 'line2', type: 'stretch', stretchLengths: [2, 3, 4] }

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

  it('detects orthogonal touching but not diagonals', () => {
    expect(cellsTouch([{ x: 1, y: 1 }], [{ x: 2, y: 1 }])).toBe(true)
    expect(cellsTouch([{ x: 1, y: 1 }], [{ x: 2, y: 2 }])).toBe(false)
    expect(pointKey({ x: 3, y: 5 })).toBe('3:5')
  })
})
