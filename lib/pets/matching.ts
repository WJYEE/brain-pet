import { STAT_DISPLAY_ORDER, type StatId } from '@/lib/brain-bet'
import type { PetProfile, StatVector } from '@/lib/pets/pet-profile'

/** Final Stat values are on a 0–100 scale (real per-stat gameScore, see game-flow.tsx) — normalize to 0–1 so they're directly comparable to a PetProfile.vector. */
const STAT_SCALE_MAX = 100

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

/** Converts the raw 0–100 Final Stat map into a 0–1 StatVector for matching. */
export function normalizeStatVector(finals: Record<StatId, number>): StatVector {
  return Object.fromEntries(
    STAT_DISPLAY_ORDER.map((id) => [id, clamp01((finals[id] ?? 0) / STAT_SCALE_MAX)]),
  ) as StatVector
}

/** Cosine similarity — compares the *shape* of two stat vectors regardless of overall magnitude. */
function cosineSimilarity(a: StatVector, b: StatVector): number {
  let dot = 0
  let normA = 0
  let normB = 0
  for (const id of STAT_DISPLAY_ORDER) {
    dot += a[id] * b[id]
    normA += a[id] ** 2
    normB += b[id] ** 2
  }
  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

/** How many top candidates the final pick is drawn from. */
export const CANDIDATE_POOL_SIZE = 5

/** Returns the catalog's top N pets by similarity to the user's vector, best first. */
export function getTopCandidates(
  userVector: StatVector,
  catalog: PetProfile[],
  count: number = CANDIDATE_POOL_SIZE,
): PetProfile[] {
  return [...catalog]
    .map((pet) => ({ pet, score: cosineSimilarity(userVector, pet.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(count, catalog.length))
    .map(({ pet }) => pet)
}

/** Deterministic string hash (djb2) so the same seed always resolves to the same candidate index. */
function hashSeed(seed: string): number {
  let hash = 5381
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 33) ^ seed.charCodeAt(i)
  }
  return hash >>> 0
}

/**
 * Deterministic seed-based ordering of a candidate pool — same seed (and same
 * candidate pool) always produces the same order, so the reroll flow always
 * reveals candidates in a fixed sequence for a given user (GAME_SPEC: no
 * randomness once a seed exists, only "next unseen candidate").
 */
export function orderCandidatesBySeed(candidates: PetProfile[], seed: string): PetProfile[] {
  return candidates
    .map((pet) => ({ pet, key: hashSeed(`${seed}:${pet.id}`) }))
    .sort((a, b) => a.key - b.key)
    .map(({ pet }) => pet)
}

/** Picks exactly one pet out of the candidate pool, deterministically from the user's seed — the first entry of the seeded order. */
export function pickFinalPet(candidates: PetProfile[], seed: string): PetProfile {
  return orderCandidatesBySeed(candidates, seed)[0]
}

/** Generates a fresh per-user seed — called once, the first time a pet is ever assigned. */
export function generatePetSeed(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `seed_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}
