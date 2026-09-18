import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CAT_LONG_PAW_DURATION_MS, CAT_LONG_PAW_PATH } from '../../game/animation/catPaw'
import { CAT_SPRITE_SHEETS } from '../../game/animation/spriteSheet'
import {
  CatSpectacleOverlay,
  CAT_PEEK_INTERVAL_MS,
  getCatSpectacleDuration,
  getRandomDropAnchor,
  type CatSpectacle
} from './CatSpectacleOverlay'

describe('CatSpectacleOverlay', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('renders an idle sprite sheet and completes after one idle beat', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    const effect: CatSpectacle = { id: 7, kind: 'idle', side: 'left' }

    render(<CatSpectacleOverlay effect={effect} onComplete={onComplete} />)

    expect(screen.getByTestId('cat-spectacle-layer')).toHaveAttribute('data-effect-kind', 'idle')
    expect(screen.getByTestId('cat-spectacle-sprite')).toHaveClass('cat-sprite--idle')
    expect(screen.getByTestId('cat-spectacle-sprite')).toHaveAttribute('data-sheet', 'idle')
    expect(screen.getByTestId('cat-spectacle-sprite')).toHaveStyle({ backgroundImage: 'url(/assets/animations/cat-idle-sheet.png)' })

    act(() => vi.advanceTimersByTime(getCatSpectacleDuration('idle')))
    expect(onComplete).toHaveBeenCalledWith(7)
  })

  it('lets the idle fade settle before removing the overlay', () => {
    expect(getCatSpectacleDuration('idle')).toBeGreaterThan(CAT_SPRITE_SHEETS.idle.durationMs)
  })

  it('uses the running sheet for a cat that crosses the screen', () => {
    const effect: CatSpectacle = { id: 8, kind: 'run', side: 'right' }

    render(<CatSpectacleOverlay effect={effect} onComplete={vi.fn()} />)

    expect(screen.getByTestId('cat-spectacle-runner')).toHaveClass('cat-spectacle__runner--right')
    expect(screen.getByTestId('cat-spectacle-sprite')).toHaveClass('cat-sprite--run')
    expect(screen.getByTestId('cat-spectacle-sprite')).toHaveAttribute('data-sheet', 'run')
    expect(getCatSpectacleDuration('run')).toBeGreaterThan(1000)
  })

  it('renders one long paw facing the selected edge', () => {
    const effect: CatSpectacle = { id: 9, kind: 'paw', direction: 'bottom' }

    render(<CatSpectacleOverlay effect={effect} onComplete={vi.fn()} />)

    expect(screen.getByTestId('cat-spectacle-paw')).toHaveAttribute('data-direction', 'bottom')
    expect(screen.getByTestId('cat-spectacle-paw')).toHaveClass('cat-spectacle__long-paw--bottom')
    expect(screen.getByTestId('cat-spectacle-paw-image')).toHaveAttribute('src', CAT_LONG_PAW_PATH)
    expect(screen.queryByTestId('cat-spectacle-sprite')).not.toBeInTheDocument()
    expect(getCatSpectacleDuration('paw')).toBe(CAT_LONG_PAW_DURATION_MS)
  })

  it('renders the dedicated top-edge strip as a cat hiding behind the board', () => {
    render(<CatSpectacleOverlay effect={{ id: 11, kind: 'peek' }} onComplete={vi.fn()} />)

    expect(screen.getByTestId('cat-spectacle-peek')).toBeInTheDocument()
    expect(screen.getByTestId('cat-spectacle-peek')).toHaveAttribute('data-direction', 'top')
    expect(screen.getByTestId('cat-spectacle-peek')).toHaveClass('cat-spectacle__peek--board-behind')
    expect(screen.getByTestId('cat-spectacle-sprite')).toHaveClass('cat-sprite--peek-top')
    expect(screen.getByTestId('cat-spectacle-sprite')).toHaveAttribute('data-sheet', 'peek-top')
    expect(screen.getByTestId('cat-spectacle-sprite')).toHaveStyle({ backgroundImage: 'url(/assets/animations/cat-peek-top-sheet.png)' })
    expect(screen.queryByTestId('cat-spectacle-peek-lid')).not.toBeInTheDocument()
    expect(getCatSpectacleDuration('peek')).toBe(CAT_SPRITE_SHEETS['peek-top'].durationMs)
  })

  it('can place a drop effect in the center or either bottom corner', () => {
    expect(getRandomDropAnchor(() => 0)).toBe('center')
    expect(getRandomDropAnchor(() => 0.34)).toBe('bottom-left')
    expect(getRandomDropAnchor(() => 0.9)).toBe('bottom-right')
  })

  it('schedules the peek effect every ten seconds while testing', () => {
    expect(CAT_PEEK_INTERVAL_MS).toBe(10_000)
  })

  it('keeps pickup, drop, and invalid placement as lightweight gesture effects', () => {
    const cases: Array<CatSpectacle['kind']> = ['pickup', 'drop', 'invalid', 'combo', 'complete', 'failed']

    for (const [index, kind] of cases.entries()) {
      const effect: CatSpectacle = { id: index + 10, kind }
      const { unmount } = render(<CatSpectacleOverlay effect={effect} onComplete={vi.fn()} />)
      expect(screen.getByTestId('cat-spectacle-layer')).toHaveAttribute('data-effect-kind', kind)
      expect(screen.getByTestId('cat-spectacle-gesture')).toHaveClass(`cat-gesture--${kind}`)
      unmount()
    }
  })
})
