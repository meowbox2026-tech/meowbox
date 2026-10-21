import { getMainlineLevel } from '../../src/game/data/mainlineLevels'
import { arrangeCats, resolvePlanning } from '../../src/game/core/planningEngine'
const L = getMainlineLevel(2)
const first: [number, number][] = [[1, 0], [6, 0], [6, 5]]
for (const [label, cell] of [['A', [4, 5]], ['B', [2, 6]], ['C', [0, 7]]] as const) {
  const cells = [...first, cell] as [number, number][]
  const b = arrangeCats(L, cells.map(([x, y], i) => ({ catId: L.cats[i].id, x, y })))
  console.log(label, JSON.stringify(cell), b ? `remaining ${resolvePlanning(b).remaining}` : 'ILLEGAL')
}
