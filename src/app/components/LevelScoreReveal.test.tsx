import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LevelScoreReveal } from './LevelScoreReveal'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('LevelScoreReveal', () => {
  it('reveals the final elapsed time after its count-up animation', () => {
    vi.useFakeTimers()
    render(<LevelScoreReveal elapsedMs={12_340} stars={3} timeLabel="完成時間" starsLabel="3 顆星" />)

    expect(screen.getByTestId('result-time')).toHaveTextContent('00:00.0')

    act(() => vi.advanceTimersByTime(800))

    expect(screen.getByTestId('result-time')).toHaveTextContent('00:12.3')
  })

  it('marks earned stars with staggered reveal delays', () => {
    const { container } = render(<LevelScoreReveal elapsedMs={12_340} stars={2} timeLabel="完成時間" starsLabel="2 顆星" />)
    const stars = [...container.querySelectorAll('.planning-score-reveal__stars img')]

    expect(stars).toHaveLength(3)
    expect(stars[0]).toHaveClass('is-earned')
    expect(stars[1]).toHaveClass('is-earned')
    expect(stars[2]).not.toHaveClass('is-earned')
    expect(stars[0]).toHaveAttribute('src', '/assets/stars.webp')
    expect(stars[0]).toHaveStyle({ animationDelay: '180ms' })
    expect(stars[1]).toHaveStyle({ animationDelay: '360ms' })
  })
})
