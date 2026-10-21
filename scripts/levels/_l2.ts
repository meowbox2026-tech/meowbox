import { getMainlineLevel } from '../../src/game/data/mainlineLevels'
import { arrangeCats, resolvePlanning } from '../../src/game/core/planningEngine'
const L = getMainlineLevel(2)
console.log(L.board.map(r => r.map(c => c ? c.type[0] : '.').join(' ')).join('\n'))
console.log('queue', L.cats.map(c => c.type).join(','), 'solution', JSON.stringify(L.solution.map(p => [p.x, p.y])))
const sol = L.solution.map(p => [p.x, p.y]) as [number, number][]
const run = (cells: [number, number][]) => {
  const b = arrangeCats(L, cells.map(([x, y], i) => ({ catId: L.cats[i].id, x, y })))
  if (!b) return 'ILLEGAL'
  const r = resolvePlanning(b); return `rem ${r.remaining} waves ${r.frames.filter((f: any) => f.clearing.length).length}`
}
console.log('solution', run(sol))
// keep first k correct, put rest in far cells; report
const far: [number, number][] = [[0, 0], [7, 0], [0, 2], [7, 2]]
for (let k = 0; k <= 3; k++) {
  const cells = sol.map((p, i) => i < k ? p : far[i]) as [number, number][]
  console.log('first', k, 'correct', JSON.stringify(cells), run(cells))
}
// last-cat-wrong variants
for (const alt of [[7, 0], [0, 0], [6, 0], [1, 0]] as [number, number][]) {
  const cells = [...sol.slice(0, 3), alt] as [number, number][]
  console.log('last wrong', JSON.stringify(alt), run(cells))
}
