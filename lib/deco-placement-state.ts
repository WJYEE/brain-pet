/**
 * One placed "sticker" instance inside the Deco stage. Coordinates are
 * normalized (0-1) relative to the (always square) Deco Stage — same
 * convention as lib/room/room-state.ts#RoomItem — so the exact same layout
 * survives any viewport width without pixel math. `width`/`height` are the
 * item's BASE (scale=1) box — the effective on-screen size is always
 * `width * scale` (aspect-locked, see lib/deco-placement-layout.ts) — kept
 * separate from `scale` so old (position-only) saves migrate cleanly by just
 * defaulting scale/rotation/layer (see lib/deco-placement-storage.ts).
 */
export interface DecoPlacementItem {
  instanceId: string
  /** Matches SupportedDecoAsset.id — see lib/deco-supported-assets.ts. */
  itemId: string
  x: number
  y: number
  width: number
  height: number
  /** Uniform size multiplier applied on top of width/height — see DECO_SCALE_MIN/MAX in lib/deco-placement-layout.ts. */
  scale: number
  /** Degrees, -180 to 180, snapped to 5° steps — see lib/deco-placement-layout.ts#clampDecoRotation. */
  rotation: number
  /** Whether this sticker renders behind or in front of the Statling itself — see deco-canvas.tsx's layered z-index scheme. */
  layer: 'behind' | 'front'
}

export interface DecoPlacementState {
  version: 1
  items: DecoPlacementItem[]
  updatedAt: string
}

/** A brand-new Deco loadout: no stickers placed yet. */
export function createDefaultDecoPlacementState(): DecoPlacementState {
  return { version: 1, items: [], updatedAt: new Date(0).toISOString() }
}

export function deepCloneDecoPlacementState(state: DecoPlacementState): DecoPlacementState {
  return { version: state.version, items: state.items.map((item) => ({ ...item })), updatedAt: state.updatedAt }
}

/** Dirty-check: compares only the parts a user can actually edit, ignoring `updatedAt` (which only ever changes on save) — mirrors lib/room/room-state.ts#roomStatesEqual. */
export function decoPlacementStatesEqual(a: DecoPlacementState, b: DecoPlacementState): boolean {
  if (a.items.length !== b.items.length) return false
  return JSON.stringify(sortedItemsForCompare(a.items)) === JSON.stringify(sortedItemsForCompare(b.items))
}

function sortedItemsForCompare(items: DecoPlacementItem[]) {
  return [...items].map((item) => ({ ...item })).sort((x, y) => x.instanceId.localeCompare(y.instanceId))
}
