import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { LevelTimerDisplay } from './LevelTimerDisplay'

afterEach(cleanup)

describe('LevelTimerDisplay', () => {
  it('exposes the live formatted level time to assistive technology', () => {
    render(<LevelTimerDisplay elapsedMs={12_340} label="關卡時間" />)

    expect(screen.getByRole('timer', { name: '關卡時間 00:12.3' })).toBeInTheDocument()
    expect(screen.getByTestId('level-timer-value')).toHaveTextContent('00:12.3')
  })

  it('marks a paused timer without changing its elapsed value', () => {
    const { container } = render(<LevelTimerDisplay elapsedMs={65_000} label="關卡時間" paused />)

    expect(container.querySelector('.planning-timer')).toHaveClass('is-paused')
    expect(screen.getByTestId('level-timer-value')).toHaveTextContent('01:05.0')
  })
})
