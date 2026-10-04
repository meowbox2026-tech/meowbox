import { useEffect, useState } from 'react'
import { useLeaderboardCopy } from '../../i18n/leaderboard'
import { loadProfile } from '../../services/leaderboard/leaderboardService'
import { getCachedProfile } from '../../services/leaderboard/profileCache'
import type { PublicProfile } from '../../services/leaderboard/profile'
import { CatAvatar } from './CatAvatar'

export function HomeSocial({ onNavigate }: { onNavigate: (screen: 'profile' | 'leaderboard') => void }) {
  const t = useLeaderboardCopy()
  const [profile, setProfile] = useState<PublicProfile | null | undefined>(() => getCachedProfile())
  useEffect(() => {
    let active = true
    void loadProfile().then(value => { if (active) setProfile(value) }).catch(() => undefined)
    return () => { active = false }
  }, [])
  return <nav className="home-social" aria-label={t.profile}>
    <button className="home-profile" onClick={() => onNavigate('profile')} aria-label={t.profile}>
      <CatAvatar avatar={profile?.avatar} framed />
    </button>
    <button className="home-leaderboard" onClick={() => onNavigate('leaderboard')} aria-label={t.board}>
      <img className="home-leaderboard__art" src="/assets/social/leaderboard-button.png" alt="" /><span>{t.board}</span>
    </button>
  </nav>
}
