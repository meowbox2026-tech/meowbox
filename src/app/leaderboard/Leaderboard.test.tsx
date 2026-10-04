import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ProfileScreen } from './ProfileScreen'
import { LeaderboardScreen } from './LeaderboardScreen'
const api = vi.hoisted(() => ({ loadProfile: vi.fn(), saveProfile: vi.fn(), leaveLeaderboard: vi.fn(), deleteAnonymousAccount: vi.fn(),
  loadBlockedPlayers: vi.fn(), unblockPlayer: vi.fn(), blockPlayer: vi.fn(), loadLeaderboard: vi.fn() }))
const cache = vi.hoisted(() => ({ getCachedProfile: vi.fn() }))
vi.mock('../../services/leaderboard/leaderboardService', () => api)
vi.mock('../../services/leaderboard/profileCache', () => cache)
afterEach(cleanup)

beforeEach(() => {
  vi.clearAllMocks()
  cache.getCachedProfile.mockReturnValue(undefined)
  api.loadProfile.mockResolvedValue(null)
  api.saveProfile.mockImplementation(async value => value)
  api.leaveLeaderboard.mockResolvedValue(undefined)
  api.deleteAnonymousAccount.mockResolvedValue(undefined)
  api.loadBlockedPlayers.mockResolvedValue([])
  api.unblockPlayer.mockResolvedValue(undefined)
  api.blockPlayer.mockResolvedValue(undefined)
  api.loadLeaderboard.mockResolvedValue([])
})

it('shows a cached profile immediately while the profile page refreshes in the background', () => {
  cache.getCachedProfile.mockReturnValue({ name: '小花', avatar: 'white', publicId: '11111111-1111-4111-8111-111111111111' })
  api.loadProfile.mockImplementation(() => new Promise(() => undefined))

  render(<ProfileScreen onBack={vi.fn()} onSaved={vi.fn()} />)

  expect(screen.getByLabelText('玩家名稱')).toHaveValue('小花')
})

it('lets an anonymous player choose a built-in avatar and name with explicit join', async () => {
  const onSaved = vi.fn()
  const onBack = vi.fn()
  render(<ProfileScreen onBack={onBack} onSaved={onSaved} />)
  await screen.findByLabelText('玩家名稱')
  expect(screen.queryByText('2–16 字，可使用中英文、數字、空格、底線與連字號。')).toBeNull()
  expect(screen.queryByRole('heading', { name: '我的貓咪' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: '關閉' }))
  expect(onBack).toHaveBeenCalledOnce()
  expect(api.saveProfile).not.toHaveBeenCalled()
  fireEvent.change(screen.getByLabelText('玩家名稱'), { target: { value: '小花貓' } })
  fireEvent.click(screen.getByRole('button', { name: '選擇貓咪頭像 6' }))
  fireEvent.click(screen.getByRole('button', { name: '加入並儲存' }))
  await screen.findByRole('status')
  expect(api.saveProfile).toHaveBeenCalledWith({ name: '小花貓', avatar: 'blue' })
  expect(onSaved).toHaveBeenCalledWith({ name: '小花貓', avatar: 'blue' })
  expect(screen.getByRole('button', { name: '已儲存' })).toBeDisabled()
  fireEvent.change(screen.getByLabelText('玩家名稱'), { target: { value: '小花隊長' } })
  expect(screen.getByRole('button', { name: '儲存變更' })).toBeEnabled()
})

it('rejects invalid names and does not claim a failed save succeeded', async () => {
  api.saveProfile.mockRejectedValue(new Error())
  render(<ProfileScreen onBack={vi.fn()} onSaved={vi.fn()} />)
  await screen.findByLabelText('玩家名稱')
  fireEvent.click(screen.getByRole('button', { name: '加入並儲存' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('有效名稱')
  expect(api.saveProfile).not.toHaveBeenCalled()
  fireEvent.change(screen.getByLabelText('玩家名稱'), { target: { value: '小白貓' } })
  fireEvent.click(screen.getByRole('button', { name: '加入並儲存' }))
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('資料暫時無法載入'))
  expect(screen.queryByText('已儲存')).toBeNull()
})

it('requires confirmation before removing the public profile', async () => {
  api.loadProfile.mockResolvedValue({ name: '小花', avatar: 'white', publicId: '11111111-1111-4111-8111-111111111111' })
  render(<ProfileScreen onBack={vi.fn()} onSaved={vi.fn()} />)
  fireEvent.click(await screen.findByRole('button', { name: '退出排行榜' }))
  expect(api.leaveLeaderboard).not.toHaveBeenCalled()
  fireEvent.click(screen.getAllByRole('button', { name: '退出排行榜' }).at(-1)!)
  await waitFor(() => expect(api.leaveLeaderboard).toHaveBeenCalledOnce())
})

it('requires a second explicit confirmation before deleting the anonymous account and cloud data', async () => {
  const onBack = vi.fn()
  const onSaved = vi.fn()
  render(<ProfileScreen onBack={onBack} onSaved={onSaved} />)
  await screen.findByLabelText('玩家名稱')
  fireEvent.click(screen.getByRole('button', { name: '刪除匿名帳號與雲端資料' }))
  expect(api.deleteAnonymousAccount).not.toHaveBeenCalled()
  expect(screen.getByRole('alertdialog')).toHaveTextContent('無法復原')
  fireEvent.click(screen.getByRole('button', { name: '永久刪除' }))
  await waitFor(() => expect(api.deleteAnonymousAccount).toHaveBeenCalledOnce())
  expect(onSaved).toHaveBeenCalledWith(null)
  expect(onBack).toHaveBeenCalledOnce()
})

it('lets the player unblock someone from profile settings', async () => {
  api.loadBlockedPlayers.mockResolvedValue([{ name: '小白', avatar: 'white', publicId: '22222222-2222-4222-8222-222222222222' }])
  render(<ProfileScreen onBack={vi.fn()} onSaved={vi.fn()} />)
  fireEvent.click(await screen.findByRole('button', { name: '解除封鎖 小白' }))
  await waitFor(() => expect(api.unblockPlayer).toHaveBeenCalledWith('22222222-2222-4222-8222-222222222222'))
})

it('shows tied rankings and highlights the current player', async () => {
  api.loadLeaderboard.mockResolvedValue([
    { rank: 1, name: '小花', avatar: 'orange', publicId: '11111111-1111-4111-8111-111111111111', highestLevel: 12, isMe: false },
    { rank: 1, name: '小白', avatar: 'white', publicId: '22222222-2222-4222-8222-222222222222', highestLevel: 12, isMe: true },
  ])
  render(<LeaderboardScreen onBack={vi.fn()} onProfile={vi.fn()} />)
  await screen.findByText('小花')
  expect(screen.getByRole('button', { name: '關閉' })).toBeInTheDocument()
  expect(screen.getAllByText('1')).toHaveLength(2)
  expect(screen.getAllByText('12')).toHaveLength(2)
  expect(screen.getAllByText('最高關卡', { exact: true })).toHaveLength(2)
  expect(document.querySelector('.is-me')).toHaveTextContent('小白')
  expect(screen.getByRole('link', { name: '檢舉 小花' })).toHaveAttribute('href', expect.stringContaining('mailto:'))
  fireEvent.click(screen.getByRole('button', { name: '封鎖 小花' }))
  expect(api.blockPlayer).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: '確認封鎖' }))
  await waitFor(() => expect(api.blockPlayer).toHaveBeenCalledWith('11111111-1111-4111-8111-111111111111'))
})

it('distinguishes unavailable service from an empty leaderboard', async () => {
  api.loadLeaderboard.mockRejectedValue(new Error())
  render(<LeaderboardScreen onBack={vi.fn()} onProfile={vi.fn()} />)
  expect(await screen.findByRole('alert')).toHaveTextContent('資料暫時無法載入')
  expect(screen.queryByText('還沒有玩家加入，成為第一位吧！')).toBeNull()
})
