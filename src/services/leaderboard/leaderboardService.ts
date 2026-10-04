import { getSupabaseClient } from '../supabase/supabaseClient'
import { getAnonymousUserId, resetAnonymousIdentity } from '../supabase/anonymousIdentity'
import {
  clearCachedProfile, getCachedProfileEntry, loadCachedProfile, persistCachedProfile,
} from './profileCache'
import { parseBlockedPlayers, parseLeaderboard, parseProfile, validName, AVATARS,
  type BlockedPlayer, type ProfileDraft, type PublicProfile } from './profile'

const PROFILE_CACHE_TTL_MS = 15 * 60 * 1000
let profileRequest: Promise<PublicProfile | null> | undefined

async function rpc(name: string, args?: Record<string, unknown>, userId?: string): Promise<unknown> {
  const client = getSupabaseClient()
  if (!client || !(userId ?? await getAnonymousUserId())) throw new Error('unavailable')
  const { data, error } = await client.rpc(name, args).abortSignal(AbortSignal.timeout(12000))
  if (error) throw new Error('unavailable')
  return data
}

export function loadProfile(options: { force?: boolean } = {}): Promise<PublicProfile | null> {
  const force = options.force === true
  const cached = getCachedProfileEntry()
  if (!force && cached && isFreshProfileCache(cached.cachedAt)) return Promise.resolve(cached.profile)
  if (profileRequest) return profileRequest

  const request = loadProfileFromSupabase(force)
  const trackedRequest = request.finally(() => {
    if (profileRequest === trackedRequest) profileRequest = undefined
  })
  profileRequest = trackedRequest
  return trackedRequest
}

async function loadProfileFromSupabase(force: boolean): Promise<PublicProfile | null> {
  const client = getSupabaseClient()
  const userId = client ? await getAnonymousUserId() : null
  if (!client || !userId) throw new Error('unavailable')

  if (!force) {
    const cached = await loadCachedProfile(userId)
    if (cached && isFreshProfileCache(cached.cachedAt)) return cached.profile
  }

  const data = await rpc('get_my_leaderboard_profile', undefined, userId)
  if (data === null) {
    await persistCachedProfile(userId, null)
    return null
  }
  const profile = parseProfile(data)
  if (!profile) throw new Error('invalid-response')
  await persistCachedProfile(userId, profile)
  return profile
}

export async function saveProfile(profile: ProfileDraft): Promise<PublicProfile> {
  if (!validName(profile.name) || !AVATARS.includes(profile.avatar)) throw new Error('invalid-profile')
  const userId = await getAnonymousUserId()
  if (!userId) throw new Error('unavailable')
  const data = await rpc('save_leaderboard_profile', { p_name: profile.name.trim().normalize('NFC'), p_avatar: profile.avatar }, userId)
  const saved = parseProfile(data)
  if (!saved) throw new Error('invalid-response')
  await persistCachedProfile(userId, saved)
  return saved
}

export async function loadLeaderboard() { return parseLeaderboard(await rpc('get_leaderboard')) }
export async function leaveLeaderboard() {
  await rpc('leave_leaderboard')
  await clearCachedProfile()
}

const publicIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requirePublicId(publicId: string) {
  if (!publicIdPattern.test(publicId)) throw new Error('invalid-player')
}

export async function blockPlayer(publicId: string) {
  requirePublicId(publicId)
  await rpc('block_leaderboard_player', { p_public_id: publicId })
}

export async function unblockPlayer(publicId: string) {
  requirePublicId(publicId)
  await rpc('unblock_leaderboard_player', { p_public_id: publicId })
}

export async function loadBlockedPlayers(): Promise<BlockedPlayer[]> {
  return parseBlockedPlayers(await rpc('get_my_blocked_players'))
}

export async function deleteAnonymousAccount(): Promise<void> {
  const client = getSupabaseClient()
  if (!client || await getAnonymousUserId() === null) throw new Error('unavailable')
  if (await rpc('delete_my_anonymous_account') !== true) throw new Error('delete-failed')
  const { error } = await client.auth.signOut({ scope: 'local' })
  resetAnonymousIdentity()
  await clearCachedProfile()
  if (error) throw new Error('sign-out-failed')
}

function isFreshProfileCache(cachedAt: number): boolean {
  return Date.now() - cachedAt < PROFILE_CACHE_TTL_MS
}
