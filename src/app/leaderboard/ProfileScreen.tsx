import { useEffect, useState } from 'react'
import { useLeaderboardCopy } from '../../i18n/leaderboard'
import { AVATARS, validName, type BlockedPlayer, type ProfileDraft, type PublicProfile } from '../../services/leaderboard/profile'
import { deleteAnonymousAccount, loadBlockedPlayers, loadProfile, leaveLeaderboard, saveProfile, unblockPlayer } from '../../services/leaderboard/leaderboardService'
import { getCachedProfile } from '../../services/leaderboard/profileCache'
import { CatAvatar } from './CatAvatar'

type ConfirmAction = 'leave' | 'delete' | null

export function ProfileScreen({ onBack, onSaved }: { onBack: () => void; onSaved: (profile: PublicProfile | null) => void }) {
  const t = useLeaderboardCopy()
  const initialCachedProfile = getCachedProfile()
  const initialDraft: ProfileDraft = initialCachedProfile
    ? { name: initialCachedProfile.name, avatar: initialCachedProfile.avatar }
    : { name: '', avatar: 'orange' }
  const [profile, setProfile] = useState<ProfileDraft>(initialDraft)
  const [storedProfile, setStoredProfile] = useState<ProfileDraft | null>(initialCachedProfile ? initialDraft : null)
  const [blocked, setBlocked] = useState<BlockedPlayer[]>([])
  const [joined, setJoined] = useState(Boolean(initialCachedProfile))
  const [loading, setLoading] = useState(initialCachedProfile === undefined)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const [saved, setSaved] = useState(false)
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null)
  const [attempt, setAttempt] = useState(0)
  const changed = !storedProfile || storedProfile.name !== profile.name.trim().normalize('NFC') || storedProfile.avatar !== profile.avatar

  useEffect(() => {
    let active = true
    setLoading(getCachedProfile() === undefined); setFailed(false)
    void Promise.all([loadProfile(), loadBlockedPlayers()]).then(([value, blockedPlayers]) => {
      if (!active) return
      setJoined(Boolean(value))
      if (value) {
        const draft = { name: value.name, avatar: value.avatar }
        setProfile(draft); setStoredProfile(draft)
      }
      setBlocked(blockedPlayers)
    }).catch(() => { if (active) setFailed(true) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [attempt])

  async function save() {
    if (busy) return
    if (!validName(profile.name)) { setInvalid(true); return }
    if (joined && !changed) return
    setBusy(true); setFailed(false); setInvalid(false); setSaved(false)
    try {
      const value = await saveProfile(profile)
      const draft = { name: value.name, avatar: value.avatar }
      setProfile(draft); setStoredProfile(draft); setJoined(true); setSaved(true); onSaved(value)
    } catch { setFailed(true) } finally { setBusy(false) }
  }

  async function leave() {
    setBusy(true); setFailed(false)
    try {
      await leaveLeaderboard()
      onSaved(null); onBack()
    } catch { setFailed(true); setConfirmAction(null) } finally { setBusy(false) }
  }

  async function deleteAccount() {
    setBusy(true); setFailed(false)
    try {
      await deleteAnonymousAccount()
      onSaved(null); onBack()
    } catch { setFailed(true); setConfirmAction(null) } finally { setBusy(false) }
  }

  async function unblock(player: BlockedPlayer) {
    setBusy(true); setFailed(false)
    try {
      await unblockPlayer(player.publicId)
      setBlocked(current => current.filter(item => item.publicId !== player.publicId))
    } catch { setFailed(true) } finally { setBusy(false) }
  }

  const confirmationText = confirmAction === 'leave' ? t.confirmLeave : t.confirmDelete
  const confirmationButton = confirmAction === 'leave' ? t.leave : t.permanentDelete

  return <main className="screen screen--social" aria-label={t.profile}>
    <header className="social-header social-header--profile">
      <button className="social-close" aria-label={t.close} onClick={onBack} disabled={busy}>×</button>
    </header>
    <section className="social-panel profile-editor" aria-busy={loading || busy}>
      {failed && <div role="alert"><p>{t.error}</p><button disabled={busy} onClick={() => setAttempt(n => n + 1)}>{t.retry}</button></div>}
      {loading ? <p role="status">{t.loading}</p> : <>
        <form className="profile-form" noValidate onSubmit={event => { event.preventDefault(); void save() }}>
          <CatAvatar avatar={profile.avatar} framed />
          <label htmlFor="player-name">{t.name}</label>
          <input id="player-name" value={profile.name} disabled={busy} autoComplete="nickname" maxLength={16}
            aria-invalid={invalid} onChange={event => { setProfile({ ...profile, name: event.target.value }); setSaved(false); setInvalid(false) }} />
          <fieldset disabled={busy}><legend>{t.avatar}</legend><div className="avatar-choices">
            {AVATARS.map((avatar, index) => <button key={avatar} type="button" aria-label={`${t.avatar} ${index + 1}`}
              aria-pressed={profile.avatar === avatar} onClick={() => { setProfile({ ...profile, avatar }); setSaved(false) }}>
              <CatAvatar avatar={avatar} />
            </button>)}
          </div></fieldset>
          <p className="social-notice">{t.notice}</p><p className="social-notice">{t.anonymous}</p>
          {invalid && <p role="alert">{t.invalid}</p>}
          {saved && <p role="status">{t.saved}</p>}
          <button className="social-primary" type="submit" disabled={busy || (joined && !changed) || saved}>
            {busy ? t.loading : saved || (joined && !changed) ? t.saved : joined ? t.save : t.join}
          </button>
        </form>

        <section className="blocked-players" aria-labelledby="blocked-players-title">
          <h2 id="blocked-players-title">{t.blockedHeading}</h2>
          {blocked.length === 0 ? <p className="social-notice">{t.blockedEmpty}</p> : <ul>
            {blocked.map(player => <li key={player.publicId}>
              <CatAvatar avatar={player.avatar} /><span>{player.name}</span>
              <button disabled={busy} aria-label={`${t.unblock} ${player.name}`} onClick={() => void unblock(player)}>{t.unblock}</button>
            </li>)}
          </ul>}
        </section>

        <div className="profile-account-actions">
          {joined && <button disabled={busy} onClick={() => setConfirmAction('leave')}>{t.leave}</button>}
          <button className="social-destructive" disabled={busy} onClick={() => setConfirmAction('delete')}>{t.deleteAccount}</button>
        </div>
        {confirmAction && <div className="social-confirm" role="alertdialog" aria-modal="true" aria-label={confirmationButton}>
          <p>{confirmationText}</p>
          <div className="social-confirm__actions">
            <button className={confirmAction === 'delete' ? 'social-destructive' : ''} disabled={busy}
              onClick={() => void (confirmAction === 'leave' ? leave() : deleteAccount())}>{busy ? t.loading : confirmationButton}</button>
            <button disabled={busy} onClick={() => setConfirmAction(null)}>{t.cancel}</button>
          </div>
        </div>}
      </>}
    </section>
  </main>
}
