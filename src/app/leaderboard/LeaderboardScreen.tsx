import { useEffect, useState } from 'react'
import { useLeaderboardCopy } from '../../i18n/leaderboard'
import { loadLeaderboard } from '../../services/leaderboard/leaderboardService'
import type { LeaderboardEntry } from '../../services/leaderboard/profile'
import { CatAvatar } from './CatAvatar'

export function LeaderboardScreen({ onBack, onProfile }: { onBack: () => void; onProfile: () => void }) {
  const t = useLeaderboardCopy()
  const [rows, setRows] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    setLoading(true); setFailed(false)
    void loadLeaderboard().then(value => { if (active) setRows(value) })
      .catch(() => { if (active) { setRows([]); setFailed(true) } })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [attempt])
  return <main className="screen screen--social">
    <header className="social-header"><button onClick={onBack}>{t.back}</button><h1>{t.board}</h1></header>
    <section className="social-panel leaderboard-panel" aria-busy={loading}>
      <p className="leaderboard-subtitle">{t.subtitle}</p>
      <div className="social-toolbar"><button onClick={onProfile}>{t.profile}</button>
        <button disabled={loading} onClick={() => setAttempt(n => n + 1)}>{t.retry}</button></div>
      {loading ? <p role="status">{t.loading}</p> : failed ? <p role="alert">{t.error}</p> : <>
        {rows.length === 0 && <p>{t.empty}</p>}
        <ol className="leaderboard-list">{rows.map((row, index) => <li key={`${row.rank}-${index}`} className={row.isMe ? 'is-me' : ''}>
          <strong className="leaderboard-rank">{row.rank}</strong><CatAvatar avatar={row.avatar} />
          <span className="leaderboard-name">{row.name}{row.isMe && <small> · {t.me}</small>}</span>
          <span className="leaderboard-score"><b>{row.completed}</b><small>{t.clears}</small></span>
        </li>)}</ol>
        {!rows.some(row => row.isMe) && <p>{t.notJoined}</p>}
      </>}
      <p className="social-notice">{t.scoreNote}</p>
    </section>
  </main>
}
