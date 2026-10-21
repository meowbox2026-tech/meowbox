import { writeFileSync } from 'node:fs'
import { getMainlineLevel } from '../../src/game/data/mainlineLevels'
import { arrangeCats, resolvePlanning } from '../../src/game/core/planningEngine'
const L: any = getMainlineLevel(20)
const g = (b: any[][]) => b.map(r => r.map(c => c ? [c.id, c.type, c.placementOrder ?? 0] : 0))
const full = arrangeCats(L, L.solution)!
const r = resolvePlanning(full, L.dualBox, L.gravityFlip, L.divider)
const last = L.solution[L.solution.length - 1]
const pre = g(full); pre[last.y][last.x] = 0
const lastCat = full[last.y][last.x]
const out = { level: 20, waves: r.waves, remaining: r.remaining, pre, last: [last.x, last.y, lastCat.id, lastCat.type, lastCat.placementOrder ?? 0], start: g(full), frames: r.frames.map(f => ({ b: g(f.board), c: f.clearing })) }
writeFileSync('marketing/meowline-l20-chain-loop/data.js', '// 由 planningEngine 匯出的第 20 關官方解：放下最後一隻後 15 波連鎖全清\nwindow.LV = ' + JSON.stringify(out) + ';\n')
console.log(r.waves, r.remaining, r.frames.length, r.frames.map(f => f.clearing.length).join(','), JSON.stringify(out.last))
