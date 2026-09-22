import { useEffect, useRef, useState } from 'react'
import { getCatAssetPath } from '../../game/data/catAssets'
import { usePlanningGame } from '../../game/phaser/usePlanningGame'
import { planningCopy } from '../../game/phaser/planningCopy'
import { planningRetryCopy } from '../../game/phaser/planningRetryCopy'
import { getDropCatName, useLocale, useLocalizedLevel } from '../../i18n'
import type { CatAsset } from '../../game/types'
import { usePlayer } from '../../state/PlayerContext'
import { startBackgroundMusic, stopBackgroundMusic } from '../../services/audio/audioService'
import { playPlacementHaptic } from '../../services/haptics/hapticsService'
import { AppButton } from '../components/AppButton'
import { Modal } from '../components/Modal'
import { PauseModal } from '../components/PauseModal'
import { TopBar } from '../components/TopBar'
import { RewardedAdModal } from '../components/RewardedAdModal'
import { PlanningDiagonalTutorial, useDiagonalTutorial } from '../components/PlanningDiagonalTutorial'

interface Props {
  levelId: number
  onHome: () => void
  onSettings: () => void
  onLevelSelect: () => void
  onNextLevel: (id: number) => void
}

export function PlanningGameScreen({ levelId, onHome, onSettings, onLevelSelect, onNextLevel }: Props) {
  const { player, completeLevel } = usePlayer()
  const locale = useLocale()
  const text = planningCopy[locale]
  const retryText = planningRetryCopy[locale]
  const localized = useLocalizedLevel(levelId)
  const [paused, setPaused] = useState(false)
  const [rules, setRules] = useState(false)
  const [ad, setAd] = useState(false)
  const tutorial = useDiagonalTutorial(levelId)
  const { level, state, dispatch, board, cats, clearing, wave, canResume, hidden } = usePlanningGame(paused || rules || ad || tutorial.open, levelId)
  const rewarded = useRef(false)
  const editing = state.phase === 'editing'
  const locked = paused || rules || ad || tutorial.open || hidden || !editing
  const stars = Math.max(1, 3 - state.failures)
  const left = cats.length - state.placements.length
  const remainingCats = cats.slice(state.placements.length)
  const totalCats = level.board.flat().filter(Boolean).length + level.cats.length
  useEffect(() => {
    if (paused || rules || ad || tutorial.open || hidden || state.phase === 'completed' || state.phase === 'failed') stopBackgroundMusic()
    else startBackgroundMusic(player.settings.music)
    return () => stopBackgroundMusic()
  }, [paused, rules, ad, tutorial.open, hidden, state.phase, player.settings.music])
  useEffect(() => {
    if (state.phase === 'completed' && !rewarded.current) {
      rewarded.current = true
      completeLevel(levelId, stars, 50)
    }
  }, [state.phase, completeLevel, levelId, stars])
  const restart = () => {
    rewarded.current = false
    dispatch({ type: 'restart' })
    setPaused(false)
    setRules(false)
    setAd(false)
  }
  const place = (x: number, y: number) => {
    if (locked) return
    dispatch({ type: 'place', x, y })
    void playPlacementHaptic(player.settings.haptics)
  }
  const catName = (type: string) => getDropCatName(type, locale)
  return <main className={`screen screen--game screen--drop screen--planning${hidden ? ' is-suspended' : ''}`}>
    <TopBar level={levelId} coins={player.pawCoins} onPause={() => setPaused(true)} status={<div className="planning-top-status">
      <strong>{localized.name}</strong><small>{text.failures} {state.failures} {text.times}</small>
      <small>{retryText.retries(state.retries)}</small>
    </div>} />
    <section className="planning-intro"><strong>{text.goal(totalCats)}</strong><span>{text.calm}</span></section>
    <section className="planning-tray" aria-label={text.tray}>
      <div className="planning-tray__heading"><span>{state.failures ? retryText.tray : text.tray}</span>
        {remainingCats.length > 8 && <small className="planning-tray__hint">↔ {text.swipe}</small>}
        <b>{text.placed} {state.placements.length} / {cats.length}</b>
      </div>
      <div className="planning-tray__cats" role="list">{remainingCats.map((cat, index) =>
        <div key={cat.id} role="listitem" className={`planning-tray__cat${index === 0 ? ' is-next' : ''}`}
          aria-label={text.cardLabel(index + 1, catName(cat.type))}>
          <img src={getCatAssetPath(cat.type)} alt="" />
        </div>
      )}</div>
    </section>
    <div className={`planning-box${paused || rules || hidden ? ' is-paused' : ''}`}>
      <div className="planning-grid" aria-label={text.board}>
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
          const content = <><img src={getCatAssetPath(cat.type as CatAsset)} alt="" />{editing && order >= 0 && <b>{order + 1}</b>}</>
          const style = { left: `${x * 12.5}%`, top: `${y * 12.5}%` }
          const className = `planning-cat${clearing.includes(cat.id) ? ' is-clearing' : ''}${order >= 0 ? ' is-added' : ''}`
          return canTakeBack
            ? <button key={cat.id} className={className} style={style} disabled={locked}
              aria-label={`${text.take} ${order + 1} ${catName(cat.type)}`} onClick={() => dispatch({ type: 'remove', id: cat.id })}>{content}</button>
            : <div key={cat.id} className={className} style={style}
              aria-label={order >= 0 ? `${text.placed} ${order + 1} ${catName(cat.type)}` : `${text.fixed} ${catName(cat.type)}`}>{content}</div>
        }))}
      </div>
      <div className="planning-box__label">MEOWBOX <span>8 × 8</span></div>
    </div>
    <div className="planning-edit-actions">
      <button disabled={locked || !state.placements.length || state.undoUses <= 0} onClick={() => dispatch({ type: 'undo' })}>{text.undo} <span className="planning-undo-count">{state.undoUses}</span></button>
      <button disabled={locked || state.hintUses <= 0 || state.selected === undefined} onClick={() => dispatch({ type: 'hint' })}>{text.useHint} <span className="planning-undo-count">{state.hintUses}</span></button>
      <button disabled={state.phase === 'running'} onClick={() => setRules(true)}>{text.rules}</button>
    </div>
    {state.hintCell && <p className="planning-hint-status" role="status">{text.hintUsed}</p>}
    <AppButton className="planning-start" disabled={locked || left > 0} onClick={() => dispatch({ type: 'start' })}>{text.start}</AppButton>
    <PauseModal open={paused} onContinue={() => setPaused(false)} onRestart={restart} onHome={onHome} onSettings={onSettings} />
    <PlanningDiagonalTutorial open={tutorial.open} onClose={tutorial.close} />
    <Modal open={rules} ariaLabel={text.rules} className="drop-rules">
      <h2>{text.rulesTitle}</h2><ol>{[text.rule1, text.rule2, text.rule3, text.rule4(totalCats), retryText.rule].map(rule => <li key={rule}>{rule}</li>)}</ol>
      <AppButton onClick={() => setRules(false)}>{text.close}</AppButton>
    </Modal>
    <Modal open={state.phase === 'failed' && !paused && !ad} ariaLabel={text.failed} className="drop-result">
      <img src={getCatAssetPath('sleeping')} alt="" /><h2>{text.failed}</h2>
      <p>{text.wave} {wave} · {text.remaining} {state.result?.remaining} {text.cats}<br />{!canResume ? retryText.noCats : state.retries ? retryText.hint : retryText.exhausted}</p>
      {canResume && state.retries > 0 && <AppButton onClick={() => dispatch({ type: 'edit' })}>{retryText.resume}</AppButton>}
      {canResume && state.retries === 0 && <AppButton onClick={() => setAd(true)}>{retryText.ad}</AppButton>}
      <AppButton variant="cream" onClick={restart}>{retryText.restart}</AppButton>
      <AppButton variant="cream" onClick={onLevelSelect}>{text.levels}</AppButton>
    </Modal>
    <Modal open={state.phase === 'completed' && !paused} ariaLabel={text.completed} className="drop-result">
      <img src={getCatAssetPath('orange')} alt="" /><h2>{text.completed}</h2>
      <div className="drop-result__stars" aria-label={`${stars} ★`}>{[1, 2, 3].map(i => <span className={i <= stars ? 'is-earned' : ''} key={i}>★</span>)}</div>
      <p>{text.wave} {wave} · {text.failures} {state.failures} {text.times}</p>
      <strong className="drop-reward">{text.reward}</strong>
      <AppButton onClick={() => onNextLevel(levelId + 1)}>{text.next(levelId + 1)}</AppButton>
      <AppButton variant="cream" onClick={onLevelSelect}>{text.levels}</AppButton>
    </Modal>
    {ad && <RewardedAdModal open kind="planning-retry" title={retryText.ad} description={retryText.adDescription}
      onReward={() => { dispatch({ type: 'ad-retry' }); setAd(false) }} onClose={() => setAd(false)} />}
  </main>
}
