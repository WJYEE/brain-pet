import type { StatId } from '@/lib/brain-bet'
import { generatePetSeed, getTopCandidates, normalizeStatVector, orderCandidatesBySeed } from '@/lib/pets/matching'
import { getPetProfileById, PET_CATALOG, type PetProfile } from '@/lib/pets/pet-profile'
import { MAX_REROLLS, type StoredPetProfile } from '@/lib/pets/pet-storage'

/**
 * First-ever assignment — or a redo for a user who replayed the 6 tests
 * before ever confirming a pet (no representative pet exists yet to protect,
 * so a fresh match against the new finals is fine). Always starts unconfirmed
 * at candidate index 0. Pass the user's existing seed when one already exists
 * so the same seed keeps producing the same deterministic order even though
 * the finals changed; omit it to generate a brand new one.
 */
export function beginPetAssignment(
  finals: Record<StatId, number>,
  seed: string = generatePetSeed(),
): StoredPetProfile {
  const candidates = getTopCandidates(normalizeStatVector(finals), PET_CATALOG)
  const order = orderCandidatesBySeed(candidates, seed)
  const now = new Date().toISOString()

  return {
    seed,
    confirmed: false,
    initialFinals: finals,
    latestFinals: finals,
    candidatePetIds: order.map((pet) => pet.id),
    viewedPetIds: [order[0].id],
    currentCandidateIndex: 0,
    rerollCount: 0,
    maxRerolls: MAX_REROLLS,
    createdAt: now,
    updatedAt: now,
  }
}

/** Advances to the next unseen candidate. No-op (returns the same reference) once confirmed or once the reroll budget is spent. */
export function rerollPet(stored: StoredPetProfile): StoredPetProfile {
  if (stored.confirmed) return stored
  if (stored.rerollCount >= stored.maxRerolls) return stored
  const nextIndex = stored.currentCandidateIndex + 1
  if (nextIndex >= stored.candidatePetIds.length) return stored

  return {
    ...stored,
    currentCandidateIndex: nextIndex,
    viewedPetIds: [...stored.viewedPetIds, stored.candidatePetIds[nextIndex]],
    rerollCount: stored.rerollCount + 1,
    updatedAt: new Date().toISOString(),
  }
}

/** Locks in whichever pet is currently on screen as the permanent representative pet. No-op once already confirmed. */
export function confirmPet(stored: StoredPetProfile): StoredPetProfile {
  if (stored.confirmed) return stored
  const now = new Date().toISOString()
  return {
    ...stored,
    confirmed: true,
    petId: stored.candidatePetIds[stored.currentCandidateIndex],
    updatedAt: now,
    confirmedAt: now,
  }
}

/** Replaying the 6 tests after already confirming — refreshes growth data only, never the pet itself. */
export function refreshGrowthData(
  stored: StoredPetProfile,
  finals: Record<StatId, number>,
): StoredPetProfile {
  return { ...stored, latestFinals: finals, updatedAt: new Date().toISOString() }
}

/**
 * The PetProfile that should be on screen right now: the confirmed pet once
 * locked in, otherwise the current candidate. Falls back to the catalog's
 * first entry if the stored id doesn't resolve (e.g. the catalog shrank) so
 * a stale/corrupt id can never break rendering.
 */
export function resolveCurrentPetProfile(stored: StoredPetProfile): PetProfile {
  const id = stored.confirmed ? stored.petId : stored.candidatePetIds[stored.currentCandidateIndex]
  if (!id) return PET_CATALOG[0]
  return getPetProfileById(id) ?? PET_CATALOG[0]
}
