import { characterIdlePath } from '@/lib/character-assets'
import type { StatId } from '@/lib/brain-bet'

/**
 * A pet's 6-stat affinity vector. Each value is normalized to the same 0–1
 * scale as a normalized user test result (see normalizeStatVector in
 * matching.ts), so the two can be compared directly.
 */
export type StatVector = Record<StatId, number>

export interface PetProfile {
  id: string
  /** Display name shown on the reveal screen. */
  name: string
  /** Real file path under public/assets/statling/characters — verified against the actual filenames on disk before wiring, never guessed. */
  imageSrc: string
  /** Stat affinity vector used for candidate matching. */
  vector: StatVector
  /** Short flavor line describing the pet itself (not the match reason). */
  tagline: string
}

/**
 * Sample catalog — 24 pets curated from the first cropped character sheet
 * (public/assets/statling/characters/pet_001.png..pet_024.png), each hand-assigned
 * a 6-stat affinity vector based on its visual theme. This is intentionally a
 * small seed set to validate the matching structure end-to-end; grow it by
 * appending more entries (up to pet_440.png is already on disk) once the
 * approach is confirmed — nothing else in the matching/storage code assumes
 * a fixed catalog size.
 */
export const PET_CATALOG: PetProfile[] = [
  {
    id: 'pet_001',
    name: '번개꼬리',
    imageSrc: characterIdlePath('pet_001'),
    tagline: '가만히 있질 못하고 늘 제일 먼저 튀어나가요.',
    vector: { reaction: 0.95, memory: 0.3, focus: 0.4, judgment: 0.35, spatial: 0.3, reasoning: 0.25 },
  },
  {
    id: 'pet_002',
    name: '책갈피토끼',
    imageSrc: characterIdlePath('pet_002'),
    tagline: '한 번 본 건 오래오래 기억해둬요.',
    vector: { reaction: 0.25, memory: 0.92, focus: 0.5, judgment: 0.35, spatial: 0.3, reasoning: 0.45 },
  },
  {
    id: 'pet_003',
    name: '부엉박사',
    imageSrc: characterIdlePath('pet_003'),
    tagline: '똑똑한 눈으로 규칙을 척척 짚어내요.',
    vector: { reaction: 0.2, memory: 0.75, focus: 0.45, judgment: 0.4, spatial: 0.35, reasoning: 0.9 },
  },
  {
    id: 'pet_004',
    name: '저울다람쥐',
    imageSrc: characterIdlePath('pet_004'),
    tagline: '망설임 없이 딱 잘라 결정해요.',
    vector: { reaction: 0.35, memory: 0.4, focus: 0.45, judgment: 0.93, spatial: 0.3, reasoning: 0.55 },
  },
  {
    id: 'pet_005',
    name: '얼음큐브',
    imageSrc: characterIdlePath('pet_005'),
    tagline: '흔들림 없이 한 곳에 오래 집중해요.',
    vector: { reaction: 0.3, memory: 0.35, focus: 0.92, judgment: 0.4, spatial: 0.45, reasoning: 0.3 },
  },
  {
    id: 'pet_006',
    name: '탐정냥이',
    imageSrc: characterIdlePath('pet_006'),
    tagline: '숨은 단서를 찾아 논리적으로 풀어내요.',
    vector: { reaction: 0.3, memory: 0.45, focus: 0.4, judgment: 0.8, spatial: 0.35, reasoning: 0.88 },
  },
  {
    id: 'pet_007',
    name: '천사폭신이',
    imageSrc: characterIdlePath('pet_007'),
    tagline: '어디 하나 치우치지 않고 두루 잘해요.',
    // Was {0.55,0.6,0.6,0.6,0.55,0.55} (spread 0.05) — the only near-flat
    // vector in the whole catalog. Cosine similarity is highest for
    // whichever vector points closest to the "average direction" of random
    // input, so a near-flat vector matches almost anything: this pet showed
    // up in the top-5 candidate pool on 97% of 300 simulated random draws
    // (next highest catalog entry: 40%), which is why QA Skip testing kept
    // landing on it. Widened to spread 0.35 (still the flattest/most
    // generalist-reading vector in the catalog — every other pet has a
    // single stat at 0.75+ — just no longer pathologically so); this alone
    // brings pool membership down to ~36%, in line with the rest of the
    // roster. See lib/game/mock-finals.ts and the QA Skip diversity check.
    vector: { reaction: 0.7, memory: 0.35, focus: 0.7, judgment: 0.35, spatial: 0.7, reasoning: 0.35 },
  },
  {
    id: 'pet_008',
    name: '그림자거미',
    imageSrc: characterIdlePath('pet_008'),
    tagline: '조용히 관찰하다가 정답을 딱 짚어요.',
    vector: { reaction: 0.4, memory: 0.4, focus: 0.7, judgment: 0.4, spatial: 0.5, reasoning: 0.8 },
  },
  {
    id: 'pet_009',
    name: '불꽃여우',
    imageSrc: characterIdlePath('pet_009'),
    tagline: '번쩍이는 순간을 절대 놓치지 않아요.',
    vector: { reaction: 0.9, memory: 0.25, focus: 0.35, judgment: 0.4, spatial: 0.3, reasoning: 0.3 },
  },
  {
    id: 'pet_010',
    name: '물방울이',
    imageSrc: characterIdlePath('pet_010'),
    tagline: '차분하게 모양을 요리조리 살펴봐요.',
    vector: { reaction: 0.35, memory: 0.3, focus: 0.8, judgment: 0.35, spatial: 0.75, reasoning: 0.3 },
  },
  {
    id: 'pet_011',
    name: '새싹사과',
    imageSrc: characterIdlePath('pet_011'),
    tagline: '머릿속에 지도를 그리듯 기억해요.',
    vector: { reaction: 0.3, memory: 0.7, focus: 0.4, judgment: 0.3, spatial: 0.8, reasoning: 0.4 },
  },
  {
    id: 'pet_012',
    name: '반짝별',
    imageSrc: characterIdlePath('pet_012'),
    tagline: '빠르게 보고 빠르게 골라내요.',
    vector: { reaction: 0.7, memory: 0.3, focus: 0.4, judgment: 0.8, spatial: 0.35, reasoning: 0.35 },
  },
  {
    id: 'pet_013',
    name: '구름솜',
    imageSrc: characterIdlePath('pet_013'),
    tagline: '느긋하지만 한번 본 건 잊지 않아요.',
    vector: { reaction: 0.25, memory: 0.8, focus: 0.75, judgment: 0.35, spatial: 0.4, reasoning: 0.4 },
  },
  {
    id: 'pet_014',
    name: '충직강아지',
    imageSrc: characterIdlePath('pet_014'),
    tagline: '빠르고 씩씩하게 바로바로 결정해요.',
    vector: { reaction: 0.8, memory: 0.4, focus: 0.45, judgment: 0.75, spatial: 0.3, reasoning: 0.3 },
  },
  {
    id: 'pet_015',
    name: '펭귄지기',
    imageSrc: characterIdlePath('pet_015'),
    tagline: '집중해서 지켜보다 정확하게 판단해요.',
    vector: { reaction: 0.35, memory: 0.4, focus: 0.82, judgment: 0.78, spatial: 0.35, reasoning: 0.35 },
  },
  {
    id: 'pet_016',
    name: '볼주머니햄찌',
    imageSrc: characterIdlePath('pet_016'),
    tagline: '차곡차곡 모아두고 위치까지 기억해요.',
    vector: { reaction: 0.3, memory: 0.85, focus: 0.4, judgment: 0.35, spatial: 0.7, reasoning: 0.35 },
  },
  {
    id: 'pet_017',
    name: '아기드래곤',
    imageSrc: characterIdlePath('pet_017'),
    tagline: '입체적으로 상상하고 규칙도 잘 찾아요.',
    vector: { reaction: 0.4, memory: 0.35, focus: 0.45, judgment: 0.4, spatial: 0.85, reasoning: 0.8 },
  },
  {
    id: 'pet_018',
    name: '실뭉치냥이',
    imageSrc: characterIdlePath('pet_018'),
    tagline: '놀이처럼 재빠르게 집중해요.',
    vector: { reaction: 0.75, memory: 0.3, focus: 0.7, judgment: 0.35, spatial: 0.4, reasoning: 0.3 },
  },
  {
    id: 'pet_019',
    name: '판다곰돌',
    imageSrc: characterIdlePath('pet_019'),
    tagline: '느긋하게, 그러나 오래 집중해요.',
    vector: { reaction: 0.25, memory: 0.75, focus: 0.85, judgment: 0.35, spatial: 0.35, reasoning: 0.35 },
  },
  {
    id: 'pet_020',
    name: '가시밤톨',
    imageSrc: characterIdlePath('pet_020'),
    tagline: '꼼꼼히 기억하고 신중하게 결정해요.',
    vector: { reaction: 0.3, memory: 0.78, focus: 0.5, judgment: 0.75, spatial: 0.35, reasoning: 0.4 },
  },
  {
    id: 'pet_021',
    name: '웃는아홀로틀',
    imageSrc: characterIdlePath('pet_021'),
    tagline: '느긋하게 헤엄치듯 규칙을 파악해요.',
    vector: { reaction: 0.3, memory: 0.4, focus: 0.5, judgment: 0.35, spatial: 0.8, reasoning: 0.72 },
  },
  {
    id: 'pet_022',
    name: '무지개유니콘',
    imageSrc: characterIdlePath('pet_040'),
    tagline: '상상력이 풍부하고 추리도 즐겨요.',
    vector: { reaction: 0.35, memory: 0.45, focus: 0.4, judgment: 0.4, spatial: 0.82, reasoning: 0.85 },
  },
  {
    id: 'pet_023',
    name: '수달친구',
    imageSrc: characterIdlePath('pet_023'),
    tagline: '재빠르게 움직이며 오래 몰입해요.',
    vector: { reaction: 0.7, memory: 0.35, focus: 0.78, judgment: 0.4, spatial: 0.4, reasoning: 0.3 },
  },
  {
    id: 'pet_024',
    name: '눈꽃여우',
    imageSrc: characterIdlePath('pet_024'),
    tagline: '차분하게 공간을 살피고 추리해요.',
    vector: { reaction: 0.35, memory: 0.4, focus: 0.45, judgment: 0.4, spatial: 0.78, reasoning: 0.75 },
  },
]

export function getPetProfileById(id: string): PetProfile | undefined {
  return PET_CATALOG.find((pet) => pet.id === id)
}
