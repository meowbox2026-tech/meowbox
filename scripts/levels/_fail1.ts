import { getMainlineLevel } from '../../src/game/data/mainlineLevels'
import { arrangeCats, resolvePlanning } from '../../src/game/core/planningEngine'
const L = getMainlineLevel(1)
console.log(L.board.map(r => r.map(c => c ? c.type[0] : '.').join(' ')).join('\n'))
console.log('queue', L.cats.map(c => c.type).join(','), 'solution', JSON.stringify(L.solution.map(p => [p.x, p.y])))
const tries: Record<string, [number, number][]> = {
  t1_corners: [[0, 0], [7, 0], [0, 3]],
  t2_white_only: [[0, 0], [7, 0], [1, 7]],
  t2b_brown_ok: [[4, 3], [6, 0], [0, 0]],
  t3_last_wrong: [[4, 3], [4, 2], [6, 0]],
  t3b_last_wrong: [[4, 3], [4, 2], [1, 0]],
  solution: L.solution.map(p => [p.x, p.y]) as any
}
for (const [k, cells] of Object.entries(tries)) {
  const b = arrangeCats(L, cells.map(([x, y], i) => ({ catId: L.cats[i].id, x, y })))
  if (!b) { console.log(k, 'ILLEGAL'); continue }
  const r = resolvePlanning(b)
  console.log(k, 'remaining', r.remaining, 'waves', r.frames.filter((f: any) => f.clearing.length).length)
}
