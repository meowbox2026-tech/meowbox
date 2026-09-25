import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LevelSelectScreen } from './LevelSelectScreen'

const player = vi.hoisted(() => ({
  currentLevel: 1,
  stars: { 1: 3 }
}))

vi.mock('../../state/PlayerContext', () => ({
  usePlayer: () => ({ player })
}))

afterEach(() => { cleanup(); player.currentLevel = 1 })

describe('LevelSelectScreen worlds', () => {
  it('renders one world of thirty levels and locks later worlds', () => {
    const { container } = render(<LevelSelectScreen onBack={vi.fn()} onSelectLevel={vi.fn()} />)

    expect(screen.getByRole('region', { name: '關卡清單' })).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(3)
    expect(screen.getByRole('tab', { name: /世界 1/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /世界 2/ })).toBeDisabled()
    expect(screen.getByRole('tab', { name: /世界 3/ })).toBeDisabled()
    expect(container.querySelectorAll('.level-tile')).toHaveLength(30)
    expect(container.querySelectorAll('.level-tile__lock img[src="/assets/lock.webp"]')).toHaveLength(29)
    expect(screen.getByRole('button', { name: /第 26 關/ })).toBeDisabled()
    expect(screen.queryByRole('button', { name: /第 31 關/ })).not.toBeInTheDocument()
  })

  it('opens world two at level thirty-one and switches between worlds', () => {
    player.currentLevel = 31
    const onSelectLevel = vi.fn()
    const { container } = render(<LevelSelectScreen onBack={vi.fn()} onSelectLevel={onSelectLevel} />)

    expect(screen.getByRole('tab', { name: /世界 2/ })).toBeEnabled()
    expect(screen.getByRole('tab', { name: /世界 2/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: /世界 3/ })).toBeDisabled()
    expect(container.querySelectorAll('.level-tile')).toHaveLength(30)
    expect(screen.getByRole('button', { name: '第 31 關' })).toBeEnabled()
    expect(screen.getByRole('button', { name: /第 60 關/ })).toBeDisabled()
    expect(screen.queryByRole('button', { name: '第 30 關' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: /世界 1/ }))
    expect(screen.getByRole('tab', { name: /世界 1/ })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('button', { name: '第 30 關' })).toBeEnabled()
    expect(screen.queryByRole('button', { name: '第 31 關' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '第 30 關' }))
    expect(onSelectLevel).toHaveBeenCalledWith(30)
  })

  it('opens world three at level sixty-one', () => {
    player.currentLevel = 61
    const { container } = render(<LevelSelectScreen onBack={vi.fn()} onSelectLevel={vi.fn()} />)

    expect(screen.getByRole('tab', { name: /世界 3/ })).toBeEnabled()
    expect(screen.getByRole('tab', { name: /世界 3/ })).toHaveAttribute('aria-selected', 'true')
    expect(container.querySelectorAll('.level-tile')).toHaveLength(30)
    expect(screen.getByRole('button', { name: '第 61 關' })).toBeEnabled()
    expect(screen.getByRole('button', { name: /第 90 關/ })).toBeDisabled()
    expect(screen.queryByRole('button', { name: '第 60 關' })).not.toBeInTheDocument()
  })
})
