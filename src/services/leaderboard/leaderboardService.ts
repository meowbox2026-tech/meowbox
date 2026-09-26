import { getSupabaseClient } from '../supabase/supabaseClient'
import { getAnonymousUserId } from '../supabase/anonymousIdentity'
import { parseLeaderboard, parseProfile, validName, AVATARS, type PublicProfile } from './profile'

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

export async function saveProfile(profile: PublicProfile): Promise<PublicProfile> {
  if (!validName(profile.name) || !AVATARS.includes(profile.avatar)) throw new Error('invalid-profile')
  const data = await rpc('save_leaderboard_profile', { p_name: profile.name.trim().normalize('NFC'), p_avatar: profile.avatar })
  const saved = parseProfile(data)
  if (!saved) throw new Error('invalid-response')
  return saved
}

export async function loadLeaderboard() { return parseLeaderboard(await rpc('get_leaderboard')) }
export async function leaveLeaderboard() { await rpc('leave_leaderboard') }
