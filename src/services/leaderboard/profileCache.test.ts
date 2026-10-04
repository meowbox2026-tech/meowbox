import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearCachedProfile,
  getCachedProfile,
  loadCachedProfile,
  persistCachedProfile,
  resetProfileCacheForTests,
} from './profileCache'

const userId = '11111111-1111-4111-8111-111111111111'
const otherUserId = '22222222-2222-4222-8222-222222222222'
const profile = { publicId: userId, name: '小花貓', avatar: 'orange' as const }

beforeEach(async () => {
  window.localStorage.clear()
  await clearCachedProfile()
  resetProfileCacheForTests()
})

describe('leaderboard profile cache', () => {
  it('persists a profile locally and restores it after the memory cache is reset', async () => {
    await persistCachedProfile(userId, profile)
    expect(getCachedProfile()).toEqual(profile)

    resetProfileCacheForTests()

    await expect(loadCachedProfile(userId)).resolves.toMatchObject({ userId, profile })
  })

  it('remembers an empty profile without exposing it to another anonymous user', async () => {
    await persistCachedProfile(userId, null)
    expect(getCachedProfile()).toBeNull()
    resetProfileCacheForTests()

    await expect(loadCachedProfile(userId)).resolves.toMatchObject({ userId, profile: null })
    await expect(loadCachedProfile(otherUserId)).resolves.toBeUndefined()
  })

  it('clears both the memory and persistent cache', async () => {
    await persistCachedProfile(userId, profile)
    await clearCachedProfile()

    expect(getCachedProfile()).toBeUndefined()
    await expect(loadCachedProfile(userId)).resolves.toBeUndefined()
  })
})
