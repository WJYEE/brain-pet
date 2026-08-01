import { PLAY_ORDER, STAT_DISPLAY_ORDER, type StatId } from '@/lib/brain-bet'
import { CHARACTER_CATALOG, getPetProfileById, type PetProfile } from '@/lib/pets/pet-profile'

/**
 * Dev/QA only — lets a developer generate a full 6-stat result without
 * playing all 6 mini-games, to test the hatch flow quickly. Never used by
 * the real gameplay path (see game-flow.tsx's onXComplete handlers, which
 * are untouched). Reuses the exact same `Record<StatId, number>` shape real
 * finals use — there is no separate test-only type.
 *
 * 'random' produces a genuinely random 6-stat spread (any of the 30
 * characters could result). Every other preset is one of the 30 character
 * ids (see lib/pets/pet-profile.ts#CHARACTER_CATALOG) — picking one
 * generates finals engineered so that exact character's
 * (primaryStat, secondaryStat) wins top/second, guaranteeing that clicking
 * "01_치즈털실냥이" in the QA menu actually hatches 치즈털실냥이.
 */
export type MockStatPreset = 'random' | (typeof CHARACTER_CATALOG)[number]['id']

export const MOCK_STAT_PRESETS: MockStatPreset[] = ['random', ...CHARACTER_CATALOG.map((pet) => pet.id)]

/** Deterministic PRNG (mulberry32) so a given seed always reproduces the same finals. */
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Same djb2-style string hash used elsewhere in lib/pets — turns an arbitrary seed string into a PRNG seed int. */
function hashStringToInt(input: string): number {
  let hash = 5381
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i)
  }
  return hash >>> 0
}

function randInRange(rng: () => number, min: number, max: number): number {
  return Math.round(min + rng() * (max - min))
}

/** All 6 stats independently random across a wide band — can land anywhere, including near-flat or lopsided (which character results is intentionally unpredictable). */
function buildRandomPreset(rng: () => number): Record<StatId, number> {
  const result = {} as Record<StatId, number>
  for (const id of STAT_DISPLAY_ORDER) {
    result[id] = randInRange(rng, 35, 95)
  }
  return result
}

/**
 * A character-targeted preset: primaryStat clearly highest, secondaryStat
 * clearly second, the remaining 4 stats spread across distinct lower bands
 * (never touching secondaryStat's range) so no accidental tie can bump a
 * filler stat above the intended pair.
 */
function buildTargetedPreset(rng: () => number, pet: PetProfile): Record<StatId, number> {
  const result = {} as Record<StatId, number>
  result[pet.primaryStat] = randInRange(rng, 88, 95)
  result[pet.secondaryStat] = randInRange(rng, 70, 82)

  const fillerBands: Array<[number, number]> = [
    [55, 62],
    [45, 52],
    [35, 42],
    [25, 32],
  ]
  let i = 0
  for (const id of PLAY_ORDER) {
    if (id === pet.primaryStat || id === pet.secondaryStat) continue
    const [min, max] = fillerBands[i]
    result[id] = randInRange(rng, min, max)
    i += 1
  }
  return result
}

/**
 * Generates a full 6-stat result for the QA skip path — same
 * `Record<StatId, number>` shape and scale as a real playthrough, so
 * getTopStat/beginPetAssignment treat it identically to a real result. Pass
 * `seed` to get a reproducible result for a given preset; omit it for a
 * genuinely fresh random result each call.
 */
export function generateMockFinals(preset: MockStatPreset = 'random', seed?: string): Record<StatId, number> {
  const resolvedSeed = seed ?? `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const rng = mulberry32(hashStringToInt(resolvedSeed))

  const targetPet = preset === 'random' ? null : getPetProfileById(preset)
  const finals = targetPet ? buildTargetedPreset(rng, targetPet) : buildRandomPreset(rng)

  if (process.env.NODE_ENV !== 'production') {
    const line = STAT_DISPLAY_ORDER.map((id) => `${id} ${finals[id]}`).join(', ')
    // eslint-disable-next-line no-console -- intentional dev-only QA log, guarded out of production above
    console.log(`[Statling QA Skip] generated finals (${preset}, seed=${resolvedSeed}):\n${line}`)
  }

  return finals
}
