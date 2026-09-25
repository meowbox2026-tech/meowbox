import { describe, expect, it } from 'vitest'
import { findDropMatches } from '../core/dropEngine'
import { analyzePlanningLevel, getPlanningProgressionWarnings, getPlanningReadabilityWarnings, scorePlanningReport } from '../core/planningDifficulty'
import { arrangeCats, resolvePlanning } from '../core/planningEngine'
import { getLevelGuidance, getLevelName } from '../../i18n/gameData'
import { PLANNING_LEVELS } from './planningLevels'

const EXTENDED_LEVEL_IDS = Array.from({ length: 60 }, (_, index) => index + 31)
const EXPECTED_FIXED_COUNTS = [36, 37, 38, 39, 40]
const EXPECTED_TRAY_COUNTS = [18, 18, 19, 19, 20]
const LOCALES = ['zh-TW', 'en', 'ja'] as const

describe('31–90 authored planning levels', () => {
  it('publishes sixty levels after the existing thirty', () => {
    expect(PLANNING_LEVELS).toHaveLength(90)
    expect(PLANNING_LEVELS.slice(30).map(level => level.id)).toEqual(EXTENDED_LEVEL_IDS)
  })

  it('keeps the extended chapter counts within the 8×8 capacity', () => {
    PLANNING_LEVELS.slice(30).forEach((level, index) => {
      const chapterOffset = index % 5
      expect(level.board.flat().filter(Boolean).length).toBe(EXPECTED_FIXED_COUNTS[chapterOffset])
      expect(level.cats).toHaveLength(EXPECTED_TRAY_COUNTS[chapterOffset])
      expect(level.board.flat().filter(Boolean).length + level.cats.length).toBeLessThanOrEqual(60)
      expect(new Set(level.cats.map(cat => cat.type)).size).toBe(4)
      expect(new Set(level.cats.map(cat => cat.type))).toEqual(new Set(['orange', 'blue', 'white', 'fishLover']))
    })
  })

  it('has no opening match and clears through the same resolver as play', () => {
    PLANNING_LEVELS.slice(30).forEach(level => {
      expect(findDropMatches(level.board), `level ${level.id} opens with a match`).toEqual([])
      const authoredBoard = arrangeCats(level, level.solution)
      expect(authoredBoard, `level ${level.id} solution does not fit`).toBeDefined()
      const result = resolvePlanning(authoredBoard!)
      expect(result.remaining, `level ${level.id} does not clear`).toBe(0)
      expect(result.waves, `level ${level.id} has no waves`).toBeGreaterThan(0)
    })
  })

  it('gives every extended level a distinct board silhouette and complete copy', () => {
    const levels = PLANNING_LEVELS.slice(30)
    const silhouettes = levels.map(level => level.board.map(row => row.map(cat => cat ? '#' : '.').join('')).join('/'))
    expect(new Set(silhouettes)).toHaveLength(levels.length)

    LOCALES.forEach(locale => {
      levels.forEach(level => {
        expect(getLevelName(level.id, locale), `level ${level.id} name ${locale}`).not.toMatch(/^Lv\\./)
        expect(getLevelGuidance(level.id, locale), `level ${level.id} guidance ${locale}`).not.toBe('')
      })
    })
  })

  it('keeps the extended difficulty in the authored target band without unfair or brittle solutions', () => {
    const reports = PLANNING_LEVELS.slice(30).map(level => scorePlanningReport(analyzePlanningLevel(level)))
    expect(reports.every(report => report.score >= 62 && report.score <= 80)).toBe(true)
    expect(reports.every(report => report.band !== 'unfair')).toBe(true)
    expect(getPlanningProgressionWarnings(reports)).toEqual([])
    expect(getPlanningReadabilityWarnings(reports)).toEqual([])
  }, 15_000)
})
