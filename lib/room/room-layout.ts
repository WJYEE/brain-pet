import { ROOM_ASSETS, type RoomAsset } from '@/lib/room-assets'
import type { RoomItem } from '@/lib/room/room-state'

/**
 * Where an item is allowed to live inside the Room Stage:
 * - wall: upper wall band only (windows, frames, floating shelves) — can't drop to the floor.
 * - floor: lower floor band only (standing furniture, rugs, plants, floor toys).
 * - free: anywhere in the stage (shelf-top decor — not pinned to a fixed band).
 */
export type RoomAnchor = 'floor' | 'wall' | 'free'

interface CategoryLayoutRule {
  anchor: RoomAnchor
  defaultZIndex: number
  defaultWidth: number
  defaultY: number
}

/** Fixed stacking for the Statling itself + its contact shadow — every other item's zIndex is relative to these (see room-canvas.tsx). Bring-to-front can push a custom item above STATLING_Z_INDEX; nothing does so by default. */
export const STATLING_Z_INDEX = 50
export const STATLING_SHADOW_Z_INDEX = 48

const WALL_Y_RANGE: [number, number] = [0.06, 0.32]
const FLOOR_Y_RANGE: [number, number] = [0.45, 0.9]
const FREE_Y_RANGE: [number, number] = [0.05, 0.95]

const MIN_WIDTH = 0.05
const MAX_WIDTH = 0.9

/** Deterministic left/right spread so several *different* assets placed into the same slot type (e.g. two different chairs) don't land exactly on top of each other. Keyed by how many items already occupy that bucket, not by asset — each individual asset is capped at one placed instance (see theme-screen.tsx#handleAssetClick). */
const X_OFFSET_CYCLE = [0.5, 0.25, 0.75, 0.35, 0.65, 0.15, 0.85]

function isShelfAsset(asset: RoomAsset): boolean {
  return asset.id.startsWith('shelf-')
}

/**
 * Per-asset fixed size — sizes are curated, not user-adjustable (there is no
 * resize handle; see room-item-handle.tsx). Falls back to a per-category
 * default below when an id doesn't match a more specific pattern. Values
 * mirror what previously read correctly in the old hand-placed
 * WARM_WOOD_PRESET (shelf ~26%, drawer ~20%, plant ~12-13%, frame ~9-10%,
 * rug ~44%), plus new per-shape furniture tuning (chairs read smaller than
 * shelves/drawers) so mixed furniture doesn't all render the same size.
 */
function getFixedWidth(asset: RoomAsset): number {
  if (asset.category === 'furniture') {
    if (isShelfAsset(asset)) return 0.26
    if (asset.id.includes('drawer')) return 0.2
    if (asset.id.includes('bigchair')) return 0.17
    if (asset.id.includes('chair')) return 0.14
    if (asset.id.includes('lantern')) return 0.11
    return 0.18
  }
  return getLayoutRule(asset).defaultWidth
}

/**
 * Category(+decorSubcategory)-based default anchor/z-index/position. Shelves
 * are cataloged under `furniture` but are wall-mounted floating shelves (the
 * original preset placed them near the top, not on the floor) — anchored to
 * the wall band, not the floor band, unlike the rest of `furniture`.
 */
function getLayoutRule(asset: RoomAsset): CategoryLayoutRule {
  switch (asset.category) {
    case 'window':
      return { anchor: 'wall', defaultZIndex: 10, defaultWidth: 0.22, defaultY: 0.14 }
    case 'decor':
      if (asset.decorSubcategory === 'shelfDecor') {
        return { anchor: 'free', defaultZIndex: 42, defaultWidth: 0.12, defaultY: 0.3 }
      }
      if (asset.decorSubcategory === 'floorDecor') {
        return { anchor: 'floor', defaultZIndex: 45, defaultWidth: 0.1, defaultY: 0.68 }
      }
      // wallDecor (frames/flag) and any future default
      return { anchor: 'wall', defaultZIndex: 20, defaultWidth: 0.1, defaultY: 0.16 }
    case 'rug':
      return { anchor: 'floor', defaultZIndex: 30, defaultWidth: 0.42, defaultY: 0.78 }
    case 'furniture':
      if (isShelfAsset(asset)) {
        return { anchor: 'wall', defaultZIndex: 20, defaultWidth: 0.26, defaultY: 0.2 }
      }
      if (asset.id.includes('lantern')) {
        return { anchor: 'floor', defaultZIndex: 40, defaultWidth: 0.11, defaultY: 0.48 }
      }
      return { anchor: 'floor', defaultZIndex: 40, defaultWidth: 0.18, defaultY: 0.62 }
    case 'plant':
      return { anchor: 'floor', defaultZIndex: 45, defaultWidth: 0.12, defaultY: 0.62 }
    case 'background':
      // Backgrounds are never placed as items — kept exhaustive for type safety only.
      return { anchor: 'free', defaultZIndex: 0, defaultWidth: 1, defaultY: 0.5 }
  }
}

export function getAnchorForCategory(asset: RoomAsset): RoomAnchor {
  return getLayoutRule(asset).anchor
}

/** Groups assets into the same "slot type" for default-position offsetting — two different chairs share a bucket, but shelves (wall-mounted) don't share one with standing furniture. */
function getBucketKey(asset: RoomAsset): string {
  if (asset.category === 'furniture') return isShelfAsset(asset) ? 'furniture:shelf' : 'furniture:floor'
  return `${asset.category}:${asset.decorSubcategory ?? ''}`
}

function getAnchorYRange(anchor: RoomAnchor): [number, number] {
  switch (anchor) {
    case 'wall':
      return WALL_Y_RANGE
    case 'floor':
      return FLOOR_Y_RANGE
    case 'free':
      return FREE_Y_RANGE
  }
}

function heightFor(asset: RoomAsset, width: number): number {
  return width * (asset.naturalHeight / asset.naturalWidth)
}

/** Clamps a candidate (x, y) so the item's full box stays within the stage and within its anchor's allowed vertical band. */
export function clampItemPosition(
  anchor: RoomAnchor,
  x: number,
  y: number,
  width: number,
  height: number,
): { x: number; y: number } {
  const halfW = width / 2
  const halfH = height / 2
  const [minY, maxY] = getAnchorYRange(anchor)

  const minX = Math.min(halfW, 1 - halfW)
  const maxX = Math.max(halfW, 1 - halfW)
  const clampedX = clamp(x, Math.min(minX, maxX), Math.max(minX, maxX))

  // Keep the band clamp, but never let the item's box escape the stage
  // vertically either, even if the band itself is close to an edge.
  const boundedMinY = Math.max(minY, halfH)
  const boundedMaxY = Math.min(maxY, 1 - halfH)
  const loY = Math.min(boundedMinY, boundedMaxY)
  const hiY = Math.max(boundedMinY, boundedMaxY)
  const clampedY = clamp(y, loY, hiY)

  return { x: clampedX, y: clampedY }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function clampWidth(width: number): number {
  return clamp(width, MIN_WIDTH, MAX_WIDTH)
}

/**
 * Builds a brand-new placed item for `asset` at its fixed default size.
 * Only called for an asset that isn't already placed (each asset is capped
 * at one instance — see theme-screen.tsx#handleAssetClick); the x offset is
 * based on how many items already share this asset's "slot type" (bucket),
 * so e.g. a second, different chair doesn't land exactly on top of the
 * first one.
 */
export function spawnDefaultItem(asset: RoomAsset, existingItems: RoomItem[]): RoomItem {
  const rule = getLayoutRule(asset)
  const bucketKey = getBucketKey(asset)
  const bucketCount = existingItems.filter((item) => {
    const existingAsset = ROOM_ASSETS[item.assetId]
    return existingAsset && getBucketKey(existingAsset) === bucketKey
  }).length
  const offsetX = X_OFFSET_CYCLE[bucketCount % X_OFFSET_CYCLE.length]

  const width = clampWidth(getFixedWidth(asset))
  const height = heightFor(asset, width)
  const { x, y } = clampItemPosition(rule.anchor, offsetX, rule.defaultY, width, height)

  return {
    instanceId: generateInstanceId(),
    assetId: asset.id,
    category: asset.category,
    x,
    y,
    width,
    height,
    zIndex: rule.defaultZIndex,
    rotation: 0,
    flipped: false,
  }
}

/** Re-clamps a dragged (x, y) into the item's anchor bounds. Size is fixed — there is no resize handle — so width/height never change here. */
export function applyMove(item: RoomItem, asset: RoomAsset, newX: number, newY: number): RoomItem {
  const { x, y } = clampItemPosition(getAnchorForCategory(asset), newX, newY, item.width, item.height)
  return { ...item, x, y }
}

let instanceCounter = 0

/** Lightweight local-only instance id — mirrors lib/game/id.ts#generateSessionId (no backend/DB, so global uniqueness isn't required). */
export function generateInstanceId(): string {
  instanceCounter += 1
  return `item_${Date.now()}_${instanceCounter}_${Math.random().toString(36).slice(2, 8)}`
}
