import { useEffect, useRef, useState } from 'react'
import { getCatAssetPath } from '../../game/data/catAssets'
import { MAX_PLANNING_LEVEL } from '../../game/data/planningLevels'
import { getPlanningObjective, type PlanningObjectiveDirection } from '../../game/core/planningObjective'
import { usePlanningGame } from '../../game/phaser/usePlanningGame'
import { planningCopy } from '../../game/phaser/planningCopy'
import { getDropCatName, useLocale, useLocalizedLevel } from '../../i18n'
import type { CatAsset } from '../../game/types'
import { usePlayer } from '../../state/PlayerContext'
import { startBackgroundMusic, stopBackgroundMusic } from '../../services/audio/audioService'
import { playPlacementHaptic } from '../../services/haptics/hapticsService'
import { AppButton } from '../components/AppButton'
import { Modal } from '../components/Modal'
import { PauseModal } from '../components/PauseModal'
import { TopBar } from '../components/TopBar'
import { PlanningDiagonalTutorial, useDiagonalTutorial } from '../components/PlanningDiagonalTutorial'

interface Props {
  levelId: number
  onHome: () => void
  onSettings: () => void
  onLevelSelect: () => void
  onNextLevel: (id: number) => void
}

export function PlanningGameScreen({ levelId, onHome, onSettings, onLevelSelect, onNextLevel }: Props) {
  const activeLevelId = Math.min(MAX_PLANNING_LEVEL, Math.max(1, levelId))
  const { player, completeLevel } = usePlayer()
  const locale = useLocale()
  const text = planningCopy[locale]
  const localized = useLocalizedLevel(activeLevelId)
  const [paused, setPaused] = useState(false)
  const [rules, setRules] = useState(false)
  const tutorial = useDiagonalTutorial(activeLevelId)
  const { level, state, dispatch, board, cats, clearing, wave, hidden } = usePlanningGame(paused || rules || tutorial.open, activeLevelId)
  const rewarded = useRef(false)
  const editing = state.phase === 'editing'
  const locked = paused || rules || tutorial.open || hidden || !editing || Boolean(state.validatingPlacement || state.pendingHint)
  const stars = Math.max(1, 3 - state.failures)
  const left = cats.length - state.placements.length
  const remainingCats = cats.slice(state.placements.length)
  const totalCats = level.board.flat().filter(Boolean).length + level.cats.length
  const placementFailure = state.failureReason === 'placement'
  const objective = getPlanningObjective(level)
  const objectiveLines: Array<[PlanningObjectiveDirection, string, string, number]> = [
    ['horizontal', '━', text.horizontalLine, objective.lineCounts.horizontal],
    ['vertical', '┃', text.verticalLine, objective.lineCounts.vertical],
    ['diagonal', '╱', text.diagonalLine, objective.lineCounts.diagonal]
  ]
  useEffect(() => {
    if (paused || rules || tutorial.open || hidden || state.phase === 'completed' || state.phase === 'failed') stopBackgroundMusic()
    else startBackgroundMusic(player.settings.music)
    return () => stopBackgroundMusic()
  }, [paused, rules, tutorial.open, hidden, state.phase, player.settings.music])
  useEffect(() => {
    if (state.phase === 'completed' && !rewarded.current) {
      rewarded.current = true
      completeLevel(activeLevelId, stars, 50)
    }
  }, [state.phase, completeLevel, activeLevelId, stars])
  const restart = () => {
    rewarded.current = false
    dispatch({ type: 'restart' })
    setPaused(false)
    setRules(false)
  }
  const place = (x: number, y: number) => {
    if (locked) return
    dispatch({ type: 'place', x, y })
    void playPlacementHaptic(player.settings.haptics)
  }
  const catName = (type: string) => getDropCatName(type, locale)
  return <main className={`screen screen--game screen--drop screen--planning${hidden ? ' is-suspended' : ''}`}>
    <TopBar level={activeLevelId} coins={player.pawCoins} onPause={() => setPaused(true)} status={<div className="planning-top-status">
      <strong>{localized.name}</strong><span aria-label={`${text.livesLabel} ${state.lives}`}>♡ {state.lives}</span><small>{text.failures} {state.failures} {text.times}</small>
    </div>} />
    <section className="planning-intro"><strong>{text.goal(totalCats)}</strong><span>{text.calm}</span></section>
    <section className="planning-tray" aria-label={text.tray}>
      <div className="planning-tray__heading"><span>{text.tray}</span>
        {remainingCats.length > 8 && <small className="planning-tray__hint">↔ {text.swipe}</small>}
        <b>{text.placed} {state.placements.length} / {cats.length}</b>
      </div>
      <section className="planning-objective" data-testid="planning-objective" aria-label={text.conditions}>
        <div className="planning-objective__heading"><strong>{text.conditions}</strong><small>{text.conditionHint}</small></div>
        <div className="planning-objective__chips">
          {objectiveLines.filter(([, , , count]) => count > 0).map(([direction, symbol, label, count]) => <span aria-label={`${label} ${count}`} data-testid={`planning-objective-line-${direction}`} key={direction}>{symbol}×{count}</span>)}
          <span aria-label={`${text.clearCount} ${objective.totalClearingCells}`} data-testid="planning-objective-cleared">▦×{objective.totalClearingCells}</span>
          {objective.gravityWaves > 0 && <span aria-label={`${text.gravityCount} ${objective.gravityWaves}`} data-testid="planning-objective-gravity">↓×{objective.gravityWaves}</span>}
          {objective.largestGroup > 3 && <span aria-label={`${text.mergedGroup} ${objective.largestGroup}`} data-testid="planning-objective-merge">◎×{objective.largestGroup}</span>}
        </div>
      </section>
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
          const content = <><img src={getCatAssetPath(cat.type as CatAsset)} alt="" />{order >= 0 && <b>{order + 1}</b>}</>
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
    {state.validatingPlacement || state.pendingHint ? <p className="planning-life-status" role="status">{text.checkingPlacement}</p> : editing && state.failures > 0 && state.placements.length === 0 && <p className="planning-life-status" role="status">{placementFailure ? text.placementRetryNotice(state.lives) : text.retryNotice(state.lives)}</p>}
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
      <h2>{text.rulesTitle}</h2><ol>{[text.rule1, text.rule2, text.rule3, text.rule4(totalCats), text.rule5].map(rule => <li key={rule}>{rule}</li>)}</ol>
      <AppButton onClick={() => setRules(false)}>{text.close}</AppButton>
    </Modal>
    <Modal open={state.phase === 'failed' && !paused} ariaLabel={placementFailure ? text.placementFailed : text.failed} className="drop-result">
      <img src={getCatAssetPath('sleeping')} alt="" /><h2>{placementFailure ? text.placementFailed : text.failed}</h2>
      <p>{state.result ? <>{text.wave} {wave} · {text.remaining} {state.result.remaining} {text.cats}<br /></> : null}{placementFailure ? text.placementFailedTip : text.failedTip}</p>
      <AppButton variant="cream" onClick={restart}>{text.restart}</AppButton>
      <AppButton variant="cream" onClick={onLevelSelect}>{text.levels}</AppButton>
    </Modal>
    <Modal open={state.phase === 'completed' && !paused} ariaLabel={text.completed} className="drop-result">
      <img src={getCatAssetPath('orange')} alt="" /><h2>{text.completed}</h2>
      <div className="drop-result__stars" aria-label={`${stars} ★`}>{[1, 2, 3].map(i => <span className={i <= stars ? 'is-earned' : ''} key={i}>★</span>)}</div>
      <p>{text.wave} {wave} · {text.failures} {state.failures} {text.times}</p>
      <strong className="drop-reward">{text.reward}</strong>
      {activeLevelId < MAX_PLANNING_LEVEL && <AppButton onClick={() => onNextLevel(activeLevelId + 1)}>{text.next(activeLevelId + 1)}</AppButton>}
      {activeLevelId === MAX_PLANNING_LEVEL && <p className="planning-mainline-done">{text.mainlineDone}</p>}
      <AppButton variant="cream" onClick={onLevelSelect}>{text.levels}</AppButton>
    </Modal>
  </main>
}
