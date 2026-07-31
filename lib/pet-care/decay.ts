import {
  DECAY_FLOOR,
  DECAY_PER_HOUR,
  MAX_OFFLINE_DECAY_MS,
  ROOM_CLEANLINESS_FLOOR,
  ROOM_DECAY_PER_HOUR,
  STAT_MAX,
  STAT_MIN,
} from '@/lib/config/pet-care.config'
import type { CareStatId, PetCareState, RoomCareState } from '@/lib/pet-care/types'

/** Rounds to a whole number (decay produces fractional values from per-ms rates) and clamps into [min,max] — every stat write goes through this, so displayed values are always clean integers. */
export function clampStat(value: number, min = STAT_MIN, max = STAT_MAX): number {
  return Math.min(max, Math.max(min, Math.round(value)))
}

/**
 * Pure decay step: lowers each stat by its per-hour rate times elapsed
 * hours, never below `floor`. Takes plain numbers (not Date/state) so it's
 * trivially unit-testable and has no notion of "now".
 */
export function applyElapsedDecay(
  stats: Record<CareStatId, number>,
  elapsedMs: number,
  rates: Record<CareStatId, number>,
  floors: Record<CareStatId, number>,
): Record<CareStatId, number> {
  const elapsedHours = Math.max(0, elapsedMs) / (60 * 60 * 1000)
  const next = { ...stats }
  for (const key of Object.keys(rates) as CareStatId[]) {
    if (key === 'happiness') continue // derived below, never decayed directly by a flat rate
    const decayed = stats[key] - rates[key] * elapsedHours
    next[key] = clampStat(decayed, floors[key])
  }
  // happiness drifts toward a neutral midpoint when the other stats it depends on are low,
  // rather than decaying on its own timer — nudge it down slightly if satiety/cleanliness/energy
  // are already under their attention range, capped by its own floor.
  const distressed = next.satiety < 40 || next.cleanliness < 40 || next.energy < 30
  if (distressed) {
    const happinessDrift = 1 * elapsedHours
    next.happiness = clampStat(stats.happiness - happinessDrift, floors.happiness)
  }
  return next
}

/**
 * Applies decay for the time between `state.lastUpdatedAt` and `now`,
 * capped at MAX_OFFLINE_DECAY_MS so a multi-day absence never reads as
 * "abandoned pet". `now` is always passed in (never read internally) so
 * this stays a pure, testable function.
 */
export function applyPetDecay(state: PetCareState, now: Date): PetCareState {
  const last = new Date(state.lastUpdatedAt).getTime()
  const elapsedMs = Math.min(Math.max(0, now.getTime() - last), MAX_OFFLINE_DECAY_MS)
  if (elapsedMs <= 0) return state
  return {
    ...state,
    stats: applyElapsedDecay(state.stats, elapsedMs, DECAY_PER_HOUR, DECAY_FLOOR),
    lastUpdatedAt: now.toISOString(),
  }
}

/**
 * `lastCleanedAt` doubles as the rolling decay baseline (bumped here, and
 * again by the actual clean action) — not strictly "the last time the room
 * was cleaned". Mirrors how PetCareState.lastUpdatedAt is bumped on every
 * decay application, so repeated calls never double-count the same elapsed
 * window twice.
 */
export function applyRoomDecay(room: RoomCareState, now: Date): RoomCareState {
  const last = new Date(room.lastCleanedAt).getTime()
  const elapsedMs = Math.min(Math.max(0, now.getTime() - last), MAX_OFFLINE_DECAY_MS)
  if (elapsedMs <= 0) return room
  const elapsedHours = elapsedMs / (60 * 60 * 1000)
  return {
    cleanliness: clampStat(room.cleanliness - ROOM_DECAY_PER_HOUR * elapsedHours, ROOM_CLEANLINESS_FLOOR),
    lastCleanedAt: now.toISOString(),
  }
}
