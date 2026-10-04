import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  blockPlayer, deleteAnonymousAccount, leaveLeaderboard, loadBlockedPlayers, loadLeaderboard,
  loadProfile, saveProfile, unblockPlayer,
} from './leaderboardService'
import { resetProfileCacheForTests } from './profileCache'

const mocks = vi.hoisted(() => ({
  clientAvailable: true,
  response: { data: null as unknown, error: null as unknown },
  client: {
    rpc: vi.fn(),
    auth: { signOut: vi.fn() },
  },
  getAnonymousUserId: vi.fn(),
  resetAnonymousIdentity: vi.fn(),
}))

vi.mock('../supabase/supabaseClient', () => ({
  getSupabaseClient: () => mocks.clientAvailable ? mocks.client : null,
}))
vi.mock('../supabase/anonymousIdentity', () => ({
  getAnonymousUserId: mocks.getAnonymousUserId,
  resetAnonymousIdentity: mocks.resetAnonymousIdentity,
}))

const playerId = '11111111-1111-4111-8111-111111111111'
const anotherPlayerId = '22222222-2222-4222-8222-222222222222'
const profile = { publicId: playerId, name: '小花貓', avatar: 'orange' }

function response(data: unknown, error: unknown = null) {
  mocks.response = { data, error }
  mocks.client.rpc.mockReturnValue({ abortSignal: vi.fn().mockImplementation(async () => mocks.response) })
}

describe('leaderboard service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.localStorage.clear()
    resetProfileCacheForTests()
    mocks.clientAvailable = true
    mocks.getAnonymousUserId.mockResolvedValue(playerId)
    mocks.client.auth.signOut.mockResolvedValue({ error: null })
    response(null)
  })

  it('requires an available Supabase client and anonymous identity', async () => {
    mocks.clientAvailable = false
    await expect(loadLeaderboard()).rejects.toThrow('unavailable')
    mocks.clientAvailable = true
    mocks.getAnonymousUserId.mockResolvedValue(null)
    await expect(loadLeaderboard()).rejects.toThrow('unavailable')
    expect(mocks.client.rpc).not.toHaveBeenCalled()
  })

  it('converts RPC failures into a stable service error', async () => {
    response(null, { message: 'offline' })
    await expect(loadLeaderboard()).rejects.toThrow('unavailable')
    expect(mocks.client.rpc).toHaveBeenCalledWith('get_leaderboard', undefined)
  })

  it('loads a missing or valid profile and rejects malformed server data', async () => {
    response(null)
    await expect(loadProfile()).resolves.toBeNull()
    resetProfileCacheForTests()
    window.localStorage.clear()
    response(profile)
    await expect(loadProfile()).resolves.toEqual(profile)
    response({ ...profile, publicId: 'auth-user-id' })
    await expect(loadProfile({ force: true })).rejects.toThrow('invalid-response')
  })

  it('reuses a fresh local profile cache instead of repeating the profile RPC', async () => {
    response(profile)
    await expect(loadProfile()).resolves.toEqual(profile)

    response({ ...profile, avatar: 'white' })
    await expect(loadProfile()).resolves.toEqual(profile)
    expect(mocks.client.rpc).toHaveBeenCalledTimes(1)
  })

  it('caches an empty profile so an unjoined player is not queried on every screen change', async () => {
    response(null)
    await expect(loadProfile()).resolves.toBeNull()

    response(profile)
    await expect(loadProfile()).resolves.toBeNull()
    expect(mocks.client.rpc).toHaveBeenCalledTimes(1)
  })

  it('validates and normalizes a profile before saving', async () => {
    await expect(saveProfile({ name: 'x', avatar: 'orange' })).rejects.toThrow('invalid-profile')
    await expect(saveProfile({ name: '小花', avatar: 'https://example.invalid/cat' as never })).rejects.toThrow('invalid-profile')
    response({ ...profile, name: 'Meow' })
    await expect(saveProfile({ name: '  Meow  ', avatar: 'orange' })).resolves.toEqual({ ...profile, name: 'Meow' })
    expect(mocks.client.rpc).toHaveBeenCalledWith('save_leaderboard_profile', { p_name: 'Meow', p_avatar: 'orange' })
    response(null)
    await expect(loadProfile()).resolves.toEqual({ ...profile, name: 'Meow' })
    expect(mocks.client.rpc).toHaveBeenCalledTimes(1)
    await expect(saveProfile({ name: 'Meow', avatar: 'orange' })).rejects.toThrow('invalid-response')
  })

  it('loads highest-level rankings and blocked players and removes a public profile', async () => {
    response([{ ...profile, rank: 1, highestLevel: 4, isMe: true }])
    await expect(loadLeaderboard()).resolves.toMatchObject([{ rank: 1, highestLevel: 4, isMe: true }])
    response([profile])
    await expect(loadBlockedPlayers()).resolves.toEqual([profile])
    response([])
    await expect(loadBlockedPlayers()).resolves.toEqual([])
    await leaveLeaderboard()
    expect(mocks.client.rpc).toHaveBeenLastCalledWith('leave_leaderboard', undefined)
  })

  it('requires opaque player IDs before blocking or unblocking', async () => {
    await expect(blockPlayer('not-a-player-id')).rejects.toThrow('invalid-player')
    await expect(unblockPlayer('not-a-player-id')).rejects.toThrow('invalid-player')
    await blockPlayer(anotherPlayerId)
    await unblockPlayer(anotherPlayerId)
    expect(mocks.client.rpc).toHaveBeenNthCalledWith(1, 'block_leaderboard_player', { p_public_id: anotherPlayerId })
    expect(mocks.client.rpc).toHaveBeenNthCalledWith(2, 'unblock_leaderboard_player', { p_public_id: anotherPlayerId })
  })

  it('only clears the local session after server-confirmed anonymous account deletion', async () => {
    mocks.getAnonymousUserId.mockResolvedValue(null)
    await expect(deleteAnonymousAccount()).rejects.toThrow('unavailable')
    expect(mocks.client.rpc).not.toHaveBeenCalled()
    mocks.getAnonymousUserId.mockResolvedValue(playerId)
    response(false)
    await expect(deleteAnonymousAccount()).rejects.toThrow('delete-failed')
    expect(mocks.client.auth.signOut).not.toHaveBeenCalled()
    response(true)
    await expect(deleteAnonymousAccount()).resolves.toBeUndefined()
    expect(mocks.client.auth.signOut).toHaveBeenCalledWith({ scope: 'local' })
    expect(mocks.resetAnonymousIdentity).toHaveBeenCalledOnce()
  })

  it('resets the cached identity even when local sign-out reports an error', async () => {
    response(true)
    mocks.client.auth.signOut.mockResolvedValue({ error: new Error('storage unavailable') })
    await expect(deleteAnonymousAccount()).rejects.toThrow('sign-out-failed')
    expect(mocks.resetAnonymousIdentity).toHaveBeenCalledOnce()
  })
})
