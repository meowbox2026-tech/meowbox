import { getSupabaseClient } from '../supabase/supabaseClient'
import { getAnonymousUserId, resetAnonymousIdentity } from '../supabase/anonymousIdentity'
import { parseBlockedPlayers, parseLeaderboard, parseProfile, validName, AVATARS,
  type BlockedPlayer, type ProfileDraft, type PublicProfile } from './profile'

async function rpc(name: string, args?: Record<string, unknown>): Promise<unknown> {
  const client = getSupabaseClient()
  if (!client || !await getAnonymousUserId()) throw new Error('unavailable')
  const { data, error } = await client.rpc(name, args).abortSignal(AbortSignal.timeout(12000))
  if (error) throw new Error('unavailable')
  return data
}

export async function loadProfile(): Promise<PublicProfile | null> {
  const data = await rpc('get_my_leaderboard_profile')
  if (data === null) return null
  const profile = parseProfile(data)
  if (!profile) throw new Error('invalid-response')
  return profile
}

export async function saveProfile(profile: ProfileDraft): Promise<PublicProfile> {
  if (!validName(profile.name) || !AVATARS.includes(profile.avatar)) throw new Error('invalid-profile')
  const data = await rpc('save_leaderboard_profile', { p_name: profile.name.trim().normalize('NFC'), p_avatar: profile.avatar })
  const saved = parseProfile(data)
  if (!saved) throw new Error('invalid-response')
  return saved
}

export async function loadLeaderboard() { return parseLeaderboard(await rpc('get_leaderboard')) }
export async function leaveLeaderboard() { await rpc('leave_leaderboard') }

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
  if (error) throw new Error('sign-out-failed')
}
