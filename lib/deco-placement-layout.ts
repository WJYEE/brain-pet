import type { AnchorPoint, CharacterAnchorKey, CharacterAnchorSet } from '@/lib/character-anchor.config'
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

/**
 * Widened from the original 0.5–1.8 so face decorations (안경/고글 등) can be
 * dragged large enough to actually cover the Statling's face via the
 * in-canvas corner handle — see deco-item-handle.tsx. clampDecoItemPosition
 * already keeps an oversized sticker's center within DECO_ZONE and a slice
 * of it always visible, so raising the ceiling here needed no other change.
 */
export const DECO_SCALE_MIN = 0.3
export const DECO_SCALE_MAX = 4
export const DECO_SCALE_DEFAULT = 1

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

/**
 * Wraps any angle into (-180, 180] — a modulo wrap, not a clamp, since
 * rotation is now driven by dragging an on-canvas handle (deco-item-handle.tsx)
 * through a full continuous turn: clamping would dead-stop the drag at ±180
 * instead of letting it keep spinning past. Every stored value (drag,
 * pinch, migration, hand-edited storage) is normalized through here so
 * -180/180/540 all end up meaning the same orientation.
 */
export function clampDecoRotation(rotation: number): number {
  if (!Number.isFinite(rotation)) return 0
  return (((rotation + 180) % 360) + 360) % 360 - 180
}

export function clampDecoLayer(layer: unknown): 'behind' | 'front' {
  return layer === 'behind' ? 'behind' : 'front' // unknown/missing (old position-only saves) defaults to 'front' per the migration rule
}

export function clampDecoAnchor(anchor: unknown): CharacterAnchorKey {
  return anchor === 'head' || anchor === 'face' || anchor === 'body' ? anchor : 'body'
}

/** Hats/ribbons/headbands etc. — checked before FACE_KEYWORDS so a compound name like '고글모자' (goggle-hat, worn on the head) doesn't match on '고글' first. */
const HEAD_KEYWORDS = ['모자', '리본', '화관', '왕관', '머리띠']
/** Glasses/masks/eyepatches — things worn specifically over the eyes/face. */
const FACE_KEYWORDS = ['안경', '고글', '가면', '안대']

/**
 * A sensible starting anchor for a newly-placed sticker, guessed from its
 * (Korean) asset name — see lib/deco-supported-assets.ts. Only decides the
 * *default*; the player can reassign it afterward via deco-properties-panel.tsx,
 * so an imperfect guess here is never a dead end. Anything that isn't
 * obviously a head/face item (wings, a held wand, an umbrella, ...) defaults
 * to 'body'.
 */
export function defaultAnchorForAsset(assetId: string): CharacterAnchorKey {
  if (HEAD_KEYWORDS.some((keyword) => assetId.includes(keyword))) return 'head'
  if (FACE_KEYWORDS.some((keyword) => assetId.includes(keyword))) return 'face'
  return 'body'
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
 * `anchors` is the resolved anchor set for whatever character/state is
 * currently showing (see lib/character-anchor.config.ts) — the sticker's
 * default anchor (defaultAnchorForAsset) is resolved against it once, up
 * front, then stored as an offset from that point.
 */
export function spawnDefaultDecoItem(
  asset: SupportedDecoAsset,
  existingItems: DecoPlacementItem[],
  anchors: CharacterAnchorSet,
): DecoPlacementItem {
  const anchor = defaultAnchorForAsset(asset.id)
  const anchorPoint = anchors[anchor]
  const width = clampDecoWidth(DEFAULT_WIDTH)
  const height = heightFor(asset, width)
  const offset = SPAWN_OFFSET_CYCLE[existingItems.length % SPAWN_OFFSET_CYCLE.length]
  const rawX = DECO_ZONE.minX + offset.x * (DECO_ZONE.maxX - DECO_ZONE.minX)
  const rawY = DECO_ZONE.minY + offset.y * (DECO_ZONE.maxY - DECO_ZONE.minY)
  const { x, y } = clampDecoItemPosition(rawX, rawY, width, height, DECO_SCALE_DEFAULT, 0)

  return {
    instanceId: generateDecoInstanceId(),
    itemId: asset.id,
    anchor,
    offsetX: x - anchorPoint.x,
    offsetY: y - anchorPoint.y,
    width,
    height,
    scale: DECO_SCALE_DEFAULT,
    rotation: 0,
    layer: 'front',
    flipped: false,
  }
}

/**
 * Re-clamps a dragged absolute (newX, newY) into the Deco zone, accounting
 * for the item's current scale/rotation, then re-expresses the clamped
 * position as an offset from `anchorPoint` (the resolved point for this
 * item's own `anchor` key, at whatever character/state is currently
 * showing — see lib/character-anchor.config.ts). Base width/height never
 * change here — only a scale change resizes a sticker.
 */
export function applyDecoMove(item: DecoPlacementItem, anchorPoint: AnchorPoint, newX: number, newY: number): DecoPlacementItem {
  const { x, y } = clampDecoItemPosition(newX, newY, item.width, item.height, item.scale, item.rotation)
  return { ...item, offsetX: x - anchorPoint.x, offsetY: y - anchorPoint.y }
}

/**
 * Applies a scale and/or rotation change, then re-clamps position against
 * the item's new effective size — a sticker scaled up or rotated further
 * from its current spot could otherwise poke past the canvas edge even
 * though its old absolute position was fine at the old size. `anchorPoint`
 * is the resolved point for this item's own `anchor` key (see applyDecoMove).
 */
export function applyDecoTransform(
  item: DecoPlacementItem,
  anchorPoint: AnchorPoint,
  patch: { scale?: number; rotation?: number },
): DecoPlacementItem {
  const scale = patch.scale !== undefined ? clampDecoScale(patch.scale) : item.scale
  const rotation = patch.rotation !== undefined ? clampDecoRotation(patch.rotation) : item.rotation
  const currentX = anchorPoint.x + item.offsetX
  const currentY = anchorPoint.y + item.offsetY
  const { x, y } = clampDecoItemPosition(currentX, currentY, item.width, item.height, scale, rotation)
  return { ...item, scale, rotation, offsetX: x - anchorPoint.x, offsetY: y - anchorPoint.y }
}

/**
 * Reassigns which anchor a sticker tracks (see deco-properties-panel.tsx),
 * without visually moving it: the sticker's current absolute position is
 * preserved, only re-expressed as an offset from the new anchor point going
 * forward — so switching "머리 -> 몸통" reads as "now follow the body
 * instead," not as a jump.
 */
export function applyDecoReanchor(
  item: DecoPlacementItem,
  oldAnchorPoint: AnchorPoint,
  newAnchor: CharacterAnchorKey,
  newAnchorPoint: AnchorPoint,
): DecoPlacementItem {
  const absX = oldAnchorPoint.x + item.offsetX
  const absY = oldAnchorPoint.y + item.offsetY
  return { ...item, anchor: newAnchor, offsetX: absX - newAnchorPoint.x, offsetY: absY - newAnchorPoint.y }
}

let decoInstanceCounter = 0

/** Lightweight local-only instance id — mirrors lib/room/room-layout.ts#generateInstanceId (no backend/DB, so global uniqueness isn't required). */
export function generateDecoInstanceId(): string {
  decoInstanceCounter += 1
  return `deco_${Date.now()}_${decoInstanceCounter}_${Math.random().toString(36).slice(2, 8)}`
}
