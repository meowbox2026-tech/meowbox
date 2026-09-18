import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getLevelById } from '../../game/data/levels'
import { getRandomCatPawDirection, type CatPawDirection } from '../../game/animation/catPaw'
import type { Match3State, Match3SwapResult } from '../../game/core/match3Engine'
import { getMatch3CatSpectacle } from '../../game/core/match3Presentation'
import { createPuzzleState } from '../../game/core/puzzleEngine'
import { Match3Board, type Match3BoardHandle } from '../../game/phaser/Match3Board'
import { PuzzleCanvas, type PuzzleCanvasHandle } from '../../game/phaser/PuzzleCanvas'
import type { PuzzleFeedback } from '../../game/phaser/PuzzleScene'
import type { CatDefinition, PuzzleState } from '../../game/types'
import {
  playCatSound,
  playMatch3Sound,
  playUiSound,
  startBackgroundMusic,
  stopBackgroundMusic
} from '../../services/audio/audioService'
import { playPlacementHaptic } from '../../services/haptics/hapticsService'
import { usePlayer } from '../../state/PlayerContext'
import { AppButton } from '../components/AppButton'
import { ArtworkButton } from '../components/ArtworkButton'
import { CatSelectionTray } from '../components/CatSelectionTray'
import {
  CAT_PEEK_INTERVAL_MS,
  CatSpectacleOverlay,
  getCatSpectacleDuration,
  getRandomDropAnchor,
  type CatSpectacle,
  type CatSpectacleKind
} from '../components/CatSpectacleOverlay'
import { Modal } from '../components/Modal'
import { PauseModal } from '../components/PauseModal'
import { RewardedAdModal } from '../components/RewardedAdModal'
import { ResultModal } from '../components/ResultModal'
import { TopBar } from '../components/TopBar'
import type { RewardKind } from '../../services/ads/rewardedAds'

interface GameScreenProps {
  levelId: number
  onHome: () => void
  onSettings: () => void
  onLevelSelect: () => void
  onNextLevel: (levelId: number) => void
  onToast: (message: string) => void
}

interface RewardPrompt {
  kind: RewardKind
  title: string
  description: string
  reward: () => void
}

interface Match3Stats {
  moves: number
  cleared: number
  cascades: number
}

export function GameScreen({ levelId, onHome, onSettings, onLevelSelect, onNextLevel, onToast }: GameScreenProps) {
  const level = useMemo(() => getLevelById(levelId), [levelId])
  const { player, completeLevel, useHint } = usePlayer()
  const canvasRef = useRef<PuzzleCanvasHandle>(null)
  const match3Ref = useRef<Match3BoardHandle>(null)
  const didOpenResult = useRef(false)
  const didOpenFailure = useRef(false)
  const didClaimReward = useRef(false)
  const spectacleId = useRef(0)
  const idleSide = useRef<'left' | 'right'>('left')
  const outcomeTimer = useRef<number | undefined>(undefined)
  const [puzzle, setPuzzle] = useState<PuzzleState>(() => createPuzzleState(level))
  const [isPaused, setIsPaused] = useState(false)
  const [isResultOpen, setIsResultOpen] = useState(false)
  const [isRewardClaimed, setIsRewardClaimed] = useState(false)
  const [isFailedOpen, setIsFailedOpen] = useState(false)
  const [selectedCatId, setSelectedCatId] = useState<string>()
  const [rewardPrompt, setRewardPrompt] = useState<RewardPrompt>()
  const [match3Stats, setMatch3Stats] = useState<Match3Stats>({ moves: 0, cleared: 0, cascades: 0 })
  const [spectacle, setSpectacle] = useState<CatSpectacle>()
  const [activityTick, setActivityTick] = useState(0)
  const isMatch3Level = level.id === 1 && Boolean(level.match3)

  const markActivity = useCallback(() => {
    setActivityTick((value) => value + 1)
  }, [])

  const showSpectacle = useCallback((
    kind: CatSpectacleKind,
    side?: 'left' | 'right',
    anchor?: CatSpectacle['anchor'],
    direction?: CatPawDirection
  ) => {
    spectacleId.current += 1
    setSpectacle({ id: spectacleId.current, kind, side, anchor, direction })
  }, [])

  const onSpectacleComplete = useCallback((effectId: number) => {
    setSpectacle((current) => current?.id === effectId ? undefined : current)
    setActivityTick((value) => value + 1)
  }, [])

  useEffect(() => {
    if (outcomeTimer.current !== undefined) window.clearTimeout(outcomeTimer.current)
    setPuzzle(createPuzzleState(level))
    didOpenResult.current = false
    didOpenFailure.current = false
    didClaimReward.current = false
    setIsRewardClaimed(false)
    setIsPaused(false)
    setIsResultOpen(false)
    setIsFailedOpen(false)
    setSelectedCatId(undefined)
    setMatch3Stats({ moves: 0, cleared: 0, cascades: 0 })
    setSpectacle(undefined)
    setActivityTick((value) => value + 1)
  }, [level])

  useEffect(() => () => {
    if (outcomeTimer.current !== undefined) window.clearTimeout(outcomeTimer.current)
    stopBackgroundMusic()
  }, [])

  useEffect(() => {
    if (isPaused || isResultOpen || isFailedOpen) return undefined

    const timer = window.setTimeout(() => {
      const side = idleSide.current
      idleSide.current = side === 'left' ? 'right' : 'left'
      showSpectacle('idle', side)
    }, 4000)

    return () => window.clearTimeout(timer)
  }, [activityTick, isFailedOpen, isPaused, isResultOpen, level.id, showSpectacle])

  useEffect(() => {
    if (isPaused || isResultOpen || isFailedOpen) return undefined

    const timer = window.setInterval(() => showSpectacle('peek'), CAT_PEEK_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [isFailedOpen, isPaused, isResultOpen, level.id, showSpectacle])

  useEffect(() => {
    if (puzzle.phase === 'completed' && !didOpenResult.current) {
      didOpenResult.current = true
      setIsResultOpen(false)
      showSpectacle('complete')
      playCatSound('purr', player.settings.sound)
      outcomeTimer.current = window.setTimeout(() => {
        outcomeTimer.current = undefined
        setIsResultOpen(true)
      }, getCatSpectacleDuration('complete'))
    }
    if (puzzle.phase === 'failed' && !didOpenFailure.current) {
      didOpenFailure.current = true
      setIsFailedOpen(false)
      showSpectacle('failed')
      outcomeTimer.current = window.setTimeout(() => {
        outcomeTimer.current = undefined
        setIsFailedOpen(true)
      }, getCatSpectacleDuration('failed'))
    }
  }, [player.settings.sound, puzzle.phase, showSpectacle])

  const onStateChange = useCallback((nextState: PuzzleState) => {
    setPuzzle(nextState)
  }, [])

  const onFeedback = useCallback((feedback: PuzzleFeedback) => {
    markActivity()
    startBackgroundMusic(player.settings.sound)
    if (feedback.type === 'selection') {
      setSelectedCatId(feedback.catId)
      if (feedback.catId) {
        showSpectacle('pickup', 'left')
      }
      return
    }
    if (feedback.accepted) {
      showSpectacle('drop', undefined, getRandomDropAnchor())
      playUiSound(player.settings.sound)
      playCatSound('purr', player.settings.sound)
      playCatSound('rustle', player.settings.sound)
      void playPlacementHaptic(player.settings.haptics)
      return
    }
    showSpectacle('invalid')
    void playPlacementHaptic(player.settings.haptics, false)
    onToast(getPlacementMessage(feedback.reason))
  }, [markActivity, onToast, player.settings.haptics, player.settings.sound, showSpectacle])

  const selectedCat = level.cats.find((cat) => cat.id === selectedCatId)
  const boardPeek = isMatch3Level && spectacle?.kind === 'peek' ? spectacle : undefined
  const stretchCat = level.cats.find((cat) => cat.type === 'stretch' && !puzzle.placements[cat.id])
  const sleepingCat = level.cats.find((cat) => cat.type === 'sleeping' && puzzle.placements[cat.id]?.locked)
  const displayedStars = calculateStars(level.targetMoves, puzzle)
  const coinReward = level.type === 'challenge' ? 75 : 50

  const dispatch = (command: Parameters<PuzzleCanvasHandle['dispatch']>[0]) => canvasRef.current?.dispatch(command)
  const restart = () => {
    if (outcomeTimer.current !== undefined) window.clearTimeout(outcomeTimer.current)
    outcomeTimer.current = undefined
    didOpenResult.current = false
    didOpenFailure.current = false
    didClaimReward.current = false
    setIsRewardClaimed(false)
    setIsResultOpen(false)
    setIsFailedOpen(false)
    setIsPaused(false)
    setSpectacle(undefined)
    markActivity()
    if (isMatch3Level) {
      match3Ref.current?.reset()
      setMatch3Stats({ moves: 0, cleared: 0, cascades: 0 })
      return
    }
    dispatch({ type: 'restart' })
  }

  const onMatch3StateChange = useCallback((state: Match3State) => {
    setMatch3Stats({ moves: state.moves, cleared: state.cleared, cascades: state.cascades })
  }, [])

  const onMatch3Action = useCallback((result: Match3SwapResult) => {
    markActivity()
    startBackgroundMusic(player.settings.sound)
    if (!result.accepted) {
      showSpectacle('invalid')
    }
  }, [markActivity, player.settings.sound, showSpectacle])

  const onMatch3ClearWave = useCallback((cascade: number) => {
    markActivity()
    startBackgroundMusic(player.settings.sound)
    playMatch3Sound(player.settings.sound, cascade)
    const catSpectacle = getMatch3CatSpectacle(cascade)
    if (catSpectacle) {
      showSpectacle(
        catSpectacle,
        catSpectacle === 'run' ? 'left' : undefined,
        undefined,
        catSpectacle === 'paw' ? getRandomCatPawDirection() : undefined
      )
    }
    void playPlacementHaptic(player.settings.haptics)
  }, [markActivity, player.settings.haptics, player.settings.sound, showSpectacle])

  const requestAd = (prompt: RewardPrompt) => setRewardPrompt(prompt)
  const hint = () => {
    if (useHint()) {
      dispatch({ type: 'hint' })
      return
    }
    requestAd({ kind: 'hint', title: '獲得一個提示', description: '讓一隻貓咪的正確位置亮起來。', reward: () => dispatch({ type: 'hint' }) })
  }

  const claimReward = (multiplier: number) => {
    if (didClaimReward.current) return
    didClaimReward.current = true
    setIsRewardClaimed(true)
    completeLevel(level.id, displayedStars, coinReward * multiplier)
  }

  return (
    <main className={`screen screen--game${level.id === 1 ? ' screen--game--intro' : ''}`}>
      <CatSpectacleOverlay effect={boardPeek ? undefined : spectacle} onComplete={onSpectacleComplete} />
      <TopBar
        coins={player.pawCoins}
        level={level.id}
        stars={isMatch3Level ? undefined : displayedStars}
        moves={puzzle.movesRemaining}
        onPause={() => setIsPaused(true)}
      />
      {!isMatch3Level && <div className="game-objective"><span>{level.type === 'challenge' ? '挑戰關卡' : '輕鬆關卡'}</span><strong>{level.tutorial ?? '把所有貓咪放進紙箱！'}</strong></div>}
      <section className={`puzzle-stage${isMatch3Level ? ' puzzle-stage--match3' : ''}`}>
        {isMatch3Level ? (
          <Match3Board
            ref={match3Ref}
            width={level.board.width}
            height={level.board.height}
            tileAssets={level.match3?.tileAssets ?? []}
            overlay={boardPeek ? <CatSpectacleOverlay effect={boardPeek} onComplete={onSpectacleComplete} /> : undefined}
            onAction={onMatch3Action}
            onClearWave={onMatch3ClearWave}
            onStateChange={onMatch3StateChange}
          />
        ) : <>
          <PuzzleCanvas key={level.id} ref={canvasRef} level={level} onStateChange={onStateChange} onFeedback={onFeedback} />
          <CatSelectionTray
            level={level}
            puzzle={puzzle}
            selectedCatId={selectedCatId}
            onSelect={(catId) => dispatch({ type: 'select-cat', catId })}
            onDrop={(clientX, clientY) => canvasRef.current?.placeAtScreenPoint(clientX, clientY)}
          />
        </>}
      </section>
      <div className="game-status" aria-live="polite">
        {isMatch3Level ? <><span>🐾</span><strong>已消除 {match3Stats.cleared} 隻貓咪</strong><small>點兩隻相鄰貓咪交換，也可以直接滑動。</small></> : selectedCat ? <><span>{specialIcon(selectedCat)}</span><strong>{getCatLabel(selectedCat)} 已選取</strong><small>{selectedCat.rule ? '亮黃色格子都是魚乾旁邊的位置。' : '拖到地板內，或按旋轉調整方向。'}</small></> : <><span>🐾</span><strong>從下方選一隻貓放到地板</strong><small>放滿四隻後會自動出現下一組貓咪。</small></>}
      </div>
      {isMatch3Level ? <nav className="game-actions game-actions--match3" aria-label="三消關卡操作">
        <ArtworkButton asset="replay" className="game-actions__button" onClick={restart}>重玩</ArtworkButton>
      </nav> : <nav className="game-actions" aria-label="關卡操作">
        <ArtworkButton asset="undo" className="game-actions__button" badge={puzzle.history.length || undefined} onClick={() => dispatch({ type: 'undo' })}>上一步</ArtworkButton>
        <ArtworkButton asset="hint" className="game-actions__button" badge={player.hints || undefined} onClick={hint}>提示</ArtworkButton>
        <ArtworkButton asset="shuffle" className="game-actions__button" onClick={() => dispatch({ type: 'rotate' })}>旋轉</ArtworkButton>
        <ArtworkButton asset="watchad_2" className="game-actions__button game-actions__button--dark" onClick={() => requestAd({ kind: 'auto-place', title: '自動放好一隻貓', description: '看完獎勵廣告，幫你完成下一個正確位置。', reward: () => dispatch({ type: 'auto-place' }) })}>自動放置</ArtworkButton>
      </nav>}
      {!isMatch3Level && (stretchCat || sleepingCat) && <div className="rule-actions">
        {stretchCat && <button type="button" onClick={() => dispatch({ type: 'stretch', catId: stretchCat.id })}>↔ 伸縮貓：{puzzle.stretchLengths[stretchCat.id]} 格（點我變長）</button>}
        {sleepingCat && <button type="button" onClick={() => requestAd({ kind: 'wake-sleeper', title: '叫醒睡覺貓', description: '看完獎勵廣告，叫醒一次並重新移動這隻貓。', reward: () => dispatch({ type: 'wake', catId: sleepingCat.id }) })}>zZ 叫醒睡覺貓</button>}
      </div>}

      <PauseModal open={isPaused} onContinue={() => setIsPaused(false)} onRestart={restart} onHome={onHome} onSettings={onSettings} />

      <Modal open={isFailedOpen} className="result-modal failed-modal">
        <span className="result-modal__emoji">😿</span><h2>挑戰失敗</h2><p>再試一次，這個紙箱一定裝得下！</p>
        <AppButton onClick={restart}>↻ 重新開始</AppButton>
        <AppButton variant="purple" onClick={() => requestAd({ kind: 'challenge-moves', title: '再給我 3 步', description: '看完獎勵廣告，立即獲得 +3 步。', reward: () => { setIsFailedOpen(false); dispatch({ type: 'extend-moves', amount: 3 }) } })}>▶ 看廣告 +3 步</AppButton>
      </Modal>

      <ResultModal
        open={isResultOpen}
        stars={displayedStars}
        reward={coinReward}
        isClaimed={isRewardClaimed}
        onClaim={() => claimReward(1)}
        onDouble={() => requestAd({ kind: 'double-reward', title: '雙倍過關獎勵', description: `看完獎勵廣告，領取 🐾 ${coinReward * 2}。`, reward: () => claimReward(2) })}
        onLevelSelect={onLevelSelect}
        onNextLevel={() => onNextLevel(Math.min(30, level.id + 1))}
        onRestart={restart}
      />

      {rewardPrompt && <RewardedAdModal open kind={rewardPrompt.kind} title={rewardPrompt.title} description={rewardPrompt.description} onClose={() => setRewardPrompt(undefined)} onReward={() => { rewardPrompt.reward(); setRewardPrompt(undefined) }} />}
    </main>
  )
}

function calculateStars(targetMoves: number | undefined, state: PuzzleState): number {
  if (state.hintsUsed > 1 || state.autoPlacesUsed > 0) return 1
  if (state.hintsUsed === 1) return 2
  const usedMoves = state.initialMoves !== undefined && state.movesRemaining !== undefined
    ? state.initialMoves - state.movesRemaining
    : 0
  if (targetMoves !== undefined && usedMoves > targetMoves) return 2
  return 3
}

function getPlacementMessage(reason?: string): string {
  const messages: Record<string, string> = {
    blocked: '這格被障礙物佔住了！',
    occupied: '這裡已經有另一隻貓咪。',
    'preferred-cell': '貪吃貓要放在魚乾旁邊！',
    outside: '貓咪不能超出紙箱。',
    inactive: '這不是可用的紙箱格子。',
    sleeping: '這隻貓正在睡覺，先用獎勵叫醒牠吧！',
    'lid-closed': '箱蓋已經關上，裡面的貓不能移動。',
    'game-over': '本關已結束，重新開始後再試試。'
  }
  return messages[reason ?? ''] ?? '這裡暫時放不下，換個位置試試。'
}

function specialIcon(cat: CatDefinition): string {
  if (cat.rule?.kind === 'adjacent-to-special' && cat.rule.specialCellKind === 'food') return '🐟'
  if (cat.type === 'sleeping') return 'zZ'
  if (cat.type === 'sticky') return '♡'
  if (cat.type === 'stretch') return '↔'
  return '🐱'
}

function getCatLabel(cat: CatDefinition): string {
  if (cat.name.includes('貓')) return cat.name
  if (cat.rule?.kind === 'adjacent-to-special' && cat.rule.specialCellKind === 'food') return '貪吃貓'
  const labels: Record<CatDefinition['type'], string> = {
    normal: '普通貓', sleeping: '睡覺貓', sticky: '黏人貓', stretch: '伸縮貓'
  }
  return labels[cat.type]
}
