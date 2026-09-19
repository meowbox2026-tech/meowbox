import { cleanup, act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GameScreen } from './GameScreen'
const completeLevel = vi.hoisted(() => vi.fn())
vi.mock('../../state/PlayerContext', () => ({ usePlayer: () => ({ player: { pawCoins: 0, settings: { sound: false, haptics: false } }, completeLevel }) }))
vi.mock('../../services/audio/audioService', () => ({ playCatSound: vi.fn(), playMatch3Sound: vi.fn(), startBackgroundMusic: vi.fn(), stopBackgroundMusic: vi.fn() }))
vi.mock('../../services/haptics/hapticsService', () => ({ playPlacementHaptic: vi.fn() }))
afterEach(() => { cleanup(); vi.useRealTimers(); vi.clearAllMocks() })
function mount() {
  vi.useFakeTimers()
  return render(<GameScreen levelId={1} onHome={vi.fn()} onSettings={vi.fn()} onLevelSelect={vi.fn()} onNextLevel={vi.fn()} onToast={vi.fn()} />)
}
function finishAnimation() { for (let n = 0; n < 8; n++) act(() => vi.advanceTimersByTime(600)) }
describe('first drop level', () => {
  it('updates previews immediately and keeps the last tapped landing ghost without another pointer move', () => {
    const { container } = mount()
    const column = screen.getByRole('button', { name: /第 5 欄/ })
    fireEvent.click(column)
    expect(screen.getByAltText('現在：小灰')).toBeInTheDocument()
    expect(screen.getByAltText('下一隻：小灰')).toBeInTheDocument()
    fireEvent.pointerLeave(column)
    fireEvent.blur(column)
    finishAnimation()
    expect((container.querySelector('.drop-ghost') as HTMLElement).style.left).toBe('66.66666666666666%')
    expect(container.querySelector('.drop-ghost img')).toHaveAttribute('src', '/assets/cats/blue.png')
  })
  it('plays to completion, awards once and restarts cleanly', () => {
    mount()
    for (let i = 0; i < 30 && !screen.queryByRole('dialog', { name: '過關囉！' }); i++) {
      const cat = screen.getByAltText(/^現在：/).getAttribute('alt')!
      const column = cat.includes('橘子') ? 3 : cat.includes('小灰') ? 1 : 2
      fireEvent.click(screen.getByRole('button', { name: new RegExp(`第 ${column} 欄`) }))
      finishAnimation()
    }
    expect(screen.getByRole('dialog', { name: '過關囉！' })).toBeInTheDocument()
    expect(completeLevel).toHaveBeenCalledTimes(1)
    expect(completeLevel).toHaveBeenCalledWith(1, 3, 50)
    expect(screen.getByRole('button', { name: /第 1 欄/ })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '再玩一次，挑戰高分' }))
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '0')
    expect(screen.getByRole('button', { name: /第 3 欄/ })).not.toBeDisabled()
    expect(completeLevel).toHaveBeenCalledTimes(1)
  })
  it('fails on overflow without giving rewards and blocks input under rules', () => {
    mount()
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
  it('previews the chosen column by pointer and keyboard and pauses input', () => {
    const { container } = mount()
    const column = screen.getByRole('button', { name: /第 5 欄/ })
    fireEvent.pointerEnter(column)
    expect((container.querySelector('.drop-ghost') as HTMLElement).style.left).toBe('66.66666666666666%')
    fireEvent.pointerLeave(column)
    expect((container.querySelector('.drop-ghost') as HTMLElement).style.left).toBe('33.33333333333333%')
    fireEvent.focus(column)
    expect((container.querySelector('.drop-ghost') as HTMLElement).style.left).toBe('66.66666666666666%')
    fireEvent.blur(column)
    fireEvent.click(screen.getByRole('button', { name: '暫停' }))
    expect(column).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '繼續遊戲' }))
    expect(column).not.toBeDisabled()
  })

})
