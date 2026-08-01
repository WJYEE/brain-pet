import { pickTopTwoStats, type StatId } from '@/lib/brain-bet'
import { CHARACTER_CATALOG, findCharacterByStats, getPetProfileById, type PetProfile } from '@/lib/pets/pet-profile'
import type { StoredPetProfile } from '@/lib/pets/pet-storage'

/**
 * First-ever assignment — or a redo for a user who replayed the 6 tests
 * before ever confirming a pet (no representative pet exists yet to
 * protect, so a fresh match against the new finals is fine). Picks the top
 * two stats (random tie-break — see pickTopTwoStats) and looks up the one
 * character whose (primaryStat, secondaryStat) matches exactly; the pet is
 * decided immediately, no candidate pool or reroll involved.
 */
export function beginPetAssignment(finals: Record<StatId, number>): StoredPetProfile {
  const [topStat, secondStat] = pickTopTwoStats(finals)
  const pet = findCharacterByStats(topStat, secondStat)
  const now = new Date().toISOString()

  return {
    petId: pet.id,
    confirmed: false,
    topStat,
    secondStat,
    initialFinals: finals,
    latestFinals: finals,
    createdAt: now,
    updatedAt: now,
  }
}

/** Locks in the assigned pet as the permanent representative pet. No-op once already confirmed. */
export function confirmPet(stored: StoredPetProfile): StoredPetProfile {
  if (stored.confirmed) return stored
  const now = new Date().toISOString()
  return { ...stored, confirmed: true, updatedAt: now, confirmedAt: now }
}

/** Replaying the 6 tests after already confirming — refreshes growth data only, never the pet itself. */
export function refreshGrowthData(
  stored: StoredPetProfile,
  finals: Record<StatId, number>,
): StoredPetProfile {
  return { ...stored, latestFinals: finals, updatedAt: new Date().toISOString() }
}

/**
 * The PetProfile that should be on screen right now. Falls back to the
 * catalog's first entry if the stored id doesn't resolve (e.g. the catalog
 * changed) so a stale/corrupt id can never break rendering.
 */
export function resolveCurrentPetProfile(stored: StoredPetProfile): PetProfile {
  return getPetProfileById(stored.petId) ?? CHARACTER_CATALOG[0]
}
