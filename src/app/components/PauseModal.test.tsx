import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PauseModal } from './PauseModal'

afterEach(cleanup)

const baseProps = {
  open: true,
  onContinue: vi.fn(),
  onRestart: vi.fn(),
  onHome: vi.fn(),
  onSettings: vi.fn(),
}

describe('PauseModal', () => {
  it('keeps visible labels over the supplied pause artwork', () => {
    const { container } = render(<PauseModal {...baseProps} />)

    expect(screen.getByRole('dialog', { name: '暫停選單' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '繼續遊戲' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重新開始本關' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '回到主頁' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '設定' })).toBeInTheDocument()
    expect(screen.getByText('暫停')).toBeInTheDocument()
    expect(container.querySelector('img[src="/assets/paused.webp"]')).toBeInTheDocument()
  })

  it('wires pause actions and settings toggles to their callbacks', () => {
    const onContinue = vi.fn()
    const onRestart = vi.fn()
    const onHome = vi.fn()
    const onSettings = vi.fn()
    render(<PauseModal {...baseProps} onContinue={onContinue} onRestart={onRestart} onHome={onHome} onSettings={onSettings} />)

    fireEvent.click(screen.getByRole('button', { name: '繼續遊戲' }))
    fireEvent.click(screen.getByRole('button', { name: '重新開始本關' }))
    fireEvent.click(screen.getByRole('button', { name: '回到主頁' }))
    fireEvent.click(screen.getByRole('button', { name: '設定' }))

    expect(onContinue).toHaveBeenCalledOnce()
    expect(onRestart).toHaveBeenCalledOnce()
    expect(onHome).toHaveBeenCalledOnce()
    expect(onSettings).toHaveBeenCalledOnce()
  })
})
