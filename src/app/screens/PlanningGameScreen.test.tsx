import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GameScreen } from './GameScreen'

const completeLevel = vi.hoisted(() => vi.fn())
const playAction = vi.hoisted(() => vi.fn())
const watchUndoAd = vi.hoisted(() => vi.fn())
const watchHintAd = vi.hoisted(() => vi.fn())
const startBackgroundMusic = vi.hoisted(() => vi.fn())
const stopBackgroundMusic = vi.hoisted(() => vi.fn())
vi.mock('../../state/PlayerContext', () => ({ usePlayer: () => ({
  player: { settings: { music: false, sound: false, haptics: false } }, completeLevel
}) }))
vi.mock('../../services/audio/audioService', () => ({ startBackgroundMusic, stopBackgroundMusic }))
vi.mock('../../services/haptics/hapticsService', () => ({ playPlacementHaptic: vi.fn() }))
afterEach(() => { cleanup(); vi.useRealTimers(); vi.clearAllMocks() })

function mount() {
  vi.useFakeTimers()
  const next = vi.fn()
  const view = render(<GameScreen levelId={1} onHome={vi.fn()} onSettings={vi.fn()} onNextLevel={next} onLevelSelect={vi.fn()} onToast={vi.fn()} onPlayAction={playAction} onWatchUndoAd={watchUndoAd} onWatchHintAd={watchHintAd} />)
  return { ...view, next }
}
function mountLevel(levelId: number) {
  vi.useFakeTimers()
  const view = render(<GameScreen levelId={levelId} onHome={vi.fn()} onSettings={vi.fn()} onNextLevel={vi.fn()} onLevelSelect={vi.fn()} onToast={vi.fn()} onPlayAction={playAction} onWatchUndoAd={watchUndoAd} onWatchHintAd={watchHintAd} />)
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
  it('renders the first-pass candy prism board skin on a normal 8x8 grid', () => {
    const { container } = mount()
    const board = container.querySelector('.planning-board')
    const grid = container.querySelector('.planning-grid')

    expect(board).toHaveClass('planning-board--prism')
    expect(board).toHaveAttribute('data-board-size', '8x8')
    expect(grid).toHaveAttribute('data-board-skin', 'candy-prism')
    expect(container.querySelectorAll('.planning-cell')).toHaveLength(64)
  })

  it('routes levels two through thirty into the same 8x8 planning rules and scrollable tray', () => {
    for (const levelId of Array.from({ length: 29 }, (_, index) => index + 2)) {
      cleanup()
      mountLevel(levelId)
      expect(document.querySelectorAll('.planning-cell')).toHaveLength(64)
      expect(document.querySelector('.planning-tray__cats')).toBeInTheDocument()
      expect(document.querySelector('[data-testid="planning-objective"]')).toBeNull()
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
    expect(screen.queryByTestId('planning-objective')).toBeNull()
    expect(screen.queryByText('本關條件')).toBeNull()
    expect(screen.getByText('救出全部 9 隻貓咪')).toHaveClass('planning-top-goal')
    expect(screen.queryByText('不限時間・先排好再開始')).not.toBeInTheDocument()
    expect(screen.queryByText('雨天連線')).not.toBeInTheDocument()
    expect(screen.queryByText('失敗 0 次')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '撤銷上一步 1' })).toHaveClass('planning-undo-button')
    expect(screen.getByRole('button', { name: '提示 1' })).toHaveClass('planning-hint-button')
    expect(container.querySelector('.planning-undo-button img')).toHaveAttribute('src', '/assets/undo.webp')
    expect(container.querySelector('.planning-hint-button img')).toHaveAttribute('src', '/assets/hint.webp')
    expect(screen.queryByRole('button', { name: '玩法說明' })).toBeNull()
    expect(container.querySelectorAll('.planning-cell')).toHaveLength(64)
    expect(container.querySelectorAll('.planning-tray img')).toHaveLength(3)
    expect(container.querySelectorAll('.planning-tray button')).toHaveLength(0)
    expect(container.querySelectorAll('button.planning-cat')).toHaveLength(0)
    expect(screen.queryByRole('timer')).toBeNull()
    expect(screen.getByRole('button', { name: '開始救援' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '開始救援' })).toHaveClass('artwork-button')
    expect(container.querySelector('.planning-start img')).toHaveAttribute('src', '/assets/start.webp')
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
    expect(screen.queryByLabelText(/生命/)).toBeNull()
    act(() => vi.advanceTimersByTime(120000))
    expect(container.querySelectorAll('.planning-cat')).toHaveLength(9)
    fireEvent.click(screen.getByRole('button', { name: '拿回 3 奶霜' }))
    expect(screen.getByRole('button', { name: '開始救援' })).toBeDisabled()
    expect(screen.getByRole('button', { name: /撤銷上一步 0/ })).toBeEnabled()
    expect(screen.getByRole('button', { name: /撤銷上一步 0/ })).toHaveClass('is-attention')
    expect(container.querySelectorAll('.planning-tray img')).toHaveLength(1)
    expect(screen.queryByRole('button', { name: '拿回 2 小灰' })).toBeNull()
    expect(screen.queryByText('失敗 0 次')).not.toBeInTheDocument()
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
    expect(container.querySelector('.planning-placement-cell.is-hint')).toBeNull()
    expect(container.querySelectorAll('.planning-cat.is-added')).toHaveLength(1)
    expect(screen.getByText('已安排 1 / 3')).toBeInTheDocument()
    expect(screen.queryByText('提示已自動放置下一隻貓咪的最佳位置')).toBeNull()
  })
  it('opens the same ad flow after the free hint is spent and grants three hints', async () => {
    watchHintAd.mockResolvedValue(true)
    const { container } = mount()

    fireEvent.click(screen.getByRole('button', { name: /提示 1/ }))
    await waitForPlaced(1)

    const hint = screen.getByRole('button', { name: /提示 0/ })
    expect(hint).toBeEnabled()
    expect(hint).toHaveClass('is-attention')
    fireEvent.click(hint)

    expect(screen.getByRole('dialog', { name: '補充提示' })).toBeInTheDocument()
    expect(screen.getByText('目前沒有提示次數，要觀看廣告補充 3 次嗎？')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(screen.queryByRole('dialog', { name: '補充提示' })).toBeNull()
    expect(watchHintAd).not.toHaveBeenCalled()

    fireEvent.click(hint)
    fireEvent.click(screen.getByRole('button', { name: '觀看廣告' }))
    await flushAsyncState()

    expect(watchHintAd).toHaveBeenCalledOnce()
    expect(screen.getByText('本關已獲得 3 次提示')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /提示 3/ })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: /提示 3/ }))
    await waitForPlaced(2)
    expect(container.querySelectorAll('.planning-cat.is-added')).toHaveLength(2)
  })
  it('keeps the hint count at zero when the rewarded ad is not completed', async () => {
    watchHintAd.mockResolvedValue(false)
    mount()

    fireEvent.click(screen.getByRole('button', { name: /提示 1/ }))
    await waitForPlaced(1)
    fireEvent.click(screen.getByRole('button', { name: /提示 0/ }))
    fireEvent.click(screen.getByRole('button', { name: '觀看廣告' }))
    await flushAsyncState()

    expect(screen.getByText('廣告尚未完成，沒有增加提示')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /提示 0/ })).toBeEnabled()
  })
  it('opens an ad confirmation from the attention-marked undo button', async () => {
    watchUndoAd.mockResolvedValue({ completed: true })
    const { container } = mount()
    await place(4, 5, 1)
    fireEvent.click(screen.getByRole('button', { name: '撤銷上一步 1' }))

    const undo = screen.getByRole('button', { name: /撤銷上一步 0/ })
    expect(undo).toBeEnabled()
    expect(undo).toHaveClass('is-attention')
    expect(screen.queryByRole('button', { name: '觀看廣告獲得 5 次上一步' })).toBeNull()
    fireEvent.click(undo)
    expect(screen.getByRole('dialog', { name: '補充上一步' })).toBeInTheDocument()
    expect(screen.getByText('目前沒有上一步次數，要觀看廣告補充 5 次嗎？')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(screen.queryByRole('dialog', { name: '補充上一步' })).toBeNull()
    expect(watchUndoAd).not.toHaveBeenCalled()

    fireEvent.click(undo)
    fireEvent.click(screen.getByRole('button', { name: '觀看廣告' }))
    await flushAsyncState()

    expect(watchUndoAd).toHaveBeenCalledOnce()
    expect(screen.getByText('本關已獲得 5 次上一步')).toBeInTheDocument()
    await place(4, 5, 1)
    expect(screen.getByRole('button', { name: '撤銷上一步 5' })).toBeEnabled()
    expect(container.querySelector('.planning-tray__cats')).toBeInTheDocument()
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
    expect(completeLevel).toHaveBeenCalledExactlyOnceWith(1, 3)
    finish()
    expect(completeLevel).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: '前往第 2 關' }))
    expect(next).toHaveBeenCalledWith(2)
  })
  it('keeps arbitrary placements playable and removes the life UI', async () => {
    mount()
    fireEvent.click(cell(1, 1))
    await waitForPlaced(1)
    expect(screen.queryByLabelText(/生命/)).toBeNull()
    expect(screen.queryByText(/扣除.*生命/)).toBeNull()
    expect(screen.queryByText('失敗 0 次')).not.toBeInTheDocument()
    expect(screen.getByText('已安排 1 / 3')).toBeInTheDocument()
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
    expect(playAction).toHaveBeenCalledOnce()
    finish()
    expect(completeLevel).not.toHaveBeenCalled()
    expect(screen.getByText('已安排 0 / 3')).toBeInTheDocument()
  })

})
