import { getSupportedDecoAssetById } from '@/lib/deco-supported-assets'
import {
  clampDecoItemPosition,
  clampDecoLayer,
  clampDecoRotation,
  clampDecoScale,
  clampDecoWidth,
  DECO_SCALE_DEFAULT,
} from '@/lib/deco-placement-layout'
import { createDefaultDecoPlacementState, type DecoPlacementItem, type DecoPlacementState } from '@/lib/deco-placement-state'
import { getOrCreateDeviceId } from '@/lib/room/room-storage'

/**
 * Same per-device-id key convention as lib/room/room-storage.ts (see that
 * file's doc comment) — a real userId later is a one-line change here, not
 * a data-model change. localStorage today; swapping the load/save bodies
 * below for Supabase calls is the entire migration surface for this file.
 */
function decoStorageKey(deviceId: string): string {
  return `statling:deco:${deviceId}`
}

function isWellFormedRaw(value: Record<string, unknown>): value is Record<string, unknown> & { items: unknown } {
  return 'items' in value && Array.isArray(value.items)
}

function migrateDecoItem(rawItem: unknown): DecoPlacementItem | null {
  if (!rawItem || typeof rawItem !== 'object') return null
  const item = rawItem as Record<string, unknown>

  const itemId = typeof item.itemId === 'string' ? item.itemId : null
  const asset = itemId ? getSupportedDecoAssetById(itemId) : undefined
  if (!asset) return null // dropped from 1supported (or never existed) since this was saved — silently drop the placement, never guess a replacement

  const instanceId = typeof item.instanceId === 'string' ? item.instanceId : `${itemId}_${Math.random().toString(36).slice(2, 8)}`
  const width = clampDecoWidth(typeof item.width === 'number' ? item.width : 0.16)
  const height = width * (asset.naturalHeight / asset.naturalWidth)
  // A save from before scale/rotation/layer existed has none of these fields
  // — defaulting to scale=1, rotation=0, layer='front' here is exactly the
  // spec's migration rule for "기존 위치만 저장된 Deco 데이터".
  const scale = clampDecoScale(typeof item.scale === 'number' ? item.scale : DECO_SCALE_DEFAULT)
  const rotation = clampDecoRotation(typeof item.rotation === 'number' ? item.rotation : 0)
  const layer = clampDecoLayer(item.layer)
  const rawX = typeof item.x === 'number' ? item.x : 0.5
  const rawY = typeof item.y === 'number' ? item.y : 0.5
  const { x, y } = clampDecoItemPosition(rawX, rawY, width, height, scale, rotation)

  return { instanceId, itemId: asset.id, x, y, width, height, scale, rotation, layer }
}

/**
 * Defensively rebuilds a valid DecoPlacementState from whatever was in
 * storage — mirrors lib/room/room-storage.ts#migrateRoomState. An
 * unresolvable itemId (asset moved out of 1supported, or the catalog was
 * regenerated) just drops that one placement rather than corrupting the
 * whole state.
 */
export function migrateDecoPlacementState(raw: unknown): DecoPlacementState {
  const fallback = createDefaultDecoPlacementState()
  if (!raw || typeof raw !== 'object') return fallback

  const value = raw as Record<string, unknown>
  if (!isWellFormedRaw(value)) return fallback

  const items = (value.items as unknown[])
    .map((rawItem) => migrateDecoItem(rawItem))
    .filter((item): item is DecoPlacementItem => item !== null)

  const updatedAt = typeof value.updatedAt === 'string' ? value.updatedAt : fallback.updatedAt

  return { version: 1, items, updatedAt }
}

export function loadSavedDecoPlacementState(): DecoPlacementState {
  if (typeof window === 'undefined') return createDefaultDecoPlacementState()
  try {
    const raw = window.localStorage.getItem(decoStorageKey(getOrCreateDeviceId()))
    if (!raw) return createDefaultDecoPlacementState()
    return migrateDecoPlacementState(JSON.parse(raw))
  } catch {
    return createDefaultDecoPlacementState()
  }
}

export function saveDecoPlacementState(state: DecoPlacementState): DecoPlacementState {
  const toSave: DecoPlacementState = { ...state, updatedAt: new Date().toISOString() }
  if (typeof window === 'undefined') return toSave
  window.localStorage.setItem(decoStorageKey(getOrCreateDeviceId()), JSON.stringify(toSave))
  return toSave
}
