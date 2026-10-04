import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { arrangeCats, type PlanningLevel } from '../../src/game/core/planningEngine'
import { findDropMatches } from '../../src/game/core/dropEngine'
import { measurePlanningCascades } from '../../src/game/core/planningCascadeMetrics'
import { analyzePlanningLevel, scorePlanningReport, getPlanningReadabilityWarnings } from '../../src/game/core/planningDifficulty'
import { summarizePlanningObjective } from '../../src/game/core/planningObjective'

// Offline deterministic search. Only the reviewed JSON is consumed by the game.
const path = 'src/game/content/levels.json'
const levels: PlanningLevel[] = JSON.parse(readFileSync(path, 'utf8'))
const baseline: PlanningLevel[] = JSON.parse(execFileSync('git', ['show', '95e60271fc53398070fc62dcb4e3ab546170c825:src/game/content/levels.json'], { encoding: 'utf8' }))
let state = 20261004
const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 2 ** 32 }
const integer = (n: number) => Math.floor(random() * n)
const silhouettes = new Set(levels.filter(level => level.id < 31 || level.id > 60).map(silhouette))
function silhouette(level: PlanningLevel) {
  return level.board.map(row => row.map(cat => cat ? '#' : '.').join('')).join('/')
}
function mutate(level: PlanningLevel): PlanningLevel | undefined {
  const board = arrangeCats(level, level.solution)!
  const occupied = board.flatMap((row, y) => row.flatMap((cat, x) => cat ? [{ x, y }] : []))
  const a = occupied[integer(occupied.length)]
  const b = random() < 0.7 ? { x: a.x, y: integer(8) } : { x: integer(8), y: integer(8) }
  if (a.x === b.x && a.y === b.y) return
  const tile = board[a.y][a.x]
  board[a.y][a.x] = board[b.y][b.x]
  board[b.y][b.x] = tile
  const tray = new Set(level.cats.map(cat => cat.id))
  const solution = level.solution.map(placement => {
    if (placement.x === a.x && placement.y === a.y) return { ...placement, ...b }
    if (placement.x === b.x && placement.y === b.y) return { ...placement, ...a }
    return { ...placement }
  })
  const fixed = board.map(row => row.map(cat => cat && !tray.has(cat.id) ? { id: cat.id, type: cat.type } : null))
  if (findDropMatches(fixed).length) return
  return { ...level, board: fixed, solution }
}
function reorder(level: PlanningLevel): PlanningLevel {
  const solution = [...level.solution]
  for (let index = solution.length - 1; index > 0; index--) {
    const other = integer(index + 1)
    ;[solution[index], solution[other]] = [solution[other], solution[index]]
  }
  return { ...level, solution }
}
function fitness(report: ReturnType<typeof measurePlanningCascades>, stage: number) {
  return Math.min(report.longestChain, 2 + stage) * 8
    + Math.min(report.dependentWaves, 4 + stage * 2) * 5
    + Math.min(report.delayedTrayCats, 3 + stage) * 3
    - Math.max(0, report.openingGroups - (7 - stage)) * 5
}
for (let index = 30; index < 60; index++) {
  const reviewed = levels[index]
  const original = baseline[index]
  const previousScore = scorePlanningReport(analyzePlanningLevel(levels[index - 1])).score
  const nextWorldScore = scorePlanningReport(analyzePlanningLevel(levels[60])).score
  const stage = Math.floor((original.id - 31) / 10)
  let current = original
  let currentFitness = fitness(measurePlanningCascades(current), stage)
  let found: PlanningLevel | undefined
  for (let attempt = 0; attempt < 150000; attempt++) {
    if (attempt % 4000 === 3999) {
      current = original
      currentFitness = fitness(measurePlanningCascades(current), stage)
    }
    const candidate = attempt === 0 ? reviewed : attempt < 2000
      ? reorder(reviewed)
      : mutate(current)
    if (!candidate) continue
    const report = measurePlanningCascades(candidate)
    if (report.remaining) continue
    const nextFitness = fitness(report, stage)
    if (nextFitness >= currentFitness || random() < 0.02) {
      current = candidate
      currentFitness = nextFitness
    }
    if (report.longestChain < 2 + stage || report.dependentWaves < 4 + stage * 2
      || report.delayedTrayCats < 3 + stage || report.openingGroups > 7 - stage
      || silhouettes.has(silhouette(candidate))) continue
    const difficulty = scorePlanningReport(analyzePlanningLevel(candidate))
    if (difficulty.score < 62 || difficulty.score > 80 || Math.abs(difficulty.score - previousScore) > 9
      || (index === 59 && Math.abs(difficulty.score - nextWorldScore) > 9)
      || getPlanningReadabilityWarnings([difficulty]).length) continue
    found = { ...candidate, objective: summarizePlanningObjective(candidate) }
    console.log(JSON.stringify({ id: found.id, attempts: attempt + 1, score: difficulty.score, ...report }))
    break
  }
  if (!found) throw new Error(`No accepted layout for level ${original.id}; source file has not been written`)
  silhouettes.add(silhouette(found))
  levels[index] = found
}
writeFileSync(path, `[\n${levels.map(level => `  ${JSON.stringify(level)}`).join(',\n')}\n]\n`)
