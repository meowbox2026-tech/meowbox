import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LevelSelectScreen } from './LevelSelectScreen'

vi.mock('../../state/PlayerContext', () => ({
  usePlayer: () => ({
    player: {
      pawCoins: 630,
      currentLevel: 1,
      stars: { 1: 3 },
    },
  }),
}))

describe('LevelSelectScreen single-phone layout', () => {
  it('keeps the level board without the removed progress and home controls', () => {
    render(<LevelSelectScreen onBack={vi.fn()} onSelectLevel={vi.fn()} />)

    expect(screen.getByRole('region', { name: '關卡清單' })).toBeInTheDocument()
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '返回主頁' })).not.toBeInTheDocument()
    expect(screen.queryByText(/\/ 90/)).not.toBeInTheDocument()
  })
})
