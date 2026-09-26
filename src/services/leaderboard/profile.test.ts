import { describe, expect, it } from 'vitest'
import { parseLeaderboard, parseProfile, validName } from './profile'

describe('public player data validation', () => {
  it.each(['喵喵隊長', 'Cat 12', 'ねこちゃん', 'Meow_Line'])('accepts safe names: %s', name => {
    expect(validName(name)).toBe(true)
  })
  it.each(['a', ' ', '<script>', 'meow\ncat', 'a'.repeat(17), 'a\u202eb'])('rejects invalid names: %s', name => {
    expect(validName(name)).toBe(false)
  })
  it('only accepts bundled avatars', () => {
    expect(parseProfile({ name: '喵喵', avatar: 'orange' })).toEqual({ name: '喵喵', avatar: 'orange' })
    expect(parseProfile({ name: '喵喵', avatar: 'https://example.com/avatar' })).toBeNull()
  })
  it('preserves tied ranks and rejects untrusted scores', () => {
    const row = { name: '喵喵', avatar: 'orange', rank: 1, completed: 3, isMe: false }
    expect(parseLeaderboard([row, { ...row, name: '小白', isMe: true }]).map(r => r.rank)).toEqual([1, 1])
    expect(() => parseLeaderboard([{ ...row, completed: -1 }])).toThrow()
    expect(() => parseLeaderboard([{ ...row, rank: 0 }])).toThrow()
    expect(() => parseLeaderboard({})).toThrow()
  })
})
