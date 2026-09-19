import { useEffect, useRef, useState } from 'react'
import { DROP_NAMES } from '../../game/core/dropEngine'
import { getCatAssetPath } from '../../game/data/catAssets'
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

export function GameScreen({ onHome, onSettings, onLevelSelect }: GameScreenProps) {
  const { player, completeLevel } = usePlayer()
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
  })
  const stars = state.moves <= 20 ? 3 : state.moves <= 28 ? 2 : 1
  useEffect(() => {
    if (state.phase === 'completed' && !rewarded.current) {
      rewarded.current = true
      completeLevel(1, stars, 50)
      playCatSound('purr', player.settings.sound)
    }
    if (state.phase !== 'playing') stopBackgroundMusic()
  }, [completeLevel, player.settings.sound, stars, state.phase])
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
    <TopBar coins={player.pawCoins} level={1} onPause={() => setPaused(true)} />
    <header className="drop-heading"><span>溫馨小屋 · 01</span><h1>貓咪，落入幸福！</h1><p>輕輕一點，把同款貓咪湊在一起。</p></header>
    <section className="drop-goal" aria-label="關卡目標">
      <div><strong>♡ 救出 {state.target} 隻貓咪</strong><b>{progress}<small> / {state.target}</small></b></div>
      <progress max={state.target} value={progress} aria-label="救援進度" />
      <footer><span className={secondsLeft <= 15 && extraDrops === undefined ? 'drop-time is-urgent' : 'drop-time'} role="timer" aria-label="剩餘時間">{extraDrops !== undefined ? `加賽：還有 ${extraDrops} 次落下` : `⏱ ${timeText}${!started ? ' · 點一下開始' : busy ? ' · 動畫停表' : ''}`}</span><span>{state.score} 分 · {state.moves} 次落下</span></footer>
    </section>
    <section className="drop-preview" aria-label="待落下的貓咪">
      <div className="drop-preview__now"><span>NOW<small>{busy ? '已備好' : '這次落下'}</small></span><img key={`${state.current}-${state.next}`} src={getCatAssetPath(state.current as CatAsset)} alt={`現在：${DROP_NAMES[state.current]}`} /><strong>{DROP_NAMES[state.current]}</strong></div>
      <span className="drop-preview__arrow" aria-hidden="true">←</span>
      <div className="drop-preview__next"><span>NEXT<small>下一隻</small></span><img src={getCatAssetPath(state.next as CatAsset)} alt={`下一隻：${DROP_NAMES[state.next]}`} /></div>
    </section>
    <DropBoard key={run} board={display.board} previous={display.previous} current={state.current} wave={display.wave} hintColumn={hintColumn}
      busy={busy || state.phase !== 'playing'} paused={paused || rules || !!ad} tutorial={state.moves === 0} onDrop={drop} />
    <div className="drop-coach" role="status"><span aria-hidden="true">🐾</span><p className={hintColumn !== undefined ? 'drop-hint-message' : undefined}>{busy ? (display.wave ? '好棒！貓咪開心地回家了 ♡' : '咚！讓貓咪找好位置…') : hintColumn !== undefined ? `★ 建議第 ${hintColumn + 1} 欄：兼顧消除與堆疊高度` : state.moves === 0 ? '試試第 3 欄，讓三隻橘子相遇！' : state.bestCombo >= 2 ? '連鎖好厲害！再找找下一組吧。' : '橫、直、斜，三隻同款就消除！'}</p></div>
    <nav className="drop-actions" aria-label="遊戲操作"><button onClick={() => setRules(true)}>？ 玩法說明</button><button disabled={!hintAvailable} onClick={() => setAd('hint')}>{hintUsed ? '本局提示已使用' : '▶ 廣告提示'}</button><button onClick={restart}>↻ 重玩</button></nav>
    <PauseModal open={paused} onContinue={() => setPaused(false)} onRestart={restart} onHome={onHome} onSettings={onSettings} />
    <Modal open={rules} ariaLabel="貓咪落下玩法" className="drop-rules">
      <h2>一點、一落、一聲喵！</h2>
      <ol><li><strong>點選一欄</strong><p>NOW 的貓咪會落到那一欄最下方的空位。NEXT 是下一隻。</p></li><li><strong>三隻同款連線</strong><p>橫向、直向、兩種斜向，連續 3 隻以上一起消除。</p></li><li><strong>掉落再連鎖</strong><p>上方貓咪往下掉，再連線就觸發 Combo！</p></li><li><strong>留意箱子頂端</strong><p>消除與掉落結束後，仍有貓咪佔到最上排就失敗。</p></li></ol>
      <p>第一關：120 秒內救出 18 隻。首次落下開始計時；動畫、暫停與廣告停表。20 次內三星，28 次內兩星，其餘一星。</p><p>每局可看廣告提示一次、復活一次。碰頂復活清掉底排（不計消除數）；時間到可加賽 3 次落下，加賽仍不能碰頂。</p><AppButton onClick={() => setRules(false)}>知道了，來玩喵！</AppButton>
    </Modal>
    <Modal open={state.phase === 'completed'} ariaLabel="過關囉！" className="drop-result">
      <div className="drop-confetti" aria-hidden="true">✦ ♡ ✧ ♡ ✦</div><img src={getCatAssetPath('orange')} alt="開心的橘子" /><h2>這一箱，都是幸福！</h2>
      <div className="drop-result__stars" aria-label={`${stars} 顆星`}>{[1, 2, 3].map(i => <span className={i <= stars ? 'is-earned' : ''} key={i}>★</span>)}</div>
      <p>救出 {state.cleared} 隻 · {state.score} 分<br />最佳 Combo ×{state.bestCombo} · 落下 {state.moves} 次</p>
      <strong className="drop-reward">🐾 50 貓掌幣已存入</strong>
      <AppButton onClick={restart}>再玩一次，挑戰高分</AppButton><AppButton variant="cream" onClick={onLevelSelect}>返回關卡</AppButton><small>新的貓咪與關卡，準備中 ♡</small>
    </Modal>
    <Modal open={state.phase === 'failed' && !ad} ariaLabel={failure === 'ceiling' ? '紙箱裝滿了' : '挑戰結束'} className="drop-result">
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
