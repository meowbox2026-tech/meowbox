import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'

const player = vi.hoisted(() => ({
  currentLevel: 1,
  pawCoins: 0,
  dailyReward: { lastClaimDate: new Date().toISOString().slice(0, 10), streak: 0 },
  settings: { music: false, sound: false, haptics: false, language: 'zh-TW' as const },
  isReady: true
}))

vi.mock('../state/PlayerContext', () => ({
  usePlayer: () => ({
    player,
    isReady: player.isReady,
    addHints: vi.fn(),
    claimDailyReward: vi.fn()
  })
}))

vi.mock('./screens/GameScreen', () => ({
  GameScreen: () => <div data-testid="game-screen" />
}))

afterEach(() => {
  player.isReady = true
  vi.clearAllMocks()
})

describe('App game loading', () => {
  it('opens the game without a full-screen loading interstitial', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '開始遊戲' }))

    expect(screen.queryByText('正在整理紙箱…')).not.toBeInTheDocument()
    expect(screen.getByTestId('game-screen')).toBeInTheDocument()
  })

  it('does not render the orange full-screen fallback while the save is loading', () => {
    player.isReady = false

    const { container } = render(<App />)

    expect(container.querySelector('.app-loading')).not.toBeInTheDocument()
  })
})
