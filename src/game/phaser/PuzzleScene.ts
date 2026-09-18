import Phaser from 'phaser'
import {
  addChallengeMoves,
  autoPlaceCat,
  createPuzzleState,
  getCatRuleTargetCells,
  moveCatOnLevel,
  restartPuzzle,
  revealHint,
  toggleStretchLength,
  undoLastAction,
  wakeSleepingCat
} from '../core/puzzleEngine'
import { getPlacedCells, pointKey } from '../core/shapes'
import { getCatAssetPath, getCatTextureKey } from '../data/catAssets'
import type { CatDefinition, GridPoint, LevelDefinition, PlacementFailure, PuzzleState } from '../types'
import { getPuzzleMetrics, type BoardMetrics } from './puzzleLayout'

export type PuzzleCommand =
  | { type: 'undo' }
  | { type: 'restart' }
  | { type: 'hint' }
  | { type: 'auto-place' }
  | { type: 'extend-moves'; amount: number }
  | { type: 'wake'; catId: string }
  | { type: 'stretch'; catId: string }
  | { type: 'rotate' }
  | { type: 'select-cat'; catId: string }

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
    if (command.type === 'select-cat') this.selectCat(command.catId)
  }

  private handleAutoPlace(): void {
    const result = autoPlaceCat(this.state)
    this.commit(result.state)
    this.options.onFeedback({ type: 'placement', accepted: result.accepted, reason: result.reason })
    if (result.accepted && result.state.lastHint?.catId) this.playPlacementAnimation(result.state.lastHint.catId)
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (this.state.phase !== 'playing' || !this.metrics) return
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
    if (this.selectedCatId && this.dragStart && this.isInsideBoard(pointer)) {
      const point = this.getGridPoint(pointer)
      this.tryPlaceSelectedCat(point)
    }

    this.dragStart = undefined
    this.previewOrigin = undefined
    this.renderPuzzle()
  }

  placeAtCanvasPoint(x: number, y: number): void {
    if (!this.isReady || !this.metrics || this.state.phase !== 'playing') return

    if (this.selectedCatId && this.isInsideBoard({ x, y })) {
      this.tryPlaceSelectedCat(this.getGridPoint({ x, y }))
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
    this.options.onFeedback({ type: 'selection', catId: undefined })
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
    this.options.onFeedback({ type: 'selection', catId: undefined })
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
    this.drawSpecialCells()
    this.drawInvalidCell()
    this.drawPlacedCats()
    this.drawBoardFrontLip()
    this.drawHint()
  }

  private getMetrics(): BoardMetrics {
    return getPuzzleMetrics(this.scale.width, this.scale.height, this.options.level.board, this.isIntroLevel())
  }

  private drawBoard(): void {
    if (this.isIntroLevel()) return
    this.drawLegacyBoard()
  }

  private drawLegacyBoard(): void {
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

  }

  private drawObstacle(left: number, top: number, cell: number, kind: NonNullable<LevelDefinition['board']['obstacles']>[number]['kind']): void {
    const graphics = this.add.graphics().setDepth(2)
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
    const graphics = this.add.graphics().setDepth(2)
    graphics.lineStyle(Math.max(3, cell * 0.08), 0x4d3b3d, 0.76)
    graphics.lineBetween(left + cell * 0.24, top + cell * 0.24, left + cell * 0.76, top + cell * 0.76)
    graphics.lineBetween(left + cell * 0.76, top + cell * 0.24, left + cell * 0.24, top + cell * 0.76)
  }

  private drawBoardFrontLip(): void {
    if (this.isIntroLevel()) return

    this.drawLegacyBoardFrontLip()
  }

  private drawSpecialCells(): void {
    const metrics = this.metrics!
    const board = this.options.level.board

    board.specialCells?.forEach((specialCell) => {
      const left = metrics.x + this.boardJolt.x + specialCell.cell.x * metrics.cell
      const top = metrics.y + this.boardJolt.y + specialCell.cell.y * metrics.cell
      const graphics = this.add.graphics().setDepth(3)
      graphics.fillStyle(0xffdc79, 0.96).fillRoundedRect(
        left + metrics.cell * 0.16,
        top + metrics.cell * 0.16,
        metrics.cell * 0.68,
        metrics.cell * 0.68,
        14
      )
      graphics.lineStyle(2, 0xd68c38, 0.86).strokeRoundedRect(
        left + metrics.cell * 0.16,
        top + metrics.cell * 0.16,
        metrics.cell * 0.68,
        metrics.cell * 0.68,
        14
      )

      if (specialCell.kind === 'food') {
        this.add.text(left + metrics.cell * 0.5, top + metrics.cell * 0.48, '🐟', {
          fontFamily: 'Apple Color Emoji, Segoe UI Emoji, sans-serif',
          fontSize: `${Math.max(22, metrics.cell * 0.34)}px`
        }).setOrigin(0.5).setDepth(4)
      }
    })

    this.drawPlacementGuide()
  }

  private drawPlacementGuide(): void {
    if (!this.selectedCatId) return
    const cat = this.findCat(this.selectedCatId)
    if (!cat?.rule) return

    const targetCells = getCatRuleTargetCells(this.options.level, cat)
    const occupiedCells = new Set<string>()
    this.options.level.cats.forEach((placedCat) => {
      if (placedCat.id === cat.id) return
      const placement = this.state.placements[placedCat.id]
      if (!placement) return
      getPlacedCells(placedCat, placement).forEach((cell) => occupiedCells.add(pointKey(cell)))
    })

    const graphics = this.add.graphics().setDepth(3.5)
    targetCells.forEach((cell) => {
      const left = this.metrics!.x + this.boardJolt.x + cell.x * this.metrics!.cell + 5
      const top = this.metrics!.y + this.boardJolt.y + cell.y * this.metrics!.cell + 5
      const isOccupied = occupiedCells.has(pointKey(cell))
      graphics.fillStyle(isOccupied ? 0xc9b8a2 : 0xffe36f, isOccupied ? 0.16 : 0.3)
        .fillRoundedRect(left, top, this.metrics!.cell - 10, this.metrics!.cell - 10, 12)
      graphics.lineStyle(3, isOccupied ? 0xb89d88 : 0xffc13e, isOccupied ? 0.35 : 0.95)
        .strokeRoundedRect(left, top, this.metrics!.cell - 10, this.metrics!.cell - 10, 12)
      if (!isOccupied) {
        this.add.text(left + this.metrics!.cell * 0.5 - 5, top + this.metrics!.cell * 0.5 - 4, '✓', {
          fontFamily: 'Arial Rounded MT Bold, sans-serif',
          fontSize: `${Math.max(16, this.metrics!.cell * 0.24)}px`,
          color: '#b86d27',
          stroke: '#fff5cf',
          strokeThickness: 3
        }).setOrigin(0.5).setDepth(5)
      }
    })
  }

  private drawInvalidCell(): void {
    if (!this.invalidCell || this.invalidCellAlpha <= 0) return
    const board = this.options.level.board
    if (this.invalidCell.x < 0 || this.invalidCell.y < 0 || this.invalidCell.x >= board.width || this.invalidCell.y >= board.height) return

    const left = this.metrics!.x + this.boardJolt.x + this.invalidCell.x * this.metrics!.cell + 3
    const top = this.metrics!.y + this.boardJolt.y + this.invalidCell.y * this.metrics!.cell + 3
    const graphics = this.add.graphics().setDepth(7)
    graphics.fillStyle(0xe75e65, 0.24 * this.invalidCellAlpha).fillRoundedRect(left, top, this.metrics!.cell - 7, this.metrics!.cell - 9, 8)
    graphics.lineStyle(3, 0xe75e65, 0.9 * this.invalidCellAlpha).strokeRoundedRect(left, top, this.metrics!.cell - 7, this.metrics!.cell - 9, 8)
  }

  private drawLegacyBoardFrontLip(): void {
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

  private drawReferenceBoardFrontLip(): void {
    const metrics = this.metrics!
    const board = this.options.level.board
    const boardWidth = board.width * metrics.cell
    const boardHeight = board.height * metrics.cell
    const left = metrics.x + this.boardJolt.x - 6
    const top = metrics.y + this.boardJolt.y + boardHeight - metrics.cell * 0.2
    const graphics = this.add.graphics().setDepth(6)
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
    const motion = this.dropAnimations.get(cat.id)
    const dropProgress = motion?.progress ?? 1
    const easedProgress = 1 - Math.pow(1 - dropProgress, 3)
    const legacyDropOffsetY = (1 - easedProgress) * -metrics.cell * 0.78
    const legacyBounceScale = 0.92 + easedProgress * 0.08 + Math.sin(dropProgress * Math.PI) * 0.06
    const textureKey = cat.visualAsset ? getCatTextureKey(cat.visualAsset) : undefined

    if (textureKey && this.textures.exists(textureKey)) {
      const visualWidth = widthInCells * metrics.cell * 0.94
      const visualHeight = Math.max(heightInCells * metrics.cell * 0.94, metrics.cell * 1.32)
      const centerX = boardX + (minX + widthInCells / 2) * metrics.cell
      const centerY = boardY + (minY + heightInCells / 2) * metrics.cell
      this.add.ellipse(centerX, centerY + metrics.cell * 0.37, visualWidth * 0.5, Math.max(5, metrics.cell * 0.13), 0x43261f, alpha * 0.22)
        .setScale(0.7 + easedProgress * 0.3, 1)
        .setDepth(3)
      this.add.image(centerX, centerY + legacyDropOffsetY, textureKey)
        .setDisplaySize(visualWidth * legacyBounceScale, visualHeight * legacyBounceScale)
        .setAngle(rotation * 90)
        .setAlpha(alpha)
        .setDepth(4)
    } else {
      const graphics = this.add.graphics()
      const color = SKIN_COLORS[cat.skin]
      cells.forEach((cell) => {
        const left = boardX + cell.x * metrics.cell + 5
        const top = boardY + cell.y * metrics.cell + 5 + legacyDropOffsetY
        graphics.fillStyle(color, alpha).fillRoundedRect(left, top, metrics.cell - 10, metrics.cell - 10, 12)
        graphics.lineStyle(2, 0xffffff, alpha * 0.6).strokeRoundedRect(left, top, metrics.cell - 10, metrics.cell - 10, 12)
      })
    }

    if (!textureKey || !this.textures.exists(textureKey)) {
      this.add.text(headX, headY + legacyDropOffsetY, 'ᵔᴥᵔ', {
        fontFamily: 'Arial Rounded MT Bold, sans-serif',
        fontSize: `${Math.max(13, metrics.cell * 0.28)}px`,
        color: cat.skin === 'black' ? '#fff4db' : '#61382d'
      }).setOrigin(0.5).setAlpha(alpha).setDepth(5)
    }

    const badge = cat.type === 'sleeping' && locked
      ? 'zZ'
      : cat.type === 'sticky'
        ? '♡'
        : cat.type === 'stretch'
          ? '↔'
          : cat.rule?.kind === 'adjacent-to-special'
            ? '🐟'
            : ''
    if (badge) {
      this.add.text(headX + metrics.cell * 0.27, headY - metrics.cell * 0.3 + legacyDropOffsetY, badge, {
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
    const graphics = this.add.graphics().setDepth(7)
    getPlacedCells(cat, hint).forEach((cell) => {
      const left = this.metrics!.x + this.boardJolt.x + cell.x * this.metrics!.cell + 4
      const top = this.metrics!.y + this.boardJolt.y + cell.y * this.metrics!.cell + 4
      graphics.lineStyle(3, 0xffd55b, 0.95).strokeRoundedRect(left, top, this.metrics!.cell - 8, this.metrics!.cell - 8, 10)
    })
  }

  private getPlacedCatAt(pointer: { x: number; y: number }): string | undefined {
    const point = this.getGridPoint(pointer)
    return [...this.options.level.cats].reverse().find((cat) => {
      const placement = this.state.placements[cat.id]
      return placement && getPlacedCells(cat, placement).some((cell) => cell.x === point.x && cell.y === point.y)
    })?.id
  }

  private getGridPoint(pointer: { x: number; y: number }): GridPoint {
    const metrics = this.metrics!
    return {
      x: Math.floor((pointer.x - metrics.x) / metrics.cell),
      y: Math.floor((pointer.y - metrics.y) / metrics.cell)
    }
  }

  private isInsideBoard(pointer: { x: number; y: number }): boolean {
    const metrics = this.metrics!
    const board = this.options.level.board
    return pointer.x >= metrics.x && pointer.x <= metrics.x + board.width * metrics.cell
      && pointer.y >= metrics.y && pointer.y <= metrics.y + board.height * metrics.cell
  }

  private findCat(catId: string): CatDefinition | undefined {
    return this.options.level.cats.find((cat) => cat.id === catId)
  }

  private isIntroLevel(): boolean {
    return this.options.level.id === 1
  }
}
