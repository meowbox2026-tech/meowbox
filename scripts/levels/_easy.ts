import { getMainlineLevel } from '../../src/game/data/mainlineLevels'
import { arrangeCats, resolvePlanning } from '../../src/game/core/planningEngine'
for (let id = 1; id <= 12; id++) {
  const L = getMainlineLevel(id)
  const n = L.cats.length
  const boardCats = L.board.flat().filter(Boolean).length
  const empties: [number, number][] = []
  for (let y = 0; y < L.height; y++) for (let x = 0; x < L.width; x++) if (!L.board[y][x]) empties.push([x, y])
  let total = 0, wins = 0
  if (n <= 3) {
    const rec = (i: number, used: Set<string>, pl: any[]) => {
      if (i === n) {
        const b = arrangeCats(L, pl); if (!b) return
        total++
        if (resolvePlanning(b, L.dualBox).remaining === 0) wins++
        return
      }
      for (const [x, y] of empties) { const k = x + ',' + y; if (used.has(k)) continue; used.add(k); rec(i + 1, used, [...pl, { catId: L.cats[i].id, x, y }]); used.delete(k) }
    }
    rec(0, new Set(), [])
  }
  console.log(id, 'queue', n, 'onBoard', boardCats, 'types', L.cats.map(c => c.type).join('/'), n <= 3 ? `legal ${total} wins ${wins}` : '')
}
