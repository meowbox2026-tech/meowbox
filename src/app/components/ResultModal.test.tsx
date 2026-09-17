import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ResultModal } from './ResultModal'

afterEach(cleanup)

const baseProps = {
  open: true,
  stars: 3,
  reward: 50,
  isClaimed: false,
  onClaim: vi.fn(),
  onDouble: vi.fn(),
  onLevelSelect: vi.fn(),
  onNextLevel: vi.fn(),
  onRestart: vi.fn(),
}

describe('ResultModal', () => {
  it('keeps rewards and level navigation on one completion screen', () => {
    const { container } = render(<ResultModal {...baseProps} />)

    expect(screen.getByRole('dialog')).toHaveAccessibleName('過關囉！')
    expect(screen.getByText('獎勵')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '領取獎勵' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '雙倍獎勵' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '關卡' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '下一關' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重玩' })).toBeInTheDocument()
    expect(container.querySelector('img[src="/assets/replay.webp"]')).toBeInTheDocument()
  })

  it('wires every action and marks rewards as claimed without changing screens', () => {
    const onClaim = vi.fn()
    const onDouble = vi.fn()
    const onLevelSelect = vi.fn()
    const onNextLevel = vi.fn()
    const onRestart = vi.fn()
    render(<ResultModal {...baseProps} onClaim={onClaim} onDouble={onDouble} onLevelSelect={onLevelSelect} onNextLevel={onNextLevel} onRestart={onRestart} />)

    fireEvent.click(screen.getByRole('button', { name: '領取獎勵' }))
    fireEvent.click(screen.getByRole('button', { name: '雙倍獎勵' }))
    fireEvent.click(screen.getByRole('button', { name: '關卡' }))
    fireEvent.click(screen.getByRole('button', { name: '下一關' }))
    fireEvent.click(screen.getByRole('button', { name: '重玩' }))

    expect(onClaim).toHaveBeenCalledOnce()
    expect(onDouble).toHaveBeenCalledOnce()
    expect(onLevelSelect).toHaveBeenCalledOnce()
    expect(onNextLevel).toHaveBeenCalledOnce()
    expect(onRestart).toHaveBeenCalledOnce()
  })

  it('disables both reward choices after the reward is claimed', () => {
    render(<ResultModal {...baseProps} isClaimed />)

    expect(screen.getByRole('button', { name: '已領取獎勵' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '雙倍獎勵已領取' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '下一關' })).toBeEnabled()
  })
})
