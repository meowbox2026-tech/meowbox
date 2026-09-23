import { describe, expect, it } from 'vitest'
import { PLANNING_LEVELS } from '../data/planningLevels'
import { analyzePlanningLevel, getPlanningProgressionWarnings, getPlanningReadabilityWarnings, scorePlanningLevel, scorePlanningReport } from './planningDifficulty'

describe('planning difficulty analysis', () => {
  it('measures the authored solution instead of trusting level id or cat count', () => {
    const level = PLANNING_LEVELS[0]
    const metrics = analyzePlanningLevel(level)

    expect(metrics.valid).toBe(true)
    expect(metrics.initialCats).toBe(6)
    expect(metrics.trayCats).toBe(3)
    expect(metrics.totalCats).toBe(9)
    expect(metrics.waves).toBe(3)
    expect(metrics.directions).toEqual(['vertical', 'horizontal'])
    expect(metrics.palettePressure).toBe(0)
    expect(metrics.gravityMoves).toBeGreaterThan(0)
    expect(metrics.solutionSearchSpaceLog10).toBeGreaterThan(0)
  })

  it('counts solution-preserving one-cell mutations as local alternatives', () => {
    const metrics = analyzePlanningLevel(PLANNING_LEVELS[0])

    expect(metrics.localMutationAttempts).toBeGreaterThan(0)
    expect(metrics.localMutationSolutions).toBeGreaterThanOrEqual(0)
    expect(metrics.localAlternativeRate).toBeGreaterThanOrEqual(0)
    expect(metrics.localAlternativeRate).toBeLessThanOrEqual(1)
    expect(metrics.forcedPlacementRate).toBeGreaterThanOrEqual(0)
    expect(metrics.forcedPlacementRate).toBeLessThanOrEqual(1)
  })

  it('keeps the weighted score bounded and exposes a fairness warning for invalid layouts', () => {
    const scores = PLANNING_LEVELS.map(level => scorePlanningLevel(analyzePlanningLevel(level)))

    expect(scores.every(score => score >= 0 && score <= 100)).toBe(true)
    expect(scores[0]).toBeLessThan(scores.at(-1)!)

    const invalid = analyzePlanningLevel({ ...PLANNING_LEVELS[0], solution: [] })
    expect(invalid.valid).toBe(false)
    expect(invalid.warnings).toContain('authored-solution-does-not-clear')
    expect(scorePlanningLevel(invalid)).toBe(100)
  })

  it('validates every authored level and reports the mechanic progression', () => {
    const reports = PLANNING_LEVELS.map(analyzePlanningLevel)

    expect(reports.every(report => report.valid && report.warnings.length === 0)).toBe(true)
    expect(reports.slice(0, 3).map(report => report.directions[0])).toEqual(['vertical', 'horizontal', 'diagonal'])
    expect(reports.slice(20).every(report => report.directions.includes('mixed'))).toBe(true)
    expect(reports[3].palettePressure).toBe(0.5)
  })

  it('keeps the existing chapter curve inside its target bands and flags large jumps', () => {
    const reports = PLANNING_LEVELS.map(level => scorePlanningReport(analyzePlanningLevel(level)))
    const outOfBand = reports.filter(report => report.score < report.target.minimum || report.score > report.target.maximum)

    expect(outOfBand).toEqual([])
    expect(getPlanningProgressionWarnings(reports)).toEqual(expect.arrayContaining([
      'level-15-jump-too-large',
      'level-21-jump-too-large'
    ]))
    expect(getPlanningProgressionWarnings(reports)).not.toEqual(expect.arrayContaining([
      'level-16-jump-too-large',
      'level-17-jump-too-large',
      'level-18-jump-too-large',
      'level-19-jump-too-large',
      'level-20-jump-too-large'
    ]))
    expect(getPlanningReadabilityWarnings(reports)).toEqual(expect.arrayContaining([
      'level-6-solution-too-brittle',
      'level-8-solution-too-brittle',
      'level-10-solution-too-brittle'
    ]))
  })
})
