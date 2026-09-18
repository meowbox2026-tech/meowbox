import type { BoardDefinition } from '../types'

export interface BoardMetrics {
  x: number
  y: number
  cell: number
  boardWidth: number
  boardHeight: number
  trayY: number
  trayHeight: number
}

export function getPuzzleMetrics(width: number, height: number, board: BoardDefinition, isIntro = false): BoardMetrics {
  const baseCell = Math.max(28, Math.min((width * 0.84) / board.width, (height * 0.58) / board.height))
  const cell = isIntro ? baseCell * 1.08 : baseCell
  const boardWidth = cell * board.width
  const boardHeight = cell * board.height
  const x = (width - boardWidth) / 2
  const y = Math.max(18, height * 0.035)
  const trayY = Math.min(y + boardHeight + 18, height - 122)

  return { x, y, cell, boardWidth, boardHeight, trayY, trayHeight: Math.max(110, height - trayY - 10) }
}
