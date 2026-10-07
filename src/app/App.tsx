import { Capacitor } from '@capacitor/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDocumentLanguage, useStrings } from '../i18n'
import { AdBreakModal } from './components/AdBreakModal'
import { useStageScale } from './useStageScale'
import { HomeScreen } from './screens/HomeScreen'
import { LevelSelectScreen } from './screens/LevelSelectScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { LegalScreen } from './screens/LegalScreen'
import { GameScreen } from './screens/GameScreen'
import type { LegalDocumentId } from './legal/legalContent'
import { usePlayer } from '../state/PlayerContext'
import { isLocalDevelopment } from './devEnvironment'
import { recordPlay, resetPlayCadence } from '../services/ads/playCadence'
import {
  DEFAULT_INTERSTITIAL_AD_SETTINGS,
  loadInterstitialAdSettings,
  type InterstitialAdSettings
} from '../services/ads/interstitialAdSettings'
import { DEMO_INTERSTITIAL_DURATION_MS, showInterstitialAd } from '../services/ads/interstitialAds'
import { DEMO_UNDO_AD_DURATION_MS, showUndoRewardAd } from '../services/ads/undoRewardAd'
import { shouldRenderDemoAd } from '../services/ads/adPresentation'
import { recordPlayerEvent } from '../services/analytics/analytics'
import { initializeNativeAdMob, showNativePrivacyOptions } from '../services/ads/nativeAdMob'
import { PlayerStatusScreen } from './player-status/PlayerStatusScreen'
import { ProfileScreen } from './leaderboard/ProfileScreen'
import { LeaderboardScreen } from './leaderboard/LeaderboardScreen'

type Screen = 'home' | 'levels' | 'game' | 'settings' | 'legal' | 'profile' | 'leaderboard'

function isPlayerStatusRoute() {
  return typeof window !== 'undefined' && window.location.pathname.replace(/\/+$/, '') === '/player-status'
}

export function App() {
  const { player, isReady } = usePlayer()
  const allowAllLevels = isLocalDevelopment()
  useDocumentLanguage()
  const strings = useStrings()
  const [screen, setScreen] = useState<Screen>('home')
  const [profileReturnScreen, setProfileReturnScreen] = useState<'home' | 'leaderboard'>('home')
  const [selectedLevel, setSelectedLevel] = useState(player.currentLevel)
  const [devPreviewMode, setDevPreviewMode] = useState(false)
  const [gameMounted, setGameMounted] = useState(false)
  const [settingsReturnScreen, setSettingsReturnScreen] = useState<'home' | 'game'>('home')
  const [isAdOpen, setIsAdOpen] = useState(false)
  const [adDurationMs, setAdDurationMs] = useState(DEMO_INTERSTITIAL_DURATION_MS)
  const [interstitialAdSettings, setInterstitialAdSettings] = useState<InterstitialAdSettings>(DEFAULT_INTERSTITIAL_AD_SETTINGS)
  const [toast, setToast] = useState<string>()
  const [legalDocument, setLegalDocument] = useState<LegalDocumentId>('privacy')
  const adInFlight = useRef(false)
  const hasEnteredGame = useRef(false)
  const analyticsSessionStarted = useRef(false)
  useStageScale()

  useEffect(() => {
    if (!isReady || isPlayerStatusRoute()) return
    void initializeNativeAdMob()
  }, [isReady])

  useEffect(() => {
    if (!isReady || isPlayerStatusRoute()) return undefined
    let active = true
    const refreshSettings = async () => {
      const settings = await loadInterstitialAdSettings()
      if (!active) return
      setInterstitialAdSettings(settings)
      if (!settings.enabled) resetPlayCadence()
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void refreshSettings()
    }

    void refreshSettings()
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      active = false
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isReady])

  useEffect(() => {
    if (allowAllLevels || isPlayerStatusRoute() || analyticsSessionStarted.current) return undefined
    analyticsSessionStarted.current = true
    void recordPlayerEvent({ eventName: 'session_started' })
    const handlePageHide = () => { void recordPlayerEvent({ eventName: 'session_ended' }) }
    window.addEventListener('pagehide', handlePageHide)
    return () => window.removeEventListener('pagehide', handlePageHide)
  }, [allowAllLevels])

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
    if (adInFlight.current || !interstitialAdSettings.enabled || !recordPlay(interstitialAdSettings.playsPerAd).shouldShowAd) return
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
  }, [interstitialAdSettings, openDemoAdSurface])

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

  const openGame = (levelId: number, previewMode = false) => {
    const isPreview = allowAllLevels && previewMode
    setDevPreviewMode(isPreview)
    setSelectedLevel(levelId)
    setGameMounted(true)
    setScreen('game')
    if (!hasEnteredGame.current) {
      hasEnteredGame.current = true
      return
    }
    if (isPreview) return
    void maybeShowPlayAd()
  }

  const openSettings = (returnScreen: 'home' | 'game') => {
    setSettingsReturnScreen(returnScreen)
    setScreen('settings')
  }

  const openProfile = (returnScreen: 'home' | 'leaderboard') => {
    setProfileReturnScreen(returnScreen)
    setScreen('profile')
  }

  const leaveGame = (nextScreen: 'home' | 'levels') => {
    setGameMounted(false)
    setScreen(nextScreen)
  }

  const openLegal = (documentId: LegalDocumentId) => {
    setLegalDocument(documentId)
    setScreen('legal')
  }

  const openPrivacyOptions = useCallback(() => {
    void showNativePrivacyOptions().then((shown) => {
      setToast(shown ? strings.settings.privacyOptionsOpened : strings.settings.privacyOptionsUnavailable)
    })
  }, [strings.settings.privacyOptionsOpened, strings.settings.privacyOptionsUnavailable])

  if (isPlayerStatusRoute()) return <PlayerStatusScreen />

  // Keep the first paint quiet while the local save is being read. The game
  // used to flash an orange full-screen loading card during this short gap.
  if (!isReady) return null

  return (
    <div className="app-frame">
      <div className="app-bleed" data-screen={screen} aria-hidden="true" />
      <div className="app-stage">
      {screen === 'home' && <HomeScreen onStart={() => openGame(player.currentLevel)} onNavigate={(destination) => {
        if (destination === 'settings') openSettings('home')
        else if (destination === 'profile') openProfile('home')
        else setScreen(destination)
      }} />}
      {screen === 'levels' && <LevelSelectScreen allowAllLevels={allowAllLevels} onBack={() => setScreen('home')} onSelectLevel={(levelId) => openGame(levelId, allowAllLevels)} />}
      {screen === 'profile' && <ProfileScreen onBack={() => setScreen(profileReturnScreen)} onSaved={() => undefined} />}
      {screen === 'leaderboard' && <LeaderboardScreen onBack={() => setScreen('home')} onProfile={() => openProfile('leaderboard')} />}
      {gameMounted && <div className="app-screen-layer" hidden={screen !== 'game'}><GameScreen active={screen === 'game' && !isAdOpen} key={selectedLevel} levelId={selectedLevel} previewMode={devPreviewMode} onHome={() => leaveGame('home')} onSettings={() => openSettings('game')} onLevelSelect={() => leaveGame('levels')} onNextLevel={(levelId) => openGame(levelId, devPreviewMode)} onToast={setToast} onPlayAction={devPreviewMode ? () => undefined : maybeShowPlayAd} onWatchUndoAd={devPreviewMode ? async () => true : maybeGrantRewardAd} onWatchHintAd={devPreviewMode ? async () => true : maybeGrantRewardAd} /></div>}
      {screen === 'settings' && <SettingsScreen onBack={() => setScreen(settingsReturnScreen)} onLegal={openLegal} onPrivacyOptions={Capacitor.isNativePlatform() ? openPrivacyOptions : undefined} />}
      {screen === 'legal' && <LegalScreen documentId={legalDocument} onBack={() => setScreen('settings')} />}
      </div>
      <AdBreakModal open={isAdOpen} durationMs={adDurationMs} />
      {toast && <div className="app-toast" role="status">🐾 {toast}</div>}
    </div>
  )
}
