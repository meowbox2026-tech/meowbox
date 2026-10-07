import { afterEach, describe, expect, it } from 'vitest'
import { getMainlineLevel } from './mainlineLevels'
import { BUNDLED_PLANNING_LEVELS, replacePlanningLevels } from './planningLevels'

describe('mainline level source', () => {
  afterEach(() => replacePlanningLevels(BUNDLED_PLANNING_LEVELS))

  it('keeps levels 1-30 as single-box content', () => {
    for (let id = 1; id <= 30; id++) expect(getMainlineLevel(id).dualBox).toBeUndefined()
  })

  it('serves dual-box levels for 31-90 in production', () => {
    for (let id = 31; id <= 90; id++) {
      const level = getMainlineLevel(id)
      expect(level.id).toBe(id)
      expect(level.dualBox).toBeDefined()
    }
  })

  it('keeps dual-box levels when remote content replaces the level list', () => {
    replacePlanningLevels(BUNDLED_PLANNING_LEVELS.map(level => ({ ...level })))
    expect(getMainlineLevel(31).dualBox).toBeDefined()
    expect(getMainlineLevel(90).dualBox).toBeDefined()
  })
})
