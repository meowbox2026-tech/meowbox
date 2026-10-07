import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'

const player = vi.hoisted(() => ({
  currentLevel: 1,
  settings: { music: false, sound: false, haptics: false, language: 'zh-TW' as const },
  isReady: true
}))
const recordPlay = vi.hoisted(() => vi.fn())
const showInterstitialAd = vi.hoisted(() => vi.fn())
const showUndoRewardAd = vi.hoisted(() => vi.fn())
const recordPlayerEvent = vi.hoisted(() => vi.fn())

vi.mock('../state/PlayerContext', () => ({
  usePlayer: () => ({
    player,
    isReady: player.isReady
  })
}))

vi.mock('../services/ads/playCadence', () => ({ recordPlay }))
vi.mock('../services/ads/interstitialAdSettings', () => ({
  DEFAULT_INTERSTITIAL_AD_SETTINGS: { enabled: true, playsPerAd: 5 },
  loadInterstitialAdSettings: async () => ({ enabled: true, playsPerAd: 5 })
}))
vi.mock('../services/ads/interstitialAds', () => ({
  DEMO_INTERSTITIAL_DURATION_MS: 30000,
  showInterstitialAd
}))
vi.mock('../services/ads/undoRewardAd', () => ({
  DEMO_UNDO_AD_DURATION_MS: 5000,
  showUndoRewardAd
}))
vi.mock('../services/analytics/analytics', () => ({ recordPlayerEvent }))

vi.mock('./screens/GameScreen', () => ({
  GameScreen: ({ onHome, onSettings, onWatchUndoAd, onWatchHintAd }: { onHome: () => void; onSettings: () => void; onWatchUndoAd: () => Promise<boolean>; onWatchHintAd: () => Promise<boolean> }) => <div data-testid="game-screen">
    <button type="button" onClick={onHome}>回主頁</button>
    <button type="button" onClick={onSettings}>設定</button>
    <button type="button" onClick={() => void onWatchUndoAd()}>撤銷上一步 0</button>
    <button type="button" onClick={() => void onWatchHintAd()}>提示 0</button>
  </div>
}))

vi.mock('./screens/SettingsScreen', () => ({
  SettingsScreen: ({ onBack }: { onBack: () => void }) => <div data-testid="settings-screen">
    <button type="button" onClick={onBack}>返回設定</button>
  </div>
}))

beforeEach(() => {
  recordPlay.mockReturnValue({ playsSinceAd: 1, shouldShowAd: false })
  showInterstitialAd.mockResolvedValue({ shown: true })
  showUndoRewardAd.mockResolvedValue({ completed: true })
})

afterEach(() => {
  cleanup()
  window.history.replaceState({}, '', '/')
  player.isReady = true
  recordPlay.mockReset()
  showInterstitialAd.mockReset()
  showUndoRewardAd.mockReset()
  vi.clearAllMocks()
})

describe('App game loading', () => {
  it('renders the player status dashboard on its standalone route', () => {
    window.history.pushState({}, '', '/player-status')

    render(<App />)

    expect(screen.getByRole('heading', { name: '玩家狀態' })).toBeInTheDocument()
    expect(screen.getByText('資料尚未接入')).toBeInTheDocument()
  })

  it('opens the game without a full-screen loading interstitial', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '開始遊戲' }))

    expect(screen.queryByText('正在整理棋盤…')).not.toBeInTheDocument()
    expect(screen.getByTestId('game-screen')).toBeInTheDocument()
  })

  it('returns to the same mounted game after settings is opened from the game', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '開始遊戲' }))
    const gameScreen = screen.getByTestId('game-screen')
    fireEvent.click(screen.getByRole('button', { name: '設定' }))

    expect(screen.getByTestId('settings-screen')).toBeInTheDocument()
    expect(gameScreen.closest('[hidden]')).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: '返回設定' }))

    expect(screen.queryByTestId('settings-screen')).not.toBeInTheDocument()
    expect(screen.getByTestId('game-screen')).toBe(gameScreen)
    expect(gameScreen.closest('[hidden]')).toBeNull()
  })

  it('skips the interstitial on the first game entry of a session', async () => {
    recordPlay.mockReturnValue({ playsSinceAd: 0, shouldShowAd: true })
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '開始遊戲' }))
    await act(async () => { await Promise.resolve() })

    expect(recordPlay).not.toHaveBeenCalled()
    expect(showInterstitialAd).not.toHaveBeenCalled()
    expect(screen.getByTestId('game-screen')).toBeInTheDocument()
  })

  it('does not render the orange full-screen fallback while the save is loading', () => {
    player.isReady = false

    const { container } = render(<App />)

    expect(container.querySelector('.app-loading')).not.toBeInTheDocument()
  })

  it('passes every fifth play action to the interstitial provider', async () => {
    recordPlay
      .mockReturnValueOnce({ playsSinceAd: 1, shouldShowAd: false })
      .mockReturnValueOnce({ playsSinceAd: 2, shouldShowAd: false })
      .mockReturnValueOnce({ playsSinceAd: 3, shouldShowAd: false })
      .mockReturnValueOnce({ playsSinceAd: 4, shouldShowAd: false })
      .mockReturnValueOnce({ playsSinceAd: 0, shouldShowAd: true })
    showInterstitialAd.mockResolvedValue({ shown: true })
    render(<App />)

    for (let play = 0; play < 6; play += 1) {
      fireEvent.click(screen.getByRole('button', { name: '開始遊戲' }))
      if (play < 5) fireEvent.click(screen.getByRole('button', { name: '回主頁' }))
    }
    await act(async () => { await Promise.resolve() })

    expect(recordPlay).toHaveBeenCalledTimes(5)
    expect(showInterstitialAd).toHaveBeenCalledOnce()
  })

  it('passes the undo bonus request to the rewarded provider', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '開始遊戲' }))
    fireEvent.click(screen.getByRole('button', { name: '撤銷上一步 0' }))
    await act(async () => { await Promise.resolve() })

    expect(showUndoRewardAd).toHaveBeenCalledOnce()
  })

  it('passes the hint bonus request to the rewarded provider', async () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: '開始遊戲' }))
    fireEvent.click(screen.getByRole('button', { name: '提示 0' }))
    await act(async () => { await Promise.resolve() })

    expect(showUndoRewardAd).toHaveBeenCalledOnce()
  })
})
