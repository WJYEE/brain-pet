import type { StatId } from '@/lib/brain-bet'

/**
 * v3: the representative pet is now decided immediately and deterministically
 * from (primaryStat, secondaryStat) against the 30-character roster (see
 * lib/pets/pet-flow.ts#beginPetAssignment) — there is no more candidate pool,
 * reroll, or seed. v2's candidatePetIds/viewedPetIds/currentCandidateIndex/
 * rerollCount/maxRerolls/seed fields are gone; topStat/secondStat are new
 * (the exact pair that decided petId, frozen once confirmed, same as petId
 * itself). Bumping the key is a clean, non-destructive reset — old v1/v2
 * data is simply abandoned in localStorage (never read, never deleted) and
 * every browser starts fresh on v3, consistent with the v1->v2 precedent.
 */
const STORAGE_KEY = 'statling.petProfile.v3'

/**
 * The persisted record for a user's representative pet. `petId` is set the
 * moment finals are known (beginPetAssignment) — no separate "not yet
 * decided" state exists since selection is a direct lookup, not a
 * multi-candidate pool. `confirmed` just marks whether the user has clicked
 * through past Reveal; nothing about the pet itself changes when it flips.
 *
 * `petId`/`topStat`/`secondStat` never change once `confirmed` is true —
 * replaying the 6 tests only refreshes `latestFinals`/`updatedAt` (growth
 * data), never the pet itself. Before confirmation, a redo of the 6 tests
 * calls beginPetAssignment again and can change all three together (a fresh
 * match against the new finals — no representative pet exists yet to
 * protect).
 */
export interface StoredPetProfile {
  /** The locked-in (or, pre-confirmation, provisional) representative pet — see lib/pets/pet-profile.ts#findCharacterByStats. */
  petId: string
  confirmed: boolean

  /** The exact stat pair that decided petId (see lib/brain-bet.ts#pickTopTwoStats) — persisted so the Reveal explanation and Room's stat badge stay stable across re-renders/reloads instead of re-rolling a fresh random tie-break on every read. */
  topStat: StatId
  secondStat: StatId

  /** The very first test result that decided this pet — kept for reference/explanation, never overwritten. */
  initialFinals: Record<StatId, number>
  /** Most recent test result — updated on every replay, used for growth tracking. */
  latestFinals: Record<StatId, number>

  createdAt: string
  updatedAt: string
  confirmedAt?: string

  /** The nickname given on the Naming screen, right after confirming — undefined until then. Persisted here (not just in-memory GameFlow state) so a reload after naming doesn't lose it. */
  statlingName?: string
}

/** Minimal structural check for the current-format record — anything short of this is treated as corrupt (fresh start), never thrown from. */
function isWellFormedCurrentShape(value: Record<string, unknown>): boolean {
  return (
    typeof value.petId === 'string' &&
    typeof value.confirmed === 'boolean' &&
    typeof value.topStat === 'string' &&
    typeof value.secondStat === 'string'
  )
}

export function loadStoredPetProfile(): StoredPetProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (!parsed || typeof parsed !== 'object') return null
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
 * Wipes the representative-pet record entirely, so the next assignment
 * starts completely fresh. Used by the QA Skip flow (see game-flow.tsx) —
 * both to silently clear a leftover *unconfirmed* record before each Skip
 * run, and as the explicit dev-only "대표 펫 초기화" reset action for
 * clearing a *confirmed* test pet between manual QA passes. Real gameplay
 * never calls this directly (see resetAllPetData in game-flow.tsx for the
 * real user-facing reset, which also clears care/memory state).
 */
export function clearStoredPetProfile(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
}
