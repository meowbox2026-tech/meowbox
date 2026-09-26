import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ProfileScreen } from './ProfileScreen'
import { LeaderboardScreen } from './LeaderboardScreen'
const api = vi.hoisted(() => ({ loadProfile: vi.fn(), saveProfile: vi.fn(), leaveLeaderboard: vi.fn(), loadLeaderboard: vi.fn() }))
vi.mock('../../services/leaderboard/leaderboardService', () => api)
afterEach(cleanup)

beforeEach(() => {
  vi.clearAllMocks()
  api.loadProfile.mockResolvedValue(null)
  api.saveProfile.mockImplementation(async value => value)
  api.leaveLeaderboard.mockResolvedValue(undefined)
})

it('lets an anonymous player choose a built-in avatar and name with explicit join', async () => {
  const onSaved = vi.fn()
  render(<ProfileScreen onBack={vi.fn()} onSaved={onSaved} />)
  await screen.findByLabelText('玩家名稱')
  expect(api.saveProfile).not.toHaveBeenCalled()
  fireEvent.change(screen.getByLabelText('玩家名稱'), { target: { value: '小花貓' } })
  fireEvent.click(screen.getByRole('button', { name: '選擇貓咪頭像 6' }))
  fireEvent.click(screen.getByRole('button', { name: '加入排行榜' }))
  await screen.findByText('已儲存')
  expect(api.saveProfile).toHaveBeenCalledWith({ name: '小花貓', avatar: 'blue' })
  expect(onSaved).toHaveBeenCalledWith({ name: '小花貓', avatar: 'blue' })
})

it('rejects invalid names and does not claim a failed save succeeded', async () => {
  api.saveProfile.mockRejectedValue(new Error())
  render(<ProfileScreen onBack={vi.fn()} onSaved={vi.fn()} />)
  await screen.findByLabelText('玩家名稱')
  fireEvent.click(screen.getByRole('button', { name: '加入排行榜' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('有效名稱')
  expect(api.saveProfile).not.toHaveBeenCalled()
  fireEvent.change(screen.getByLabelText('玩家名稱'), { target: { value: '小白貓' } })
  fireEvent.click(screen.getByRole('button', { name: '加入排行榜' }))
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('目前無法連線'))
  expect(screen.queryByText('已儲存')).toBeNull()
})

it('requires confirmation before removing the public profile', async () => {
  api.loadProfile.mockResolvedValue({ name: '小花', avatar: 'white' })
  render(<ProfileScreen onBack={vi.fn()} onSaved={vi.fn()} />)
  fireEvent.click(await screen.findByRole('button', { name: '退出排行榜' }))
  expect(api.leaveLeaderboard).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: '退出排行榜' }))
  await waitFor(() => expect(api.leaveLeaderboard).toHaveBeenCalledOnce())
})

it('shows tied rankings and highlights the current player', async () => {
  api.loadLeaderboard.mockResolvedValue([
    { rank: 1, name: '小花', avatar: 'orange', completed: 12, isMe: false },
    { rank: 1, name: '小白', avatar: 'white', completed: 12, isMe: true },
  ])
  render(<LeaderboardScreen onBack={vi.fn()} onProfile={vi.fn()} />)
  await screen.findByText('小花')
  expect(screen.getAllByText('1')).toHaveLength(2)
  expect(document.querySelector('.is-me')).toHaveTextContent('小白')
})

it('distinguishes unavailable service from an empty leaderboard', async () => {
  api.loadLeaderboard.mockRejectedValue(new Error())
  render(<LeaderboardScreen onBack={vi.fn()} onProfile={vi.fn()} />)
  expect(await screen.findByRole('alert')).toHaveTextContent('目前無法連線')
  expect(screen.queryByText('還沒有玩家加入，成為第一位吧！')).toBeNull()
})
