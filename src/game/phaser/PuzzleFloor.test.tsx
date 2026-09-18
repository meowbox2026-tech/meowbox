import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getLevelById } from '../data/levels'
import { PuzzleFloor } from './PuzzleFloor'

describe('PuzzleFloor', () => {
  it('renders the supplied modular floor as its own visual component', () => {
    const { container } = render(<PuzzleFloor level={getLevelById(1)} />)

    expect(container.querySelector('.puzzle-floor-layer')).toBeInTheDocument()
    expect(container.querySelector('.puzzle-floor')).toBeInTheDocument()
    const tiles = container.querySelectorAll('.puzzle-floor-tile')
    expect(tiles).toHaveLength(64)
    expect([...tiles].every((tile) => tile.getAttribute('src') === '/assets/boxes/modular/floor.png')).toBe(true)
  })

  it('does not add a standalone floor below the legacy box levels', () => {
    const { container } = render(<PuzzleFloor level={getLevelById(2)} />)

    expect(container.firstChild).toBeNull()
  })
})
