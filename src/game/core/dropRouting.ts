import type { DropState } from './dropEngine'

/** Resolve at most one directed tunnel. A tunnel exit is never routed again. */
export function resolveDropColumn(state: Pick<DropState, 'width' | 'tunnels'>, column: number): number | undefined {
  if (!Number.isInteger(column) || column < 0 || column >= state.width) return undefined
  return state.tunnels.find((tunnel) => tunnel.entryColumn === column)?.exitColumn ?? column
}

export function patrolColumn(state: Pick<DropState, 'patrol'>): number | undefined {
  const patrol = state.patrol
  if (!patrol || patrol.columns.length === 0) return undefined
  return patrol.columns[patrol.index % patrol.columns.length]
}

export function isPatrolBlocked(state: Pick<DropState, 'patrol'>, column: number): boolean {
  return patrolColumn(state) === column
}

export function isDropRouteBlocked(state: Pick<DropState, 'patrol'>, requestedColumn: number, resolvedColumn: number): boolean {
  return isPatrolBlocked(state, requestedColumn) || isPatrolBlocked(state, resolvedColumn)
}
