import type { CatDefinition, CatPlacement, GridPoint } from '../types'

const BASE_SHAPES: Record<string, GridPoint[]> = {
  dot: [{ x: 0, y: 0 }],
  line2: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
  line3: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
  line4: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }],
  square2: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
  l: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
  t: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }],
  z: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }]
}

export function getShapeCells(cat: CatDefinition, placement?: CatPlacement): GridPoint[] {
  const cells = cat.type === 'stretch'
    ? getStretchCells(placement?.stretchLength ?? cat.stretchLengths?.[0] ?? 2)
    : BASE_SHAPES[cat.shape]

  return rotateCells(cells, placement?.rotation ?? 0)
}

export function getPlacedCells(cat: CatDefinition, placement: CatPlacement): GridPoint[] {
  return getShapeCells(cat, placement).map((cell) => ({
    x: cell.x + placement.origin.x,
    y: cell.y + placement.origin.y
  }))
}

export function cellsTouch(first: GridPoint[], second: GridPoint[]): boolean {
  return first.some((firstCell) => second.some((secondCell) => {
    const distance = Math.abs(firstCell.x - secondCell.x) + Math.abs(firstCell.y - secondCell.y)
    return distance === 1
  }))
}

export function pointKey(point: GridPoint): string {
  return `${point.x}:${point.y}`
}

function getStretchCells(length: number): GridPoint[] {
  return Array.from({ length }, (_, index) => ({ x: index, y: 0 }))
}

function rotateCells(cells: GridPoint[], rotation: number): GridPoint[] {
  const turns = ((rotation % 4) + 4) % 4
  const rotated = cells.map((cell) => rotateCell(cell, turns))
  const minX = Math.min(...rotated.map((cell) => cell.x))
  const minY = Math.min(...rotated.map((cell) => cell.y))

  return rotated.map((cell) => ({ x: cell.x - minX, y: cell.y - minY }))
}

function rotateCell(cell: GridPoint, turns: number): GridPoint {
  if (turns === 1) return { x: -cell.y, y: cell.x }
  if (turns === 2) return { x: -cell.x, y: -cell.y }
  if (turns === 3) return { x: cell.y, y: -cell.x }
  return cell
}
