import { CAT_ASSET_PATHS } from '../../game/data/catAssets'
import type { CatAsset } from '../../game/types'

export const AVATARS = Object.keys(CAT_ASSET_PATHS) as CatAsset[]
export interface PublicProfile { name: string; avatar: CatAsset }
export interface LeaderboardEntry extends PublicProfile { rank: number; completed: number; isMe: boolean }

export function validName(value: string): boolean {
  const name = value.trim().normalize('NFC')
  return [...name].length >= 2 && [...name].length <= 16 && /^[\p{L}\p{N} _-]+$/u.test(name)
}

export function parseProfile(value: unknown): PublicProfile | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  if (typeof row.name !== 'string' || !validName(row.name) || !AVATARS.includes(row.avatar as CatAsset)) return null
  return { name: row.name, avatar: row.avatar as CatAsset }
}

export function parseLeaderboard(value: unknown): LeaderboardEntry[] {
  if (!Array.isArray(value) || value.length > 101) throw new Error('invalid-response')
  return value.map(row => {
    const profile = parseProfile(row)
    if (!profile || !Number.isSafeInteger(row.rank) || row.rank < 1 || !Number.isInteger(row.completed)
      || row.completed < 0 || row.completed > 500 || typeof row.isMe !== 'boolean') throw new Error('invalid-response')
    return { ...profile, rank: row.rank, completed: row.completed, isMe: row.isMe }
  })
}
