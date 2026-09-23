import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GameScreen } from './GameScreen'

const completeLevel = vi.hoisted(() => vi.fn())
const showAd = vi.hoisted(() => vi.fn())
const startBackgroundMusic = vi.hoisted(() => vi.fn())
const stopBackgroundMusic = vi.hoisted(() => vi.fn())
vi.mock('../../services/ads/rewardedAds', () => ({ showRewardedAd: showAd }))
vi.mock('../../state/PlayerContext', () => ({ usePlayer: () => ({
  player: { pawCoins: 0, settings: { music: false, haptics: false } }, completeLevel
}) }))
vi.mock('../../services/audio/audioService', () => ({ startBackgroundMusic, stopBackgroundMusic }))
vi.mock('../../services/haptics/hapticsService', () => ({ playPlacementHaptic: vi.fn() }))
afterEach(() => { cleanup(); vi.useRealTimers(); vi.clearAllMocks() })

function mount() {
  vi.useFakeTimers()
  const next = vi.fn()
  const view = render(<GameScreen levelId={1} onHome={vi.fn()} onSettings={vi.fn()} onNextLevel={next} onLevelSelect={vi.fn()} onToast={vi.fn()} />)
  return { ...view, next }
}
function mountLevel(levelId: number) {
  vi.useFakeTimers()
  const view = render(<GameScreen levelId={levelId} onHome={vi.fn()} onSettings={vi.fn()} onNextLevel={vi.fn()} onLevelSelect={vi.fn()} onToast={vi.fn()} />)
  return view
}
function cell(row: number, column: number) { return screen.getByRole('button', { name: `放在第 ${row} 排、第 ${column} 欄` }) }
function start() { fireEvent.click(screen.getByRole('button', { name: '開始救援' })) }
function finish() { for (let i = 0; i < 9; i++) act(() => vi.advanceTimersByTime(700)) }
async function flushAsyncState() {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
  })
}
async function waitForPlaced(count: number) {
  await flushAsyncState()
  expect(document.querySelector('.planning-tray__heading b')).toHaveTextContent(`已安排 ${count} /`)
}
async function place(row: number, column: number, count: number) {
  fireEvent.click(cell(row, column))
  await waitForPlaced(count)
}

describe('8x8 planning level through the game entry point', () => {
  it('routes levels two through twenty-five into the same 8x8 planning rules and scrollable tray', () => {
    for (const levelId of Array.from({ length: 24 }, (_, index) => index + 2)) {
      cleanup()
      mountLevel(levelId)
      expect(document.querySelectorAll('.planning-cell')).toHaveLength(64)
      expect(document.querySelector('.planning-tray__cats')).toBeInTheDocument()
      expect(document.querySelector('[data-testid="planning-objective"]')).toBeInTheDocument()
      if (levelId >= 7) expect(document.querySelector('.planning-tray__hint')).toBeInTheDocument()
      else expect(document.querySelector('.planning-tray__hint')).toBeNull()
      for (const card of document.querySelectorAll('.planning-tray__cat')) {
        expect(card.querySelector('img')).not.toBeNull()
        expect(card.getAttribute('aria-label')).toBeTruthy()
      }
      expect(screen.queryByRole('timer')).toBeNull()
    }
  })

  it('shows all cats, no timer, editable numbered placements and gated start', async () => {
    const { container } = mount()
    expect(screen.getByTestId('planning-objective')).toBeInTheDocument()
    expect(screen.getByText('本關條件')).toBeInTheDocument()
    expect(screen.getByTestId('planning-objective-line-horizontal')).toBeInTheDocument()
    expect(screen.getByTestId('planning-objective-line-vertical')).toBeInTheDocument()
    expect(screen.getByTestId('planning-objective-line-horizontal')).toHaveTextContent('━×1')
    expect(screen.getByTestId('planning-objective-line-vertical')).toHaveTextContent('┃×2')
    expect(screen.getByTestId('planning-objective-cleared')).toHaveTextContent('▦×9')
    expect(screen.queryByTestId('planning-objective-line-diagonal')).toBeNull()
    expect(screen.queryByTestId('planning-objective-merge')).toBeNull()
    expect(container.querySelectorAll('.planning-cell')).toHaveLength(64)
    expect(container.querySelectorAll('.planning-tray img')).toHaveLength(3)
    expect(container.querySelectorAll('.planning-tray button')).toHaveLength(0)
    expect(container.querySelectorAll('button.planning-cat')).toHaveLength(0)
    expect(screen.queryByRole('timer')).toBeNull()
    expect(screen.getByRole('button', { name: '開始救援' })).toBeDisabled()
    await place(4, 5, 1)
    expect(container.querySelectorAll('.planning-tray img')).toHaveLength(2)
    expect(container.querySelectorAll('button.planning-cat')).toHaveLength(1)
    await place(3, 5, 2)
    expect(container.querySelectorAll('.planning-tray img')).toHaveLength(1)
    await place(2, 5, 3)
    expect(container.querySelectorAll('.planning-tray img')).toHaveLength(0)
    expect(container.querySelectorAll('.planning-cat')).toHaveLength(9)
    expect([...container.querySelectorAll('.planning-cat b')].map(node => node.textContent).sort()).toEqual(['1', '2', '3'])
    expect(screen.getByRole('button', { name: '開始救援' })).toBeEnabled()
    expect(screen.getByLabelText('生命 3')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(120000))
    expect(container.querySelectorAll('.planning-cat')).toHaveLength(9)
    fireEvent.click(screen.getByRole('button', { name: '拿回 3 奶霜' }))
    expect(screen.getByRole('button', { name: '開始救援' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '撤銷上一步 0' })).toBeDisabled()
    expect(container.querySelectorAll('.planning-tray img')).toHaveLength(1)
    expect(screen.queryByRole('button', { name: '拿回 2 小灰' })).toBeNull()
    expect(screen.getByText('失敗 0 次')).toBeInTheDocument()
  })

  it('replaces take-all with one free hint per planning level', async () => {
    const { container } = mount()
    const hint = screen.getByRole('button', { name: /提示/ })
    expect(hint).toBeEnabled()
    expect(screen.queryByRole('button', { name: '全部拿回' })).toBeNull()
    fireEvent.click(hint)
    expect(hint).toBeDisabled()
    await flushAsyncState()
    expect(screen.queryByText('正在確認這個位置是否仍可解⋯')).toBeNull()
    expect(container.querySelector('.planning-placement-cell.is-hint')).toBeInTheDocument()
    expect(screen.getByText('提示已標出下一隻貓咪的推薦位置')).toBeInTheDocument()
  })

  it('suspends input, playback and audio while the app window is inactive', () => {
    mount()
    const firstCell = cell(4, 5)
    fireEvent.blur(window)
    expect(firstCell).toBeDisabled()
    expect(document.querySelector('.screen--planning')).toHaveClass('is-suspended')
    expect(stopBackgroundMusic).toHaveBeenCalled()

    fireEvent.focus(window)
    expect(firstCell).toBeEnabled()
    expect(document.querySelector('.screen--planning')).not.toHaveClass('is-suspended')
  })
  it('plays three waves, awards once, and navigates to level two', async () => {
    const { next } = mount()
    await place(4, 5, 1)
    await place(3, 5, 2)
    await place(2, 5, 3)
    start()
    expect(cell(4, 5)).toBeDisabled()
    expect(completeLevel).not.toHaveBeenCalled()
    finish()
    expect(screen.getByRole('dialog', { name: '全部回家了！' })).toBeInTheDocument()
    expect(completeLevel).toHaveBeenCalledExactlyOnceWith(1, 3, 50)
    finish()
    expect(completeLevel).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: '前往第 2 關' }))
    expect(next).toHaveBeenCalledWith(2)
  })
  it('spends lives immediately on a proven dead click and resets before the next try', async () => {
    mount()
    const fail = async (lives: number) => {
      fireEvent.click(cell(1, 1))
      await flushAsyncState()
      expect(screen.getByLabelText(`生命 ${lives}`)).toBeInTheDocument()
    }
    await fail(2)
    expect(screen.queryByRole('dialog', { name: '點擊判定失敗' })).toBeNull()
    expect(screen.queryByRole('button', { name: /從中斷處修改/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /看廣告/ })).toBeNull()
    expect(screen.getByText('失敗 1 次')).toBeInTheDocument()
    expect(screen.getByLabelText('生命 2')).toBeInTheDocument()
    expect(screen.getByText('已安排 0 / 3')).toBeInTheDocument()

    await fail(1)
    expect(screen.getByLabelText('生命 1')).toBeInTheDocument()
    expect(screen.getByText('已安排 0 / 3')).toBeInTheDocument()

    await fail(0)
    expect(screen.getByRole('dialog', { name: '點擊判定失敗' })).toBeInTheDocument()
    expect(screen.getByLabelText('生命 0')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /看廣告/ })).toBeNull()
  })
  it('pauses playback and discards an old run when restarting', async () => {
    mount()
    await place(4, 5, 1)
    await place(3, 5, 2)
    await place(2, 5, 3)
    start()
    fireEvent.click(screen.getByRole('button', { name: '暫停' }))
    finish()
    expect(completeLevel).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '重新開始本關' }))
    finish()
    expect(completeLevel).not.toHaveBeenCalled()
    expect(screen.getByText('已安排 0 / 3')).toBeInTheDocument()
  })

})
