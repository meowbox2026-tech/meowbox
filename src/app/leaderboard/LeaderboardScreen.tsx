import { useEffect, useState } from 'react'
import { useLeaderboardCopy } from '../../i18n/leaderboard'
import { blockPlayer, loadLeaderboard } from '../../services/leaderboard/leaderboardService'
import type { LeaderboardEntry } from '../../services/leaderboard/profile'
import { CatAvatar } from './CatAvatar'

const supportEmail = 'meowbox2026@gmail.com'

function reportLink(player: LeaderboardEntry) {
  const subject = encodeURIComponent('Meow Line 排行榜玩家檢舉')
  const body = encodeURIComponent(`檢舉玩家：${player.name}\n玩家代碼：${player.publicId}\n\n原因：`)
  return `mailto:${supportEmail}?subject=${subject}&body=${body}`
}

export function LeaderboardScreen({ onBack, onProfile }: { onBack: () => void; onProfile: () => void }) {
  const t = useLeaderboardCopy()
  const [rows, setRows] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [pendingBlock, setPendingBlock] = useState<LeaderboardEntry | null>(null)
  const [blockedNotice, setBlockedNotice] = useState(false)
  useEffect(() => {
    let active = true
    setLoading(true); setFailed(false)
    void loadLeaderboard().then(value => { if (active) setRows(value) })
      .catch(() => { if (active) { setRows([]); setFailed(true) } })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [attempt])

  async function confirmBlock() {
    if (!pendingBlock || busy) return
    setBusy(true); setFailed(false)
    try {
      await blockPlayer(pendingBlock.publicId)
      setPendingBlock(null); setBlockedNotice(true); setAttempt(value => value + 1)
    } catch { setFailed(true) } finally { setBusy(false) }
  }

  return <main className="screen screen--social">
    <header className="social-header social-header--centered">
      <h1>{t.board}</h1>
      <button className="social-close" aria-label={t.close} onClick={onBack}>×</button>
    </header>
    <section className="social-panel leaderboard-panel" aria-busy={loading || busy}>
      <p className="leaderboard-subtitle">{t.subtitle}</p>
      <div className="social-toolbar"><button onClick={onProfile}>{t.profile}</button>
        <button disabled={loading || busy} onClick={() => setAttempt(n => n + 1)}>{t.retry}</button></div>
      {blockedNotice && <p role="status" className="social-notice">{t.blockedNotice}</p>}
      {loading ? <p role="status">{t.loading}</p> : failed ? <p role="alert">{t.error}</p> : <>
        {rows.length === 0 && <p className="leaderboard-empty">{t.empty}</p>}
        <ol className="leaderboard-list">{rows.map(row => <li key={row.publicId} className={row.isMe ? 'is-me' : ''}>
          <strong className="leaderboard-rank">{row.rank}</strong><CatAvatar avatar={row.avatar} />
          <span className="leaderboard-name">{row.name}{row.isMe && <small> · {t.me}</small>}</span>
          <span className="leaderboard-score"><b>{row.completed}</b><small>{t.clears}</small></span>
          {!row.isMe && <span className="leaderboard-actions">
            <a href={reportLink(row)} aria-label={`${t.report} ${row.name}`}>{t.report}</a>
            <button disabled={busy} onClick={() => setPendingBlock(row)}>{t.block} {row.name}</button>
          </span>}
        </li>)}</ol>
        {!rows.some(row => row.isMe) && <button className="leaderboard-join" onClick={onProfile}>{t.join}</button>}
      </>}
      {pendingBlock && <div className="social-confirm" role="alertdialog" aria-modal="true" aria-label={t.confirmBlock}>
        <p>{t.blockQuestion.replace('{name}', pendingBlock.name)}</p>
        <div className="social-confirm__actions">
          <button disabled={busy} onClick={() => void confirmBlock()}>{busy ? t.loading : t.confirmBlock}</button>
          <button disabled={busy} onClick={() => setPendingBlock(null)}>{t.cancel}</button>
        </div>
      </div>}
      <p className="social-notice">{t.scoreNote}</p>
    </section>
  </main>
}
