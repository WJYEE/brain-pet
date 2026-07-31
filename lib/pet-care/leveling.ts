/**
 * Care/intimacy leveling — deliberately separate from the unrelated 6-stat
 * cognitive "성장" (growth) system (GrowScreen/egg-growth.ts). Naming here
 * (`intimacyLevel`/`intimacyExp`) never reuses "성장"/"growth" wording so the
 * two systems stay unambiguous in UI copy and code.
 */

/** exp required to go from level N to N+1 — index 0 is Lv1→2. Uncapped levels beyond the table fall back to a formula. */
const EXP_TO_NEXT_LEVEL_TABLE = [20, 40, 70, 110, 160, 220, 290, 370, 460]

export function expRequiredForLevel(level: number): number {
  const index = level - 1
  if (index < EXP_TO_NEXT_LEVEL_TABLE.length) return EXP_TO_NEXT_LEVEL_TABLE[index]
  // Beyond the hand-tuned table: keep the same upward curve going (+90 per level over the last table step).
  const last = EXP_TO_NEXT_LEVEL_TABLE[EXP_TO_NEXT_LEVEL_TABLE.length - 1]
  const stepsPastTable = index - (EXP_TO_NEXT_LEVEL_TABLE.length - 1)
  return last + stepsPastTable * 90
}

export interface ExpGainResult {
  level: number
  exp: number
  leveledUp: boolean
  /** Every level actually crossed this gain (usually 0 or 1 entries, but a huge gain could cross several). */
  levelsGained: number[]
}

export function applyExpGain(current: { intimacyLevel: number; intimacyExp: number }, gained: number): ExpGainResult {
  let level = current.intimacyLevel
  let exp = current.intimacyExp + Math.max(0, gained)
  const levelsGained: number[] = []

  let needed = expRequiredForLevel(level)
  while (exp >= needed) {
    exp -= needed
    level += 1
    levelsGained.push(level)
    needed = expRequiredForLevel(level)
  }

  return { level, exp, leveledUp: levelsGained.length > 0, levelsGained }
}

export type RewardType = 'dialogueTone' | 'idleMotion' | 'accessorySlot' | 'roomItem' | 'expression'

export interface RewardUnlock {
  level: number
  type: RewardType
  id: string
  title: string
  description: string
}

/**
 * Extensible unlock table. Most of these are intentionally thin hooks for
 * this scope: Lv2's tone shift is actually driven by DialogueLine's own
 * `minIntimacyLevel` filter (see dialogue.ts), Lv3 swaps in an idle motion
 * variant, and Lv5/7/10 currently only surface a Toast — the accessory
 * slot / room item / special expression payloads themselves are future
 * scope, `type` just marks where that would plug in.
 */
export const REWARD_UNLOCKS: RewardUnlock[] = [
  { level: 2, type: 'dialogueTone', id: 'lv2-casual-tone', title: '더 친근한 말투 해금!', description: '이제 조금 더 편하게 이야기해줄 거예요.' },
  { level: 3, type: 'idleMotion', id: 'lv3-idle-variant', title: '새로운 몸짓 해금!', description: '가만히 있을 때도 표정이 더 다양해졌어요.' },
  { level: 5, type: 'accessorySlot', id: 'lv5-accessory-slot', title: '액세서리 슬롯 해금!', description: '곧 꾸며줄 수 있게 될 거예요.' },
  { level: 7, type: 'roomItem', id: 'lv7-room-item', title: '방 꾸미기 아이템 해금!', description: '방에 놓을 특별한 아이템이 생겼어요.' },
  { level: 10, type: 'expression', id: 'lv10-expression', title: '특별한 표정 해금!', description: '아주 특별한 순간에만 보여줄 표정이에요.' },
]

/** Rewards newly crossed between fromLevel(exclusive) and toLevel(inclusive), minus ones already granted. */
export function getNewlyUnlockedRewards(fromLevel: number, toLevel: number, already: number[]): RewardUnlock[] {
  if (toLevel <= fromLevel) return []
  return REWARD_UNLOCKS.filter(
    (reward) => reward.level > fromLevel && reward.level <= toLevel && !already.includes(reward.level),
  )
}
