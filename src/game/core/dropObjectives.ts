import type { DropGoals, DropProgress, FishTreat, ScratchPost } from './dropTypes'

export function createDropGoals(rescued: number, scratchPosts: ScratchPost[] = [], fishTreats: FishTreat[] = []): DropGoals {
  return { rescued, scratchPosts: scratchPosts.length, fishTreats: fishTreats.length }
}

export function getDropProgress(rescued: number, scratchPosts: ScratchPost[], remainingFishTreats: FishTreat[], totalFishTreats: number): DropProgress {
  return {
    rescued,
    scratchPosts: scratchPosts.filter((post) => post.hp <= 0).length,
    fishTreats: Math.max(0, totalFishTreats - remainingFishTreats.length)
  }
}

export function hasCompletedDropObjectives(goals: DropGoals, progress: DropProgress): boolean {
  return progress.rescued >= goals.rescued
    && progress.scratchPosts >= goals.scratchPosts
    && progress.fishTreats >= goals.fishTreats
}
