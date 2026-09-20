import { useEffect, useRef, useState } from 'react'
import { getDropLevelById } from '../../game/data/dropLevels'
import { getCatAssetPath } from '../../game/data/catAssets'
import { DropBoard } from '../../game/phaser/DropBoard'
import { DropPreview } from '../../game/phaser/DropPreview'
import { useDropGame } from '../../game/phaser/useDropGame'
import { format, getDropCatName, useLocale, useLocalizedLevel, useStrings } from '../../i18n'
import { playCatSound, playMatch3Sound, startBackgroundMusic, stopBackgroundMusic } from '../../services/audio/audioService'
import { playPlacementHaptic } from '../../services/haptics/hapticsService'
import { usePlayer } from '../../state/PlayerContext'
import { AppButton } from '../components/AppButton'
import { Modal } from '../components/Modal'
import { PauseModal } from '../components/PauseModal'
import { TopBar } from '../components/TopBar'
import { RewardedAdModal } from '../components/RewardedAdModal'
import { recommendColumn } from '../../game/core/dropAssistance'

interface GameScreenProps {
  levelId: number
  onHome: () => void
  onSettings: () => void
  onLevelSelect: () => void
  onNextLevel: (levelId: number) => void
  onToast: (message: string) => void
}

export function GameScreen({ levelId, onHome, onSettings, onLevelSelect, onNextLevel }: GameScreenProps) {
  const { player, completeLevel } = usePlayer()
  const strings = useStrings()
  const locale = useLocale()
  const level = getDropLevelById(levelId)
  const localized = useLocalizedLevel(level.id)
  const [paused, setPaused] = useState(false)
  const [rules, setRules] = useState(false)
  const [ad, setAd] = useState<'hint' | 'revive'>()
  const [run, setRun] = useState(0)
  const rewarded = useRef(false)
  const { state, display, busy, drop, reset, secondsLeft, started, failure, reviveUsed, extraDrops, revive, hint, hintColumn, hintUsed } = useDropGame(paused || rules || !!ad, combo => {
    startBackgroundMusic(player.settings.sound)
    if (combo) playMatch3Sound(player.settings.sound, combo)
    else playCatSound('rustle', player.settings.sound)
    void playPlacementHaptic(player.settings.haptics)
  }, level)
  const stars = state.moves <= level.threeStarMoves ? 3 : state.moves <= level.threeStarMoves + 8 ? 2 : 1
  useEffect(() => {
    if (state.phase === 'completed' && !busy && !rewarded.current) {
      rewarded.current = true
      completeLevel(level.id, stars, 50)
      playCatSound('purr', player.settings.sound)
    }
    if (state.phase !== 'playing') stopBackgroundMusic()
  }, [busy, completeLevel, level.id, player.settings.sound, stars, state.phase])
  useEffect(() => {
    if (paused || rules || ad) stopBackgroundMusic()
  }, [paused, rules, ad])
  useEffect(() => () => stopBackgroundMusic(), [])
  const restart = () => { rewarded.current = false; reset(); setPaused(false); setRules(false); setAd(undefined); setRun(value => value + 1) }
  const progress = Math.min(state.cleared, state.target)
  const hintAvailable = !busy && state.phase === 'playing' && !hintUsed && recommendColumn(state) !== undefined
  const timeText = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`
  const failureTitle = failure === 'ceiling' ? strings.game.failedCeilingTitle : failure === 'moves' ? strings.game.failedMovesTitle : strings.game.failedTimeTitle
  void started
  return <main className="screen screen--game screen--drop">
    <TopBar coins={player.pawCoins} level={level.id} onPause={() => setPaused(true)} status={<div className="drop-top-status" aria-label={strings.game.statusLabel}>
      <strong>{format(strings.game.rescue, { done: progress, target: state.target })}</strong>
      <span className={secondsLeft <= 15 && extraDrops === undefined ? 'drop-time is-urgent' : 'drop-time'} role="timer" aria-label={strings.game.timeLeft}>{extraDrops !== undefined ? format(strings.game.overtime, { count: extraDrops }) : `⏱ ${timeText}`}</span>
    </div>} />
    <DropPreview current={state.current} next={state.next} soon={level.previewCount === 3 ? state.queue[0] : undefined} />
    <DropBoard key={run} board={display.board} previous={display.previous} current={state.current} wave={display.wave} hintColumn={hintColumn}
      paused={paused || rules || !!ad} terminal={state.phase !== 'playing'} onDrop={drop} />
    <nav className="drop-actions" aria-label={strings.game.actions}><button onClick={() => setRules(true)}>{strings.game.howTo}</button><button disabled={!hintAvailable} onClick={() => setAd('hint')}>{hintUsed ? strings.game.hintUsed : strings.game.hintAd}</button><button onClick={restart}>{strings.game.replay}</button></nav>
    <PauseModal open={paused} onContinue={() => setPaused(false)} onRestart={restart} onHome={onHome} onSettings={onSettings} />
    <Modal open={rules} ariaLabel={strings.game.rulesAria} className="drop-rules">
      <h2>{strings.game.rulesTitle}</h2>
      <p className="drop-level-intro">{localized.name} — {localized.guidance}</p>
      <ol><li><strong>{strings.game.rule1Title}</strong><p>{strings.game.rule1Desc}</p></li><li><strong>{strings.game.rule2Title}</strong><p>{strings.game.rule2Desc}</p></li><li><strong>{strings.game.rule3Title}</strong><p>{strings.game.rule3Desc}</p></li><li><strong>{strings.game.rule4Title}</strong><p>{strings.game.rule4Desc}</p></li></ol>
      <p>{format(strings.game.rulesFooter, { time: level.timeLimit, target: level.target, three: level.threeStarMoves, two: level.threeStarMoves + 8 })}</p><p>{strings.game.rulesExtra}</p><AppButton onClick={() => setRules(false)}>{strings.game.rulesCta}</AppButton>
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
      <img src={getCatAssetPath('sleeping')} alt={getDropCatName('sleeping', locale)} /><h2>{failureTitle}</h2><p>{format(strings.game.failedProgress, { cleared: state.cleared, target: state.target })}<br />{failure === 'ceiling' ? strings.game.ceilingTip : strings.game.otherTip}</p>
      {!reviveUsed && <AppButton variant="purple" onClick={() => setAd('revive')}>{failure === 'ceiling' ? strings.game.reviveCeiling : strings.game.reviveMoves}</AppButton>}
      <AppButton onClick={restart}>{strings.game.retry}</AppButton><AppButton variant="cream" onClick={onHome}>{strings.game.backCottage}</AppButton>
    </Modal>
    {ad && <RewardedAdModal key={`${run}-${ad}`} open kind={ad === 'hint' ? 'hint' : failure === 'ceiling' ? 'clear-bottom-row' : 'challenge-moves'}
      title={ad === 'hint' ? strings.game.hintTitle : strings.game.reviveTitle}
      description={ad === 'hint' ? strings.game.hintDesc : failure === 'ceiling' ? strings.game.reviveCeilingDesc : strings.game.reviveMovesDesc}
      onClose={() => setAd(undefined)} onReward={() => { if (ad === 'hint') hint(); else revive(); setAd(undefined) }} />}
  </main>
}

function isLastLevel(levelId: number): boolean {
  return levelId >= 60
}
