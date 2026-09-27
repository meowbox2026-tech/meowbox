import { describe, expect, it } from 'vitest'
import { parseLeaderboard, parseProfile, validName } from './profile'

describe('public player data validation', () => {
  it.each(['喵喵隊長', 'Cat 12', 'ねこちゃん', 'Meow_Line'])('accepts safe names: %s', name => {
    expect(validName(name)).toBe(true)
  })
  it.each(['a', ' ', '<script>', 'meow\ncat', 'a'.repeat(17), 'a\u202eb', 'Fuck this', '操你'])('rejects invalid names: %s', name => {
    expect(validName(name)).toBe(false)
  })
  it('only accepts bundled avatars', () => {
    expect(parseProfile({ name: '喵喵', avatar: 'orange', publicId: '11111111-1111-4111-8111-111111111111' }))
      .toEqual({ name: '喵喵', avatar: 'orange', publicId: '11111111-1111-4111-8111-111111111111' })
    expect(parseProfile({ name: '喵喵', avatar: 'https://example.com/avatar', publicId: '11111111-1111-4111-8111-111111111111' })).toBeNull()
  })
  it('preserves tied ranks and rejects untrusted highest levels', () => {
    const row = { name: '喵喵', avatar: 'orange', publicId: '11111111-1111-4111-8111-111111111111', rank: 1, highestLevel: 3, isMe: false }
    expect(parseLeaderboard([row, { ...row, name: '小白', publicId: '22222222-2222-4222-8222-222222222222', isMe: true }]).map(r => r.rank)).toEqual([1, 1])
    expect(() => parseLeaderboard([{ ...row, highestLevel: -1 }])).toThrow()
    expect(() => parseLeaderboard([{ ...row, highestLevel: 91 }])).toThrow()
    expect(() => parseLeaderboard([{ ...row, rank: 0 }])).toThrow()
    expect(() => parseLeaderboard({})).toThrow()
  })
})
