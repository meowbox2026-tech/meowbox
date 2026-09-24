import { useCallback, useEffect, useRef, useState } from 'react'

export const LEVEL_TIMER_TICK_MS = 100

export function useLevelTimer(running: boolean) {
  const accumulatedMs = useRef(0)
  const startedAt = useRef<number | undefined>(undefined)
  const [elapsedMs, setElapsedMs] = useState(0)

  const read = useCallback(() => {
    if (startedAt.current === undefined) return accumulatedMs.current
    return Math.max(0, accumulatedMs.current + Date.now() - startedAt.current)
  }, [])

  useEffect(() => {
    if (!running) return undefined

    startedAt.current = Date.now()
    setElapsedMs(read())
    const timer = window.setInterval(() => setElapsedMs(read()), LEVEL_TIMER_TICK_MS)

    return () => {
      accumulatedMs.current = read()
      startedAt.current = undefined
      window.clearInterval(timer)
    }
  }, [read, running])

  const reset = useCallback(() => {
    accumulatedMs.current = 0
    startedAt.current = running ? Date.now() : undefined
    setElapsedMs(0)
  }, [running])

  return { elapsedMs, read, reset }
}
