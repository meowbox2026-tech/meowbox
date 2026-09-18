import { describe, expect, it } from 'vitest'
import { getPuzzleMetrics } from './puzzleLayout'

describe('puzzle layout metrics', () => {
  it('keeps the floor bounds and Phaser board bounds on the same grid', () => {
    const metrics = getPuzzleMetrics(373, 410, { width: 3, height: 3, blockedCells: [] }, true)

    expect(metrics.cell).toBeCloseTo(85.608, 2)
    expect(metrics.x).toBeCloseTo(58.088, 2)
    expect(metrics.y).toBeCloseTo(18, 2)
    expect(metrics.boardWidth).toBeCloseTo(metrics.cell * 3, 5)
    expect(metrics.boardHeight).toBeCloseTo(metrics.cell * 3, 5)
  })
})
