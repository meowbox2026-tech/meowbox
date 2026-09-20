import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HomeScreen } from './HomeScreen'

vi.mock('../../state/PlayerContext', () => ({
  usePlayer: () => ({
    player: {
      pawCoins: 630,
      currentLevel: 4,
      stars: { 4: 3 },
    },
  }),
}))

describe('HomeScreen responsive controls', () => {
  it('keeps only the level control in the home navigation', () => {
    const { container } = render(<HomeScreen onStart={vi.fn()} onNavigate={vi.fn()} />)

    expect(screen.getByRole('button', { name: '設定' })).toHaveClass('top-bar__round')
    expect(screen.queryByLabelText('生命值 5，已滿')).not.toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: '目前進度，第 4 關' })).toHaveClass('home-progress')
    expect(container.querySelector('.home-brand p')).toHaveTextContent('貓咪落下消除')
    expect(container.querySelector('.home-progress__stars')).not.toBeInTheDocument()
    expect(screen.queryByText(/已蒐集/)).not.toBeInTheDocument()

    const navigation = screen.getByRole('navigation', { name: '主選單' })
    expect(navigation.querySelectorAll('.home-nav__button')).toHaveLength(1)
    expect(screen.getByRole('button', { name: '關卡' })).toHaveClass('home-nav__button')
    expect(screen.queryByRole('button', { name: '收藏' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /每日獎勵/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '商店' })).not.toBeInTheDocument()
  })
})
