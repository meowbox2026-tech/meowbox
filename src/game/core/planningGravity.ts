import type { DropBoard, DropCell } from './dropEngine'

/** Only a contiguous stack resting on a removed cat loses its support. */
export function clearPlanningSupport(board: DropBoard, matches: DropCell[]): DropBoard {
  const next = board.map(row => row.map(cat => cat && { ...cat }))
  const cleared = new Set(matches.map(({ x, y }) => `${x}:${y}`))
  const falling: DropCell[] = []
  for (const x of new Set(matches.map(cell => cell.x))) {
    let lostSupport = false
    // Inspect the original board: an existing gap breaks the support chain.
    for (let y = board.length - 1; y >= 0; y--) {
      if (!board[y][x]) lostSupport = false
      else if (cleared.has(`${x}:${y}`)) lostSupport = true
      else if (lostSupport) falling.push({ x, y })
    }
  }
  matches.forEach(({ x, y }) => { next[y][x] = null })
  // Bottom first keeps stack order and lets untouched cats remain as supports.
  for (const { x, y } of falling) {
    const cat = next[y][x]
    next[y][x] = null
    let target = y
    while (target + 1 < next.length && !next[target + 1][x]) target++
    next[target][x] = cat
  }
  return next
}
