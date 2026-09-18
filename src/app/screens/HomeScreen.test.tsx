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
  it('keeps the annotated controls available as distinct layout targets', () => {
    render(<HomeScreen onStart={vi.fn()} onNavigate={vi.fn()} onDailyReward={vi.fn()} />)

    expect(screen.getByRole('button', { name: '設定' })).toHaveClass('top-bar__round')
    expect(screen.queryByLabelText('生命值 5，已滿')).not.toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: '目前進度，第 4 關' })).toHaveClass('home-progress')

    const navigation = screen.getByRole('navigation', { name: '主選單' })
    expect(navigation.querySelectorAll('.home-nav__button')).toHaveLength(4)
    expect(screen.getByRole('button', { name: '關卡' })).toHaveClass('home-nav__button')
    expect(screen.getByRole('button', { name: '收藏' })).toHaveClass('home-nav__button')
    expect(screen.getByRole('button', { name: /每日獎勵/ })).toHaveClass('home-nav__button')
    expect(screen.getByRole('button', { name: '商店' })).toHaveClass('home-nav__button')
  })
})
