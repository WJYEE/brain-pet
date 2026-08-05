import { STAT_DISPLAY_ORDER, type StatId } from '@/lib/brain-bet'
import type { PetProfile, StatVector } from '@/lib/pets/pet-profile'

/** All 6 stat ids ranked by a vector's value, highest first. */
export function rankStatsByVector(vector: StatVector): StatId[] {
  return [...STAT_DISPLAY_ORDER].sort((a, b) => vector[b] - vector[a])
}

/** The pet's own second-strongest stat. */
export function getPetSecondaryStat(pet: PetProfile): StatId {
  return rankStatsByVector(pet.vector)[1]
}

/** Short "~하는" clause per stat, composable into 1-2 sentence trait summaries. */
const TRAIT_DESCRIPTOR: Record<StatId, string> = {
  reaction: '변화에는 빠르게 반응해요',
  memory: '한 번 본 것은 오래 붙잡아둬요',
  focus: '한 가지 목표에는 깊게 몰입해요',
  judgment: '상황은 빠르게 정리해서 결정해요',
  spatial: '머릿속으로는 그림을 그리듯 파악해요',
  reasoning: '숨은 규칙은 잘 찾아내요',
}

/** Below this stdev, the 6 finals read as "roughly even" rather than having a clear peak. */
const BALANCE_STDEV_THRESHOLD = 8
/** At/above this gap between top and second stat, the top stat reads as a clear standout rather than a close pair. */
const DOMINANT_GAP_THRESHOLD = 15

/**
 * "핵심 성향" — built from the user's actual 6 finals (never the pet's
 * vector): how spread out the 6 stats are decides whether this reads as
 * "balanced", "one clear standout", or "two stats working together".
 */
export function buildCoreTraitSummary(
  finals: Record<StatId, number>,
  topStat: StatId,
  secondaryStat: StatId,
): string {
  const values = STAT_DISPLAY_ORDER.map((id) => finals[id] ?? 0)
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  const stdev = Math.sqrt(variance)
  const gap = (finals[topStat] ?? 0) - (finals[secondaryStat] ?? 0)

  if (stdev < BALANCE_STDEV_THRESHOLD) {
    return '나는 한 가지 능력에만 기대기보다, 상황에 맞춰 여러 강점을 골고루 꺼내 쓰는 편이에요.'
  }
  if (gap >= DOMINANT_GAP_THRESHOLD) {
    return `나는 ${TRAIT_DESCRIPTOR[topStat]}. 집중할 목표가 분명할 때 가장 강한 힘을 발휘해요.`
  }
  return `나는 ${TRAIT_DESCRIPTOR[topStat]}. 동시에 ${TRAIT_DESCRIPTOR[secondaryStat]}.`
}
