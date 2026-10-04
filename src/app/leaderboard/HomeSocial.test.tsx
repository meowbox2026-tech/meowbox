import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { HomeSocial } from './HomeSocial'

const api = vi.hoisted(() => ({ loadProfile: vi.fn() }))
const cache = vi.hoisted(() => ({ getCachedProfile: vi.fn() }))
vi.mock('../../services/leaderboard/leaderboardService', () => api)
vi.mock('../../services/leaderboard/profileCache', () => cache)
afterEach(cleanup)

beforeEach(() => {
  vi.clearAllMocks()
  cache.getCachedProfile.mockReturnValue(undefined)
  api.loadProfile.mockImplementation(() => new Promise(() => undefined))
})

it('renders the cached avatar before the profile request completes', () => {
  cache.getCachedProfile.mockReturnValue({ name: '小花', avatar: 'white', publicId: '11111111-1111-4111-8111-111111111111' })

  render(<HomeSocial onNavigate={vi.fn()} />)

  expect(screen.getByRole('button', { name: '我的貓咪' }).querySelector('img')).toHaveAttribute('src', '/assets/cats/white.png')
})
