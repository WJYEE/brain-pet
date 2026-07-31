import { getOrCreateDeviceId } from '@/lib/room/room-storage'
import { createInitialPetMemory, discardStalePendingGameReaction, type PetMemory } from '@/lib/pet-care/pet-memory'

function petMemoryStorageKey(deviceId: string): string {
  return `statling:petMemory:${deviceId}`
}

/** Minimal structural check — anything short of this is treated as corrupt (fresh memory), never thrown from. */
function isWellFormed(value: Record<string, unknown>): boolean {
  return (
    typeof value.firstMetAt === 'string' &&
    typeof value.lastVisitedAt === 'string' &&
    typeof value.totalVisits === 'number' &&
    typeof value.careActionCounts === 'object' &&
    value.careActionCounts !== null
  )
}

/**
 * No real schema migrations exist yet (this is the first version), but the
 * shape is split out — same as lib/pets/pet-storage.ts's `migrateLegacy` — so
 * a future field rename/retype has a designated place to branch instead of
 * papering over it in loadPetMemory. Spreading over createInitialPetMemory()
 * already backfills any newly-added field for existing saved data.
 */
export function migratePetMemory(raw: unknown, now: Date): PetMemory {
  const fallback = createInitialPetMemory(now)
  if (!raw || typeof raw !== 'object') return fallback

  const value = raw as Record<string, unknown>
  if (!isWellFormed(value)) return fallback

  const merged: PetMemory = { ...fallback, ...(value as unknown as PetMemory), version: 1 }
  return discardStalePendingGameReaction(merged, now)
}

export function loadPetMemory(now: Date = new Date()): PetMemory {
  if (typeof window === 'undefined') return createInitialPetMemory(now)
  try {
    const raw = window.localStorage.getItem(petMemoryStorageKey(getOrCreateDeviceId()))
    if (!raw) return createInitialPetMemory(now)
    return migratePetMemory(JSON.parse(raw), now)
  } catch {
    return createInitialPetMemory(now)
  }
}

export function savePetMemory(memory: PetMemory): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(petMemoryStorageKey(getOrCreateDeviceId()), JSON.stringify(memory))
}
