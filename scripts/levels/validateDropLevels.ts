import { createDropState, dropCat, type DropState } from '../../src/game/core/dropEngine'
import { DROP_LEVELS, getDropLevelVariants } from '../../src/game/data/dropLevels'

function createState(level: typeof DROP_LEVELS[number], withoutTraits = false): DropState {
  return createDropState({
    width: level.width,
    height: level.height,
    tileTypes: level.tileAssets,
    board: level.initialBoard,
    current: level.initialCurrent,
    currentTrait: withoutTraits ? 'none' : level.initialCurrentTrait,
    next: level.initialNext,
    nextTrait: withoutTraits ? 'none' : level.initialNextTrait,
    queue: level.initialQueue,
    queueTraits: withoutTraits ? level.initialQueue.map(() => 'none') : level.initialQueueTraits,
    target: level.target,
    scratchPosts: level.scratchPosts,
    fishTreats: level.fishTreats,
    tunnels: level.tunnels,
    patrol: level.patrol,
    goals: level.goals,
    holdUses: level.holdUses,
    previewCount: level.previewCount,
    variant: level.variant
  })
}

function replay(level: typeof DROP_LEVELS[number], withoutTraits = false): { state: DropState; usedTypes: Set<string> } {
  let state = createState(level, withoutTraits)
  const usedTypes = new Set<string>()
  for (const column of level.witness) {
    usedTypes.add(state.current)
    const result = dropCat(state, column, () => .5)
    if (!result.accepted) break
    state = result.state
    if (state.phase !== 'playing') break
  }
  return { state, usedTypes }
}

const rows = DROP_LEVELS.filter((level) => level.id >= 31).flatMap((base) => getDropLevelVariants(base.id).map((level) => {
  const actual = replay(level)
  const neutral = replay(level, true)
  const firstTokens = [level.initialCurrent, level.initialNext, ...level.initialQueue].slice(0, level.tileAssets.length * 2)
  const coverage = new Set(firstTokens).size === level.tileAssets.length
  const passed = actual.state.phase === 'completed' && neutral.state.phase === 'completed' && coverage
  return {
    level,
    actual,
    neutral,
    coverage,
    passed
  }
}))

console.log('# MeowBox 31–90 題庫驗證報告')
console.log('')
console.log(`產生時間：${new Date().toISOString()}`)
console.log('驗證方式：每個 variant 使用 src/game/core/dropEngine.ts 回放保存的 witness；再將全部 token trait 改為 none 重播。')
console.log('限制：這是邏輯可解驗證，不代表真人時間與體感已平衡；所有 180 variant 的第二首落點分支仍需後續專門試玩／搜索。')
console.log('')
console.log(`結果：${rows.filter((row) => row.passed).length}/${rows.length} variant 通過；neutral trait ${rows.filter((row) => row.neutral.state.phase === 'completed').length}/${rows.length} 通過。`)
console.log('')
console.log('| 關 | variant | seed | 秒 | 格 | 種類 | 初貓 | 目標救援/板/魚 | witness | 三星/二星 | 實際/none | 2N 覆蓋 |')
console.log('|---:|---:|---:|---:|---:|---:|---:|---|---:|---|---|:---:|')
for (const row of rows) {
  const level = row.level
  const status = `${row.actual.state.phase}/${row.neutral.state.phase}`
  const goals = `${level.goals.rescued}/${level.goals.scratchPosts}/${level.goals.fishTreats}`
  const stars = `${level.threeStarMoves}/${level.twoStarMoves}`
  console.log(`| ${level.id} | ${level.variant} | ${level.seed} | ${level.timeLimit} | ${level.width}×${level.height} | ${level.tileAssets.length} | ${level.initialCatCount} | ${goals} | ${level.witness.length} | ${stars} | ${status} | ${row.coverage ? '是' : '否'} |`)
}
