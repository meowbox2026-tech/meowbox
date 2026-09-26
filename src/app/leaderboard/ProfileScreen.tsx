import { useEffect, useState } from 'react'
import { useLeaderboardCopy } from '../../i18n/leaderboard'
import { AVATARS, validName, type PublicProfile } from '../../services/leaderboard/profile'
import { loadProfile, saveProfile, leaveLeaderboard } from '../../services/leaderboard/leaderboardService'
import { CatAvatar } from './CatAvatar'

export function ProfileScreen({ onBack, onSaved }: { onBack: () => void; onSaved: (profile: PublicProfile | null) => void }) {
  const t = useLeaderboardCopy()
  const [profile, setProfile] = useState<PublicProfile>({ name: '', avatar: 'orange' })
  const [joined, setJoined] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const [saved, setSaved] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    setLoading(true); setFailed(false)
    void loadProfile().then(value => {
      if (!active) return
      setJoined(Boolean(value))
      if (value) setProfile(value)
    }).catch(() => { if (active) setFailed(true) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [attempt])

  async function save() {
    if (busy) return
    if (!validName(profile.name)) { setInvalid(true); return }
    setBusy(true); setFailed(false); setInvalid(false); setSaved(false)
    try {
      const value = await saveProfile(profile)
      setProfile(value); setJoined(true); setSaved(true); onSaved(value)
    } catch { setFailed(true) } finally { setBusy(false) }
  }

  async function leave() {
    setBusy(true); setFailed(false)
    try {
      await leaveLeaderboard()
      onSaved(null); onBack()
    } catch { setFailed(true) } finally { setBusy(false); setConfirm(false) }
  }

  return <main className="screen screen--social">
    <header className="social-header"><button onClick={onBack} disabled={busy}>{t.back}</button><h1>{t.profile}</h1></header>
    <section className="social-panel profile-editor" aria-busy={loading || busy}>
      {failed && <div role="alert"><p>{t.error}</p><button disabled={busy} onClick={() => setAttempt(n => n + 1)}>{t.retry}</button></div>}
      {loading ? <p role="status">{t.loading}</p> : <>
        <CatAvatar avatar={profile.avatar} framed />
        <label htmlFor="player-name">{t.name}</label>
        <input id="player-name" value={profile.name} disabled={busy} autoComplete="off" maxLength={32}
          aria-describedby="name-hint" onChange={event => { setProfile({ ...profile, name: event.target.value }); setSaved(false) }} />
        <small id="name-hint">{t.nameHint}</small>
        <fieldset disabled={busy}><legend>{t.avatar}</legend><div className="avatar-choices">
          {AVATARS.map((avatar, index) => <button key={avatar} type="button" aria-label={`${t.avatar} ${index + 1}`}
            aria-pressed={profile.avatar === avatar} onClick={() => { setProfile({ ...profile, avatar }); setSaved(false) }}>
            <CatAvatar avatar={avatar} />
          </button>)}
        </div></fieldset>
        <p className="social-notice">{t.notice}</p><p className="social-notice">{t.anonymous}</p>
        {invalid && <p role="alert">{t.invalid}</p>}
        {saved && <p role="status">{t.saved}</p>}
        <button className="social-primary" disabled={busy} onClick={() => void save()}>{busy ? t.loading : joined ? t.save : t.join}</button>
        {joined && !confirm && <button disabled={busy} onClick={() => setConfirm(true)}>{t.leave}</button>}
        {confirm && <div className="social-confirm"><p>{t.confirmLeave}</p>
          <button disabled={busy} onClick={() => void leave()}>{t.leave}</button>
          <button disabled={busy} onClick={() => setConfirm(false)}>{t.cancel}</button></div>}
      </>}
    </section>
  </main>
}
