import { beforeEach, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ getSession: vi.fn(), signInAnonymously: vi.fn() }))
vi.mock('./supabaseClient', () => ({ getSupabaseClient: () => ({ auth: mocks }) }))
import { getAnonymousUserId, resetAnonymousIdentityForTests } from './anonymousIdentity'

beforeEach(() => { vi.clearAllMocks(); resetAnonymousIdentityForTests() })
it('shares an in-flight sign-in between analytics and profile requests', async () => {
  mocks.getSession.mockResolvedValue({ data: { session: null }, error: null })
  mocks.signInAnonymously.mockResolvedValue({ data: { user: { id: 'one-user' } }, error: null })
  expect(await Promise.all([getAnonymousUserId(), getAnonymousUserId()])).toEqual(['one-user', 'one-user'])
  expect(mocks.signInAnonymously).toHaveBeenCalledTimes(1)
})
it('retries a failed sign-in without replacing an existing identity', async () => {
  mocks.getSession.mockResolvedValueOnce({ data: { session: null }, error: new Error() })
    .mockResolvedValueOnce({ data: { session: { user: { id: 'existing' } } }, error: null })
  expect(await getAnonymousUserId()).toBeNull()
  expect(await getAnonymousUserId()).toBe('existing')
  expect(mocks.signInAnonymously).not.toHaveBeenCalled()
})
