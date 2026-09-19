import { useEffect, useRef, useState } from 'react'
import { createDropState, dropCat, type DropBoard, type DropResult, type DropState, type DropWave } from '../core/dropEngine'
import { clearBottomRow, recommendColumn } from '../core/dropAssistance'
import { useDropClock } from './useDropClock'
import { getDropLevelById, type DropLevelDefinition } from '../data/dropLevels'

interface Frame {
  board: DropBoard
  previous: DropBoard
  wave?: DropWave
  duration: number
}

type FailureReason = 'ceiling' | 'time' | 'moves'

export function useDropGame(
  paused: boolean,
  feedback: (combo: number) => void,
  level: DropLevelDefinition = getDropLevelById(1)
) {
  const createState = () => createDropState({
    width: level.width,
    height: level.height,
    tileTypes: level.tileAssets,
    board: level.initialBoard,
    current: level.initialCurrent,
    next: level.initialNext,
    queue: level.initialQueue,
    target: level.target
  })
  const initial = createState()
  const [state, setState] = useState(initial)
  const stateRef = useRef<DropState>(initial)
  const [display, setDisplay] = useState<Frame>({ board: initial.board, previous: initial.board, duration: 0 })
  const [activeFrame, setActiveFrame] = useState<Frame>()
  const activeFrameRef = useRef<Frame | undefined>(undefined)
  const frameQueue = useRef<Frame[]>([])
  const [busy, setBusy] = useState(false)
  const startedRef = useRef(false)
  const [started, setStarted] = useState(false)
  const [hidden, setHidden] = useState(document.hidden)
  const [failure, setFailure] = useState<FailureReason>()
  const [reviveUsed, setReviveUsed] = useState(false)
  const reviveLock = useRef(false)
  const [extraDrops, setExtraDrops] = useState<number | undefined>()
  const extraDropsRef = useRef<number | undefined>(undefined)
  const pendingFailure = useRef<FailureReason | undefined>(undefined)
  const [hintColumn, setHintColumn] = useState<number | undefined>()
  const [hintUsed, setHintUsed] = useState(false)
  const callback = useRef(feedback)
  callback.current = feedback
  const stopped = paused || hidden

  const updateState = (next: DropState) => {
    stateRef.current = next
    setState(next)
  }

  const startNextFrame = () => {
    const next = frameQueue.current.shift()
    if (next) {
      activeFrameRef.current = next
      setActiveFrame(next)
    }
    else {
      activeFrameRef.current = undefined
      setActiveFrame(undefined)
      setBusy(false)
      if (pendingFailure.current) {
        const reason = pendingFailure.current
        pendingFailure.current = undefined
        updateState({ ...stateRef.current, phase: 'failed' })
        setFailure(reason)
      }
    }
  }

  useEffect(() => {
    if (!activeFrame) return undefined
    setDisplay(activeFrame)
    if (stopped) return undefined
    const timer = window.setTimeout(() => {
      startNextFrame()
    }, activeFrame.duration)
    return () => window.clearTimeout(timer)
  }, [activeFrame, stopped])

  useEffect(() => {
    const visibility = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', visibility)
    return () => document.removeEventListener('visibilitychange', visibility)
  }, [])

  const { secondsLeft, read, resetClock } = useDropClock(
    started && !stopped && state.phase === 'playing' && extraDrops === undefined,
    level.timeLimit
  )

  useEffect(() => {
    if (secondsLeft !== 0 || stateRef.current.phase !== 'playing' || extraDropsRef.current !== undefined) return
    updateState({ ...stateRef.current, phase: 'failed' })
    setFailure('time')
  }, [secondsLeft])

  const enqueue = (frames: Frame[]) => {
    // Logical drops are resolved immediately. Keep the visual queue bounded
    // to the newest drop so fast taps are visible right away instead of being
    // hidden behind a long chain animation.
    frameQueue.current = frames
    setBusy(true)
    const next = frameQueue.current.shift()
    if (next) {
      activeFrameRef.current = next
      setActiveFrame(next)
    }
  }

  const drop = (column: number) => {
    const currentState = stateRef.current
    const currentExtra = extraDropsRef.current
    if (stopped || currentState.phase !== 'playing' || (currentExtra !== undefined && currentExtra <= 0)) return
    if (startedRef.current && currentExtra === undefined && read() <= 0) {
      updateState({ ...currentState, phase: 'failed' })
      setFailure('time')
      return
    }
    const result: DropResult = dropCat(currentState, column)
    if (!result.accepted) return

    updateState(result.state)
    setHintColumn(undefined)
    if (!startedRef.current) {
      startedRef.current = true
      setStarted(true)
    }
    if (currentExtra !== undefined) {
      const remaining = currentExtra - 1
      extraDropsRef.current = remaining
      setExtraDrops(remaining)
      if (remaining === 0 && result.state.phase === 'playing') pendingFailure.current = 'moves'
    }
    if (result.state.phase === 'failed') setFailure('ceiling')

    const sequence: Frame[] = []
    let previous = currentState.board
    sequence.push({ board: result.landed, previous, duration: 300 })
    previous = result.landed
    result.waves.forEach(wave => {
      sequence.push({ board: wave.board, previous, wave, duration: 380 })
      sequence.push({ board: wave.after, previous: wave.board, duration: 300 })
      previous = wave.after
    })
    callback.current(0)
    result.waves.forEach(wave => callback.current(wave.combo))
    enqueue(sequence)
  }

  const reset = () => {
    const fresh = createState()
    frameQueue.current = []
    activeFrameRef.current = undefined
    setActiveFrame(undefined)
    setBusy(false)
    stateRef.current = fresh
    startedRef.current = false
    extraDropsRef.current = undefined
    pendingFailure.current = undefined
    reviveLock.current = false
    setStarted(false)
    setFailure(undefined)
    setReviveUsed(false)
    setExtraDrops(undefined)
    setHintColumn(undefined)
    setHintUsed(false)
    resetClock()
    setState(fresh)
    setDisplay({ board: fresh.board, previous: fresh.board, duration: 0 })
  }

  const revive = () => {
    if (stateRef.current.phase !== 'failed' || reviveLock.current || busy) return
    reviveLock.current = true
    setReviveUsed(true)
    if (failure === 'ceiling') {
      const before = stateRef.current
      const next = clearBottomRow(before)
      extraDropsRef.current = undefined
      updateState(next)
      setDisplay({ board: next.board, previous: before.board, duration: 0 })
    } else if (failure === 'time') {
      extraDropsRef.current = 3
      setExtraDrops(3)
      updateState({ ...stateRef.current, phase: 'playing' })
    }
    setFailure(undefined)
  }

  const hint = () => {
    if (stateRef.current.phase !== 'playing' || busy || hintUsed) return
    setHintColumn(recommendColumn(stateRef.current))
    setHintUsed(true)
  }

  return {
    state,
    display,
    busy,
    drop,
    reset,
    secondsLeft,
    started,
    failure,
    reviveUsed,
    extraDrops,
    revive,
    hint,
    hintColumn,
    hintUsed
  }
}
