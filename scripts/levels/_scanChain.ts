import { getMainlineLevel } from '../../src/game/data/mainlineLevels'
import { arrangeCats, resolvePlanning } from '../../src/game/core/planningEngine'
const rows: any[] = []
for (let n = 1; n <= 90; n++) {
  const L: any = getMainlineLevel(n); if (!L?.solution) continue
  const b = arrangeCats(L, L.solution); if (!b) { rows.push({ n, err: 'illegal' }); continue }
  const r = resolvePlanning(b, L.dualBox, L.gravityFlip, L.divider)
  rows.push({ n, waves: r.waves, rem: r.remaining, cats: L.cats.length, w: L.width, h: L.height, special: !!(L.dualBox || L.gravityFlip || L.divider) })
}
rows.filter(r => !r.err && r.rem === 0).sort((a, b) => b.waves - a.waves).slice(0, 12).forEach(r => console.log(JSON.stringify(r)))
console.log('bad', rows.filter(r => r.err || r.rem).map(r => r.n))
