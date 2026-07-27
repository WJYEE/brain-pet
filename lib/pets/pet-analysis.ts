import { STATS, STAT_DISPLAY_ORDER, type StatId } from '@/lib/brain-bet'
import type { PetProfile, StatVector } from '@/lib/pets/pet-profile'

/** All 6 stat ids ranked by a vector's value, highest first. */
export function rankStatsByVector(vector: StatVector): StatId[] {
  return [...STAT_DISPLAY_ORDER].sort((a, b) => vector[b] - vector[a])
}

/** The pet's own strongest stat, derived from its affinity vector (not a separately-authored field). */
export function getPetPrimaryStat(pet: PetProfile): StatId {
  return rankStatsByVector(pet.vector)[0]
}

/** The pet's own second-strongest stat. */
export function getPetSecondaryStat(pet: PetProfile): StatId {
  return rankStatsByVector(pet.vector)[1]
}

/** Korean subject particle (이/가) by whether the name's last syllable has a trailing consonant (batchim). Non-Hangul names fall back to 가. */
export function subjectParticle(name: string): '이' | '가' {
  const code = name.charCodeAt(name.length - 1) - 0xac00
  if (code < 0 || code > 11171) return '가'
  return code % 28 === 0 ? '가' : '이'
}

/**
 * Why this particular pet was selected — combines the user's actual top/
 * second stat with whether the pet's own strongest stat directly matches
 * either of them (a closer, more literal fit) or not (still the best
 * available match, just not a 1:1 overlap). Never repeats petProfile.tagline.
 */
export function buildSelectionReason(pet: PetProfile, topStat: StatId, secondaryStat: StatId): string {
  const petPrimary = getPetPrimaryStat(pet)
  const isDirectMatch = petPrimary === topStat || petPrimary === secondaryStat
  const closenessClause = isDirectMatch ? '꼭 닮아 있어서' : '가장 잘 어울려서'

  return `6개의 스탯을 모두 분석한 결과, ${STATS[topStat].name}과 ${STATS[secondaryStat].name}이 돋보이는 당신의 성향과 ${closenessClause}, ${pet.name}${subjectParticle(pet.name)} 대표 Statling으로 선택되었어요.`
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
    return '한 가지 능력에만 기대기보다, 상황에 맞춰 여러 강점을 골고루 꺼내 쓰는 타입이에요.'
  }
  if (gap >= DOMINANT_GAP_THRESHOLD) {
    return `${TRAIT_DESCRIPTOR[topStat]}. 집중할 목표가 분명할 때 가장 강한 힘을 발휘해요.`
  }
  return `${TRAIT_DESCRIPTOR[topStat]}. 동시에 ${TRAIT_DESCRIPTOR[secondaryStat]}.`
}
