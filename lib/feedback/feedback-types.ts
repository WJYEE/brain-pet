export type SatisfactionValue = 'very-satisfied' | 'satisfied' | 'neutral' | 'unsatisfied' | 'very-unsatisfied'

export type FavoritePartValue =
  | 'minigames'
  | 'stat-result'
  | 'pet-hatch'
  | 'pet-care'
  | 'room-decor'
  | 'character-design'
  | 'other'

export type ImprovementAreaValue =
  | 'intro-length'
  | 'minigame-difficulty'
  | 'stat-explanation'
  | 'ui-readability'
  | 'pet-interaction'
  | 'room-decor'
  | 'loading-errors'
  | 'other'

export type ReturnIntentValue = 'definitely' | 'sometimes' | 'unsure' | 'unlikely'

export const SATISFACTION_OPTIONS: { value: SatisfactionValue; label: string }[] = [
  { value: 'very-satisfied', label: '매우 만족' },
  { value: 'satisfied', label: '만족' },
  { value: 'neutral', label: '보통' },
  { value: 'unsatisfied', label: '아쉬움' },
  { value: 'very-unsatisfied', label: '매우 아쉬움' },
]

export const FAVORITE_PART_OPTIONS: { value: FavoritePartValue; label: string }[] = [
  { value: 'minigames', label: '미니게임' },
  { value: 'stat-result', label: '스탯 결과' },
  { value: 'pet-hatch', label: '펫 탄생' },
  { value: 'pet-care', label: '펫 돌보기' },
  { value: 'room-decor', label: '방 꾸미기' },
  { value: 'character-design', label: '캐릭터 디자인' },
  { value: 'other', label: '기타' },
]

export const IMPROVEMENT_AREA_OPTIONS: { value: ImprovementAreaValue; label: string }[] = [
  { value: 'intro-length', label: 'Intro 길이' },
  { value: 'minigame-difficulty', label: '미니게임 난이도' },
  { value: 'stat-explanation', label: '스탯 설명' },
  { value: 'ui-readability', label: 'UI 가독성' },
  { value: 'pet-interaction', label: '펫 상호작용' },
  { value: 'room-decor', label: '방 꾸미기' },
  { value: 'loading-errors', label: '로딩·오류' },
  { value: 'other', label: '기타' },
]

export const RETURN_INTENT_OPTIONS: { value: ReturnIntentValue; label: string }[] = [
  { value: 'definitely', label: '꼭 다시 사용하고 싶음' },
  { value: 'sometimes', label: '가끔 사용하고 싶음' },
  { value: 'unsure', label: '잘 모르겠음' },
  { value: 'unlikely', label: '다시 사용할 생각이 적음' },
]

/**
 * One user's feedback — always exactly one per device (see
 * lib/feedback/feedback-storage.ts#upsertFeedbackRecord: a new submission
 * UPDATEs this record rather than adding another one). `satisfaction`/
 * `favoritePart`/`improvementArea`/`returnIntent` are the four required
 * single-select questions; `comment` is the only optional field. No name/
 * contact field exists on purpose — the form itself warns against writing
 * personal info into `comment` (see feedback-section.tsx).
 *
 * `appVersion`/`deviceType`/`statlingId`/`statlingName` are captured
 * automatically (not asked of the user) — lightweight context for reading
 * feedback later, same idea as GameResult's own `device` field.
 * `submittedAt` is set once, at first submission, and never changes;
 * `updatedAt` moves on every re-submission — same initial/current split
 * convention as lib/pets/pet-storage.ts's initialFinals/latestFinals.
 */
export interface FeedbackRecord {
  id: string
  satisfaction: SatisfactionValue
  favoritePart: FavoritePartValue
  improvementArea: ImprovementAreaValue
  returnIntent: ReturnIntentValue
  comment: string
  appVersion: string
  deviceType: string
  /** The representative pet's catalog id at the time of this submission, if one exists yet — see lib/pets/pet-profile.ts. */
  statlingId: string | null
  statlingName: string | null
  submittedAt: string
  updatedAt: string
}

export type FeedbackDraft = {
  satisfaction: SatisfactionValue | null
  favoritePart: FavoritePartValue | null
  improvementArea: ImprovementAreaValue | null
  returnIntent: ReturnIntentValue | null
  comment: string
}

export function emptyFeedbackDraft(): FeedbackDraft {
  return { satisfaction: null, favoritePart: null, improvementArea: null, returnIntent: null, comment: '' }
}
