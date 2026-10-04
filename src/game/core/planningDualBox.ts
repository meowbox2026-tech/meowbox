import type { DropBoard, DropCell } from './dropEngine'

export interface PlanningPortal { id: string; entry: DropCell; exit: DropCell }
export interface PlanningDualBox { splitAt: number; entry: DropCell; exit: DropCell; portals?: PlanningPortal[] }
export const getDualBoxPortals = (config: PlanningDualBox): PlanningPortal[] => config.portals ?? [{ id: 'A', entry: config.entry, exit: config.exit }]
export interface PlanningTransfer { catId: number; from: DropCell; to: DropCell; portalId?: string; exit?: DropCell }
export function isDualBoxPortal(config: PlanningDualBox | undefined, x: number, y: number): boolean {
  return Boolean(config && getDualBoxPortals(config).some(portal => [portal.entry, portal.exit].some(cell => cell.x === x && cell.y === y)))
}

export function canPlaceInDualBox(config: PlanningDualBox | undefined, homeBox: 'left' | 'right' | undefined, x: number): boolean {
  return !config || !homeBox || (homeBox === 'left' ? x < config.splitAt : x >= config.splitAt)
}

/** A cleared support feeds the inlet. Blocked outlets retain the entire incoming stack. */
export function transferDualBoxCats(board: DropBoard, config: PlanningDualBox) {
  const next = board.map(row => row.map(cat => cat && { ...cat }))
  const transfers: PlanningTransfer[] = []
  const used = new Set<string>()
  let changed = true
  while (changed) {
    changed = false
    for (const portal of getDualBoxPortals(config)) {
      const { entry, exit } = portal
      while (next[entry.y][entry.x] && !next[exit.y][exit.x]) {
        const cat = next[entry.y][entry.x]!
        const visit = `${cat.id}:${portal.id}`
        // A cat may use each route once per gravity step; cycles cannot loop forever.
        if (used.has(visit)) break
        used.add(visit)
        changed = true
        next[entry.y][entry.x] = null
        let target = exit.y
        while (target + 1 < next.length && !next[target + 1][exit.x]) target++
        next[target][exit.x] = cat
        transfers.push({ catId: cat.id, from: { ...entry }, to: { x: exit.x, y: target },
          portalId: portal.id, exit: { ...exit } })
        // Only the contiguous stack above the inlet loses its support.
        for (let y = entry.y - 1; y >= 0 && next[y][entry.x]; y--) {
          next[y + 1][entry.x] = next[y][entry.x]
          next[y][entry.x] = null
        }
      }
    }
  }
  return { board: next, transfers }
}
