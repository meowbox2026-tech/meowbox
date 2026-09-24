import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { TopBar } from './TopBar'

afterEach(cleanup)

describe('TopBar', () => {
  it('renders the compact level artwork with a numeric label', () => {
    const { container } = render(<TopBar level={3} stars={3} moves={14} />)

    expect(screen.getByLabelText('關卡 3')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(container.querySelector('.level-pill')).toHaveClass('level-pill')
    expect(container.querySelector('.level-pill__art')).toHaveAttribute('src', '/assets/levelcard.webp')
    expect(screen.queryByLabelText(/Paw Coins/)).not.toBeInTheDocument()
  })
})
