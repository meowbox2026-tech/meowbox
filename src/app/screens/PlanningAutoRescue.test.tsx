import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PlanningGameScreen } from './PlanningGameScreen'

vi.mock('../../state/PlayerContext', () => ({ usePlayer: () => ({
  player: { settings: { music: false, sound: false, haptics: false } }, completeLevel: vi.fn()
}) }))
vi.mock('../../services/audio/audioService', () => ({ pauseBackgroundMusic: vi.fn(), startBackgroundMusic: vi.fn(),
  stopBackgroundMusic: vi.fn(), playClearSound: vi.fn(), playLevelResultSound: vi.fn() }))
vi.mock('../../services/analytics/analytics', () => ({ recordPlayerEvent: vi.fn(), createAnalyticsId: () => 'test' }))
vi.mock('../../services/haptics/hapticsService', () => ({ playPlacementHaptic: vi.fn() }))
const bannerVisibility = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
vi.mock('../../services/ads/bannerAds', () => ({ setGameBannerVisible: bannerVisibility }))

afterEach(() => { cleanup(); vi.clearAllMocks() })
function mount(levelId = 1, previewMode = false) {
  return render(<PlanningGameScreen levelId={levelId} previewMode={previewMode} onHome={vi.fn()} onSettings={vi.fn()}
    onLevelSelect={vi.fn()} onNextLevel={vi.fn()} onPlayAction={vi.fn()} onWatchUndoAd={async () => true} />)
}
const cell = (row: number, column: number) => screen.getByRole('button', { name: `放在第 ${row} 排、第 ${column} 欄` })

describe('automatic rescue', () => {
  it('starts when a hint places the last cat and disables further edits', async () => {
    mount()
    fireEvent.click(cell(4, 5))
    fireEvent.click(cell(3, 5))
    fireEvent.click(screen.getByRole('button', { name: '提示 1' }))
    await act(async () => { for (let i = 0; i < 5; i++) await Promise.resolve() })
    expect(screen.getByText('已安排 3 / 3')).toBeInTheDocument()
    expect(cell(2, 5)).toBeDisabled()
    expect(screen.getByRole('button', { name: '提示 0，點擊補充提示' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: '開始救援' })).toBeNull()
    expect(document.querySelector('.planning-effect--start')).toBeInTheDocument()
  })
  it('keeps editing after an invalid occupied-cell click', () => {
    mount()
    fireEvent.click(cell(4, 5))
    fireEvent.click(cell(4, 5))
    expect(screen.getByText('已安排 1 / 3')).toBeInTheDocument()
    expect(cell(3, 5)).toBeEnabled()
    expect(document.querySelector('.planning-effect--start')).toBeNull()
  })
  it('hides the banner during a pause and restores it on continuing', () => {
    mount()
    expect(bannerVisibility).toHaveBeenLastCalledWith(true)
    fireEvent.click(screen.getByRole('button', { name: '暫停' }))
    expect(bannerVisibility).toHaveBeenLastCalledWith(false)
    fireEvent.click(screen.getByRole('button', { name: '繼續遊戲' }))
    expect(bannerVisibility).toHaveBeenLastCalledWith(true)
  })
})


describe('banner in every level', () => {
  it.each([false, true])('shows the banner throughout levels 1–90 (preview=%s)', previewMode => {
    for (let levelId = 1; levelId <= 90; levelId++) {
      cleanup()
      mount(levelId, previewMode)
      const tutorialClose = screen.queryByRole('button', { name: '知道了，試試看' })
      if (tutorialClose) fireEvent.click(tutorialClose)
      expect(screen.getByLabelText('廣告預覽')).toBeInTheDocument()
      expect(bannerVisibility).toHaveBeenLastCalledWith(true)
    }
  }, 30_000)
})
