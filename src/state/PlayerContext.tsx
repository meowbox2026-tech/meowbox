import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  createDefaultPlayerSave,
  loadPlayerSave,
  persistPlayerSave,
  type PlayerSave,
  type PlayerSettings
} from '../services/save/playerSave'
import { MAX_PLANNING_LEVEL } from '../game/data/planningLevels'
import { setBackgroundMusicEnabled, startBackgroundMusic } from '../services/audio/audioService'
import { installGlobalAudioFeedback } from '../services/audio/globalAudioFeedback'

interface PlayerContextValue {
  player: PlayerSave
  isReady: boolean
  updateSettings: (settings: Partial<PlayerSettings>) => void
  completeLevel: (levelId: number, stars: number) => void
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

  useEffect(() => {
    if (!isReady) return
    setBackgroundMusicEnabled(player.settings.music)
    if (player.settings.music) startBackgroundMusic(true)
  }, [isReady, player.settings.music])

  useEffect(() => {
    if (!isReady) return undefined
    return installGlobalAudioFeedback(() => player.settings)
  }, [isReady, player.settings.music, player.settings.sound])

  const update = useCallback((updater: (current: PlayerSave) => PlayerSave) => {
    setPlayer((current) => ({ ...updater(current), updatedAt: new Date().toISOString() }))
  }, [])

  const updateSettings = useCallback((settings: Partial<PlayerSettings>) => {
    update((current) => ({ ...current, settings: { ...current.settings, ...settings } }))
  }, [update])

  const completeLevel = useCallback((levelId: number, stars: number) => {
    update((current) => ({
      ...current,
      currentLevel: Math.max(current.currentLevel, Math.min(MAX_PLANNING_LEVEL, levelId + 1)),
      completedLevels: uniqueNumbers([...current.completedLevels, levelId]),
      stars: { ...current.stars, [levelId]: Math.max(current.stars[levelId] ?? 0, stars) }
    }))
  }, [update])

  const value = useMemo<PlayerContextValue>(() => ({
    player,
    isReady,
    updateSettings,
    completeLevel
  }), [
    completeLevel,
    isReady,
    player,
    updateSettings
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
