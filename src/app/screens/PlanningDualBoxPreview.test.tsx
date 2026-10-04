import { EXPANDED_DUAL_BOX_LEVELS } from '../../game/data/planningDualBoxExpanded'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PlanningGameScreen } from './PlanningGameScreen'

const completeLevel = vi.hoisted(() => vi.fn())
const recordPlayerEvent = vi.hoisted(() => vi.fn())
vi.mock('../../state/PlayerContext', () => ({ usePlayer: () => ({
  player: { settings: { music: false, sound: false, haptics: false } }, completeLevel
}) }))
vi.mock('../../services/audio/audioService', () => ({ pauseBackgroundMusic: vi.fn(), startBackgroundMusic: vi.fn(),
  stopBackgroundMusic: vi.fn(), playClearSound: vi.fn(), playLevelResultSound: vi.fn() }))
vi.mock('../../services/analytics/analytics', () => ({ recordPlayerEvent, createAnalyticsId: () => 'preview' }))
vi.mock('../../services/haptics/hapticsService', () => ({ playPlacementHaptic: vi.fn() }))
afterEach(() => { cleanup(); vi.useRealTimers(); vi.clearAllMocks() })

function mount(previewMode: boolean, levelId = 61) {
  vi.useFakeTimers()
  return render(<PlanningGameScreen levelId={levelId} previewMode={previewMode} onHome={vi.fn()} onSettings={vi.fn()}
    onLevelSelect={vi.fn()} onNextLevel={vi.fn()} onPlayAction={vi.fn()} onWatchUndoAd={async () => true} />)
}
describe('dual box previews', () => {
  it.each([51, 70, 71, 90])('renders and solves the larger three-route level %i', levelId => {
    const level = EXPANDED_DUAL_BOX_LEVELS.get(levelId)!
    mount(true, levelId)
    expect(document.querySelectorAll('.dual-box__cell')).toHaveLength(level.width * 8)
    expect(document.querySelectorAll('.dual-box__portal.is-third')).toHaveLength(2)
    expect(document.querySelector('.dual-box__intro')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('剪刀貓')).not.toBeInTheDocument()
    for (const p of level.solution) {
      const side = p.x < level.dualBox!.splitAt ? '左箱' : '右箱'
      const column = p.x % level.dualBox!.splitAt + 1
      fireEvent.click(screen.getByRole('button', { name: `${side} ${p.y + 1}, ${column}` }))
    }
    fireEvent.click(screen.getByRole('button', { name: '開始救援' }))
    for (let i = 0; i < 35; i++) act(() => vi.advanceTimersByTime(2500))
    expect(screen.getByRole('heading', { name: '全部回家了！' })).toBeInTheDocument()
    expect(completeLevel).not.toHaveBeenCalled()
    expect(recordPlayerEvent).not.toHaveBeenCalled()
  })
  it('plays the harder level 31 with eight placements and six waves', () => {
    mount(true, 31)
    expect(screen.getByText('A 送往右箱、B 返回左箱；先替下一段安排落點。')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '左箱 4, 3' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '右箱 8, 4' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '看傳送示範' }))
    expect(document.querySelector('.planning-tray__heading b')).toHaveTextContent('已安排 0 / 8')
    act(() => vi.advanceTimersByTime(999))
    expect(document.querySelector('.planning-tray__heading b')).toHaveTextContent('已安排 0 / 8')
    act(() => vi.advanceTimersByTime(1))
    expect(document.querySelector('.planning-tray__heading b')).toHaveTextContent('已安排 1 / 8')
    for (let i = 0; i < 7; i++) act(() => vi.advanceTimersByTime(1000))
    expect(document.querySelector('.planning-tray__heading b')).toHaveTextContent('已安排 8 / 8')
    for (let i = 0; i < 20; i++) act(() => vi.advanceTimersByTime(1600))
    expect(screen.getByRole('heading', { name: '全部回家了！' })).toBeInTheDocument()
    expect(completeLevel).not.toHaveBeenCalled()
  })
  it.each([32, 40, 50, 61])('hides the teaching demo in level %i', levelId => {
    mount(true, levelId)
    expect(screen.getByLabelText('雙箱傳送')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '看傳送示範' })).not.toBeInTheDocument()
    expect(document.querySelector('.dual-box__intro')).not.toBeInTheDocument()
  })
  it('pauses demo placements and cancels them when restarting', () => {
    mount(true, 31)
    fireEvent.click(screen.getByRole('button', { name: '看傳送示範' }))
    act(() => vi.advanceTimersByTime(1000))
    fireEvent.click(screen.getByRole('button', { name: '暫停' }))
    act(() => vi.advanceTimersByTime(5000))
    expect(document.querySelector('.planning-tray__heading b')).toHaveTextContent('已安排 1 / 8')
    fireEvent.click(screen.getByRole('button', { name: '繼續遊戲' }))
    act(() => vi.advanceTimersByTime(1000))
    expect(document.querySelector('.planning-tray__heading b')).toHaveTextContent('已安排 2 / 8')
    fireEvent.click(screen.getByRole('button', { name: '暫停' }))
    fireEvent.click(screen.getByRole('button', { name: '重新開始本關' }))
    act(() => vi.advanceTimersByTime(5000))
    expect(document.querySelector('.planning-tray__heading b')).toHaveTextContent('已安排 0 / 8')
    expect(screen.getByRole('button', { name: '看傳送示範' })).toBeEnabled()
  })
  it('shows starting boxes and prevents placing relay cats across the wall', () => {
    mount(true, 31)
    expect(document.querySelectorAll('.dual-box__tray-label')).toHaveLength(8)
    expect(screen.getByRole('button', { name: '右箱 8, 2' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '左箱 6, 2' }))
    expect(screen.getByRole('button', { name: '右箱 8, 2' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '左箱 5, 1' }))
    expect(screen.getByRole('button', { name: '右箱 8, 2' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '左箱 5, 3' })).toBeDisabled()
  })
  it('keeps the released level unchanged outside preview mode', () => {
    const { container } = mount(false)
    expect(screen.queryByRole('button', { name: '看傳送示範' })).not.toBeInTheDocument()
    expect(container.querySelectorAll('.planning-cell')).toHaveLength(64)
  })
})
