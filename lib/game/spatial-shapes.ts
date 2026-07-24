import type { SpatialRotationAngle } from '@/lib/game/types'

export type CellCoord = [number, number]

export type SpatialShapeTier = 'simple' | 'complex'

export interface SpatialShape {
  id: string
  tier: SpatialShapeTier
  cells: CellCoord[]
}

/** Shifts a cell set so its minimum row/col is 0, then sorts it into a stable order — makes two equivalent cell sets comparable regardless of how they were produced. */
export function normalizeCells(cells: CellCoord[]): CellCoord[] {
  const minRow = Math.min(...cells.map(([r]) => r))
  const minCol = Math.min(...cells.map(([, c]) => c))
  return cells
    .map(([r, c]): CellCoord => [r - minRow, c - minCol])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
}

function rotate90Clockwise(cells: CellCoord[]): CellCoord[] {
  const maxRow = Math.max(...cells.map(([r]) => r))
  return normalizeCells(cells.map(([r, c]): CellCoord => [c, maxRow - r]))
}

/** Rotates a cell set by 0/90/180/270 degrees clockwise, normalized to start at (0,0). */
export function rotateCells(cells: CellCoord[], angle: SpatialRotationAngle): CellCoord[] {
  const steps = angle === 90 ? 1 : angle === 180 ? 2 : angle === 270 ? 3 : 0
  let result = normalizeCells(cells)
  for (let i = 0; i < steps; i++) result = rotate90Clockwise(result)
  return result
}

/** Flips a cell set left-right (mirrors it), normalized to start at (0,0). */
export function mirrorCells(cells: CellCoord[]): CellCoord[] {
  const maxCol = Math.max(...cells.map(([, c]) => c))
  return normalizeCells(cells.map(([r, c]): CellCoord => [r, maxCol - c]))
}

/** A stable string key for a (already-normalized) cell set — used for equality checks and React keys. */
export function cellsSignature(cells: CellCoord[]): string {
  return normalizeCells(cells)
    .map(([r, c]) => `${r},${c}`)
    .join('|')
}

export function cellsEqual(a: CellCoord[], b: CellCoord[]): boolean {
  return cellsSignature(a) === cellsSignature(b)
}

/**
 * Base Shape Pool — hand-authored, verified asymmetric polyominoes (GAME_SPEC
 * §73: v1.0 uses a validated pool, never procedurally-generated shapes).
 * 'simple' (4-cell tetromino) shapes back Tutorial + Level 1; 'complex'
 * (5-cell pentomino) shapes back Level 2-4. Every entry here has an
 * independently-defined mirror partner below — mirroring is a verified
 * geometric transform of an already-validated shape, not new shape
 * generation, so it stays within the "validated pool" principle.
 *
 * scripts/verify-spatial-shapes.ts (run during implementation, not shipped)
 * confirmed for this whole pool: every shape's 4 rotations are pairwise
 * distinct (no rotational symmetry), every shape's mirror is never equal to
 * any of its own rotations (true chirality), and no two DIFFERENT base
 * shapes ever coincide under any rotation+mirror combination (so any two
 * pool entries are always visually distinguishable, at any angle).
 */
const TETRO_L: SpatialShape = {
  id: 'tetro-l',
  tier: 'simple',
  cells: [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
  ],
}

const PENTA_F: SpatialShape = {
  id: 'penta-f',
  tier: 'complex',
  cells: [
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [2, 1],
  ],
}

const PENTA_L: SpatialShape = {
  id: 'penta-l',
  tier: 'complex',
  cells: [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [3, 1],
  ],
}

const PENTA_N: SpatialShape = {
  id: 'penta-n',
  tier: 'complex',
  cells: [
    [0, 1],
    [1, 1],
    [2, 0],
    [2, 1],
    [3, 0],
  ],
}

const PENTA_P: SpatialShape = {
  id: 'penta-p',
  tier: 'complex',
  cells: [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
    [2, 0],
  ],
}

const PENTA_Y: SpatialShape = {
  id: 'penta-y',
  tier: 'complex',
  cells: [
    [0, 1],
    [1, 0],
    [1, 1],
    [2, 1],
    [3, 1],
  ],
}

function mirrorPartner(shape: SpatialShape, mirrorId: string): SpatialShape {
  return { id: mirrorId, tier: shape.tier, cells: mirrorCells(shape.cells) }
}

const TETRO_J = mirrorPartner(TETRO_L, 'tetro-j')
const PENTA_F_MIRROR = mirrorPartner(PENTA_F, 'penta-f-mirror')
const PENTA_J = mirrorPartner(PENTA_L, 'penta-j')
const PENTA_S = mirrorPartner(PENTA_N, 'penta-s')
const PENTA_Q = mirrorPartner(PENTA_P, 'penta-q')
const PENTA_Y_MIRROR = mirrorPartner(PENTA_Y, 'penta-y-mirror')

export const SPATIAL_SHAPE_POOL: SpatialShape[] = [
  TETRO_L,
  TETRO_J,
  PENTA_F,
  PENTA_F_MIRROR,
  PENTA_L,
  PENTA_J,
  PENTA_N,
  PENTA_S,
  PENTA_P,
  PENTA_Q,
  PENTA_Y,
  PENTA_Y_MIRROR,
]

export const SHAPE_BY_ID: Record<string, SpatialShape> = Object.fromEntries(
  SPATIAL_SHAPE_POOL.map((shape) => [shape.id, shape]),
)

/** Each shape's mirror-image partner, by id — both directions are registered so looking either shape up works. */
export const MIRROR_PARTNER_ID: Record<string, string> = {
  'tetro-l': 'tetro-j',
  'tetro-j': 'tetro-l',
  'penta-f': 'penta-f-mirror',
  'penta-f-mirror': 'penta-f',
  'penta-l': 'penta-j',
  'penta-j': 'penta-l',
  'penta-n': 'penta-s',
  'penta-s': 'penta-n',
  'penta-p': 'penta-q',
  'penta-q': 'penta-p',
  'penta-y': 'penta-y-mirror',
  'penta-y-mirror': 'penta-y',
}

export function shapeIdsInTier(tier: SpatialShapeTier): string[] {
  return SPATIAL_SHAPE_POOL.filter((shape) => shape.tier === tier).map((shape) => shape.id)
}
