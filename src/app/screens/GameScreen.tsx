import { useEffect, useRef, useState } from 'react'
import { advanceDropVariant, getStoredDropVariant, loadDropLevelById } from '../../game/data/dropLevelLoader'
import { MAX_DROP_LEVEL } from '../../game/data/dropManifest'
import type { DropLevelDefinition } from '../../game/data/dropLevelTypes'
import { getCatAssetPath } from '../../game/data/catAssets'
import { DropBoard } from '../../game/phaser/DropBoard'
import { DropPreview } from '../../game/phaser/DropPreview'
import { useDropGame } from '../../game/phaser/useDropGame'
import { format, getDropCatName, useLocale, useLocalizedLevel, useStrings } from '../../i18n'
import { startBackgroundMusic, stopBackgroundMusic } from '../../services/audio/audioService'
import { playPlacementHaptic } from '../../services/haptics/hapticsService'
import { usePlayer } from '../../state/PlayerContext'
import { AppButton } from '../components/AppButton'
import { Modal } from '../components/Modal'
import { PauseModal } from '../components/PauseModal'
import { TopBar } from '../components/TopBar'
import { RewardedAdModal } from '../components/RewardedAdModal'
import { recommendColumn } from '../../game/core/dropAssistance'
import { DropHold } from '../../game/phaser/DropHold'
import { DropObjectives } from '../../game/phaser/DropObjectives'
import { DropTutorial } from '../../game/phaser/DropTutorial'

interface GameScreenProps {
  levelId: number
  onHome: () => void
  onSettings: () => void
  onLevelSelect: () => void
  onNextLevel: (levelId: number) => void
  onToast: (message: string) => void
}

export function GameScreen(props: GameScreenProps) {
  const strings = useStrings()
  const { levelId } = props
  const [variant, setVariant] = useState(() => getStoredDropVariant(levelId))
  const [level, setLevel] = useState<DropLevelDefinition>()
  const [loadError, setLoadError] = useState(false)
  const [loadAttempt, setLoadAttempt] = useState(0)

  useEffect(() => {
    let mounted = true
    setLevel(undefined)
    setLoadError(false)
    void loadDropLevelById(levelId, variant)
      .then((loadedLevel) => {
        if (mounted) setLevel(loadedLevel)
      })
      .catch(() => {
        if (mounted) setLoadError(true)
      })
    return () => { mounted = false }
  }, [levelId, loadAttempt, variant])

  if (!level) return <main className="screen screen--game screen--drop drop-level-loading" aria-busy="true">
    <div className="drop-level-loading__content" role="status">
      <span>{loadError ? strings.game.retry : strings.app.organizingBox}</span>
      {loadError && <button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>{strings.game.retry}</button>}
    </div>
  </main>

  return <LoadedGameScreen {...props} level={level} onRestart={() => setVariant(advanceDropVariant(level.id))} />
}

interface LoadedGameScreenProps extends GameScreenProps {
  level: DropLevelDefinition
  onRestart: () => void
}

function LoadedGameScreen({ level, onRestart, onHome, onSettings, onLevelSelect, onNextLevel }: LoadedGameScreenProps) {
  const { player, completeLevel } = usePlayer()
  const strings = useStrings()
  const locale = useLocale()
  const localized = useLocalizedLevel(level.id)
  const [paused, setPaused] = useState(false)
  const [rules, setRules] = useState(false)
  const [ad, setAd] = useState<'hint' | 'revive'>()
  const [tutorial, setTutorial] = useState(false)
  const [run, setRun] = useState(0)
  const rewarded = useRef(false)
  useEffect(() => setTutorial(shouldShowTutorial(level.tutorial)), [level.id, level.tutorial])
  const { state, display, busy, drop, hold, reset, secondsLeft, started, failure, reviveUsed, canReviveFromCeiling, extraDrops, revive, hint, hintColumn, hintUsed } = useDropGame(paused || rules || !!ad || tutorial, combo => {
    startBackgroundMusic(player.settings.music)
    void playPlacementHaptic(player.settings.haptics)
  }, level)
  const stars = state.moves <= level.threeStarMoves ? 3 : state.moves <= level.twoStarMoves ? 2 : 1
  useEffect(() => {
    if (state.phase === 'completed' && !busy && !rewarded.current) {
      rewarded.current = true
      completeLevel(level.id, stars, 50)
    }
    if (state.phase !== 'playing') stopBackgroundMusic()
  }, [busy, completeLevel, level.id, player.settings.music, stars, state.phase])
  useEffect(() => {
    if (paused || rules || ad || tutorial || state.phase !== 'playing') return
    startBackgroundMusic(player.settings.music)
  }, [ad, paused, player.settings.music, rules, state.phase, tutorial])
  useEffect(() => {
    if (paused || rules || ad || tutorial) stopBackgroundMusic()
  }, [paused, rules, ad, tutorial])
  useEffect(() => () => stopBackgroundMusic(), [])
  const restart = () => {
    rewarded.current = false
    reset()
    onRestart()
    setPaused(false)
    setRules(false)
    setAd(undefined)
    setRun(value => value + 1)
  }
  const progress = Math.min(state.progress.rescued, state.goals.rescued)
  const hintAvailable = !busy && state.phase === 'playing' && !hintUsed && recommendColumn(state) !== undefined
  const timeText = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`
  const failureTitle = failure === 'ceiling' ? strings.game.failedCeilingTitle : failure === 'no-route' ? strings.game.noRouteTitle : failure === 'moves' ? strings.game.failedMovesTitle : strings.game.failedTimeTitle
  void started
  return <main className="screen screen--game screen--drop">
    <TopBar coins={player.pawCoins} level={level.id} onPause={() => setPaused(true)} status={<div className="drop-top-status" aria-label={strings.game.statusLabel}>
      <strong>{format(strings.game.rescue, { done: progress, target: state.target })}</strong>
      <span className={secondsLeft <= 15 && extraDrops === undefined ? 'drop-time is-urgent' : 'drop-time'} role="timer" aria-label={strings.game.timeLeft}>{extraDrops !== undefined ? format(strings.game.overtime, { count: extraDrops }) : `⏱ ${timeText}`}</span>
    </div>} />
    <DropObjectives goals={state.goals} progress={state.progress} patrolDrops={state.patrol?.dropsUntilMove}
      patrolColumn={state.patrol ? state.patrol.columns[state.patrol.index % state.patrol.columns.length] : undefined} />
    <DropPreview current={state.current} next={state.next} currentTrait={state.currentTrait} nextTrait={state.nextTrait}
      tokens={[{ type: state.current, trait: state.currentTrait }, { type: state.next, trait: state.nextTrait }, ...state.queue.map((type, index) => ({ type, trait: state.queueTraits[index] ?? 'none' as const }))]}
      previewCount={state.previewCount} />
    {level.holdUses > 0 && <DropHold token={state.holdToken} uses={state.holdUses} locked={state.holdLocked} disabled={paused || rules || !!ad || tutorial || busy || state.phase !== 'playing'} onHold={hold} />}
    <DropBoard key={run} board={display.board} previous={display.previous} current={state.current} wave={display.wave} hintColumn={hintColumn}
      paused={paused || rules || !!ad || tutorial || (level.id >= 31 && busy)} terminal={state.phase !== 'playing'} onDrop={drop}
      scratchPosts={state.scratchPosts} fishTreats={state.fishTreats} tunnels={state.tunnels} patrol={state.patrol}
      routedColumn={display.routedColumn} routed={display.routed} patrolMoved={display.patrolMoved} />
    <nav className="drop-actions" aria-label={strings.game.actions}><button onClick={() => setRules(true)}>{strings.game.howTo}</button><button disabled={!hintAvailable} onClick={() => setAd('hint')}>{hintUsed ? strings.game.hintUsed : strings.game.hintAd}</button><button onClick={restart}>{strings.game.replay}</button></nav>
    <PauseModal open={paused} onContinue={() => setPaused(false)} onRestart={restart} onHome={onHome} onSettings={onSettings} />
    <DropTutorial level={level} open={tutorial} onClose={() => { dismissTutorial(level.tutorial); setTutorial(false) }} />
    <Modal open={rules} ariaLabel={strings.game.rulesAria} className="drop-rules">
      <h2>{strings.game.rulesTitle}</h2>
      <p className="drop-level-intro">{localized.name} — {localized.guidance}</p>
      <ol><li><strong>{strings.game.rule1Title}</strong><p>{strings.game.rule1Desc}</p></li><li><strong>{strings.game.rule2Title}</strong><p>{strings.game.rule2Desc}</p></li><li><strong>{strings.game.rule3Title}</strong><p>{strings.game.rule3Desc}</p></li><li><strong>{strings.game.rule4Title}</strong><p>{strings.game.rule4Desc}</p></li></ol>
      <p>{format(strings.game.rulesFooter, { time: level.timeLimit, target: level.target, three: level.threeStarMoves, two: level.twoStarMoves })}</p><p>{strings.game.rulesExtra}</p><AppButton onClick={() => setRules(false)}>{strings.game.rulesCta}</AppButton>
    </Modal>
    <Modal open={state.phase === 'completed' && !busy} ariaLabel={strings.game.completedAria} className="drop-result">
      <div className="drop-confetti" aria-hidden="true">✦ ♡ ✧ ♡ ✦</div><img src={getCatAssetPath(level.tileAssets[0])} alt={getDropCatName(level.tileAssets[0], locale)} /><h2>{format(strings.game.completedTitle, { id: level.id })}</h2>
      <div className="drop-result__stars" aria-label={format(strings.game.starsAria, { stars })}>{[1, 2, 3].map(i => <span className={i <= stars ? 'is-earned' : ''} key={i}>★</span>)}</div>
      <p>{format(strings.game.summary, { cleared: state.cleared, score: state.score })}<br />{format(strings.game.summaryLine2, { best: state.bestCombo, moves: state.moves })}</p>
      <strong className="drop-reward">{format(strings.game.reward, { amount: 50 })}</strong>
      {!isLastLevel(level.id) && <AppButton onClick={() => onNextLevel(level.id + 1)}>{format(strings.game.nextLevel, { id: level.id + 1 })}</AppButton>}
      <AppButton onClick={restart}>{strings.game.playAgain}</AppButton><AppButton variant="cream" onClick={onLevelSelect}>{strings.game.backToLevels}</AppButton><small>{isLastLevel(level.id) ? strings.game.partyDone : strings.game.nextHappiness}</small>
    </Modal>
    <Modal open={state.phase === 'failed' && !busy && !ad} ariaLabel={failure === 'ceiling' ? strings.game.failedCeilingAria : strings.game.failedGenericAria} className="drop-result">
      <img src={getCatAssetPath('sleeping')} alt={getDropCatName('sleeping', locale)} /><h2>{failureTitle}</h2><p>{format(strings.game.failedProgress, { cleared: state.progress.rescued, target: state.goals.rescued })}<br />{failure === 'ceiling' ? strings.game.ceilingTip : failure === 'no-route' ? strings.game.noRouteTip : strings.game.otherTip}</p>
      {!reviveUsed && failure !== 'no-route' && (failure !== 'ceiling' || canReviveFromCeiling) && <AppButton variant="purple" onClick={() => setAd('revive')}>{failure === 'ceiling' ? strings.game.reviveCeiling : strings.game.reviveMoves}</AppButton>}
      <AppButton onClick={restart}>{strings.game.retry}</AppButton><AppButton variant="cream" onClick={onHome}>{strings.game.backCottage}</AppButton>
    </Modal>
    {ad && <RewardedAdModal key={`${run}-${ad}`} open kind={ad === 'hint' ? 'hint' : failure === 'ceiling' ? 'clear-bottom-row' : 'challenge-moves'}
      title={ad === 'hint' ? strings.game.hintTitle : strings.game.reviveTitle}
      description={ad === 'hint' ? strings.game.hintDesc : failure === 'ceiling' ? strings.game.reviveCeilingDesc : strings.game.reviveMovesDesc}
      onClose={() => setAd(undefined)} onReward={() => { if (ad === 'hint') hint(); else revive(); setAd(undefined) }} />}
  </main>
}

function isLastLevel(levelId: number): boolean {
  return levelId >= MAX_DROP_LEVEL
}

function shouldShowTutorial(tutorial?: string): boolean {
  if (!tutorial || !tutorial.startsWith('mechanic-')) return false
  try {
    return window.sessionStorage.getItem(`meowbox-tutorial:${tutorial}`) !== '1'
  } catch {
    return true
  }
}

function dismissTutorial(tutorial?: string): void {
  if (!tutorial) return
  try {
    window.sessionStorage.setItem(`meowbox-tutorial:${tutorial}`, '1')
  } catch {
    // The tutorial is still dismissible when storage is blocked by the host.
  }
}
