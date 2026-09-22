import { lazy, Suspense, useEffect, useState } from 'react'
import { format, useDocumentLanguage, useStrings } from '../i18n'
import { DailyRewardModal } from './components/DailyRewardModal'
import { useStageScale } from './useStageScale'
import { CollectionScreen } from './screens/CollectionScreen'
import { HomeScreen } from './screens/HomeScreen'
import { LevelSelectScreen } from './screens/LevelSelectScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { ShopScreen } from './screens/ShopScreen'
import { LegalScreen } from './screens/LegalScreen'
import { GameScreen } from './screens/GameScreen'
import type { LegalDocumentId } from './legal/legalContent'
import { usePlayer } from '../state/PlayerContext'

type Screen = 'home' | 'levels' | 'game' | 'collection' | 'shop' | 'settings' | 'legal'

export function App() {
  const { player, isReady, addHints, claimDailyReward } = usePlayer()
  const strings = useStrings()
  useDocumentLanguage()
  const [screen, setScreen] = useState<Screen>('home')
  const [selectedLevel, setSelectedLevel] = useState(player.currentLevel)
  const [isDailyOpen, setIsDailyOpen] = useState(false)
  const [toast, setToast] = useState<string>()
  const [legalDocument, setLegalDocument] = useState<LegalDocumentId>('privacy')
  useStageScale()

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(undefined), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const openGame = (levelId: number) => {
    setSelectedLevel(levelId)
    setScreen('game')
  }

  const openLegal = (documentId: LegalDocumentId) => {
    setLegalDocument(documentId)
    setScreen('legal')
  }

  const claimDaily = (amount: number) => {
    if (amount <= 2) addHints(amount)
    else claimDailyReward(amount)
    setIsDailyOpen(false)
    setToast(amount <= 2 ? format(strings.app.hintClaimed, { amount }) : format(strings.app.coinClaimed, { amount }))
  }

  // Keep the first paint quiet while the local save is being read. The game
  // used to flash an orange full-screen loading card during this short gap.
  if (!isReady) return null

  const hasDailyReward = player.dailyReward.lastClaimDate !== new Date().toISOString().slice(0, 10)
  return (
    <div className="app-frame">
      <div className="app-bleed" data-screen={screen} aria-hidden="true" />
      <div className="app-stage">
      {screen === 'home' && <HomeScreen onStart={() => openGame(player.currentLevel)} onNavigate={setScreen} />}
      {screen === 'levels' && <LevelSelectScreen onBack={() => setScreen('home')} onSelectLevel={openGame} />}
      {screen === 'game' && <GameScreen key={selectedLevel} levelId={selectedLevel} onHome={() => setScreen('home')} onSettings={() => setScreen('settings')} onLevelSelect={() => setScreen('levels')} onNextLevel={openGame} onToast={setToast} />}
      {screen === 'collection' && <CollectionScreen onBack={() => setScreen('home')} onShop={() => setScreen('shop')} />}
      {screen === 'shop' && <ShopScreen onBack={() => setScreen('home')} onToast={setToast} />}
      {screen === 'settings' && <SettingsScreen onBack={() => setScreen('home')} onToast={setToast} onLegal={openLegal} />}
      {screen === 'legal' && <LegalScreen documentId={legalDocument} onBack={() => setScreen('settings')} />}
      </div>
      <DailyRewardModal open={isDailyOpen} streak={player.dailyReward.streak} canClaim={hasDailyReward} onClaim={claimDaily} onClose={() => setIsDailyOpen(false)} />
      {toast && <div className="app-toast" role="status">🐾 {toast}</div>}
    </div>
  )
}
