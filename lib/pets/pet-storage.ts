import type { StatId } from '@/lib/brain-bet'

const STORAGE_KEY = 'statling.petProfile.v1'

/** Initial reveal + up to 2 rerolls = 3 pets seen total, all from the same top-5 similarity pool. */
export const MAX_REROLLS = 2

/**
 * The persisted record for a user's representative pet.
 *
 * Before confirmation, the pet on screen is tracked via
 * `candidatePetIds[currentCandidateIndex]` (one fixed, seed-ordered
 * permutation of the top-N similarity matches — see
 * lib/pets/matching.ts#orderCandidatesBySeed). `petId` only exists once
 * `confirmed` is true, and neither `petId` nor `seed` nor `candidatePetIds`
 * change after that — replaying the 6 tests only refreshes
 * `latestFinals`/`updatedAt` (growth data), never the pet itself.
 */
export interface StoredPetProfile {
  seed: string
  /** Only set once `confirmed` is true — the locked-in representative pet. */
  petId?: string
  confirmed: boolean

  /** The very first test result that decided this pet — kept for reference/explanation, never overwritten. */
  initialFinals: Record<StatId, number>
  /** Most recent test result — updated on every replay, used for growth tracking. */
  latestFinals: Record<StatId, number>

  /** Fixed, seed-ordered permutation of the top similarity candidates — set once at first assignment, never reshuffled. */
  candidatePetIds: string[]
  /** Candidate ids shown so far, in the order shown — always a prefix of candidatePetIds up to currentCandidateIndex. */
  viewedPetIds: string[]
  /** Index into candidatePetIds of the pet currently on screen (pre-confirmation). */
  currentCandidateIndex: number

  rerollCount: number
  maxRerolls: number

  createdAt: string
  updatedAt: string
  confirmedAt?: string
}

/** Shape written by the previous version of this feature, before the reroll flow existed. */
interface LegacyStoredPetProfile {
  seed: string
  petId: string
  initialFinals: Record<StatId, number>
  latestFinals: Record<StatId, number>
  createdAt: string
  updatedAt: string
}

function isLegacyShape(value: Record<string, unknown>): boolean {
  return typeof value.petId === 'string' && value.confirmed === undefined
}

/** A legacy record always represented an already-decided, never-changing pet — migrate it in as already confirmed. */
function migrateLegacy(legacy: LegacyStoredPetProfile): StoredPetProfile {
  return {
    seed: legacy.seed,
    petId: legacy.petId,
    confirmed: true,
    initialFinals: legacy.initialFinals,
    latestFinals: legacy.latestFinals,
    candidatePetIds: [legacy.petId],
    viewedPetIds: [legacy.petId],
    currentCandidateIndex: 0,
    rerollCount: 0,
    maxRerolls: MAX_REROLLS,
    createdAt: legacy.createdAt,
    updatedAt: legacy.updatedAt,
    confirmedAt: legacy.updatedAt,
  }
}

/** Minimal structural check for the current-format record — anything short of this is treated as corrupt (fresh start), never thrown from. */
function isWellFormedCurrentShape(value: Record<string, unknown>): boolean {
  return (
    typeof value.seed === 'string' &&
    typeof value.confirmed === 'boolean' &&
    Array.isArray(value.candidatePetIds) &&
    typeof value.currentCandidateIndex === 'number'
  )
}

export function loadStoredPetProfile(): StoredPetProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (!parsed || typeof parsed !== 'object') return null

    if (isLegacyShape(parsed)) {
      const migrated = migrateLegacy(parsed as unknown as LegacyStoredPetProfile)
      saveStoredPetProfile(migrated)
      return migrated
    }

    if (!isWellFormedCurrentShape(parsed)) return null
    return parsed as unknown as StoredPetProfile
  } catch {
    return null
  }
}

export function saveStoredPetProfile(profile: StoredPetProfile): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
}

/**
 * Wipes the representative-pet record entirely (seed included), so the next
 * assignment starts completely fresh. Used by the QA Skip flow (see
 * game-flow.tsx) — both to silently clear a leftover *unconfirmed* record
 * before each Skip run (so repeated Skips don't keep reusing the same seed
 * and converging on the same pet), and as the explicit dev-only "대표 펫
 * 초기화" reset action for clearing a *confirmed* test pet between manual
 * QA passes. Real gameplay never calls this.
 */
export function clearStoredPetProfile(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}
