import { ROOM_ASSETS, type RoomAsset } from '@/lib/room-assets'

/** Where one item sits within the (square) Room Stage — all percentage-based so layout survives both mobile and desktop without pixel coordinates. */
export interface RoomPlacement {
  /** Center position of the item, as a percentage of the Room Stage's own width/height (0-100). */
  xPercent: number
  yPercent: number
  /** Rendered width as a percentage of the Room Stage's width — height follows the asset's real aspect ratio (object-fit: contain), so nothing is ever stretched. */
  widthPercent: number
  /** Stacking order. Background is always implicitly 0; Statling + its contact shadow are rendered by RoomStage itself at 35/40 — keep custom item z-index below 35 unless something is deliberately meant to sit in front of the character. */
  zIndex: number
}

export interface RoomPresetItem {
  asset: RoomAsset
  placement: RoomPlacement
}

export interface RoomPreset {
  id: string
  name: string
  background: RoomAsset
  items: RoomPresetItem[]
}

/**
 * Per-asset fine-tune multiplier — every entry starts at 1. Adjust only the
 * specific asset(s) that end up reading visually smaller/larger than their
 * neighbors once seen on a real screen (some source PNGs carry more/less
 * internal transparent padding than their siblings). Never resizes the
 * source file — this only scales the on-screen <img>. Keyed by RoomAsset id
 * (lib/room-assets.ts), so the same override applies everywhere that asset
 * is used across presets.
 */
export const ROOM_ASSET_SCALE: Record<string, number> = {
  'wood-background': 1,
  'wood-rug': 1,
  'wood-drawer': 1,
  'wood-plant': 1,
  'shelf-2': 1,
  'tree-frame': 1,
  'green-background': 1,
  'green-rug': 1,
  'green-drawer': 1,
  'green-lantern': 1,
  'plant-7': 1,
  'shelf-4': 1,
  'clover-frame': 1,
  'pink-rug': 1,
  'pink-drawer': 1,
  'pink-plant': 1,
  'shelf-5': 1,
  'rabbit-frame': 1,
}

function scaleOf(assetId: string): number {
  return ROOM_ASSET_SCALE[assetId] ?? 1
}

function item(assetId: string, placement: RoomPlacement): RoomPresetItem {
  return { asset: ROOM_ASSETS[assetId], placement }
}

/**
 * Warm Wood — the default preset actually shown in RoomScreen right now.
 * Deliberately minimal (1 shelf, 1 storage piece, 1 plant, 1 wall frame, 1
 * rug) rather than using every available asset, so the room reads as an
 * uncluttered space with the Statling as the clear focal point. No window
 * layer: wood_back-Photoroom.png already draws its own window into the wall
 * art, so layering windows/wood_window.png on top would show two windows.
 * No lantern: furniture/wood_lantern.png is a mislabeled duplicate of
 * plants/wood_plant.png (see room-assets.ts), not an actual lamp graphic —
 * omitted rather than shipping a visibly duplicated plant.
 */
export const WARM_WOOD_PRESET: RoomPreset = {
  id: 'warm-wood',
  name: '따뜻한 우드',
  background: ROOM_ASSETS['wood-background'],
  items: [
    item('shelf-2', { xPercent: 72, yPercent: 20, widthPercent: 26, zIndex: 15 }),
    item('tree-frame', { xPercent: 46, yPercent: 14, widthPercent: 10, zIndex: 15 }),
    item('wood-drawer', { xPercent: 15, yPercent: 62, widthPercent: 20, zIndex: 25 }),
    item('wood-plant', { xPercent: 86, yPercent: 60, widthPercent: 13, zIndex: 25 }),
    item('wood-rug', { xPercent: 50, yPercent: 76, widthPercent: 44, zIndex: 20 }),
  ],
}

/**
 * Forest Green — data-defined for future preset selection, not yet rendered
 * by any screen. Unlike Warm Wood, green_lantern.png is a real, correctly-
 * drawn lamp graphic, so this preset can afford both a lantern and a plant.
 */
export const FOREST_GREEN_PRESET: RoomPreset = {
  id: 'forest-green',
  name: '포레스트 그린',
  background: ROOM_ASSETS['green-background'],
  items: [
    item('shelf-4', { xPercent: 72, yPercent: 20, widthPercent: 27, zIndex: 15 }),
    item('clover-frame', { xPercent: 46, yPercent: 14, widthPercent: 9, zIndex: 15 }),
    item('green-drawer', { xPercent: 15, yPercent: 62, widthPercent: 19, zIndex: 25 }),
    item('green-lantern', { xPercent: 15, yPercent: 40, widthPercent: 10, zIndex: 26 }),
    item('plant-7', { xPercent: 86, yPercent: 62, widthPercent: 12, zIndex: 25 }),
    item('green-rug', { xPercent: 50, yPercent: 76, widthPercent: 44, zIndex: 20 }),
  ],
}

/**
 * Pastel Pink — data-defined for future preset selection, not yet rendered
 * by any screen. No pink background PNG exists in the current asset set, so
 * this reuses wood-background as the most neutral available option (per
 * spec: "없다면 존재하지 않는 경로를 만들지 말고 가장 중립적인 배경을 사용")
 * rather than inventing a path. That background's own baked-in window has
 * green curtains, a known cosmetic mismatch flagged in the completion
 * report rather than hidden.
 */
export const PASTEL_PINK_PRESET: RoomPreset = {
  id: 'pastel-pink',
  name: '파스텔 핑크',
  background: ROOM_ASSETS['wood-background'],
  items: [
    item('shelf-5', { xPercent: 72, yPercent: 20, widthPercent: 28, zIndex: 15 }),
    item('rabbit-frame', { xPercent: 46, yPercent: 14, widthPercent: 10, zIndex: 15 }),
    item('pink-drawer', { xPercent: 15, yPercent: 62, widthPercent: 19, zIndex: 25 }),
    item('pink-plant', { xPercent: 86, yPercent: 60, widthPercent: 12, zIndex: 25 }),
    item('pink-rug', { xPercent: 50, yPercent: 76, widthPercent: 44, zIndex: 20 }),
  ],
}

export const ROOM_PRESETS: RoomPreset[] = [WARM_WOOD_PRESET, FOREST_GREEN_PRESET, PASTEL_PINK_PRESET]

export { scaleOf }
