import { useEffect, useRef, useState } from 'react'
import { getLevelTimeTargets, getStarsForTime } from '../../game/core/levelTiming'
import { getCatAssetPath } from '../../game/data/catAssets'
import { MAX_PLANNING_LEVEL } from '../../game/data/planningLevels'
import { usePlanningGame } from '../../game/phaser/usePlanningGame'
import { planningCopy } from '../../game/phaser/planningCopy'
import { useLevelTimer } from '../../game/phaser/useLevelTimer'
import { getDropCatName, useLocale } from '../../i18n'
import type { CatAsset } from '../../game/types'
import { usePlayer } from '../../state/PlayerContext'
import { pauseBackgroundMusic, playClearSound, playLevelResultSound, startBackgroundMusic, stopBackgroundMusic } from '../../services/audio/audioService'
import { playPlacementHaptic } from '../../services/haptics/hapticsService'
import { createAnalyticsId, recordPlayerEvent } from '../../services/analytics/analytics'
import { AppButton } from '../components/AppButton'
import { ArtworkButton } from '../components/ArtworkButton'
import { GameImage } from '../components/GameImage'
import { LevelScoreReveal } from '../components/LevelScoreReveal'
import { LevelTimerDisplay } from '../components/LevelTimerDisplay'
import { Modal } from '../components/Modal'
import { PauseModal } from '../components/PauseModal'
import { PlanningBoardEffects, type PlanningBoardEffect } from '../components/PlanningBoardEffects'
import { TopBar } from '../components/TopBar'
import { PlanningDiagonalTutorial, useDiagonalTutorial } from '../components/PlanningDiagonalTutorial'

interface Props {
  levelId: number
  onHome: () => void
  onSettings: () => void
  onLevelSelect: () => void
  onNextLevel: (id: number) => void
  onPlayAction: () => void | Promise<void>
  onWatchUndoAd: () => Promise<boolean>
  onWatchHintAd?: () => Promise<boolean>
}

type RewardAdKind = 'undo' | 'hint'

export function PlanningGameScreen({ levelId, onHome, onSettings, onLevelSelect, onNextLevel, onPlayAction, onWatchUndoAd, onWatchHintAd = onWatchUndoAd }: Props) {
  const activeLevelId = Math.min(MAX_PLANNING_LEVEL, Math.max(1, levelId))
  const { player, completeLevel } = usePlayer()
  const locale = useLocale()
  const text = planningCopy[locale]
  const [paused, setPaused] = useState(false)
  const [failureModalOpen, setFailureModalOpen] = useState(false)
  const [rewardAdConfirm, setRewardAdConfirm] = useState<RewardAdKind>()
  const [rewardAdPending, setRewardAdPending] = useState(false)
  const [rewardAdStatus, setRewardAdStatus] = useState<string>()
  const tutorial = useDiagonalTutorial(activeLevelId)
  const { level, state, dispatch, board, cats, clearing, wave, hidden } = usePlanningGame(paused || tutorial.open, activeLevelId)
  const completionRecorded = useRef(false)
  const attemptId = useRef(createAnalyticsId())
  const failureRecorded = useRef(false)
  const resultSoundPlayed = useRef<'clear' | 'over' | undefined>(undefined)
  const clearSoundWavePlayed = useRef(0)
  const boardEffectId = useRef(0)
  const lastHintEffect = useRef<string | undefined>(undefined)
  const [boardEffect, setBoardEffect] = useState<PlanningBoardEffect>()
  const editing = state.phase === 'editing'
  const locked = paused || tutorial.open || hidden || !editing || state.pendingHint || rewardAdPending || failureModalOpen
  const left = cats.length - state.placements.length
  const remainingCats = cats.slice(state.placements.length)
  const totalCats = level.board.flat().filter(Boolean).length + level.cats.length
  const timeTargets = getLevelTimeTargets(activeLevelId, cats.length)
  const timerRunning = !paused && !tutorial.open && !hidden && !failureModalOpen
    && !rewardAdPending && rewardAdConfirm === undefined && state.phase === 'editing'
  const { elapsedMs, read, reset } = useLevelTimer(timerRunning)
  const [completionTimeMs, setCompletionTimeMs] = useState<number>()
  const [completionStars, setCompletionStars] = useState<1 | 2 | 3>(3)
  const stars = completionStars
  useEffect(() => {
    attemptId.current = createAnalyticsId()
    failureRecorded.current = false
    void recordPlayerEvent({ eventName: 'level_started', levelId: activeLevelId, attemptId: attemptId.current })
  }, [activeLevelId])
  const triggerBoardEffect = (effect: Omit<PlanningBoardEffect, 'id'>) => {
    boardEffectId.current += 1
    setBoardEffect({ ...effect, id: boardEffectId.current })
  }
  useEffect(() => {
    if (tutorial.open || hidden) pauseBackgroundMusic()
    else startBackgroundMusic(player.settings.music)
  }, [tutorial.open, hidden, player.settings.music])
  useEffect(() => {
    if (state.phase !== 'running') clearSoundWavePlayed.current = 0
  }, [state.phase])
  useEffect(() => {
    if (state.phase !== 'running' || paused || tutorial.open || hidden || clearing.length === 0 || wave <= clearSoundWavePlayed.current) return
    clearSoundWavePlayed.current = wave
    playClearSound(wave, player.settings.sound)
  }, [clearing, hidden, paused, player.settings.sound, state.phase, tutorial.open, wave])
  useEffect(() => {
    const result = state.phase === 'completed' ? 'clear' : state.failureReason === 'resolution' ? 'over' : undefined
    if (!result || resultSoundPlayed.current === result) return
    resultSoundPlayed.current = result
    stopBackgroundMusic()
    playLevelResultSound(result, player.settings.sound)
  }, [state.phase, state.failureReason, player.settings.sound])
  useEffect(() => () => stopBackgroundMusic(), [])
  useEffect(() => {
    if (state.phase !== 'completed' || completionRecorded.current) return
    completionRecorded.current = true
    const finalElapsedMs = read()
    const earnedStars = getStarsForTime(finalElapsedMs, timeTargets)
    setCompletionTimeMs(finalElapsedMs)
    setCompletionStars(earnedStars)
    completeLevel(activeLevelId, earnedStars)
    void recordPlayerEvent({ eventName: 'level_completed', levelId: activeLevelId, attemptId: attemptId.current, clearTimeMs: finalElapsedMs, starsEarned: earnedStars })
  }, [state.phase, completeLevel, activeLevelId, read, timeTargets.threeStarMs, timeTargets.twoStarMs])
  useEffect(() => {
    if (!state.failureReason) return
    setFailureModalOpen(true)
    if (failureRecorded.current) return
    failureRecorded.current = true
    void recordPlayerEvent({ eventName: 'level_failed', levelId: activeLevelId, attemptId: attemptId.current })
  }, [state.failureReason, activeLevelId])
  useEffect(() => {
    const hint = state.hintCell
    if (!hint) {
      lastHintEffect.current = undefined
      return
    }
    const hintKey = `${hint.catId}:${hint.x}:${hint.y}`
    if (lastHintEffect.current === hintKey) return
    lastHintEffect.current = hintKey
    triggerBoardEffect({ kind: 'place', x: hint.x, y: hint.y })
  }, [state.hintCell])
  const restart = () => {
    completionRecorded.current = false
    failureRecorded.current = false
    resultSoundPlayed.current = undefined
    attemptId.current = createAnalyticsId()
    void recordPlayerEvent({ eventName: 'level_started', levelId: activeLevelId, attemptId: attemptId.current })
    reset()
    setCompletionTimeMs(undefined)
    setCompletionStars(3)
    setBoardEffect(undefined)
    dispatch({ type: 'restart' })
    void onPlayAction()
    setRewardAdConfirm(undefined)
    setRewardAdStatus(undefined)
    setFailureModalOpen(false)
    setPaused(false)
  }
  const watchRewardAd = async (kind: RewardAdKind, allowExistingHint = false, restartAfterReward = false) => {
    if (rewardAdPending || state.phase !== 'editing') return
    if (kind === 'undo' ? state.undoUses > 0 : !allowExistingHint && state.hintUses > 0) return
    setRewardAdPending(true)
    setRewardAdStatus(undefined)
    try {
      const completed = await (kind === 'hint' ? onWatchHintAd() : onWatchUndoAd())
      if (completed) {
        if (restartAfterReward) restart()
        dispatch({ type: kind === 'hint' ? 'grant-hint' : 'grant-undo' })
        setRewardAdStatus(kind === 'hint' ? text.hintAdGranted : text.undoAdGranted)
      } else {
        setRewardAdStatus(kind === 'hint' ? text.hintAdUnavailable : text.undoAdUnavailable)
        if (restartAfterReward) setFailureModalOpen(true)
      }
    } catch {
      setRewardAdStatus(kind === 'hint' ? text.hintAdUnavailable : text.undoAdUnavailable)
      if (restartAfterReward) setFailureModalOpen(true)
    } finally {
      setRewardAdPending(false)
    }
  }
  const requestUndo = () => {
    if (locked || rewardAdPending) return
    if (state.undoUses > 0) {
      if (state.placements.length) dispatch({ type: 'undo' })
      return
    }
    setRewardAdConfirm('undo')
  }
  const requestHint = () => {
    if (locked || rewardAdPending || state.selected === undefined) return
    if (state.hintUses > 0) {
      dispatch({ type: 'hint' })
      void recordPlayerEvent({ eventName: 'hint_used', levelId: activeLevelId, attemptId: attemptId.current })
      return
    }
    setRewardAdConfirm('hint')
  }
  const requestFailureHint = () => {
    setFailureModalOpen(false)
    void watchRewardAd('hint', true, true)
  }
  const confirmRewardAd = () => {
    if (!rewardAdConfirm) return
    const kind = rewardAdConfirm
    setRewardAdConfirm(undefined)
    void watchRewardAd(kind)
  }
  const place = (x: number, y: number) => {
    if (locked) return
    triggerBoardEffect({ kind: 'place', x, y })
    dispatch({ type: 'place', x, y })
    void playPlacementHaptic(player.settings.haptics)
  }
  const removePlacedCat = (id: number, x: number, y: number) => {
    if (locked) return
    triggerBoardEffect({ kind: 'remove', x, y })
    dispatch({ type: 'remove', id })
  }
  const catName = (type: string) => getDropCatName(type, locale)
  const shownElapsedMs = completionTimeMs ?? elapsedMs
  return <main className={`screen screen--game screen--drop screen--planning${hidden ? ' is-suspended' : ''}`}>
    <TopBar level={activeLevelId} onPause={() => setPaused(true)} status={<div className="planning-top-status">
      <div className="planning-top-goal">{text.goal(totalCats)}</div>
      <LevelTimerDisplay elapsedMs={shownElapsedMs} label={text.timerLabel} paused={!timerRunning && state.phase !== 'completed'} complete={state.phase === 'completed'} />
    </div>} />
    <section className="planning-tray" aria-label={text.tray}>
      <div className="planning-tray__heading"><span>{text.tray}</span>
        {remainingCats.length > 8 && <small className="planning-tray__hint">↔ {text.swipe}</small>}
        <b>{text.placed} {state.placements.length} / {cats.length}</b>
      </div>
      <div className="planning-tray__cats" role="list">{remainingCats.map((cat, index) =>
        <div key={cat.id} role="listitem" className={`planning-tray__cat${index === 0 ? ' is-next' : ''}`}
          aria-label={text.cardLabel(index + 1, catName(cat.type))}>
          <img src={getCatAssetPath(cat.type)} alt="" />
        </div>
      )}{remainingCats.length === 0 && <span className="planning-tray__empty-slot" aria-hidden="true" />}</div>
    </section>
    <div
      className={`planning-board planning-board--prism${paused || hidden ? ' is-paused' : ''}`}
      data-board-size="8x8"
    >
      <div className="planning-grid" data-board-skin="liquid-crystal" aria-label={text.board}>
        {Array.from({ length: 64 }, (_, i) => <div className="planning-cell" key={i} />)}
        <div className="planning-placement-grid">{Array.from({ length: 8 }, (_, y) => Array.from({ length: 8 }, (_, x) => {
          const hinted = state.hintCell !== undefined && state.hintCell.catId === state.selected && state.hintCell.x === x && state.hintCell.y === y
          return <button key={`${x}:${y}`} className={`planning-placement-cell${hinted ? ' is-hint' : ''}`} disabled={locked || state.selected === undefined || !!board[y][x]}
            aria-label={text.cellLabel(y + 1, x + 1)} onClick={() => place(x, y)} />
        }))}</div>
        {board.flatMap((row, y) => row.flatMap((cat, x) => {
          if (!cat) return []
          const order = state.placements.findIndex(p => p.catId === cat.id)
          const canTakeBack = editing && state.undoUses > 0 && order >= 0 && order === state.placements.length - 1
          const isNewlyPlaced = boardEffect?.kind === 'place' && boardEffect.x === x && boardEffect.y === y
          const content = <><img src={getCatAssetPath(cat.type as CatAsset)} alt="" />{order >= 0 && <b>{order + 1}</b>}</>
          const style = { left: `${x * 12.5}%`, top: `${y * 12.5}%` }
          const className = `planning-cat${clearing.includes(cat.id) ? ' is-clearing' : ''}${isNewlyPlaced ? ' is-added' : ''}`
          return canTakeBack
            ? <button key={cat.id} className={className} style={style} disabled={locked}
              aria-label={`${text.take} ${order + 1} ${catName(cat.type)}`} onClick={() => removePlacedCat(cat.id, x, y)}>{content}</button>
            : <div key={cat.id} className={className} style={style}
              aria-label={order >= 0 ? `${text.placed} ${order + 1} ${catName(cat.type)}` : `${text.fixed} ${catName(cat.type)}`}>{content}</div>
        }))}
      </div>
      <PlanningBoardEffects
        board={board}
        clearingIds={clearing}
        effect={boardEffect}
        frame={state.frame}
        wave={wave}
        clearLabel={text.clear}
        comboLabel={text.combo}
      />
      <div className="planning-board__label">MEOW LINE <span>8 × 8</span></div>
    </div>
    {editing && !failureModalOpen && state.failureReason === 'resolution' && state.placements.length === 0 && <p className="planning-status" role="status">{text.retryNotice}</p>}
    <div className="planning-edit-actions">
      <ArtworkButton
        asset="undo"
        className={`planning-undo-button${state.undoUses === 0 ? ' is-attention' : ''}`}
        badge={state.undoUses}
        disabled={locked || rewardAdPending || (state.undoUses > 0 && !state.placements.length)}
        aria-label={`${text.undo} ${state.undoUses}${state.undoUses === 0 ? `，${text.undoAdAttention}` : ''}`}
        onClick={requestUndo}
      />
      <ArtworkButton
        asset="hint"
        className={`planning-hint-button${state.hintUses === 0 ? ' is-attention' : ''}`}
        badge={state.hintUses}
        disabled={locked || rewardAdPending || state.selected === undefined}
        aria-label={`${text.useHint} ${state.hintUses}${state.hintUses === 0 ? `，${text.hintAdAttention}` : ''}`}
        onClick={() => requestHint()}
      />
    </div>
    {rewardAdStatus && !failureModalOpen && <p className="planning-ad-status" role="status">{rewardAdStatus}</p>}
    <ArtworkButton asset="start" className="planning-start" disabled={locked || left > 0} onClick={() => { triggerBoardEffect({ kind: 'start' }); dispatch({ type: 'start' }) }}>{text.start}</ArtworkButton>
    <PauseModal open={paused} onContinue={() => setPaused(false)} onRestart={restart} onHome={onHome} onSettings={onSettings} />
    <PlanningDiagonalTutorial open={tutorial.open} onClose={tutorial.close} />
    <Modal
      open={rewardAdConfirm !== undefined}
      onClose={() => setRewardAdConfirm(undefined)}
      ariaLabel={rewardAdConfirm === 'hint' ? text.hintAdConfirmTitle : text.undoAdConfirmTitle}
      className="planning-undo-confirm"
    >
      <h2>{rewardAdConfirm === 'hint' ? text.hintAdConfirmTitle : text.undoAdConfirmTitle}</h2>
      <p>{rewardAdConfirm === 'hint' ? text.hintAdConfirmBody : text.undoAdConfirmBody}</p>
      <div className="planning-undo-confirm__actions">
        <AppButton onClick={confirmRewardAd} disabled={rewardAdPending}>{text.undoAdConfirmAction}</AppButton>
        <AppButton variant="cream" onClick={() => setRewardAdConfirm(undefined)}>{text.cancel}</AppButton>
      </div>
    </Modal>
    <Modal
      open={failureModalOpen && state.failureReason !== undefined && !paused}
      onClose={state.failureReason === 'no-solution' ? undefined : () => setFailureModalOpen(false)}
      ariaLabel={state.failureReason === 'no-solution' ? text.noSolutionTitle : text.failureTitle}
      className="drop-result drop-result--failure"
    >
      <div className="drop-result__header">
        <div className="drop-result__level-chip" aria-label={`第 ${activeLevelId} 關`}>
          <GameImage asset="levelcard" alt="" aria-hidden="true" />
          <span>{activeLevelId}</span>
        </div>
        <div className="drop-result__mascot">
          <img src={getCatAssetPath('sleeping')} alt="" />
        </div>
        <div className="drop-result__title">
          <span className="drop-result__eyebrow">{state.failureReason === 'no-solution' ? text.noSolutionEyebrow : text.failureEyebrow}</span>
          <h2>{state.failureReason === 'no-solution' ? text.noSolutionTitle : text.failureTitle}</h2>
        </div>
        <p className="drop-result__encouragement">{state.failureReason === 'no-solution' ? text.noSolutionEncouragement : text.failureEncouragement}</p>
      </div>
      {state.failureReason === 'resolution' && <div className="drop-result__score-panel drop-result__failure-summary"><p className="drop-result__summary"><span>{text.failures}</span><strong>{state.failures}</strong><span>{text.times}</span></p></div>}
      {rewardAdStatus && failureModalOpen && <p className="planning-ad-status" role="status">{rewardAdStatus}</p>}
      <div className="drop-result__actions">
        <AppButton onClick={restart}>{text.restart}</AppButton>
        <AppButton variant="blue" onClick={requestFailureHint}>{state.failureReason === 'no-solution' ? text.noSolutionHintAd : text.failureHintAd}</AppButton>
        {state.failureReason === 'no-solution' && <AppButton variant="cream" onClick={() => setFailureModalOpen(false)}>{text.continueAction}</AppButton>}
      </div>
    </Modal>
    <Modal open={state.phase === 'completed' && !paused} ariaLabel={text.completed} className="drop-result drop-result--success">
      <div className="drop-result__header">
        <div className="drop-result__level-chip" aria-label={`第 ${activeLevelId} 關`}>
          <GameImage asset="levelcard" alt="" aria-hidden="true" />
          <span>{activeLevelId}</span>
        </div>
        <div className="drop-result__mascot">
          <img src={getCatAssetPath('orange')} alt="" />
        </div>
        <div className="drop-result__title">
          <span className="drop-result__eyebrow">{text.successEyebrow}</span>
          <h2>{text.completed}</h2>
        </div>
        <p className="drop-result__encouragement">{text.successEncouragement}</p>
      </div>
      <div className="drop-result__score-panel">
        <LevelScoreReveal elapsedMs={shownElapsedMs} stars={stars} timeLabel={text.resultTime} starsLabel={text.starsLabel(stars)} />
        <p className="drop-result__summary"><span>{text.wave}</span><strong>{wave}</strong></p>
      </div>
      <div className="drop-result__actions">
        {activeLevelId < MAX_PLANNING_LEVEL && <AppButton variant="cream" className="drop-result__next-button" onClick={() => onNextLevel(activeLevelId + 1)}>{text.next(activeLevelId + 1)}</AppButton>}
        {activeLevelId === MAX_PLANNING_LEVEL && <p className="planning-mainline-done">{text.mainlineDone}</p>}
        <AppButton variant="cream" onClick={onLevelSelect}>{text.levels}</AppButton>
      </div>
    </Modal>
  </main>
}
