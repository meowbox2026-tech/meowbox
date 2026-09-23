import { PLANNING_LEVELS } from '../../src/game/data/planningLevels'
import { arrangeCats, resolvePlanning } from '../../src/game/core/planningEngine'

const level = PLANNING_LEVELS[14]
const board = arrangeCats(level, level.solution)!
const result = resolvePlanning(board)
console.log(result.remaining, result.frames.filter(frame => frame.clearing.length).map(frame => ({ wave: frame.wave, clearing: frame.clearing })))
console.log(result.frames.at(-1)?.board.map(row => row.map(cat => cat ? `${cat.type[0]}${cat.id}` : '.').join(' ')).join('\n'))
