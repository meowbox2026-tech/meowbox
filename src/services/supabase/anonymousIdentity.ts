import { getSupabaseClient } from './supabaseClient'

let pending: Promise<string | null> | undefined

/** Share one sign-in across analytics and profile requests, but never cache a failed login. */
export function getAnonymousUserId(): Promise<string | null> {
  if (pending) return pending
  pending = (async () => {
    const client = getSupabaseClient()
    if (!client) return null
    const { data, error } = await client.auth.getSession()
    if (error) return null
    if (data.session?.user.id) return data.session.user.id
    const result = await client.auth.signInAnonymously()
    return result.error ? null : result.data.user?.id ?? null
  })().catch(() => null).finally(() => { pending = undefined })
  return pending
}

export function resetAnonymousIdentity(): void { pending = undefined }
export const resetAnonymousIdentityForTests = resetAnonymousIdentity
