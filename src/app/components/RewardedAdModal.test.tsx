import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RewardedAdModal } from './RewardedAdModal'
const show = vi.hoisted(() => vi.fn())
vi.mock('../../services/ads/rewardedAds', () => ({ showRewardedAd: show }))
afterEach(() => { cleanup(); vi.resetAllMocks() })
const mount = (onReward = vi.fn()) => ({ onReward, ...render(<RewardedAdModal open kind="hint" title="提示" description="選一欄" onReward={onReward} onClose={vi.fn()} />) })
describe('reward confirmation', () => {
  it('grants a completed reward once even with rapid clicks', async () => {
    let finish!: (value: unknown) => void
    show.mockReturnValue(new Promise(resolve => { finish = resolve }))
    const { onReward } = mount()
    const button = screen.getByRole('button', { name: '觀看並領取' })
    fireEvent.click(button); fireEvent.click(button)
    expect(show).toHaveBeenCalledTimes(1)
    await act(async () => finish({ completed: true, kind: 'hint' }))
    expect(onReward).toHaveBeenCalledTimes(1)
  })
  it.each([{ completed: false, kind: 'hint' }, { completed: true, kind: 'double-reward' }])('does not grant an incomplete or mismatched reward', async result => {
    show.mockResolvedValue(result)
    const { onReward } = mount()
    await act(async () => fireEvent.click(screen.getByRole('button', { name: '觀看並領取' })))
    expect(onReward).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
  it('allows retry after a gateway failure', async () => {
    show.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ completed: true, kind: 'hint' })
    const { onReward } = mount()
    await act(async () => fireEvent.click(screen.getByRole('button', { name: '觀看並領取' })))
    expect(onReward).not.toHaveBeenCalled()
    await act(async () => fireEvent.click(screen.getByRole('button', { name: '觀看並領取' })))
    expect(onReward).toHaveBeenCalledTimes(1)
  })
  it('ignores a late completion after leaving the game', async () => {
    let finish!: (value: unknown) => void
    show.mockReturnValue(new Promise(resolve => { finish = resolve }))
    const { onReward, unmount } = mount()
    fireEvent.click(screen.getByRole('button', { name: '觀看並領取' }))
    unmount()
    await act(async () => finish({ completed: true, kind: 'hint' }))
    expect(onReward).not.toHaveBeenCalled()
  })
})
