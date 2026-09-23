import { canCompletePlanning, findSafePlacement } from './planningSolvability'
import type { Placement, PlanningLevel } from './planningEngine'

type SolvabilityWorkerRequest =
  | { kind: 'can-complete'; level: PlanningLevel; placements: Placement[] }
  | { kind: 'find-safe'; level: PlanningLevel; placements: Placement[] }

const workerScope = globalThis as unknown as {
  onmessage: (event: MessageEvent<SolvabilityWorkerRequest>) => void
  postMessage: (message: { kind: string; safe?: boolean; placement?: Placement }) => void
}

workerScope.onmessage = ({ data }) => {
  if (data.kind === 'can-complete') {
    workerScope.postMessage({ kind: data.kind, safe: canCompletePlanning(data.level, data.placements) })
    return
  }
  workerScope.postMessage({ kind: data.kind, placement: findSafePlacement(data.level, data.placements) })
}
