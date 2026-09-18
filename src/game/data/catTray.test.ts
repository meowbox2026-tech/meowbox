import { describe, expect, it } from 'vitest'
import { createPuzzleState } from '../core/puzzleEngine'
import { getLevelById } from './levels'
import { getVisibleCatGroup } from './catTray'

describe('cat selection groups', () => {
  it('starts with four cats and reveals the next group after all four are placed', () => {
    const level = getLevelById(1)
    const state = createPuzzleState(level)

    expect(getVisibleCatGroup(level, state).map((cat) => cat.visualAsset)).toEqual([
      'arrogant', 'sunny', 'fishLover', 'orange'
    ])

    const firstGroupPlaced = {
      ...state,
      placements: Object.fromEntries(level.cats.slice(0, 4).map((cat, index) => [cat.id, {
        origin: { x: index % 3, y: Math.floor(index / 3) },
        rotation: 0
      }]))
    }

    expect(getVisibleCatGroup(level, firstGroupPlaced).map((cat) => cat.visualAsset)).toEqual([
      'white', 'blue', 'alone', 'sleeping'
    ])
  })

  it('keeps the final partial group visible for a nine-cat first level', () => {
    const level = getLevelById(1)
    const state = createPuzzleState(level)
    const eightPlaced = {
      ...state,
      placements: Object.fromEntries(level.cats.slice(0, 8).map((cat, index) => [cat.id, {
        origin: { x: index % 3, y: Math.floor(index / 3) },
        rotation: 0
      }]))
    }

    expect(getVisibleCatGroup(level, eightPlaced).map((cat) => cat.visualAsset)).toEqual(['box'])
  })
})
