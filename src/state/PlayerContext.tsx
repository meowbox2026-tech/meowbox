import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  createDefaultPlayerSave,
  loadPlayerSave,
  persistPlayerSave,
  type PlayerSave,
  type PlayerSettings
} from '../services/save/playerSave'

interface PlayerContextValue {
  player: PlayerSave
  isReady: boolean
  updateSettings: (settings: Partial<PlayerSettings>) => void
  completeLevel: (levelId: number, stars: number, coinReward: number) => void
  spendCoins: (amount: number) => boolean
  addCoins: (amount: number) => void
  addHints: (amount: number) => void
  useHint: () => boolean
  purchaseSkin: (kind: 'cat' | 'box', skinId: string, price: number) => boolean
  selectSkin: (kind: 'cat' | 'box', skinId: string) => void
  claimDailyReward: (amount: number) => void
}

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined)

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<PlayerSave>(createDefaultPlayerSave)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let mounted = true
    void loadPlayerSave().then((savedPlayer) => {
      if (!mounted) return
      setPlayer(savedPlayer)
      setIsReady(true)
    })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (isReady) void persistPlayerSave(player)
  }, [isReady, player])

  const update = useCallback((updater: (current: PlayerSave) => PlayerSave) => {
    setPlayer((current) => ({ ...updater(current), updatedAt: new Date().toISOString() }))
  }, [])

  const updateSettings = useCallback((settings: Partial<PlayerSettings>) => {
    update((current) => ({ ...current, settings: { ...current.settings, ...settings } }))
  }, [update])

  const completeLevel = useCallback((levelId: number, stars: number, coinReward: number) => {
    update((current) => ({
      ...current,
      currentLevel: Math.max(current.currentLevel, Math.min(60, levelId + 1)),
      completedLevels: uniqueNumbers([...current.completedLevels, levelId]),
      stars: { ...current.stars, [levelId]: Math.max(current.stars[levelId] ?? 0, stars) },
      pawCoins: current.pawCoins + coinReward
    }))
  }, [update])

  const spendCoins = useCallback((amount: number): boolean => {
    if (player.pawCoins < amount) return false
    update((current) => ({ ...current, pawCoins: current.pawCoins - amount }))
    return true
  }, [player.pawCoins, update])

  const addCoins = useCallback((amount: number) => {
    update((current) => ({ ...current, pawCoins: current.pawCoins + Math.max(0, amount) }))
  }, [update])

  const addHints = useCallback((amount: number) => {
    update((current) => ({ ...current, hints: current.hints + Math.max(0, amount) }))
  }, [update])

  const useHint = useCallback((): boolean => {
    if (player.hints <= 0) return false
    update((current) => ({ ...current, hints: current.hints - 1 }))
    return true
  }, [player.hints, update])

  const purchaseSkin = useCallback((kind: 'cat' | 'box', skinId: string, price: number): boolean => {
    const unlocked = kind === 'cat' ? player.unlockedCatSkins : player.unlockedBoxSkins
    if (unlocked.includes(skinId)) return true
    if (player.pawCoins < price) return false
    update((current) => ({
      ...current,
      pawCoins: current.pawCoins - price,
      unlockedCatSkins: kind === 'cat'
        ? [...current.unlockedCatSkins, skinId]
        : current.unlockedCatSkins,
      unlockedBoxSkins: kind === 'box'
        ? [...current.unlockedBoxSkins, skinId]
        : current.unlockedBoxSkins
    }))
    return true
  }, [player.pawCoins, player.unlockedBoxSkins, player.unlockedCatSkins, update])

  const selectSkin = useCallback((kind: 'cat' | 'box', skinId: string) => {
    update((current) => kind === 'cat'
      ? { ...current, selectedCatSkin: skinId }
      : { ...current, selectedBoxSkin: skinId })
  }, [update])

  const claimDailyReward = useCallback((amount: number) => {
    const today = new Date().toISOString().slice(0, 10)
    update((current) => ({
      ...current,
      pawCoins: current.pawCoins + amount,
      dailyReward: { lastClaimDate: today, streak: current.dailyReward.streak + 1 }
    }))
  }, [update])

  const value = useMemo<PlayerContextValue>(() => ({
    player,
    isReady,
    updateSettings,
    completeLevel,
    spendCoins,
    addCoins,
    addHints,
    useHint,
    purchaseSkin,
    selectSkin,
    claimDailyReward
  }), [
    addCoins,
    addHints,
    claimDailyReward,
    completeLevel,
    isReady,
    player,
    purchaseSkin,
    selectSkin,
    spendCoins,
    updateSettings,
    useHint
  ])

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export function usePlayer(): PlayerContextValue {
  const context = useContext(PlayerContext)
  if (!context) throw new Error('usePlayer must be called inside PlayerProvider')
  return context
}

function uniqueNumbers(values: number[]): number[] {
  return [...new Set(values)].sort((first, second) => first - second)
}
