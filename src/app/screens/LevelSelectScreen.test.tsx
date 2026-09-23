import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LevelSelectScreen } from './LevelSelectScreen'

const player = vi.hoisted(() => ({
  pawCoins: 630,
  currentLevel: 1,
  stars: { 1: 3 }
}))

vi.mock('../../state/PlayerContext', () => ({
  usePlayer: () => ({ player })
}))

afterEach(() => { cleanup(); player.currentLevel = 1 })

describe('LevelSelectScreen active mainline', () => {
  it('renders only the twenty-five planning levels without world tabs', () => {
    const { container } = render(<LevelSelectScreen onBack={vi.fn()} onSelectLevel={vi.fn()} />)

    expect(screen.getByRole('region', { name: '關卡清單' })).toBeInTheDocument()
    expect(container.querySelectorAll('.level-tile')).toHaveLength(25)
    expect(container.querySelectorAll('.level-tile__lock img[src="/assets/lock.webp"]')).toHaveLength(24)
    expect(container.querySelector('.world-tabs')).toBeNull()
    expect(screen.queryByRole('button', { name: /第 26 關/ })).not.toBeInTheDocument()
    expect(screen.queryByText(/世界/)).not.toBeInTheDocument()
  })

  it('unlocks through level twenty-five and keeps later levels absent', () => {
    player.currentLevel = 25
    const onSelectLevel = vi.fn()
    const { container } = render(<LevelSelectScreen onBack={vi.fn()} onSelectLevel={onSelectLevel} />)

    expect(container.querySelectorAll('.level-tile--locked')).toHaveLength(0)
    expect(screen.getByRole('button', { name: '第 25 關' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: '第 25 關' }))
    expect(onSelectLevel).toHaveBeenCalledWith(25)
    expect(screen.queryByRole('button', { name: /第 (26|90) 關/ })).not.toBeInTheDocument()
  })
})
