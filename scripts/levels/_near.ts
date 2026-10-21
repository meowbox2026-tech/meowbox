import { getMainlineLevel } from '../../src/game/data/mainlineLevels'
import { arrangeCats, resolvePlanning } from '../../src/game/core/planningEngine'
const L = getMainlineLevel(90)
const sol = L.solution
const found: any[] = []; const hist: Record<number, number> = {}; let illegal = 0
const test = (s: typeof sol, label: string) => {
  const b = arrangeCats(L, s); if (!b) { illegal++; return }
  const r = resolvePlanning(b, L.dualBox)
  const waves = r.frames.filter((f: any) => f.clearing.length).length
  hist[r.remaining] = (hist[r.remaining] ?? 0) + 1
  if (r.remaining >= 2 && r.remaining <= 3) found.push({ label, waves, rem: r.remaining, s })
}
// swap two placements' positions
for (let i = 0; i < sol.length; i++) for (let j = i + 1; j < sol.length; j++) {
  const s = sol.map(p => ({ ...p }))
  const [xi, yi] = [s[i].x, s[i].y]; s[i].x = s[j].x; s[i].y = s[j].y; s[j].x = xi; s[j].y = yi
  test(s, `swap ${i + 1}<->${j + 1}`)
}
// move one cat to another cell
for (let i = 0; i < sol.length; i++) for (let x = 0; x < L.width; x++) for (let y = 0; y < L.height; y++) {
  const s = sol.map(p => ({ ...p })); s[i].x = x; s[i].y = y; test(s, `move ${i + 1}->(${x},${y})`)
}
console.log('hist', hist, 'illegal', illegal)
found.sort((a, b) => b.waves - a.waves)
console.log('count', found.length)
for (const f of found.slice(0, 6)) console.log(f.label, 'rem', f.rem, 'waves', f.waves)
const best = found[0]; if (best) console.log('BEST', JSON.stringify(best.s.map((p: any) => [p.x, p.y])))
