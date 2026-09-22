import type { DropPatrol } from './dropTypes'

export const PATROL_INTERVAL = 4

export function createPatrol(value?: Partial<DropPatrol>): DropPatrol | undefined {
  if (!value?.columns?.length) return undefined
  const columns = [...new Set(value.columns.filter(Number.isInteger))]
  if (!columns.length) return undefined
  const index = Math.max(0, Math.min(columns.length - 1, value.index ?? 0))
  return {
    columns,
    index,
    dropsUntilMove: Math.max(1, value.dropsUntilMove ?? PATROL_INTERVAL)
  }
}

/** Advance only after a successfully resolved drop. */
export function advancePatrol(patrol?: DropPatrol): DropPatrol | undefined {
  if (!patrol) return undefined
  if (patrol.dropsUntilMove > 1) return { ...patrol, dropsUntilMove: patrol.dropsUntilMove - 1 }
  return {
    ...patrol,
    index: (patrol.index + 1) % patrol.columns.length,
    dropsUntilMove: PATROL_INTERVAL
  }
}
