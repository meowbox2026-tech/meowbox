import { useEffect, useRef, useState } from 'react'
import { createDropState, dropCat, type DropBoard, type DropResult, type DropWave } from '../core/dropEngine'
import { clearBottomRow, recommendColumn } from '../core/dropAssistance'
import { useDropClock } from './useDropClock'
interface Frame { board: DropBoard; previous: DropBoard; wave?: DropWave; duration: number }
export function useDropGame(paused: boolean, feedback: (combo: number) => void) {
  const [state, setState] = useState(createDropState)
  const [frames, setFrames] = useState<Frame[]>([])
  const [index, setIndex] = useState(0)
  const [display, setDisplay] = useState<Frame>({ board: state.board, previous: state.board, duration: 0 })
  const pending = useRef<DropResult | undefined>(undefined)
  const locked = useRef(false)
  const [started, setStarted] = useState(false)
  const [hidden, setHidden] = useState(document.hidden)
  const [failure, setFailure] = useState<'ceiling' | 'time' | 'moves'>()
  const [reviveUsed, setReviveUsed] = useState(false)
  const reviveLock = useRef(false)
  const [extraDrops, setExtraDrops] = useState<number | undefined>()
  const [hintColumn, setHintColumn] = useState<number | undefined>()
  const [hintUsed, setHintUsed] = useState(false)
  const callback = useRef(feedback)
  callback.current = feedback
  const busy = frames.length > 0
  const stopped = paused || hidden
  const { secondsLeft, read, resetClock } = useDropClock(started && !stopped && !busy && state.phase === 'playing' && extraDrops === undefined)
  useEffect(() => {
    const visibility = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', visibility)
    return () => document.removeEventListener('visibilitychange', visibility)
  }, [])
  useEffect(() => {
    if (secondsLeft === 0 && state.phase === 'playing' && !busy && extraDrops === undefined) {
      setFailure('time')
      setState(current => ({ ...current, phase: 'failed' }))
    }
  }, [secondsLeft, state.phase, busy, extraDrops])
  useEffect(() => {
    if (!frames.length || stopped) return
    const frame = frames[index]
    setDisplay(frame)
    const timer = window.setTimeout(() => {
      if (index + 1 < frames.length) {
        const next = frames[index + 1]
        if (next.wave) callback.current(next.wave.combo)
        setIndex(index + 1)
      } else {
        if (pending.current) {
          let next = pending.current.state
          if (next.phase === 'failed') setFailure('ceiling')
          else if (next.phase === 'playing' && extraDrops === 0) {
            next = { ...next, phase: 'failed' }
            setFailure('moves')
          }
          setState(next)
        }
        pending.current = undefined
        locked.current = false
        setFrames([])
      }
    }, frame.duration)
    return () => window.clearTimeout(timer)
  }, [frames, index, stopped, extraDrops])
  const drop = (column: number) => {
    if (locked.current || stopped || state.phase !== 'playing') return
    if (started && extraDrops === undefined && read() <= 0) {
      setState(current => ({ ...current, phase: 'failed' })); setFailure('time'); return
    }
    const result = dropCat(state, column)
    if (!result.accepted) return
    locked.current = true
    pending.current = result
    setStarted(true)
    setHintColumn(undefined)
    if (extraDrops !== undefined) setExtraDrops(extraDrops - 1)
    // Preview advances at acceptance; score, board and outcome wait for presentation.
    setState(current => ({ ...current, current: result.state.current, next: result.state.next, queue: result.state.queue }))
    const next: Frame[] = [{ board: result.landed, previous: state.board, duration: 420 }]
    result.waves.forEach(wave => {
      next.push({ board: wave.board, previous: wave.board, wave, duration: 580 })
      next.push({ board: wave.after, previous: wave.board, duration: 420 })
    })
    setIndex(0)
    setFrames(next)
    callback.current(0)
  }
  const reset = () => {
    const fresh = createDropState()
    pending.current = undefined
    locked.current = false
    reviveLock.current = false
    setStarted(false); setFailure(undefined); setReviveUsed(false); setExtraDrops(undefined)
    setHintColumn(undefined); setHintUsed(false); resetClock()
    setFrames([]); setIndex(0); setState(fresh)
    setDisplay({ board: fresh.board, previous: fresh.board, duration: 0 })
  }
  const revive = () => {
    if (state.phase !== 'failed' || reviveLock.current || busy) return
    reviveLock.current = true
    setReviveUsed(true)
    if (failure === 'ceiling') {
      const next = clearBottomRow(state)
      setState(next)
      setDisplay({ board: next.board, previous: state.board, duration: 0 })
    } else if (failure === 'time') {
      setExtraDrops(3)
      setState(current => ({ ...current, phase: 'playing' }))
    }
    setFailure(undefined)
  }
  const hint = () => {
    if (state.phase !== 'playing' || busy || hintUsed) return
    setHintColumn(recommendColumn(state))
    setHintUsed(true)
  }
  return { state, display, busy, drop, reset, secondsLeft, started, failure, reviveUsed, extraDrops, revive, hint, hintColumn, hintUsed }
}
