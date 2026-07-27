import { STAT_DISPLAY_ORDER, type StatId } from '@/lib/brain-bet'

/**
 * Dev/QA only — lets a developer generate a full 6-stat result without
 * playing all 6 mini-games, to test the pet-matching flow quickly. Never
 * used by the real gameplay path (see game-flow.tsx's onXComplete handlers,
 * which are untouched). Reuses the exact same `Record<StatId, number>` shape
 * real finals use — there is no separate test-only type.
 */
export type MockStatPreset =
  | 'random'
  | 'balanced'
  | 'focus'
  | 'reaction'
  | 'memory'
  | 'judgment'
  | 'spatial'
  | 'reasoning'

export const MOCK_STAT_PRESETS: MockStatPreset[] = [
  'random',
  'balanced',
  'focus',
  'reaction',
  'memory',
  'judgment',
  'spatial',
  'reasoning',
]

/** Every stat-specific preset's dominant + supporting stat (GAME_SPEC QA skip §C 2-7). */
const FOCUSED_PRESET_STATS: Partial<Record<MockStatPreset, { primary: StatId; secondary: StatId }>> = {
  focus: { primary: 'focus', secondary: 'reaction' },
  reaction: { primary: 'reaction', secondary: 'judgment' },
  memory: { primary: 'memory', secondary: 'focus' },
  judgment: { primary: 'judgment', secondary: 'reasoning' },
  spatial: { primary: 'spatial', secondary: 'reasoning' },
  reasoning: { primary: 'reasoning', secondary: 'memory' },
}

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

/** All 6 stats independently random across a wide band — can land anywhere, including near-flat or lopsided. */
function buildRandomPreset(rng: () => number): Record<StatId, number> {
  const result = {} as Record<StatId, number>
  for (const id of STAT_DISPLAY_ORDER) {
    result[id] = randInRange(rng, 35, 95)
  }
  return result
}

/** "랜덤 균형형" — all 6 stats in 55-85, nudged apart if they land too close together so there's still a visible top/bottom. */
function buildBalancedPreset(rng: () => number): Record<StatId, number> {
  const result = {} as Record<StatId, number>
  for (const id of STAT_DISPLAY_ORDER) {
    result[id] = randInRange(rng, 55, 85)
  }

  const MIN_SPREAD = 10
  let maxId = STAT_DISPLAY_ORDER[0]
  let minId = STAT_DISPLAY_ORDER[0]
  for (const id of STAT_DISPLAY_ORDER) {
    if (result[id] > result[maxId]) maxId = id
    if (result[id] < result[minId]) minId = id
  }
  if (maxId !== minId && result[maxId] - result[minId] < MIN_SPREAD) {
    result[maxId] = Math.min(85, result[maxId] + MIN_SPREAD)
    result[minId] = Math.max(55, result[minId] - MIN_SPREAD)
  }
  return result
}

/** A stat-specific preset: primary stat high, secondary stat moderately high, the rest mid-range. */
function buildFocusedPreset(rng: () => number, primary: StatId, secondary: StatId): Record<StatId, number> {
  const result = {} as Record<StatId, number>
  for (const id of STAT_DISPLAY_ORDER) {
    if (id === primary) result[id] = randInRange(rng, 80, 95)
    else if (id === secondary) result[id] = randInRange(rng, 65, 80)
    else result[id] = randInRange(rng, 40, 65)
  }
  return result
}

/**
 * Generates a full 6-stat result for the QA skip path — same
 * `Record<StatId, number>` shape and (48-95-ish) scale as a real playthrough,
 * so getTopStat/matching.ts/pet-flow.ts all treat it identically to a real
 * result. Pass `seed` to get a reproducible result for a given preset;
 * omit it for a genuinely fresh random result each call.
 */
export function generateMockFinals(preset: MockStatPreset = 'random', seed?: string): Record<StatId, number> {
  const resolvedSeed = seed ?? `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const rng = mulberry32(hashStringToInt(resolvedSeed))

  const finals =
    preset === 'balanced'
      ? buildBalancedPreset(rng)
      : preset === 'random'
        ? buildRandomPreset(rng)
        : buildFocusedPreset(rng, FOCUSED_PRESET_STATS[preset]!.primary, FOCUSED_PRESET_STATS[preset]!.secondary)

  if (process.env.NODE_ENV !== 'production') {
    const line = STAT_DISPLAY_ORDER.map((id) => `${id} ${finals[id]}`).join(', ')
    // eslint-disable-next-line no-console -- intentional dev-only QA log, guarded out of production above
    console.log(`[Statling QA Skip] generated finals (${preset}, seed=${resolvedSeed}):\n${line}`)
  }

  return finals
}
