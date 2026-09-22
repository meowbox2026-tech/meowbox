import { cleanup, act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
// Regression coverage for the retained timed mode; planning level one has its own suite.
import { GameScreen as RoutedGameScreen, LegacyDropGameScreen as GameScreen } from './GameScreen'
import { DROP_LEVELS } from '../../game/data/dropLevels'
import { loadDropLevelById } from '../../game/data/dropLevelLoader'
const completeLevel = vi.hoisted(() => vi.fn())
const startBackgroundMusic = vi.hoisted(() => vi.fn())
const stopBackgroundMusic = vi.hoisted(() => vi.fn())
vi.mock('../../state/PlayerContext', () => ({ usePlayer: () => ({ player: { pawCoins: 0, settings: { sound: false, music: true, haptics: false } }, completeLevel }) }))
vi.mock('../../services/audio/audioService', () => ({ startBackgroundMusic, stopBackgroundMusic }))
vi.mock('../../services/haptics/hapticsService', () => ({ playPlacementHaptic: vi.fn() }))
afterEach(() => { cleanup(); window.sessionStorage.clear(); vi.useRealTimers(); vi.clearAllMocks() })
async function settleLevelLoad(container: HTMLElement, levelId: number) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (container.querySelector('.drop-top-status')) return
    if (container.querySelector('.drop-level-loading__content button')) throw new Error(`Level ${levelId} failed to load.`)
    await act(async () => { await Promise.resolve() })
  }
  throw new Error(`Timed out waiting for level ${levelId} to load.`)
}
async function mount() {
  await loadDropLevelById(1)
  vi.useFakeTimers()
  const result = render(<GameScreen levelId={1} onHome={vi.fn()} onSettings={vi.fn()} onLevelSelect={vi.fn()} onNextLevel={vi.fn()} onToast={vi.fn()} />)
  await settleLevelLoad(result.container, 1)
  return result
}
async function mountLevel(levelId: number) {
  await loadDropLevelById(levelId)
  vi.useFakeTimers()
  const result = render(<GameScreen levelId={levelId} onHome={vi.fn()} onSettings={vi.fn()} onLevelSelect={vi.fn()} onNextLevel={vi.fn()} onToast={vi.fn()} />)
  await settleLevelLoad(result.container, levelId)
  return result
}
function finishAnimation() { for (let n = 0; n < 8; n++) act(() => vi.advanceTimersByTime(600)) }
describe('first drop level', () => {
  it('keeps level 26 in the timed mode after the planning chapter', async () => {
    await loadDropLevelById(26)
    vi.useFakeTimers()
    const result = render(<RoutedGameScreen levelId={26} onHome={vi.fn()} onSettings={vi.fn()} onLevelSelect={vi.fn()} onNextLevel={vi.fn()} onToast={vi.fn()} />)
    await settleLevelLoad(result.container, 26)

    expect(result.container.querySelector('.planning-cell')).toBeNull()
    expect(screen.getByRole('timer', { name: '剩餘時間' })).toBeInTheDocument()
  })

  it('starts background music when entering an active level', async () => {
    await mount()

    expect(startBackgroundMusic).toHaveBeenCalledWith(true)
  })

  it('renders every configured level with its own board, target, assets and clock', async () => {
    for (let levelId = 1; levelId <= 90; levelId += 1) {
      cleanup()
      await mountLevel(levelId)
      const previewCount = levelId <= 30 ? 2 : levelId <= 75 ? 3 : 4
      expect(screen.queryByRole('heading', { name: DROP_LEVELS[levelId - 1].name })).not.toBeInTheDocument()
      expect(document.querySelector('.drop-top-status')).toBeInTheDocument()
      expect(document.querySelectorAll('.drop-preview img')).toHaveLength(previewCount)
      expect(document.querySelectorAll('.drop-preview__cat[data-preview-slot]')).toHaveLength(previewCount)
      expect(document.querySelector('.drop-preview__cat--now')).toBeInTheDocument()
      expect(document.querySelector('.drop-preview__cat--next')).toBeInTheDocument()
      if (levelId > 30) expect(document.querySelector('.drop-preview__cat--soon')).toBeInTheDocument()
      if (levelId >= 76) expect(document.querySelector('.drop-preview__cat--later')).toBeInTheDocument()
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      expect(screen.getByRole('timer', { name: '剩餘時間' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /第 1 欄/ })).toBeInTheDocument()
    }
  }, 30000)

  it('shows the third world 2 preview cat after the next cat', async () => {
    await mountLevel(31)
    expect(screen.getByText('SOON')).toBeInTheDocument()
    expect(screen.getByLabelText('待落下的三隻貓咪')).toBeInTheDocument()
  })
  it('shows world 3 mechanics, objectives, hold and four-cat preview together', async () => {
    await mountLevel(76)

    expect(screen.getByLabelText('本關目標')).toBeInTheDocument()
    expect(screen.getByLabelText('逗貓棒暫存')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /暫存/ })).toBeInTheDocument()
    expect(screen.getByLabelText('待落下的四隻貓咪')).toBeInTheDocument()
    expect(screen.getByText(/次後搗蛋貓移動/)).toBeInTheDocument()
    expect(screen.getByText(/下一個封鎖欄/)).toBeInTheDocument()
  })
  it('offers a no-score cute mechanic demo before the first world 2 drop', async () => {
    await mountLevel(31)

    expect(screen.getByRole('dialog', { name: '先和貓咪試玩一下' })).toBeInTheDocument()
    expect(screen.getByText('爪爪！')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /看可愛示範/ }))
    expect(document.querySelector('.drop-tutorial__demo.is-active')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '開始正式關卡' }))
    expect(screen.queryByRole('dialog', { name: '先和貓咪試玩一下' })).not.toBeInTheDocument()
  })
  it('updates previews immediately without rendering a drop ghost', async () => {
    const { container } = await mount()
    const column = screen.getByRole('button', { name: /第 3 欄/ })
    fireEvent.click(column)
    expect(screen.getByAltText('現在：小灰')).toBeInTheDocument()
    expect(screen.getByAltText('下一隻：小灰')).toBeInTheDocument()
    fireEvent.pointerLeave(column)
    fireEvent.blur(column)
    finishAnimation()
    expect(container.querySelector('.drop-ghost')).toBeNull()
    expect(container.querySelector('.drop-coach')).toBeNull()
    expect(container.querySelectorAll('.drop-cell.is-guide')).toHaveLength(0)
  })
  it('plays to completion, awards once and restarts cleanly', async () => {
    await mount()
    for (let i = 0; i < 30 && !screen.queryByRole('dialog', { name: '過關囉！' }); i++) {
      const cat = screen.getByAltText(/^現在：/).getAttribute('alt')!
      const column = cat.includes('橘子') ? 3 : cat.includes('小灰') ? 1 : 2
      fireEvent.click(screen.getByRole('button', { name: new RegExp(`第 ${column} 欄`) }))
      finishAnimation()
    }
    expect(screen.getByRole('dialog', { name: '過關囉！' })).toBeInTheDocument()
    expect(completeLevel).toHaveBeenCalledTimes(1)
    expect(completeLevel).toHaveBeenCalledWith(1, expect.any(Number), 50)
    expect(completeLevel.mock.calls[0][1]).toBeGreaterThanOrEqual(1)
    expect(completeLevel.mock.calls[0][1]).toBeLessThanOrEqual(3)
    expect(screen.getByRole('button', { name: /第 1 欄/ })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '再玩一次，挑戰高分' }))
    expect(screen.getByText('救出 0 / 18')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /第 3 欄/ })).not.toBeDisabled()
    expect(completeLevel).toHaveBeenCalledTimes(1)
  })
  it('fails on overflow without giving rewards and blocks input under rules', async () => {
    await mount()
    fireEvent.click(screen.getByRole('button', { name: '？ 玩法說明' }))
    expect(screen.getByRole('button', { name: /第 1 欄/ })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '知道了，來玩喵！' }))
    for (let i = 0; i < 10 && !screen.queryByRole('dialog', { name: '紙箱裝滿了' }); i++) {
      fireEvent.click(screen.getByRole('button', { name: /第 1 欄/ }))
      finishAnimation()
    }
    expect(screen.getByRole('dialog', { name: '紙箱裝滿了' })).toBeInTheDocument()
    expect(completeLevel).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '再試一次喵' }))
    expect(screen.getByAltText('現在：橘子')).toBeInTheDocument()
  })
  it('previews the chosen column by pointer and keyboard and pauses input', async () => {
    const { container } = await mount()
    const column = screen.getByRole('button', { name: /第 3 欄/ })
    fireEvent.pointerEnter(column)
    expect(container.querySelectorAll('.drop-cell.is-guide')).toHaveLength(0)
    fireEvent.pointerLeave(column)
    expect(container.querySelector('.drop-ghost')).toBeNull()
    fireEvent.focus(column)
    expect(container.querySelectorAll('.drop-cell.is-guide')).toHaveLength(0)
    fireEvent.blur(column)
    fireEvent.click(screen.getByRole('button', { name: '暫停' }))
    expect(column).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '繼續遊戲' }))
    expect(column).not.toBeDisabled()
  })

})
