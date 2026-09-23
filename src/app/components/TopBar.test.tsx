import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { TopBar } from './TopBar'

afterEach(cleanup)

describe('TopBar', () => {
  it('renders the supplied level card artwork with an accessible level label', () => {
    const { container } = render(<TopBar level={3} stars={3} moves={14} />)

    expect(screen.getByLabelText('關卡 3')).toBeInTheDocument()
    expect(screen.getByText('關卡')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(container.querySelector('img[src="/assets/levelcard.webp"]')).toBeInTheDocument()
    expect(screen.queryByLabelText(/Paw Coins/)).not.toBeInTheDocument()
  })
})
