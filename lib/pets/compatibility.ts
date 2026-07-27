import type { StatId } from '@/lib/brain-bet'
import type { PetProfile } from '@/lib/pets/pet-profile'
import { rankStatsByVector } from '@/lib/pets/pet-analysis'

export interface StatCompatibility {
  goodMatches: StatId[]
  differentRhythms: StatId[]
}

/** Human-friendly "-형" label per stat, e.g. 순발력 -> 순발형. */
export const STAT_TYPE_LABEL: Record<StatId, string> = {
  reaction: '순발형',
  memory: '기억형',
  focus: '집중형',
  judgment: '판단형',
  spatial: '공간형',
  reasoning: '추리형',
}

/** Why a type complements the pet — framed as help, never as a ranking. */
const GOOD_MATCH_BLURB: Record<StatId, string> = {
  reaction: '망설이는 순간에 먼저 움직여서 속도를 붙여줘요.',
  memory: '빠르게 포착한 정보를 오래 유지하도록 보완해줘요.',
  focus: '흩어지기 쉬운 순간에 중심을 잡아줘요.',
  judgment: '몰입한 뒤 결정을 정리하는 데 도움을 줘요.',
  spatial: '머릿속 그림을 더 입체적으로 채워줘요.',
  reasoning: '숨은 규칙을 짚어내 다음 방향을 제안해줘요.',
}

/** Why a type has a different rhythm — framed as tempo/style difference, never as a bad match. */
const DIFFERENT_RHYTHM_BLURB: Record<StatId, string> = {
  reaction: '속도는 잘 맞지만 방향을 자주 바꾸면 피로할 수 있어요.',
  memory: '차근차근 쌓아가는 속도라 템포가 다르게 느껴질 수 있어요.',
  focus: '한 곳에 오래 머무는 편이라 리듬이 다르게 느껴질 수 있어요.',
  judgment: '충분히 생각한 뒤 움직이는 성향이라 템포 차이가 날 수 있어요.',
  spatial: '그림을 그리듯 천천히 살피는 편이라 속도 차이가 날 수 있어요.',
  reasoning: '규칙을 꼼꼼히 따지는 편이라 즉흥적인 흐름과는 결이 다를 수 있어요.',
}

/**
 * Derives compatibility purely from the pet's own 6-stat vector — no
 * per-pet hardcoded answers. Ranks all 6 stats by the pet's own vector, then:
 *  - drops the pet's own top 2 (its identity, not "another type" to compare against)
 *  - the next 2 (closer to the pet's own profile, but not quite it) become
 *    differentRhythms — similar-but-not-aligned tends to create tempo friction
 *  - the bottom 2 (the pet's weakest stats) become goodMatches — a type
 *    strong exactly where this pet is weak fills the gap
 * The two lists are disjoint slices of one ranking, so they can never overlap.
 */
export function getStatCompatibility(pet: PetProfile): StatCompatibility {
  const ranked = rankStatsByVector(pet.vector)
  const remaining = ranked.slice(2)
  return {
    differentRhythms: remaining.slice(0, 2),
    goodMatches: remaining.slice(2, 4),
  }
}

export function getStatTypeLabel(id: StatId): string {
  return STAT_TYPE_LABEL[id]
}

export function getGoodMatchBlurb(id: StatId): string {
  return GOOD_MATCH_BLURB[id]
}

export function getDifferentRhythmBlurb(id: StatId): string {
  return DIFFERENT_RHYTHM_BLURB[id]
}
