import { CAT_ASSET_PATHS } from '../../game/data/catAssets'
import type { CatAsset } from '../../game/types'

export const AVATARS = Object.keys(CAT_ASSET_PATHS) as CatAsset[]
const MAX_LEADERBOARD_LEVEL = 90
export interface ProfileDraft { name: string; avatar: CatAsset }
export interface PublicProfile extends ProfileDraft { publicId: string }
export interface LeaderboardEntry extends PublicProfile { rank: number; highestLevel: number; isMe: boolean }
export type BlockedPlayer = PublicProfile

const publicIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const blockedNamePatterns = [
  /\b(?:fuck|fucking|shit|bitch|asshole|bastard|dickhead|slut|whore)\b/i,
  /操你|幹你|干你|他媽|他妈|媽的|妈的|婊子|賤人|贱人/,
]

export function validName(value: string): boolean {
  const name = value.trim().normalize('NFC')
  return [...name].length >= 2 && [...name].length <= 16 && /^[\p{L}\p{N} _-]+$/u.test(name)
    && !blockedNamePatterns.some(pattern => pattern.test(name))
}

export function parseProfile(value: unknown): PublicProfile | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  if (typeof row.name !== 'string' || !validName(row.name) || !AVATARS.includes(row.avatar as CatAsset)
    || typeof row.publicId !== 'string' || !publicIdPattern.test(row.publicId)) return null
  return { publicId: row.publicId, name: row.name, avatar: row.avatar as CatAsset }
}

export function parseLeaderboard(value: unknown): LeaderboardEntry[] {
  if (!Array.isArray(value) || value.length > 101) throw new Error('invalid-response')
  return value.map(row => {
    const profile = parseProfile(row)
    if (!profile || !Number.isSafeInteger(row.rank) || row.rank < 1 || !Number.isInteger(row.highestLevel)
      || row.highestLevel < 0 || row.highestLevel > MAX_LEADERBOARD_LEVEL || typeof row.isMe !== 'boolean') throw new Error('invalid-response')
    return { ...profile, rank: row.rank, highestLevel: row.highestLevel, isMe: row.isMe }
  })
}

export function parseBlockedPlayers(value: unknown): BlockedPlayer[] {
  if (!Array.isArray(value) || value.length > 1000) throw new Error('invalid-response')
  return value.map(row => {
    const profile = parseProfile(row)
    if (!profile) throw new Error('invalid-response')
    return profile
  })
}
