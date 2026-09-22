export type RewardKind = 'hint' | 'auto-place' | 'challenge-moves' | 'wake-sleeper' | 'double-reward' | 'daily-double' | 'clear-bottom-row' | 'planning-retry'

export interface RewardedAdResult {
  completed: boolean
  kind: RewardKind
}

export interface RewardedAdGateway {
  show: (kind: RewardKind) => Promise<RewardedAdResult>
}

class DemoRewardedAdGateway implements RewardedAdGateway {
  async show(kind: RewardKind): Promise<RewardedAdResult> {
    await new Promise((resolve) => window.setTimeout(resolve, 700))
    return { completed: true, kind }
  }
}

let gateway: RewardedAdGateway = new DemoRewardedAdGateway()

export function setRewardedAdGateway(nextGateway: RewardedAdGateway): void {
  gateway = nextGateway
}

export async function showRewardedAd(kind: RewardKind): Promise<RewardedAdResult> {
  return gateway.show(kind)
}
