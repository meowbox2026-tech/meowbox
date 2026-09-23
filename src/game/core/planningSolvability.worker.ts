import { findSafePlacement } from './planningSolvability'
import type { Placement, PlanningLevel } from './planningEngine'

type SolvabilityWorkerRequest =
  | { kind: 'find-safe'; level: PlanningLevel; placements: Placement[] }

const workerScope = globalThis as unknown as {
  onmessage: (event: MessageEvent<SolvabilityWorkerRequest>) => void
  postMessage: (message: { kind: string; placement?: Placement }) => void
}

workerScope.onmessage = ({ data }) => {
  workerScope.postMessage({ kind: data.kind, placement: findSafePlacement(data.level, data.placements) })
}
