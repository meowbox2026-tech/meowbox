import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LevelSelectScreen } from './LevelSelectScreen'

const player = vi.hoisted(() => ({
  pawCoins: 630,
  currentLevel: 1,
  stars: { 1: 3 }
}))

vi.mock('../../state/PlayerContext', () => ({
  usePlayer: () => ({ player }),
}))

afterEach(() => { cleanup(); player.currentLevel = 1 })

describe('LevelSelectScreen single-phone layout', () => {
  it('keeps the level board without the removed progress and home controls', () => {
    const { container } = render(<LevelSelectScreen onBack={vi.fn()} onSelectLevel={vi.fn()} />)

    expect(screen.getByRole('region', { name: '關卡清單' })).toBeInTheDocument()
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '返回主頁' })).not.toBeInTheDocument()
    expect(screen.queryByText(/\/ 90/)).not.toBeInTheDocument()
    expect(container.querySelectorAll('.level-tile').length).toBeGreaterThan(0)
    expect(container.querySelectorAll('.level-tile__stars img[src="/assets/stars.webp"]')).toHaveLength(3)
    expect(container.querySelectorAll('.world-tabs img[src="/assets/lock.webp"]')).toHaveLength(2)
    expect(container.querySelectorAll('.level-tile__lock img[src="/assets/lock.webp"]')).toHaveLength(29)
  })

  it('switches to world 2 and shows levels 31 through 60 when unlocked', () => {
    player.currentLevel = 31
    const { container } = render(<LevelSelectScreen onBack={vi.fn()} onSelectLevel={vi.fn()} />)

    fireEvent.click(screen.getByRole('tab', { name: /世界 2/ }))

    expect(screen.getByRole('tab', { name: /世界 2/ })).toHaveAttribute('aria-selected', 'true')
    expect(container.querySelectorAll('.level-tile')).toHaveLength(30)
    expect(screen.getByRole('button', { name: '第 31 關' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /第 60 關/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /第 30 關/ })).not.toBeInTheDocument()
  })

  it('explains that world 2 unlocks after world 1 is complete', () => {
    render(<LevelSelectScreen onBack={vi.fn()} onSelectLevel={vi.fn()} />)

    expect(screen.getByRole('tab', { name: /世界 2/ })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('完成世界 1 的 30 關後解鎖世界 2')
  })
})
