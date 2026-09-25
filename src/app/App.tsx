import { useCallback, useEffect, useRef, useState } from 'react'
import { useDocumentLanguage } from '../i18n'
import { AdBreakModal } from './components/AdBreakModal'
import { useStageScale } from './useStageScale'
import { HomeScreen } from './screens/HomeScreen'
import { LevelSelectScreen } from './screens/LevelSelectScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { LegalScreen } from './screens/LegalScreen'
import { GameScreen } from './screens/GameScreen'
import type { LegalDocumentId } from './legal/legalContent'
import { usePlayer } from '../state/PlayerContext'
import { recordPlay } from '../services/ads/playCadence'
import { DEMO_INTERSTITIAL_DURATION_MS, showInterstitialAd } from '../services/ads/interstitialAds'
import { DEMO_UNDO_AD_DURATION_MS, showUndoRewardAd } from '../services/ads/undoRewardAd'
import { shouldRenderDemoAd } from '../services/ads/adPresentation'
import { recordPlayerEvent } from '../services/analytics/analytics'
import { PlayerStatusScreen } from './player-status/PlayerStatusScreen'

type Screen = 'home' | 'levels' | 'game' | 'settings' | 'legal'

function isPlayerStatusRoute() {
  return typeof window !== 'undefined' && window.location.pathname.replace(/\/+$/, '') === '/player-status'
}

export function App() {
  const { player, isReady } = usePlayer()
  useDocumentLanguage()
  const [screen, setScreen] = useState<Screen>('home')
  const [selectedLevel, setSelectedLevel] = useState(player.currentLevel)
  const [isAdOpen, setIsAdOpen] = useState(false)
  const [adDurationMs, setAdDurationMs] = useState(DEMO_INTERSTITIAL_DURATION_MS)
  const [toast, setToast] = useState<string>()
  const [legalDocument, setLegalDocument] = useState<LegalDocumentId>('privacy')
  const adInFlight = useRef(false)
  const hasEnteredGame = useRef(false)
  const analyticsSessionStarted = useRef(false)
  useStageScale()

  useEffect(() => {
    if (isPlayerStatusRoute() || analyticsSessionStarted.current) return undefined
    analyticsSessionStarted.current = true
    void recordPlayerEvent({ eventName: 'session_started' })
    const handlePageHide = () => { void recordPlayerEvent({ eventName: 'session_ended' }) }
    window.addEventListener('pagehide', handlePageHide)
    return () => window.removeEventListener('pagehide', handlePageHide)
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(undefined), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const openDemoAdSurface = useCallback((durationMs: number) => {
    if (!shouldRenderDemoAd()) return
    setAdDurationMs(durationMs)
    setIsAdOpen(true)
  }, [])

  const maybeShowPlayAd = useCallback(async () => {
    if (adInFlight.current || !recordPlay().shouldShowAd) return
    adInFlight.current = true
    openDemoAdSurface(DEMO_INTERSTITIAL_DURATION_MS)
    try {
      await showInterstitialAd()
    } catch {
      // A missing ad must never block the player from continuing.
    } finally {
      adInFlight.current = false
      setIsAdOpen(false)
    }
  }, [openDemoAdSurface])

  const maybeGrantRewardAd = useCallback(async (): Promise<boolean> => {
    if (adInFlight.current) return false
    adInFlight.current = true
    openDemoAdSurface(DEMO_UNDO_AD_DURATION_MS)
    try {
      const result = await showUndoRewardAd()
      return result.completed
    } catch {
      return false
    } finally {
      adInFlight.current = false
      setIsAdOpen(false)
    }
  }, [openDemoAdSurface])

  const openGame = (levelId: number) => {
    setSelectedLevel(levelId)
    setScreen('game')
    if (!hasEnteredGame.current) {
      hasEnteredGame.current = true
      return
    }
    void maybeShowPlayAd()
  }

  const openLegal = (documentId: LegalDocumentId) => {
    setLegalDocument(documentId)
    setScreen('legal')
  }

  if (isPlayerStatusRoute()) return <PlayerStatusScreen />

  // Keep the first paint quiet while the local save is being read. The game
  // used to flash an orange full-screen loading card during this short gap.
  if (!isReady) return null

  return (
    <div className="app-frame">
      <div className="app-bleed" data-screen={screen} aria-hidden="true" />
      <div className="app-stage">
      {screen === 'home' && <HomeScreen onStart={() => openGame(player.currentLevel)} onNavigate={setScreen} />}
      {screen === 'levels' && <LevelSelectScreen onBack={() => setScreen('home')} onSelectLevel={openGame} />}
      {screen === 'game' && <GameScreen key={selectedLevel} levelId={selectedLevel} onHome={() => setScreen('home')} onSettings={() => setScreen('settings')} onLevelSelect={() => setScreen('levels')} onNextLevel={openGame} onToast={setToast} onPlayAction={maybeShowPlayAd} onWatchUndoAd={maybeGrantRewardAd} onWatchHintAd={maybeGrantRewardAd} />}
      {screen === 'settings' && <SettingsScreen onBack={() => setScreen('home')} onToast={setToast} onLegal={openLegal} />}
      {screen === 'legal' && <LegalScreen documentId={legalDocument} onBack={() => setScreen('settings')} />}
      </div>
      <AdBreakModal open={isAdOpen} durationMs={adDurationMs} />
      {toast && <div className="app-toast" role="status">🐾 {toast}</div>}
    </div>
  )
}
