import { PLANNING_LEVELS } from '../../src/game/data/planningLevels'
import { analyzePlanningLevel, getPlanningProgressionWarnings, getPlanningReadabilityWarnings, scorePlanningReport } from '../../src/game/core/planningDifficulty'

const reports = PLANNING_LEVELS.map(level => scorePlanningReport(
  analyzePlanningLevel(level)
))

console.table(reports.map(report => ({
  level: report.levelId,
  score: report.score,
  band: report.band,
  target: `${report.target.minimum}-${report.target.maximum}`,
  fixed: report.initialCats,
  tray: report.trayCats,
  waves: report.waves,
  directions: report.directions.join('/'),
  waveSequence: report.waveDirections.join('→'),
  switches: report.directionSwitches,
  gravity: report.gravityDistance,
  forced: `${Math.round(report.forcedPlacementRate * 100)}%`,
  alternatives: `${Math.round(report.localAlternativeRate * 100)}%`,
  searchLog10: report.solutionSearchSpaceLog10.toFixed(1)
})))

const warnings = getPlanningProgressionWarnings(reports)
const readabilityWarnings = getPlanningReadabilityWarnings(reports)
console.log(warnings.length ? `\nProgression warnings: ${warnings.join(', ')}` : '\nProgression warnings: none')
console.log(readabilityWarnings.length
  ? `Readability warnings: ${readabilityWarnings.join(', ')}`
  : 'Readability warnings: none')
