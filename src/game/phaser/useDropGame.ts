import { useEffect, useRef, useState } from 'react'
import { createDropState, type DropBoard, type DropState, type DropWave } from '../core/dropEngine'
import { recommendColumn } from '../core/dropAssistance'
import { evaluateDropAction } from '../core/dropFairness'
import { holdCurrent } from '../core/dropHold'
import { useDropClock } from './useDropClock'
import { getWorldOneLevel } from '../data/dropWorldOne'
import type { DropLevelDefinition } from '../data/dropLevelTypes'
import { usePageSuspended } from '../../app/usePageSuspended'

const DEFAULT_DROP_LEVEL = getWorldOneLevel(1)
const STARTING_LIVES = 3

interface Frame {
  board: DropBoard
  previous: DropBoard
  wave?: DropWave
  duration: number
  routedColumn?: number
  routed?: boolean
  patrolMoved?: boolean
}

type FailureReason = 'ceiling' | 'time' | 'no-route' | 'lives'

export function useDropGame(
  paused: boolean,
  feedback: (combo: number) => void,
  level: DropLevelDefinition = DEFAULT_DROP_LEVEL
) {
  const createState = () => createDropState({
    width: level.width,
    height: level.height,
    tileTypes: level.tileAssets,
    board: level.initialBoard,
    current: level.initialCurrent,
    currentTrait: level.initialCurrentTrait,
    next: level.initialNext,
    nextTrait: level.initialNextTrait,
    queue: level.initialQueue,
    queueTraits: level.initialQueueTraits,
    target: level.target,
    scratchPosts: level.scratchPosts,
    fishTreats: level.fishTreats,
    tunnels: level.tunnels,
    patrol: level.patrol,
    goals: { ...level.goals, rescued: level.target },
    holdUses: level.holdUses,
    previewCount: level.previewCount,
    variant: level.variant
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
  const hidden = usePageSuspended()
  const [failure, setFailure] = useState<FailureReason>()
  const [lives, setLives] = useState(STARTING_LIVES)
  const livesRef = useRef(STARTING_LIVES)
  const [deadNotice, setDeadNotice] = useState(false)
  const [hintColumn, setHintColumn] = useState<number | undefined>()
  const [hintUsed, setHintUsed] = useState(false)
  const callback = useRef(feedback)
  callback.current = feedback
  const stopped = paused || hidden
  const lockDuringMechanics = level.id >= 31
  const levelKey = `${level.id}:${level.variant}`
  const levelKeyRef = useRef(levelKey)

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

  const { secondsLeft, read, resetClock } = useDropClock(
    started && !stopped && state.phase === 'playing' && (!lockDuringMechanics || !busy),
    level.timeLimit
  )

  useEffect(() => {
    if (secondsLeft !== 0 || stateRef.current.phase !== 'playing') return
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
    if (stopped || currentState.phase !== 'playing' || (lockDuringMechanics && busy)) return
    if (startedRef.current && read() <= 0) {
      updateState({ ...currentState, phase: 'failed' })
      setFailure('time')
      return
    }
    const evaluation = evaluateDropAction(currentState, column)
    if (!evaluation.accepted) return
    if (evaluation.safety === 'dead') {
      const remainingLives = Math.max(0, livesRef.current - 1)
      livesRef.current = remainingLives
      setLives(remainingLives)
      setDeadNotice(true)
      setHintColumn(undefined)
      if (remainingLives === 0) {
        frameQueue.current = []
        activeFrameRef.current = undefined
        setActiveFrame(undefined)
        setBusy(false)
        updateState({ ...currentState, phase: 'failed' })
        setFailure('lives')
      }
      return
    }

    const result = evaluation.result
    setDeadNotice(false)

    updateState(result.state)
    setHintColumn(undefined)
    if (!startedRef.current) {
      startedRef.current = true
      setStarted(true)
    }
    if (result.state.phase === 'failed') setFailure(result.failureReason === 'no-route' ? 'no-route' : 'ceiling')

    const sequence: Frame[] = []
    let previous = currentState.board
    const landingDuration = level.id >= 31 ? 180 : 300
    const waveDuration = level.id >= 31 ? 240 : 380
    const settleDuration = level.id >= 31 ? 180 : 300
    sequence.push({ board: result.landed, previous, duration: landingDuration, routedColumn: result.resolvedColumn, routed: result.routed, patrolMoved: result.patrolMoved })
    previous = result.landed
    result.waves.forEach(wave => {
      sequence.push({ board: wave.board, previous, wave, duration: waveDuration })
      sequence.push({ board: wave.after, previous: wave.board, duration: settleDuration })
      previous = wave.after
    })
    callback.current(0)
    result.waves.forEach(wave => callback.current(wave.combo))
    enqueue(sequence)
  }

  const hold = () => {
    const currentState = stateRef.current
    if (stopped || busy || currentState.phase !== 'playing') return
    const result = holdCurrent(currentState)
    if (!result.accepted) return
    setDeadNotice(false)
    updateState(result.state)
    setHintColumn(undefined)
    if (!startedRef.current) {
      startedRef.current = true
      setStarted(true)
    }
  }

  const reset = () => {
    const fresh = createState()
    frameQueue.current = []
    activeFrameRef.current = undefined
    setActiveFrame(undefined)
    setBusy(false)
    stateRef.current = fresh
    startedRef.current = false
    setStarted(false)
    setFailure(undefined)
    livesRef.current = STARTING_LIVES
    setLives(STARTING_LIVES)
    setDeadNotice(false)
    setHintColumn(undefined)
    setHintUsed(false)
    resetClock()
    setState(fresh)
    setDisplay({ board: fresh.board, previous: fresh.board, duration: 0 })
  }

  useEffect(() => {
    if (levelKeyRef.current === levelKey) return
    levelKeyRef.current = levelKey
    reset()
  }, [levelKey])

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
    lives,
    deadNotice,
    hint,
    hold,
    hintColumn,
    hintUsed,
    hidden
  }
}
