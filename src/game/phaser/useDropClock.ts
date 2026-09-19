import { useEffect, useRef, useState } from 'react'

export const FIRST_LEVEL_SECONDS = 120

export function useDropClock(running: boolean) {
  const remaining = useRef(FIRST_LEVEL_SECONDS * 1000)
  const stamp = useRef<number | undefined>(undefined)
  const [secondsLeft, setSecondsLeft] = useState(FIRST_LEVEL_SECONDS)
  const read = () => Math.max(0, remaining.current - (stamp.current === undefined ? 0 : Date.now() - stamp.current))
  useEffect(() => {
    if (!running) return
    stamp.current = Date.now()
    const timer = window.setInterval(() => setSecondsLeft(Math.ceil(read() / 1000)), 100)
    return () => {
      remaining.current = read()
      stamp.current = undefined
      window.clearInterval(timer)
    }
  }, [running])
  const resetClock = () => {
    remaining.current = FIRST_LEVEL_SECONDS * 1000
    if (stamp.current !== undefined) stamp.current = Date.now()
    setSecondsLeft(FIRST_LEVEL_SECONDS)
  }
  return { secondsLeft, read, resetClock }
}
