import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HomeScreen } from './HomeScreen'

describe('HomeScreen responsive controls', () => {
  it('keeps only the level control in the home navigation', () => {
    const { container } = render(<HomeScreen onStart={vi.fn()} onNavigate={vi.fn()} />)

    expect(screen.getByRole('button', { name: '設定' })).toHaveClass('top-bar__round')
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    expect(container.querySelector('.home-progress')).not.toBeInTheDocument()
    expect(container.querySelector('.home-brand__logo')).toHaveAttribute('src', '/assets/meowlogo.webp')
    expect(container.querySelector('.home-brand p')).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Meow Line 喵序｜貓咪落下連線解謎' })).toBeInTheDocument()

    const navigation = screen.getByRole('navigation', { name: '主選單' })
    expect(navigation.querySelectorAll('.home-nav__button')).toHaveLength(1)
    expect(screen.getByRole('button', { name: '關卡' })).toHaveClass('home-nav__button')
    expect(screen.queryByRole('button', { name: '收藏' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /每日獎勵/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '商店' })).not.toBeInTheDocument()
  })
})
