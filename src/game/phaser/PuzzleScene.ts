import Phaser from 'phaser'
import {
  addChallengeMoves,
  autoPlaceCat,
  createPuzzleState,
  moveCatOnLevel,
  restartPuzzle,
  revealHint,
  toggleStretchLength,
  undoLastAction,
  wakeSleepingCat
} from '../core/puzzleEngine'
import { getPlacedCells, getShapeCells, pointKey } from '../core/shapes'
import { getCatAssetPath, getCatTextureKey } from '../data/catAssets'
import type { CatDefinition, GridPoint, LevelDefinition, PlacementFailure, PuzzleState } from '../types'

export type PuzzleCommand =
  | { type: 'undo' }
  | { type: 'restart' }
  | { type: 'hint' }
  | { type: 'auto-place' }
  | { type: 'extend-moves'; amount: number }
  | { type: 'wake'; catId: string }
  | { type: 'stretch'; catId: string }
  | { type: 'rotate' }

export interface PuzzleFeedback {
  type: 'placement' | 'selection'
  accepted?: boolean
  reason?: PlacementFailure
  catId?: string
  rotation?: number
}

export interface PuzzleSceneOptions {
  level: LevelDefinition
  onStateChange: (state: PuzzleState) => void
  onFeedback: (feedback: PuzzleFeedback) => void
}

interface BoardMetrics {
  x: number
  y: number
  cell: number
  trayY: number
  trayHeight: number
}

interface MotionState {
  progress: number
}

const SKIN_COLORS: Record<CatDefinition['skin'], number> = {
  orange: 0xf6a341,
  black: 0x3d3743,
  gray: 0x9ba2ab,
  white: 0xfff7eb,
  calico: 0xf5bd82,
  siamese: 0xa77b66,
  ragdoll: 0xdccdc5
}

export class PuzzleScene extends Phaser.Scene {
  private readonly options: PuzzleSceneOptions
  private state: PuzzleState
  private metrics?: BoardMetrics
  private selectedCatId?: string
  private selectedRotation = 0
  private dragStart?: Phaser.Math.Vector2
  private previewOrigin?: GridPoint
  private trayStartIndex = 0
  private isReady = false
  private queuedCommands: PuzzleCommand[] = []
  private readonly dropAnimations = new Map<string, MotionState>()
  private readonly boardJolt = { progress: 1, x: 0, y: 0 }
  private invalidCell?: GridPoint
  private invalidCellAlpha = 0

  constructor(options: PuzzleSceneOptions) {
    super({ key: `PuzzleScene-${options.level.id}` })
    this.options = options
    this.state = createPuzzleState(options.level)
  }

  preload(): void {
    const loadedKeys = new Set<string>()
    this.options.level.cats.forEach((cat) => {
      if (!cat.visualAsset) return
      const key = getCatTextureKey(cat.visualAsset)
      if (loadedKeys.has(key) || this.textures.exists(key)) return
      loadedKeys.add(key)
      this.load.image(key, getCatAssetPath(cat.visualAsset))
    })
  }

  create(): void {
    this.input.on('pointerdown', this.handlePointerDown, this)
    this.input.on('pointermove', this.handlePointerMove, this)
    this.input.on('pointerup', this.handlePointerUp, this)
    this.scale.on('resize', this.renderPuzzle, this)
    this.isReady = true
    this.renderPuzzle()
    this.options.onStateChange(this.state)
    this.queuedCommands.splice(0).forEach((command) => this.dispatch(command))
  }

  shutdown(): void {
    this.input.off('pointerdown', this.handlePointerDown, this)
    this.input.off('pointermove', this.handlePointerMove, this)
    this.input.off('pointerup', this.handlePointerUp, this)
    this.scale.off('resize', this.renderPuzzle, this)
    this.tweens.killAll()
    this.dropAnimations.clear()
    this.isReady = false
  }

  dispatch(command: PuzzleCommand): void {
    if (!this.isReady) {
      this.queuedCommands.push(command)
      return
    }

    if (command.type === 'undo') this.commit(undoLastAction(this.state))
    if (command.type === 'restart') this.resetSelection(restartPuzzle(this.state))
    if (command.type === 'hint') this.commit(revealHint(this.state))
    if (command.type === 'auto-place') this.handleAutoPlace()
    if (command.type === 'extend-moves') this.commit(addChallengeMoves(this.state, command.amount))
    if (command.type === 'wake') this.commit(wakeSleepingCat(this.state, command.catId))
    if (command.type === 'stretch') this.commit(toggleStretchLength(this.state, command.catId))
    if (command.type === 'rotate') this.rotateSelectedCat()
  }

  private handleAutoPlace(): void {
    const result = autoPlaceCat(this.state)
    this.commit(result.state)
    this.options.onFeedback({ type: 'placement', accepted: result.accepted, reason: result.reason })
    if (result.accepted && result.state.lastHint?.catId) this.playPlacementAnimation(result.state.lastHint.catId)
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.state.phase !== 'playing' || !this.metrics) return
    const trayAction = this.getTrayAction(pointer)
    if (trayAction === 'previous' || trayAction === 'next') {
      this.shiftTray(trayAction)
      return
    }
    if (trayAction) {
      this.selectCat(trayAction)
      this.dragStart = new Phaser.Math.Vector2(pointer.x, pointer.y)
      return
    }

    const placedCatId = this.getPlacedCatAt(pointer)
    if (placedCatId) {
      this.selectCat(placedCatId)
      this.dragStart = new Phaser.Math.Vector2(pointer.x, pointer.y)
      return
    }

    if (this.isInsideBoard(pointer) && this.selectedCatId) {
      this.dragStart = new Phaser.Math.Vector2(pointer.x, pointer.y)
      this.previewOrigin = this.getGridPoint(pointer)
      this.renderPuzzle()
    }
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.dragStart || !this.selectedCatId || !this.isInsideBoard(pointer)) return
    this.previewOrigin = this.getGridPoint(pointer)
    this.renderPuzzle()
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    const horizontalTravel = this.dragStart ? pointer.x - this.dragStart.x : 0
    if (Math.abs(horizontalTravel) > 44 && !this.isInsideBoard(pointer)) {
      this.shiftTray(horizontalTravel > 0 ? 'previous' : 'next')
    }

    if (this.selectedCatId && this.dragStart && this.isInsideBoard(pointer)) {
      const point = this.getGridPoint(pointer)
      this.tryPlaceSelectedCat(point)
    }

    this.dragStart = undefined
    this.previewOrigin = undefined
    this.renderPuzzle()
  }

  private tryPlaceSelectedCat(origin: GridPoint): void {
    const catId = this.selectedCatId
    if (!catId) return
    const result = moveCatOnLevel(this.options.level, this.state, catId, origin, this.selectedRotation)
    this.options.onFeedback({ type: 'placement', accepted: result.accepted, reason: result.reason, catId })
    if (!result.accepted) {
      this.flashInvalidCell(origin)
      return
    }

    this.state = result.state
    this.selectedCatId = undefined
    this.selectedRotation = 0
    this.commit(this.state)
    this.playPlacementAnimation(catId)
  }

  private selectCat(catId: string): void {
    this.invalidCell = undefined
    this.invalidCellAlpha = 0
    const existing = this.state.placements[catId]
    this.selectedCatId = catId
    this.selectedRotation = existing?.rotation ?? 0
    this.options.onFeedback({ type: 'selection', catId, rotation: this.selectedRotation })
    this.renderPuzzle()
  }

  private rotateSelectedCat(): void {
    if (!this.selectedCatId) return
    this.selectedRotation = (this.selectedRotation + 1) % 4
    this.options.onFeedback({ type: 'selection', catId: this.selectedCatId, rotation: this.selectedRotation })
    this.renderPuzzle()
  }

  private resetSelection(nextState: PuzzleState): void {
    this.tweens.killAll()
    this.dropAnimations.clear()
    this.invalidCell = undefined
    this.invalidCellAlpha = 0
    this.boardJolt.x = 0
    this.boardJolt.y = 0
    this.selectedCatId = undefined
    this.selectedRotation = 0
    this.commit(nextState)
  }

  private commit(nextState: PuzzleState): void {
    this.state = nextState
    this.options.onStateChange(this.state)
    this.renderPuzzle()
  }

  private playPlacementAnimation(catId: string): void {
    const motion: MotionState = { progress: 0 }
    this.dropAnimations.set(catId, motion)
    this.joltBoard(2.5, 190)
    this.tweens.add({
      targets: motion,
      progress: 1,
      duration: 360,
      ease: 'Cubic.easeOut',
      onUpdate: () => {
        this.renderPuzzle()
      },
      onComplete: () => {
        this.dropAnimations.delete(catId)
        this.renderPuzzle()
      }
    })
  }

  private flashInvalidCell(origin: GridPoint): void {
    this.invalidCell = origin
    const motion: MotionState = { progress: 1 }
    this.invalidCellAlpha = motion.progress
    this.joltBoard(4, 260)
    this.tweens.add({
      targets: motion,
      progress: 0,
      duration: 520,
      ease: 'Cubic.easeOut',
      onUpdate: () => {
        this.invalidCellAlpha = motion.progress
        this.renderPuzzle()
      },
      onComplete: () => {
        this.invalidCell = undefined
        this.invalidCellAlpha = 0
        this.renderPuzzle()
      }
    })
  }

  private joltBoard(amount: number, duration: number): void {
    this.tweens.killTweensOf(this.boardJolt)
    this.boardJolt.progress = 0
    this.boardJolt.x = 0
    this.boardJolt.y = 0
    this.tweens.add({
      targets: this.boardJolt,
      progress: 1,
      duration,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        const wave = Math.sin(this.boardJolt.progress * Math.PI * 5)
        this.boardJolt.x = wave * amount
        this.boardJolt.y = Math.sin(this.boardJolt.progress * Math.PI * 3) * amount * 0.32
        this.renderPuzzle()
      },
      onComplete: () => {
        this.boardJolt.x = 0
        this.boardJolt.y = 0
        this.renderPuzzle()
      }
    })
  }

  private renderPuzzle(): void {
    if (!this.isReady) return
    this.children.removeAll(true)
    this.metrics = this.getMetrics()
    this.drawBoard()
    this.drawPlacedCats()
    this.drawBoardFrontLip()
    this.drawHint()
    this.drawTray()
  }

  private getMetrics(): BoardMetrics {
    const width = this.scale.width
    const height = this.scale.height
    const board = this.options.level.board
    const cell = Math.max(28, Math.min((width * 0.84) / board.width, (height * 0.58) / board.height))
    const boardWidth = cell * board.width
    const boardHeight = cell * board.height
    const x = (width - boardWidth) / 2
    const y = Math.max(18, height * 0.035)
    const trayY = Math.min(y + boardHeight + 18, height - 122)
    return { x, y, cell, trayY, trayHeight: Math.max(110, height - trayY - 10) }
  }

  private drawBoard(): void {
    const metrics = this.metrics!
    const { board } = this.options.level
    const graphics = this.add.graphics()
    const boardWidth = board.width * metrics.cell
    const boardHeight = board.height * metrics.cell
    const offsetX = this.boardJolt.x
    const offsetY = this.boardJolt.y
    const boardX = metrics.x + offsetX
    const boardY = metrics.y + offsetY
    graphics.fillStyle(0x6e4029, 0.3).fillRoundedRect(boardX + 5, boardY + 11, boardWidth, boardHeight + 3, 22)
    graphics.fillStyle(0x9c5f35, 1).fillRoundedRect(boardX - 11, boardY - 8, boardWidth + 22, boardHeight + 22, 24)
    graphics.fillStyle(0xd89455, 1).fillRoundedRect(boardX - 5, boardY - 5, boardWidth + 10, boardHeight + 10, 18)
    graphics.fillStyle(0x7c472c, 0.45).fillRoundedRect(boardX, boardY + 3, boardWidth, boardHeight, 14)

    const blocked = new Set(board.blockedCells.map(pointKey))
    const active = board.activeCells ? new Set(board.activeCells.map(pointKey)) : undefined
    const obstacles = new Map(board.obstacles?.map((obstacle) => [pointKey(obstacle.cell), obstacle.kind]) ?? [])
    for (let y = 0; y < board.height; y += 1) {
      for (let x = 0; x < board.width; x += 1) {
        const point = { x, y }
        const left = boardX + x * metrics.cell + 2
        const top = boardY + y * metrics.cell + 2
        const isActive = !active || active.has(pointKey(point))
        if (!isActive) continue
        const isBlocked = blocked.has(pointKey(point)) || obstacles.has(pointKey(point))
        graphics.fillStyle(isBlocked ? 0x6a4c4f : 0xb86f3e, 1)
        graphics.fillRoundedRect(left + 1, top + 4, metrics.cell - 5, metrics.cell - 4, 8)
        graphics.fillStyle(isBlocked ? 0x86646a : 0xdba064, 1)
        graphics.fillRoundedRect(left, top, metrics.cell - 5, metrics.cell - 8, 8)
        graphics.fillStyle(0xf3c58b, 0.32).fillRoundedRect(left + 4, top + 2, metrics.cell - 14, Math.max(3, metrics.cell * 0.055), 4)
        graphics.lineStyle(1.5, isBlocked ? 0x4d3b3d : 0x975d38, 0.58).strokeRoundedRect(left, top, metrics.cell - 5, metrics.cell - 8, 8)
        const obstacleKind = obstacles.get(pointKey(point))
        if (obstacleKind) this.drawObstacle(left, top, metrics.cell, obstacleKind)
        else if (blocked.has(pointKey(point))) this.drawBlockedCell(left, top, metrics.cell)
      }
    }

    board.lidZones?.forEach((zone) => {
      if (!this.state.closedLids.includes(zone.id)) return
      zone.cells.forEach((cell) => {
        const left = boardX + cell.x * metrics.cell + 3
        const top = boardY + cell.y * metrics.cell + 3
        graphics.fillStyle(0x8e592d, 0.28).fillRoundedRect(left, top, metrics.cell - 6, metrics.cell - 6, 5)
      })
    })

    if (this.invalidCell && this.invalidCellAlpha > 0) {
      const left = boardX + this.invalidCell.x * metrics.cell + 3
      const top = boardY + this.invalidCell.y * metrics.cell + 3
      graphics.fillStyle(0xe75e65, 0.24 * this.invalidCellAlpha).fillRoundedRect(left, top, metrics.cell - 7, metrics.cell - 9, 8)
      graphics.lineStyle(3, 0xe75e65, 0.9 * this.invalidCellAlpha).strokeRoundedRect(left, top, metrics.cell - 7, metrics.cell - 9, 8)
    }
  }

  private drawObstacle(left: number, top: number, cell: number, kind: NonNullable<LevelDefinition['board']['obstacles']>[number]['kind']): void {
    const graphics = this.add.graphics()
    const centerX = left + cell * 0.5
    const centerY = top + cell * 0.52
    const shadowY = top + cell * 0.78
    graphics.fillStyle(0x3e2724, 0.24).fillEllipse(centerX, shadowY, cell * 0.68, cell * 0.18)

    if (kind === 'tape') {
      graphics.fillStyle(0xb86e3c, 1).fillRoundedRect(left + cell * 0.2, top + cell * 0.28, cell * 0.6, cell * 0.36, 7)
      graphics.fillStyle(0xe4a267, 1).fillEllipse(centerX, top + cell * 0.3, cell * 0.62, cell * 0.25)
      graphics.lineStyle(2, 0x8a4f32, 0.8).strokeEllipse(centerX, top + cell * 0.3, cell * 0.24, cell * 0.1)
      return
    }

    if (kind === 'yarn') {
      graphics.fillStyle(0xe77b77, 1).fillCircle(centerX, centerY, cell * 0.27)
      graphics.lineStyle(Math.max(1.5, cell * 0.035), 0xffc0a3, 0.8)
      graphics.strokeCircle(centerX, centerY, cell * 0.17)
      graphics.arc(centerX - cell * 0.04, centerY + cell * 0.02, cell * 0.22, 0.2, 4.7, false)
      graphics.lineBetween(centerX - cell * 0.18, centerY + cell * 0.15, centerX - cell * 0.38, centerY + cell * 0.27)
      return
    }

    if (kind === 'divider') {
      graphics.fillStyle(0x8c5a39, 1).fillRoundedRect(left + cell * 0.18, top + cell * 0.18, cell * 0.64, cell * 0.46, 5)
      graphics.fillStyle(0xd99a5f, 1).fillRoundedRect(left + cell * 0.24, top + cell * 0.21, cell * 0.52, cell * 0.1, 3)
      graphics.lineStyle(2, 0x704329, 0.75).lineBetween(left + cell * 0.24, top + cell * 0.57, left + cell * 0.76, top + cell * 0.57)
      return
    }

    graphics.fillStyle(0x5a8eac, 1).fillRoundedRect(left + cell * 0.22, top + cell * 0.28, cell * 0.56, cell * 0.39, 9)
    graphics.fillStyle(0x8bc2d2, 0.85).fillCircle(left + cell * 0.38, top + cell * 0.39, cell * 0.07)
    graphics.lineStyle(2, 0x3c657d, 0.75).strokeRoundedRect(left + cell * 0.22, top + cell * 0.28, cell * 0.56, cell * 0.39, 9)
  }

  private drawBlockedCell(left: number, top: number, cell: number): void {
    const graphics = this.add.graphics()
    graphics.lineStyle(Math.max(3, cell * 0.08), 0x4d3b3d, 0.76)
    graphics.lineBetween(left + cell * 0.24, top + cell * 0.24, left + cell * 0.76, top + cell * 0.76)
    graphics.lineBetween(left + cell * 0.76, top + cell * 0.24, left + cell * 0.24, top + cell * 0.76)
  }

  private drawBoardFrontLip(): void {
    const metrics = this.metrics!
    const board = this.options.level.board
    const boardWidth = board.width * metrics.cell
    const boardHeight = board.height * metrics.cell
    const left = metrics.x + this.boardJolt.x - 6
    const top = metrics.y + this.boardJolt.y + boardHeight - metrics.cell * 0.2
    const graphics = this.add.graphics()
    const backWallTop = metrics.y + this.boardJolt.y - metrics.cell * 0.18
    graphics.fillStyle(0x714329, 0.3).fillRoundedRect(left + 4, backWallTop + 5, boardWidth + 12, metrics.cell * 0.22, 7)
    graphics.fillStyle(0xb66c3b, 1).fillRoundedRect(left, backWallTop, boardWidth + 12, metrics.cell * 0.18, 7)
    graphics.fillStyle(0xe4a66b, 0.75).fillRoundedRect(left + 2, backWallTop + 2, boardWidth + 8, Math.max(2, metrics.cell * 0.04), 3)
    graphics.lineStyle(1.5, 0x7e472c, 0.68).strokeRoundedRect(left, backWallTop, boardWidth + 12, metrics.cell * 0.18, 7)
    graphics.fillStyle(0x704127, 0.26).fillRoundedRect(left + 4, top + 6, boardWidth + 12, metrics.cell * 0.24, 8)
    graphics.fillStyle(0xa96137, 1).fillRoundedRect(left, top, boardWidth + 12, metrics.cell * 0.2, 7)
    graphics.fillStyle(0xe2a163, 0.7).fillRoundedRect(left + 2, top + 2, boardWidth + 8, Math.max(2, metrics.cell * 0.045), 3)
    graphics.lineStyle(1.5, 0x7e472c, 0.68).strokeRoundedRect(left, top, boardWidth + 12, metrics.cell * 0.2, 7)
    graphics.fillStyle(0x8c512f, 0.8).fillRoundedRect(left, backWallTop, metrics.cell * 0.12, boardHeight + metrics.cell * 0.18, 5)
    graphics.fillStyle(0x8c512f, 0.8).fillRoundedRect(left + boardWidth + 12 - metrics.cell * 0.12, backWallTop, metrics.cell * 0.12, boardHeight + metrics.cell * 0.18, 5)

    const edgeHeight = Math.max(5, metrics.cell * 0.12)
    for (let y = 0; y < board.height; y += 1) {
      for (let x = 0; x < board.width; x += 1) {
        const cellKey = pointKey({ x, y })
        const isActive = !board.activeCells || board.activeCells.some((cell) => pointKey(cell) === cellKey)
        if (!isActive) continue
        const cellLeft = metrics.x + this.boardJolt.x + x * metrics.cell + 3
        const cellTop = metrics.y + this.boardJolt.y + y * metrics.cell + metrics.cell - edgeHeight - 2
        graphics.fillStyle(0x8f512f, 0.65).fillRoundedRect(cellLeft, cellTop + 3, metrics.cell - 9, edgeHeight, 4)
        graphics.fillStyle(0xd4884c, 0.82).fillRoundedRect(cellLeft, cellTop, metrics.cell - 9, Math.max(2, edgeHeight * 0.35), 3)
      }
    }
  }

  private drawPlacedCats(): void {
    this.options.level.cats.forEach((cat) => {
      const placement = this.state.placements[cat.id]
      if (placement) this.drawCat(cat, placement.origin, placement.rotation, placement.stretchLength, placement.locked)
    })

    if (this.selectedCatId && this.previewOrigin) {
      const cat = this.findCat(this.selectedCatId)
      if (cat) this.drawCat(cat, this.previewOrigin, this.selectedRotation, this.state.stretchLengths[cat.id], false, 0.42)
    }
  }

  private drawCat(
    cat: CatDefinition,
    origin: GridPoint,
    rotation: number,
    stretchLength?: number,
    locked?: boolean,
    alpha = 1
  ): void {
    const metrics = this.metrics!
    const placement = { origin, rotation, stretchLength }
    const cells = getPlacedCells(cat, placement)
    const minX = Math.min(...cells.map((cell) => cell.x))
    const maxX = Math.max(...cells.map((cell) => cell.x))
    const minY = Math.min(...cells.map((cell) => cell.y))
    const maxY = Math.max(...cells.map((cell) => cell.y))
    const widthInCells = maxX - minX + 1
    const heightInCells = maxY - minY + 1
    const head = cells[0]
    const boardX = metrics.x + this.boardJolt.x
    const boardY = metrics.y + this.boardJolt.y
    const headX = boardX + (head.x + 0.5) * metrics.cell
    const headY = boardY + (head.y + 0.5) * metrics.cell
    const centerX = boardX + (minX + widthInCells / 2) * metrics.cell
    const centerY = boardY + (minY + heightInCells / 2) * metrics.cell
    const motion = this.dropAnimations.get(cat.id)
    const dropProgress = motion?.progress ?? 1
    const easedProgress = 1 - Math.pow(1 - dropProgress, 3)
    const dropOffsetY = (1 - easedProgress) * -metrics.cell * 0.78
    const bounceScale = 0.92 + easedProgress * 0.08 + Math.sin(dropProgress * Math.PI) * 0.06
    const textureKey = cat.visualAsset ? getCatTextureKey(cat.visualAsset) : undefined

    if (textureKey && this.textures.exists(textureKey)) {
      const baseCells = getShapeCells(cat, { origin: { x: 0, y: 0 }, rotation: 0, stretchLength })
      const baseWidthInCells = Math.max(...baseCells.map((cell) => cell.x)) + 1
      const baseHeightInCells = Math.max(...baseCells.map((cell) => cell.y)) + 1
      const visualWidth = baseWidthInCells * metrics.cell * 0.94
      const visualHeight = Math.max(baseHeightInCells * metrics.cell * 0.94, metrics.cell * 1.32)
      this.add.ellipse(centerX, centerY + metrics.cell * 0.37, visualWidth * 0.5, Math.max(5, metrics.cell * 0.13), 0x43261f, alpha * 0.22)
        .setScale(0.7 + easedProgress * 0.3, 1)
        .setDepth(3)
      this.add.image(centerX, centerY + dropOffsetY, textureKey)
        .setDisplaySize(visualWidth * bounceScale, visualHeight * bounceScale)
        .setAngle(rotation * 90)
        .setAlpha(alpha)
        .setDepth(4)
    } else {
      const graphics = this.add.graphics()
      const color = SKIN_COLORS[cat.skin]
      cells.forEach((cell) => {
        const left = boardX + cell.x * metrics.cell + 5
        const top = boardY + cell.y * metrics.cell + 5 + dropOffsetY
        graphics.fillStyle(color, alpha).fillRoundedRect(left, top, metrics.cell - 10, metrics.cell - 10, 12)
        graphics.lineStyle(2, 0xffffff, alpha * 0.6).strokeRoundedRect(left, top, metrics.cell - 10, metrics.cell - 10, 12)
      })
    }

    if (!textureKey || !this.textures.exists(textureKey)) {
      this.add.text(headX, headY + dropOffsetY, 'ᵔᴥᵔ', {
        fontFamily: 'Arial Rounded MT Bold, sans-serif',
        fontSize: `${Math.max(13, metrics.cell * 0.28)}px`,
        color: cat.skin === 'black' ? '#fff4db' : '#61382d'
      }).setOrigin(0.5).setAlpha(alpha).setDepth(5)
    }

    const badge = cat.type === 'sleeping' && locked ? 'zZ' : cat.type === 'sticky' ? '♡' : cat.type === 'stretch' ? '↔' : ''
    if (badge) {
      this.add.text(headX + metrics.cell * 0.27, headY - metrics.cell * 0.3 + dropOffsetY, badge, {
        fontFamily: 'Arial Rounded MT Bold, sans-serif',
        fontSize: `${Math.max(12, metrics.cell * 0.23)}px`,
        color: '#76402c', stroke: '#fff8e6', strokeThickness: 3
      }).setOrigin(0.5).setAlpha(alpha).setDepth(5)
    }
  }

  private drawHint(): void {
    const hint = this.state.lastHint
    if (!hint) return
    const cat = this.findCat(hint.catId)
    if (!cat) return
    const graphics = this.add.graphics()
    getPlacedCells(cat, hint).forEach((cell) => {
      const left = this.metrics!.x + this.boardJolt.x + cell.x * this.metrics!.cell + 4
      const top = this.metrics!.y + this.boardJolt.y + cell.y * this.metrics!.cell + 4
      graphics.lineStyle(3, 0xffd55b, 0.95).strokeRoundedRect(left, top, this.metrics!.cell - 8, this.metrics!.cell - 8, 10)
    })
  }

  private drawTray(): void {
    const metrics = this.metrics!
    const width = this.scale.width
    const graphics = this.add.graphics()
    graphics.fillStyle(0xfff4e3, 0.97).fillRoundedRect(18, metrics.trayY, width - 36, metrics.trayHeight, 20)
    graphics.lineStyle(2, 0xd39565, 0.76).strokeRoundedRect(18, metrics.trayY, width - 36, metrics.trayHeight, 20)
    const visibleCats = this.options.level.cats.slice(this.trayStartIndex, this.trayStartIndex + 4)
    const cardWidth = (width - 86) / 4
    visibleCats.forEach((cat, index) => {
      const left = 34 + index * cardWidth
      const isSelected = cat.id === this.selectedCatId
      const isPlaced = Boolean(this.state.placements[cat.id])
      graphics.fillStyle(isSelected ? 0xffe58a : 0xf6e3cc, isPlaced ? 0.52 : 1)
      graphics.fillRoundedRect(left, metrics.trayY + 14, cardWidth - 8, metrics.trayHeight - 28, 13)
      graphics.lineStyle(isSelected ? 3 : 1.5, isSelected ? 0xf1a033 : 0xd3ab86, 0.9)
      graphics.strokeRoundedRect(left, metrics.trayY + 14, cardWidth - 8, metrics.trayHeight - 28, 13)
      this.drawTrayCat(cat, left + (cardWidth - 8) / 2, metrics.trayY + metrics.trayHeight * 0.47, cardWidth - 34, isPlaced)
      if (isPlaced) this.add.text(left + (cardWidth - 8) / 2, metrics.trayY + metrics.trayHeight - 24, '已放入', {
        fontFamily: 'Arial Rounded MT Bold, sans-serif', fontSize: '11px', color: '#84513b'
      }).setOrigin(0.5)
    })

    this.drawTrayArrow(24, metrics.trayY + metrics.trayHeight / 2, '‹')
    this.drawTrayArrow(width - 24, metrics.trayY + metrics.trayHeight / 2, '›')
  }

  private drawTrayCat(cat: CatDefinition, centerX: number, centerY: number, maxWidth: number, dimmed: boolean): void {
    const textureKey = cat.visualAsset ? getCatTextureKey(cat.visualAsset) : undefined
    if (textureKey && this.textures.exists(textureKey)) {
      this.add.image(centerX, centerY, textureKey)
        .setDisplaySize(Math.min(maxWidth, 74), Math.min(maxWidth, 74))
        .setAlpha(dimmed ? 0.45 : 1)
        .setDepth(4)
      return
    }

    const cells = getPlacedCells(cat, { origin: { x: 0, y: 0 }, rotation: 0, stretchLength: this.state.stretchLengths[cat.id] })
    const minX = Math.min(...cells.map((cell) => cell.x))
    const maxX = Math.max(...cells.map((cell) => cell.x))
    const minY = Math.min(...cells.map((cell) => cell.y))
    const maxY = Math.max(...cells.map((cell) => cell.y))
    const size = Math.min(maxWidth / (maxX - minX + 1), 26)
    const graphics = this.add.graphics()
    cells.forEach((cell) => {
      const left = centerX + (cell.x - minX - (maxX - minX + 1) / 2) * size
      const top = centerY + (cell.y - minY - (maxY - minY + 1) / 2) * size
      graphics.fillStyle(SKIN_COLORS[cat.skin], dimmed ? 0.45 : 1).fillRoundedRect(left, top, size - 2, size - 2, 7)
      graphics.lineStyle(1, 0xffffff, 0.6).strokeRoundedRect(left, top, size - 2, size - 2, 7)
    })
    this.add.text(centerX, centerY, 'ᵔᴥᵔ', {
      fontFamily: 'Arial Rounded MT Bold, sans-serif', fontSize: `${Math.max(10, size * 0.45)}px`, color: cat.skin === 'black' ? '#fff5e8' : '#61382d'
    }).setOrigin(0.5).setAlpha(dimmed ? 0.56 : 1)
  }

  private drawTrayArrow(x: number, y: number, label: string): void {
    this.add.text(x, y, label, {
      fontFamily: 'Arial Rounded MT Bold, sans-serif',
      fontSize: '42px', color: '#c27b39', stroke: '#fff4e3', strokeThickness: 5
    }).setOrigin(0.5)
  }

  private getTrayAction(pointer: Phaser.Input.Pointer): string | undefined {
    const metrics = this.metrics!
    if (pointer.y < metrics.trayY || pointer.y > metrics.trayY + metrics.trayHeight) return undefined
    if (pointer.x < 42) return 'previous'
    if (pointer.x > this.scale.width - 42) return 'next'
    const index = Math.floor((pointer.x - 34) / ((this.scale.width - 86) / 4))
    return this.options.level.cats[this.trayStartIndex + index]?.id
  }

  private getPlacedCatAt(pointer: Phaser.Input.Pointer): string | undefined {
    const point = this.getGridPoint(pointer)
    return [...this.options.level.cats].reverse().find((cat) => {
      const placement = this.state.placements[cat.id]
      return placement && getPlacedCells(cat, placement).some((cell) => cell.x === point.x && cell.y === point.y)
    })?.id
  }

  private getGridPoint(pointer: Phaser.Input.Pointer): GridPoint {
    const metrics = this.metrics!
    return {
      x: Math.floor((pointer.x - metrics.x) / metrics.cell),
      y: Math.floor((pointer.y - metrics.y) / metrics.cell)
    }
  }

  private isInsideBoard(pointer: Phaser.Input.Pointer): boolean {
    const metrics = this.metrics!
    const board = this.options.level.board
    return pointer.x >= metrics.x && pointer.x <= metrics.x + board.width * metrics.cell
      && pointer.y >= metrics.y && pointer.y <= metrics.y + board.height * metrics.cell
  }

  private shiftTray(direction: 'previous' | 'next'): void {
    const maxStart = Math.max(0, this.options.level.cats.length - 4)
    this.trayStartIndex = Phaser.Math.Clamp(this.trayStartIndex + (direction === 'next' ? 1 : -1), 0, maxStart)
    this.renderPuzzle()
  }

  private findCat(catId: string): CatDefinition | undefined {
    return this.options.level.cats.find((cat) => cat.id === catId)
  }
}
