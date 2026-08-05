import type { CharacterAnchorKey } from '@/lib/character-anchor.config'

/**
 * One placed "sticker" instance inside the Deco stage. Position is stored as
 * an offset from a named anchor on the Statling itself (`anchor` + `offsetX`/
 * `offsetY`, both normalized 0-1 stage fractions) rather than an absolute
 * stage coordinate — see lib/character-anchor.config.ts. Different
 * action/expression sprites draw the head/face/body in different spots (a
 * "look left" pose isn't idle's pose mirrored, it's a different drawing), so
 * an absolute (x, y) that looked right on idle drifted off the character
 * the moment its pose changed. Anchor + offset instead means "this far from
 * wherever the head/face/body currently is," which follows the character
 * across poses. `width`/`height` are the item's BASE (scale=1) box — the
 * effective on-screen size is always `width * scale` (aspect-locked, see
 * lib/deco-placement-layout.ts) — kept separate from `scale` so old
 * (position-only) saves migrate cleanly by just defaulting scale/rotation/
 * layer (see lib/deco-placement-storage.ts).
 */
export interface DecoPlacementItem {
  instanceId: string
  /** Matches SupportedDecoAsset.id — see lib/deco-supported-assets.ts. */
  itemId: string
  /** Which of the character's anchor points (lib/character-anchor.config.ts) this sticker's position is measured from. */
  anchor: CharacterAnchorKey
  /** Offset from the resolved anchor point, in the same normalized 0-1 stage units — see lib/deco-placement-layout.ts's applyDecoMove/applyDecoReanchor. */
  offsetX: number
  offsetY: number
  width: number
  height: number
  /** Uniform size multiplier applied on top of width/height — see DECO_SCALE_MIN/MAX in lib/deco-placement-layout.ts. */
  scale: number
  /** Degrees, wrapped into (-180, 180] — see lib/deco-placement-layout.ts#clampDecoRotation. */
  rotation: number
  /** Whether this sticker renders behind or in front of the Statling itself — see deco-canvas.tsx's layered z-index scheme. */
  layer: 'behind' | 'front'
  /** Left-right mirrored, same convention as lib/room/room-state.ts#RoomItem's `flipped` — see deco-item-handle.tsx. */
  flipped?: boolean
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
