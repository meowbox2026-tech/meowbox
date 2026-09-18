import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LegalScreen } from './LegalScreen'

describe('LegalScreen', () => {
  it('renders the privacy policy with the support contact', () => {
    render(<LegalScreen documentId="privacy" onBack={vi.fn()} />)

    expect(screen.getByRole('heading', { name: '隱私權政策' })).toBeInTheDocument()
    expect(screen.getByText('meowbox2026@gmail.com', { exact: false })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /返回設定/ })).toBeInTheDocument()
  })

  it('exposes a mail link on the support page', () => {
    render(<LegalScreen documentId="support" onBack={vi.fn()} />)

    expect(screen.getByRole('link', { name: '寄信給客服' })).toHaveAttribute('href', 'mailto:meowbox2026@gmail.com')
  })
})
