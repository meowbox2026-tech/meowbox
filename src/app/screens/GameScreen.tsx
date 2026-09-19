import { useEffect, useRef, useState } from 'react'
import { DROP_NAMES } from '../../game/core/dropEngine'
import { getCatAssetPath } from '../../game/data/catAssets'
import { getDropLevelById } from '../../game/data/dropLevels'
import { DropBoard } from '../../game/phaser/DropBoard'
import { useDropGame } from '../../game/phaser/useDropGame'
import type { CatAsset } from '../../game/types'
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
  const level = getDropLevelById(levelId)
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
  const failureTitle = failure === 'ceiling' ? '哎呀，紙箱裝滿了！' : failure === 'moves' ? '額外落下次數用完了' : '時間到，休息一下喵！'
  return <main className="screen screen--game screen--drop">
    <TopBar coins={player.pawCoins} level={level.id} onPause={() => setPaused(true)} status={<div className="drop-top-status" aria-label="關卡任務與時間">
      <strong>救出 {progress} / {state.target}</strong>
      <span className={secondsLeft <= 15 && extraDrops === undefined ? 'drop-time is-urgent' : 'drop-time'} role="timer" aria-label="剩餘時間">{extraDrops !== undefined ? `加賽 ${extraDrops} 次` : `⏱ ${timeText}`}</span>
    </div>} />
    <section className="drop-preview" aria-label="待落下的兩隻貓咪">
      <div className="drop-preview__now"><span>NOW</span><img key={`${state.current}-${state.next}`} src={getCatAssetPath(state.current as CatAsset)} alt={`現在：${DROP_NAMES[state.current]}`} /></div>
      <span className="drop-preview__arrow" aria-hidden="true">→</span>
      <div className="drop-preview__next"><span>NEXT</span><img src={getCatAssetPath(state.next as CatAsset)} alt={`下一隻：${DROP_NAMES[state.next]}`} /></div>
    </section>
    <DropBoard key={run} board={display.board} previous={display.previous} current={state.current} wave={display.wave} hintColumn={hintColumn}
      paused={paused || rules || !!ad} terminal={state.phase !== 'playing'} onDrop={drop} />
    <nav className="drop-actions" aria-label="遊戲操作"><button onClick={() => setRules(true)}>？ 玩法說明</button><button disabled={!hintAvailable} onClick={() => setAd('hint')}>{hintUsed ? '本局提示已使用' : '▶ 廣告提示'}</button><button onClick={restart}>↻ 重玩</button></nav>
    <PauseModal open={paused} onContinue={() => setPaused(false)} onRestart={restart} onHome={onHome} onSettings={onSettings} />
    <Modal open={rules} ariaLabel="貓咪落下玩法" className="drop-rules">
      <h2>一點、一落、一聲喵！</h2>
      <ol><li><strong>點選一欄</strong><p>NOW 的貓咪會落到那一欄最下方的空位。NEXT 是下一隻。</p></li><li><strong>三隻同款連線</strong><p>橫向、直向、兩種斜向，連續 3 隻以上一起消除。</p></li><li><strong>掉落再連鎖</strong><p>上方貓咪往下掉，再連線就觸發 Combo！</p></li><li><strong>留意箱子頂端</strong><p>消除與掉落結束後，仍有貓咪佔到最上排就失敗。</p></li></ol>
      <p>本關：{level.timeLimit} 秒內救出 {level.target} 隻。首次落下開始計時；連鎖動畫也會持續倒數，暫停與廣告停表。{level.threeStarMoves} 次內三星，{level.threeStarMoves + 8} 次內兩星。</p><p>每局可看廣告提示一次、復活一次。碰頂復活清掉底排（不計消除數）；時間到可加賽 3 次落下，加賽仍不能碰頂。</p><AppButton onClick={() => setRules(false)}>知道了，來玩喵！</AppButton>
    </Modal>
    <Modal open={state.phase === 'completed' && !busy} ariaLabel="過關囉！" className="drop-result">
      <div className="drop-confetti" aria-hidden="true">✦ ♡ ✧ ♡ ✦</div><img src={getCatAssetPath(level.tileAssets[0])} alt="開心的貓咪" /><h2>第 {level.id} 關完成！</h2>
      <div className="drop-result__stars" aria-label={`${stars} 顆星`}>{[1, 2, 3].map(i => <span className={i <= stars ? 'is-earned' : ''} key={i}>★</span>)}</div>
      <p>救出 {state.cleared} 隻 · {state.score} 分<br />最佳 Combo ×{state.bestCombo} · 落下 {state.moves} 次</p>
      <strong className="drop-reward">🐾 50 貓掌幣已存入</strong>
      {!isLastLevel(level.id) && <AppButton onClick={() => onNextLevel(level.id + 1)}>下一關：{level.id + 1}</AppButton>}
      <AppButton onClick={restart}>再玩一次，挑戰高分</AppButton><AppButton variant="cream" onClick={onLevelSelect}>返回關卡</AppButton><small>{isLastLevel(level.id) ? '箱長的派對完成了 ♡' : '下一箱幸福正在等你 ♡'}</small>
    </Modal>
    <Modal open={state.phase === 'failed' && !busy && !ad} ariaLabel={failure === 'ceiling' ? '紙箱裝滿了' : '挑戰結束'} className="drop-result">
      <img src={getCatAssetPath('sleeping')} alt="休息一下的貓咪" /><h2>{failureTitle}</h2><p>已救出 {state.cleared} / {state.target} 隻貓咪。<br />{failure === 'ceiling' ? '試試分散堆疊，留出更多空間。' : '再找找三連線，貓咪等你帶牠們回家。'}</p>
      {!reviveUsed && <AppButton variant="purple" onClick={() => setAd('revive')}>{failure === 'ceiling' ? '▶ 看廣告，清除底部一排' : '▶ 看廣告，再給 3 次落下'}</AppButton>}
      <AppButton onClick={restart}>再試一次喵</AppButton><AppButton variant="cream" onClick={onHome}>回溫馨小屋</AppButton>
    </Modal>
    {ad && <RewardedAdModal key={`${run}-${ad}`} open kind={ad === 'hint' ? 'hint' : failure === 'ceiling' ? 'clear-bottom-row' : 'challenge-moves'}
      title={ad === 'hint' ? '讓貓咪幫你看一眼' : '再挑戰一次喵'}
      description={ad === 'hint' ? '完成觀看後，標出一個較安全的欄位。本局限一次。' : failure === 'ceiling' ? '清除底部一排，其餘貓咪向下移；不增加消除數。每局限復活一次。' : '獲得 3 次額外落下，不再倒數；碰頂仍失敗。每局限復活一次。'}
      onClose={() => setAd(undefined)} onReward={() => { if (ad === 'hint') hint(); else revive(); setAd(undefined) }} />}
  </main>
}

function isLastLevel(levelId: number): boolean {
  return levelId >= 30
}
