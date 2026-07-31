import type { RoomAssetCategory } from '@/lib/room-assets'

/**
 * One placed instance of a RoomAsset inside the room. Coordinates are all
 * normalized (0-1) relative to the (always square, aspect-square) Room
 * Stage, so the exact same layout survives both mobile and desktop widths
 * without any pixel math. `height` is always kept in sync with `width` via
 * the asset's own aspect ratio (see lib/room/room-layout.ts) — resizing only
 * ever drives `width`, so an item can never be stretched off its original
 * proportions.
 */
export interface RoomItem {
  instanceId: string
  assetId: string
  category: RoomAssetCategory
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  rotation?: number
  flipped?: boolean
}

export interface RoomState {
  version: 1
  backgroundId: string
  items: RoomItem[]
  updatedAt: string
}

export const DEFAULT_BACKGROUND_ID = 'wood-background'

/** A brand-new room: only the background, no items — per spec, nothing is ever hardcoded here. */
export function createDefaultRoomState(): RoomState {
  return {
    version: 1,
    backgroundId: DEFAULT_BACKGROUND_ID,
    items: [],
    updatedAt: new Date(0).toISOString(),
  }
}

export function deepCloneRoomState(state: RoomState): RoomState {
  return {
    version: state.version,
    backgroundId: state.backgroundId,
    items: state.items.map((item) => ({ ...item })),
    updatedAt: state.updatedAt,
  }
}

/** Dirty-check: compares only the parts a user can actually edit, ignoring `updatedAt` (which only ever changes on save). */
export function roomStatesEqual(a: RoomState, b: RoomState): boolean {
  if (a.backgroundId !== b.backgroundId) return false
  if (a.items.length !== b.items.length) return false
  return JSON.stringify(sortedItemsForCompare(a.items)) === JSON.stringify(sortedItemsForCompare(b.items))
}

function sortedItemsForCompare(items: RoomItem[]) {
  return [...items]
    .map((item) => ({ ...item }))
    .sort((x, y) => x.instanceId.localeCompare(y.instanceId))
}
