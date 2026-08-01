import type { SupportedDecoAsset } from '@/lib/deco-supported-assets'
import type { DecoPlacementItem } from '@/lib/deco-placement-state'

/**
 * One fixed, Statling-centered placement zone — identical for every
 * character, on purpose (per the Deco placement scope: "모든 캐릭터에 동일한
 * 상대 좌표계를 사용, 캐릭터별 개별 anchor 좌표는 만들지 않음"). Every
 * character in lib/pets/pet-profile.ts renders centered in its own square
 * frame regardless of its native art size (see components/brain-bet/
 * asset-image.tsx's object-contain), so one shared box around that center
 * reads as "around the Statling" for all 30 without per-character tuning.
 * This clamps a sticker's CENTER point (not its full box — see
 * clampDecoItemPosition) so "얼마나 멀리 갈 수 있는지" reads the same on every
 * character regardless of that sticker's own current size/rotation.
 */
export const DECO_ZONE = { minX: 0.16, maxX: 0.84, minY: 0.12, maxY: 0.88 }

/** Fixed stacking around the Statling — behind items sit under it, front items on top. Within a layer, array order (not a separate z field) decides relative order, so a saved arrangement always renders the same way (see deco-canvas.tsx). */
export const DECO_STATLING_Z_INDEX = 50
export const DECO_BEHIND_Z_BASE = 20
export const DECO_FRONT_Z_BASE = 60

export const DECO_SCALE_MIN = 0.5
export const DECO_SCALE_MAX = 1.8
export const DECO_SCALE_DEFAULT = 1

export const DECO_ROTATION_MIN = -180
export const DECO_ROTATION_MAX = 180
export const DECO_ROTATION_STEP = 5

const DEFAULT_WIDTH = 0.16
const MIN_WIDTH = 0.06
const MAX_WIDTH = 0.32

/** How much of a sticker's (scaled, rotated) bounding box is allowed to peek off the canvas edge before the center clamp kicks in — see clampDecoItemPosition. Deliberately loose: the spec calls for a "never fully disappears" guarantee, not strict full-containment (that's what DECO_ZONE's own center clamp already provides for the common case). */
const MIN_VISIBLE_FRACTION = 0.35

/** Spreads several stickers apart by default so they don't all spawn on top of each other — purely a spawn-time convenience, not a constraint (the user can still drag them anywhere in the zone, including on top of one another). */
const SPAWN_OFFSET_CYCLE: Array<{ x: number; y: number }> = [
  { x: 0.5, y: 0.3 },
  { x: 0.3, y: 0.5 },
  { x: 0.7, y: 0.5 },
  { x: 0.5, y: 0.7 },
  { x: 0.35, y: 0.25 },
  { x: 0.65, y: 0.25 },
  { x: 0.35, y: 0.75 },
  { x: 0.65, y: 0.75 },
]

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function clampDecoWidth(width: number): number {
  return clamp(width, MIN_WIDTH, MAX_WIDTH)
}

export function clampDecoScale(scale: number): number {
  if (Number.isNaN(scale)) return DECO_SCALE_DEFAULT
  return clamp(scale, DECO_SCALE_MIN, DECO_SCALE_MAX)
}

/** Clamps to [-180, 180] and snaps to DECO_ROTATION_STEP so every stored value (however it arrived — slider, migration, hand-edited storage) reads the same "5도 단위" the slider itself produces. */
export function clampDecoRotation(rotation: number): number {
  if (Number.isNaN(rotation)) return 0
  const snapped = Math.round(rotation / DECO_ROTATION_STEP) * DECO_ROTATION_STEP
  return clamp(snapped, DECO_ROTATION_MIN, DECO_ROTATION_MAX)
}

export function clampDecoLayer(layer: unknown): 'behind' | 'front' {
  return layer === 'behind' ? 'behind' : 'front' // unknown/missing (old position-only saves) defaults to 'front' per the migration rule
}

function heightFor(asset: SupportedDecoAsset, width: number): number {
  return width * (asset.naturalHeight / asset.naturalWidth)
}

/**
 * The rotated-rect axis-aligned bounding box half-extents for a sticker at
 * its EFFECTIVE (scaled) size — the standard rotated-AABB formula
 * (|w·cos θ| + |h·sin θ|, |w·sin θ| + |h·cos θ|). Used only to keep a
 * heavily scaled/rotated sticker from fully leaving the canvas (see
 * clampDecoItemPosition) — DECO_ZONE's own center clamp is what actually
 * keeps it "around the Statling."
 */
function rotatedHalfExtents(width: number, height: number, scale: number, rotationDeg: number) {
  const w = width * scale
  const h = height * scale
  const rad = (rotationDeg * Math.PI) / 180
  const cos = Math.abs(Math.cos(rad))
  const sin = Math.abs(Math.sin(rad))
  return { halfW: (w * cos + h * sin) / 2, halfH: (w * sin + h * cos) / 2 }
}

/**
 * Clamps a candidate (x, y) so the sticker's center never leaves DECO_ZONE —
 * keeping every placement "around the Statling," the same rule for every
 * character — while a second, looser guard (MIN_VISIBLE_FRACTION) only stops
 * an extreme scale+rotation combo from pushing the sticker's rotated
 * bounding box entirely off-canvas. This is intentionally NOT a strict
 * "whole box must stay inside" rule (a rotated sticker's corners, or an
 * oversized one's edges, may still legitimately spill past DECO_ZONE or even
 * the canvas edge — see the placement-limit notes) — only the center point
 * and a minimum visible sliver are actually enforced.
 */
export function clampDecoItemPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number = DECO_SCALE_DEFAULT,
  rotation: number = 0,
): { x: number; y: number } {
  const zoneMinX = Math.min(DECO_ZONE.minX, DECO_ZONE.maxX)
  const zoneMaxX = Math.max(DECO_ZONE.minX, DECO_ZONE.maxX)
  const zoneMinY = Math.min(DECO_ZONE.minY, DECO_ZONE.maxY)
  const zoneMaxY = Math.max(DECO_ZONE.minY, DECO_ZONE.maxY)

  const { halfW, halfH } = rotatedHalfExtents(width, height, scale, rotation)
  const visibleHalfW = halfW * (1 - MIN_VISIBLE_FRACTION)
  const visibleHalfH = halfH * (1 - MIN_VISIBLE_FRACTION)

  const canvasMinX = -visibleHalfW
  const canvasMaxX = 1 + visibleHalfW
  const canvasMinY = -visibleHalfH
  const canvasMaxY = 1 + visibleHalfH

  const loX = Math.max(zoneMinX, canvasMinX)
  const hiX = Math.min(zoneMaxX, canvasMaxX)
  const loY = Math.max(zoneMinY, canvasMinY)
  const hiY = Math.min(zoneMaxY, canvasMaxY)

  return {
    x: clamp(x, Math.min(loX, hiX), Math.max(loX, hiX)),
    y: clamp(y, Math.min(loY, hiY), Math.max(loY, hiY)),
  }
}

/**
 * Builds a brand-new placed sticker for `asset` at a default size, offset by
 * how many stickers are already placed (purely cosmetic spread — see
 * SPAWN_OFFSET_CYCLE). Each asset can only be placed once (mirrors
 * theme-screen.tsx#handleAssetClick's existing "one instance per asset"
 * rule) — the caller is responsible for checking that before calling this.
 */
export function spawnDefaultDecoItem(asset: SupportedDecoAsset, existingItems: DecoPlacementItem[]): DecoPlacementItem {
  const width = clampDecoWidth(DEFAULT_WIDTH)
  const height = heightFor(asset, width)
  const offset = SPAWN_OFFSET_CYCLE[existingItems.length % SPAWN_OFFSET_CYCLE.length]
  const rawX = DECO_ZONE.minX + offset.x * (DECO_ZONE.maxX - DECO_ZONE.minX)
  const rawY = DECO_ZONE.minY + offset.y * (DECO_ZONE.maxY - DECO_ZONE.minY)
  const { x, y } = clampDecoItemPosition(rawX, rawY, width, height, DECO_SCALE_DEFAULT, 0)

  return {
    instanceId: generateDecoInstanceId(),
    itemId: asset.id,
    x,
    y,
    width,
    height,
    scale: DECO_SCALE_DEFAULT,
    rotation: 0,
    layer: 'front',
  }
}

/** Re-clamps a dragged (x, y) into the Deco zone, accounting for the item's current scale/rotation. Base width/height never change here — only a scale change resizes a sticker. */
export function applyDecoMove(item: DecoPlacementItem, newX: number, newY: number): DecoPlacementItem {
  const { x, y } = clampDecoItemPosition(newX, newY, item.width, item.height, item.scale, item.rotation)
  return { ...item, x, y }
}

/**
 * Applies a scale and/or rotation change, then re-clamps position against
 * the item's new effective size — a sticker scaled up or rotated further
 * from its current spot could otherwise poke past the canvas edge even
 * though its old (x, y) was fine at the old size.
 */
export function applyDecoTransform(item: DecoPlacementItem, patch: { scale?: number; rotation?: number }): DecoPlacementItem {
  const scale = patch.scale !== undefined ? clampDecoScale(patch.scale) : item.scale
  const rotation = patch.rotation !== undefined ? clampDecoRotation(patch.rotation) : item.rotation
  const { x, y } = clampDecoItemPosition(item.x, item.y, item.width, item.height, scale, rotation)
  return { ...item, scale, rotation, x, y }
}

let decoInstanceCounter = 0

/** Lightweight local-only instance id — mirrors lib/room/room-layout.ts#generateInstanceId (no backend/DB, so global uniqueness isn't required). */
export function generateDecoInstanceId(): string {
  decoInstanceCounter += 1
  return `deco_${Date.now()}_${decoInstanceCounter}_${Math.random().toString(36).slice(2, 8)}`
}
