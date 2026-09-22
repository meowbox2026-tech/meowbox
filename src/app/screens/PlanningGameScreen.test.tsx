import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GameScreen } from './GameScreen'

const completeLevel = vi.hoisted(() => vi.fn())
const showAd = vi.hoisted(() => vi.fn())
vi.mock('../../services/ads/rewardedAds', () => ({ showRewardedAd: showAd }))
vi.mock('../../state/PlayerContext', () => ({ usePlayer: () => ({
  player: { pawCoins: 0, settings: { music: false, haptics: false } }, completeLevel
}) }))
vi.mock('../../services/audio/audioService', () => ({ startBackgroundMusic: vi.fn(), stopBackgroundMusic: vi.fn() }))
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

describe('8x8 planning level through the game entry point', () => {
  it('routes levels two through ten into the same 8x8 planning rules and scrollable tray', () => {
    for (const levelId of [2, 3, 4, 5, 6, 7, 8, 9, 10]) {
      cleanup()
      mountLevel(levelId)
      expect(document.querySelectorAll('.planning-cell')).toHaveLength(64)
      expect(document.querySelector('.planning-tray__cats')).toBeInTheDocument()
      if (levelId >= 7) expect(document.querySelector('.planning-tray__hint')).toBeInTheDocument()
      else expect(document.querySelector('.planning-tray__hint')).toBeNull()
      for (const card of document.querySelectorAll('.planning-tray__cats button')) {
        expect(card.textContent).toBe('')
        expect(card.querySelector('img')).not.toBeNull()
        expect(card.getAttribute('aria-label')).toBeTruthy()
      }
      expect(screen.queryByRole('timer')).toBeNull()
    }
  })

  it('shows all cats, no timer, editable numbered placements and gated start', () => {
    const { container } = mount()
    expect(container.querySelectorAll('.planning-cell')).toHaveLength(64)
    expect(container.querySelectorAll('.planning-tray img')).toHaveLength(3)
    expect(screen.queryByRole('timer')).toBeNull()
    expect(screen.getByRole('button', { name: '開始救援' })).toBeDisabled()
    fireEvent.click(cell(4, 5))
    fireEvent.click(cell(3, 5))
    fireEvent.click(cell(2, 5))
    expect(container.querySelectorAll('.planning-cat')).toHaveLength(9)
    expect([...container.querySelectorAll('.planning-cat b')].map(node => node.textContent).sort()).toEqual(['1', '2', '3'])
    expect(screen.getByRole('button', { name: '開始救援' })).toBeEnabled()
    act(() => vi.advanceTimersByTime(120000))
    expect(container.querySelectorAll('.planning-cat')).toHaveLength(9)
    fireEvent.click(screen.getByRole('button', { name: '拿回 2 小灰' }))
    expect(screen.getByRole('button', { name: '開始救援' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '拿回 2 奶霜' })).toBeInTheDocument()
    expect(screen.getByText('失敗 0 次')).toBeInTheDocument()
  })
  it('plays three waves, awards once, and navigates to level two', () => {
    const { next } = mount()
    fireEvent.click(cell(4, 5))
    fireEvent.click(cell(3, 5))
    fireEvent.click(cell(2, 5))
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
  it('edits surviving player cats at the stopped board and keeps earlier clears', () => {
    mount()
    fireEvent.click(cell(4, 5))
    fireEvent.click(screen.getByRole('button', { name: '奶霜' }))
    fireEvent.click(cell(3, 5))
    fireEvent.click(cell(2, 5))
    start()
    finish()
    expect(screen.getByRole('dialog', { name: '再調整一下' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '從中斷處修改（用 1 次）' }))
    expect(screen.getByText('失敗 1 次')).toBeInTheDocument()
    expect(screen.getByText('中途重試剩 1 次')).toBeInTheDocument()
    expect(document.querySelectorAll('.planning-cat')).toHaveLength(6)
    expect(document.querySelectorAll('button.planning-cat')).toHaveLength(2)
    expect(document.querySelectorAll('.planning-tray img')).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: '撤銷上一步' }))
    fireEvent.click(screen.getByRole('button', { name: '撤銷上一步' }))
    fireEvent.click(screen.getByRole('button', { name: '小灰' }))
    fireEvent.click(cell(6, 5))
    fireEvent.click(cell(5, 5))
    start()
    finish()
    expect(completeLevel).toHaveBeenCalledExactlyOnceWith(1, 2, 50)
  })
  it('offers a rewarded retry only after both free retries, and cancellation grants nothing', async () => {
    mount()
    fireEvent.click(cell(1, 1))
    fireEvent.click(cell(1, 3))
    fireEvent.click(cell(1, 5))
    start()
    for (const remaining of [1, 0]) {
      fireEvent.click(screen.getByRole('button', { name: '從中斷處修改（用 1 次）' }))
      expect(screen.getByText(`中途重試剩 ${remaining} 次`)).toBeInTheDocument()
      start()
    }
    expect(screen.queryByRole('button', { name: '從中斷處修改（用 1 次）' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '看廣告，多重試 1 次' }))
    fireEvent.click(screen.getByRole('button', { name: '暫時不用' }))
    expect(showAd).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '看廣告，多重試 1 次' }))
    showAd.mockResolvedValueOnce({ completed: false, kind: 'planning-retry' })
    await act(async () => fireEvent.click(screen.getByRole('button', { name: '觀看並領取' })))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    showAd.mockResolvedValueOnce({ completed: true, kind: 'planning-retry' })
    await act(async () => fireEvent.click(screen.getByRole('button', { name: '觀看並領取' })))
    expect(showAd).toHaveBeenLastCalledWith('planning-retry')
    expect(screen.getByRole('button', { name: '開始救援' })).toBeEnabled()
    expect(screen.getByText('中途重試剩 0 次')).toBeInTheDocument()
    start()
    fireEvent.click(screen.getByRole('button', { name: '整關重來' }))
    expect(screen.getByText('中途重試剩 2 次')).toBeInTheDocument()
    expect(screen.getByText('已安排 0 / 3')).toBeInTheDocument()
  })
  it('pauses playback and discards an old run when restarting', () => {
    mount()
    fireEvent.click(cell(4, 5))
    fireEvent.click(cell(3, 5))
    fireEvent.click(cell(2, 5))
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
