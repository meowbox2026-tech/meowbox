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
const shouldRenderDemoAd = vi.hoisted(() => vi.fn())
const recordPlayerEvent = vi.hoisted(() => vi.fn())
const initializeNativeAdMob = vi.hoisted(() => vi.fn())
const showNativePrivacyOptions = vi.hoisted(() => vi.fn())

vi.mock('../state/PlayerContext', () => ({
  usePlayer: () => ({ player, isReady: player.isReady })
}))
vi.mock('../services/ads/playCadence', () => ({ recordPlay }))
vi.mock('../services/ads/interstitialAds', () => ({
  DEMO_INTERSTITIAL_DURATION_MS: 30000,
  showInterstitialAd
}))
vi.mock('../services/ads/undoRewardAd', () => ({
  DEMO_UNDO_AD_DURATION_MS: 5000,
  showUndoRewardAd
}))
vi.mock('../services/ads/adPresentation', () => ({ shouldRenderDemoAd }))
vi.mock('../services/analytics/analytics', () => ({ recordPlayerEvent }))
vi.mock('../services/ads/nativeAdMob', () => ({ initializeNativeAdMob, showNativePrivacyOptions }))

vi.mock('./screens/GameScreen', () => ({
  GameScreen: ({ onPlayAction, onWatchUndoAd }: { onPlayAction: () => Promise<void>; onWatchUndoAd: () => Promise<boolean> }) => (
    <div data-testid="game-screen">
      <button type="button" onClick={() => void onPlayAction()}>測試插頁廣告</button>
      <button type="button" onClick={() => void onWatchUndoAd()}>測試獎勵廣告</button>
    </div>
  )
}))

beforeEach(() => {
  recordPlay.mockReturnValue({ playsSinceAd: 0, shouldShowAd: true })
  showInterstitialAd.mockResolvedValue({ shown: true })
  showUndoRewardAd.mockResolvedValue({ completed: true })
  shouldRenderDemoAd.mockReturnValue(false)
  initializeNativeAdMob.mockResolvedValue(true)
  showNativePrivacyOptions.mockResolvedValue(true)
})

afterEach(() => {
  cleanup()
  window.history.replaceState({}, '', '/')
  recordPlay.mockReset()
  showInterstitialAd.mockReset()
  showUndoRewardAd.mockReset()
  shouldRenderDemoAd.mockReset()
  vi.clearAllMocks()
})

describe('App ad presentation', () => {
  it('does not render the local ad surface while native AdMob is presenting', async () => {
    let resolveAd: ((result: { shown: boolean }) => void) | undefined
    showInterstitialAd.mockReturnValue(new Promise((resolve) => { resolveAd = resolve }))

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '開始遊戲' }))
    fireEvent.click(screen.getByRole('button', { name: '測試插頁廣告' }))
    await act(async () => { await Promise.resolve() })

    expect(shouldRenderDemoAd).toHaveBeenCalled()
    expect(showInterstitialAd).toHaveBeenCalledOnce()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    resolveAd?.({ shown: true })
    await act(async () => { await Promise.resolve() })
  })

  it('initializes native AdMob after the saved player is ready', async () => {
    render(<App />)
    await act(async () => { await Promise.resolve() })

    expect(initializeNativeAdMob).toHaveBeenCalledOnce()
  })

  it('does not render the local ad surface for native rewarded ads', async () => {
    let resolveAd: ((result: { completed: boolean }) => void) | undefined
    showUndoRewardAd.mockReturnValue(new Promise((resolve) => { resolveAd = resolve }))

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '開始遊戲' }))
    fireEvent.click(screen.getByRole('button', { name: '測試獎勵廣告' }))
    await act(async () => { await Promise.resolve() })

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    resolveAd?.({ completed: true })
    await act(async () => { await Promise.resolve() })
  })
})
