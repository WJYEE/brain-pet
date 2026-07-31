import { RECENT_DIALOGUE_HISTORY_SIZE } from '@/lib/config/pet-care.config'
import type { Mood } from '@/lib/pet-care/types'

export type DialogueCategory = Mood | 'levelUp'

export interface DialogueLine {
  id: string
  text: string
  /** Only enters the candidate pool once intimacyLevel reaches this — lets the same category read shy at Lv1 and playful at Lv5+. */
  minIntimacyLevel?: number
}

/**
 * 8 mood categories + a dedicated level-up category. Each has 5-10+ lines;
 * within a category, lines with no `minIntimacyLevel` are always-available
 * "cautious/short" defaults, and higher-`minIntimacyLevel` lines add
 * progressively more familiar/playful phrasing on top of that pool (never
 * replacing it) as intimacyLevel climbs — spec's "낮은 친밀도: 조심스럽고
 * 짧은 말투 / 높은 친밀도: 친근하고 장난스러운 말투".
 */
export const DIALOGUE_BANK: Record<DialogueCategory, DialogueLine[]> = {
  hungry: [
    { id: 'hungry-1', text: '배에서 꼬르륵 소리가 나요…' },
    { id: 'hungry-2', text: '저... 배가 좀 고픈 것 같아요.' },
    { id: 'hungry-3', text: '밥 먹을 시간 아닌가요?' },
    { id: 'hungry-4', text: '뭔가 먹고 싶어요.' },
    { id: 'hungry-5', text: '냄새... 맛있는 냄새가 나는 것 같기도 하고.' },
    { id: 'hungry-6', text: '밥 좀 주실래요? 헤헤.', minIntimacyLevel: 3 },
    { id: 'hungry-7', text: '배고파 죽겠어요! 얼른요!', minIntimacyLevel: 5 },
  ],
  dirty: [
    { id: 'dirty-1', text: '몸이 좀 찝찝해요…' },
    { id: 'dirty-2', text: '먼지가 묻은 것 같아요.' },
    { id: 'dirty-3', text: '씻고 싶어요.' },
    { id: 'dirty-4', text: '몸을 한번 털어볼까요...' },
    { id: 'dirty-5', text: '깨끗해지고 싶은 기분이에요.' },
    { id: 'dirty-6', text: '거품 목욕 어때요? 재밌을 것 같아요!', minIntimacyLevel: 3 },
    { id: 'dirty-7', text: '으엑, 저 좀 씻겨주세요!', minIntimacyLevel: 5 },
  ],
  lonely: [
    { id: 'lonely-1', text: '조금만 같이 있어줄래요?' },
    { id: 'lonely-2', text: '혼자 있으니 심심해요.' },
    { id: 'lonely-3', text: '...저 여기 있어요.' },
    { id: 'lonely-4', text: '누가 좀 봐줬으면 좋겠어요.' },
    { id: 'lonely-5', text: '옆에 있어주면 좋을 것 같아요.' },
    { id: 'lonely-6', text: '보고 싶었어요!', minIntimacyLevel: 3 },
    { id: 'lonely-7', text: '왜 이렇게 안 놀아줘요, 삐질 거예요!', minIntimacyLevel: 5 },
  ],
  sleepy: [
    { id: 'sleepy-1', text: '눈이 자꾸 감겨요...' },
    { id: 'sleepy-2', text: '하아암... 졸려요.' },
    { id: 'sleepy-3', text: '조금 쉬고 싶어요.' },
    { id: 'sleepy-4', text: '힘이 하나도 없어요.' },
    { id: 'sleepy-5', text: '잠깐 눈 좀 붙일까요...' },
    { id: 'sleepy-6', text: '같이 낮잠 잘래요?', minIntimacyLevel: 3 },
  ],
  sad: [
    { id: 'sad-1', text: '...' },
    { id: 'sad-2', text: '오늘은 기운이 좀 없어요.' },
    { id: 'sad-3', text: '괜찮아질 거예요.' },
    { id: 'sad-4', text: '그냥... 조용히 있고 싶어요.' },
    { id: 'sad-5', text: '조금 울적해요.' },
    { id: 'sad-6', text: '옆에 있어주면 나아질 것 같아요.', minIntimacyLevel: 3 },
  ],
  joyful: [
    { id: 'joyful-1', text: '오늘 기분 최고예요!' },
    { id: 'joyful-2', text: '방방 뛰고 싶은 기분이에요!' },
    { id: 'joyful-3', text: '당신과 있으면 정말 즐거워요!' },
    { id: 'joyful-4', text: '와, 오늘 하루 완벽해요!' },
    { id: 'joyful-5', text: '세상이 다 반짝반짝해 보여요!' },
    { id: 'joyful-6', text: '우리 진짜 잘 맞는 것 같아요!', minIntimacyLevel: 3 },
    { id: 'joyful-7', text: '헤헤, 당신 최고예요!', minIntimacyLevel: 5 },
  ],
  happy: [
    { id: 'happy-1', text: '오늘 기분 좋아요.' },
    { id: 'happy-2', text: '함께 있어서 좋아요.' },
    { id: 'happy-3', text: '편안한 하루예요.' },
    { id: 'happy-4', text: '이 정도면 딱 좋아요.' },
    { id: 'happy-5', text: '기분이 산뜻해요.' },
    { id: 'happy-6', text: '당신 덕분에 웃게 되네요.', minIntimacyLevel: 3 },
  ],
  calm: [
    { id: 'calm-1', text: '오늘도 평화롭네요.' },
    { id: 'calm-2', text: '그냥... 그런 하루예요.' },
    { id: 'calm-3', text: '조용히 시간을 보내고 있어요.' },
    { id: 'calm-4', text: '별일 없어요.' },
    { id: 'calm-5', text: '오늘은 뭐 하고 놀까요?' },
    { id: 'calm-6', text: '심심하면 말 걸어주세요.', minIntimacyLevel: 3 },
  ],
  levelUp: [
    { id: 'levelup-1', text: '우리 사이가 더 가까워진 것 같아요!' },
    { id: 'levelup-2', text: '두근두근! 뭔가 달라진 기분이에요.' },
    { id: 'levelup-3', text: '고마워요, 덕분에 여기까지 왔어요.' },
    { id: 'levelup-4', text: '앞으로도 잘 부탁해요!' },
    { id: 'levelup-5', text: '이 순간을 기억할게요.' },
  ],
}

/** Anything pickFromPool can select from — a shared shape so other dialogue banks (initiated-dialogue.ts) can reuse the same pick/history logic. */
export interface PickableLine {
  id: string
  minIntimacyLevel?: number
}

/**
 * 1) filter to lines this intimacyLevel unlocks, 2) drop ones just shown
 * (recentIds), 3) if that empties the pool, fall back to the level-filtered
 * pool alone (small categories shouldn't ever throw), 4) pick at random.
 */
export function pickFromPool<T extends PickableLine>(pool: T[], intimacyLevel: number, recentIds: string[]): T {
  const eligible = pool.filter((line) => (line.minIntimacyLevel ?? 1) <= intimacyLevel)
  const basePool = eligible.length > 0 ? eligible : pool
  const fresh = basePool.filter((line) => !recentIds.includes(line.id))
  const candidates = fresh.length > 0 ? fresh : basePool
  return candidates[Math.floor(Math.random() * candidates.length)]
}

export function pushRecentId(recentIds: string[], newId: string, maxSize: number): string[] {
  return [...recentIds, newId].slice(-maxSize)
}

export function pickDialogue(category: DialogueCategory, intimacyLevel: number, recentIds: string[]): DialogueLine {
  return pickFromPool(DIALOGUE_BANK[category], intimacyLevel, recentIds)
}

export function pushRecentDialogue(recentIds: string[], newId: string): string[] {
  return pushRecentId(recentIds, newId, RECENT_DIALOGUE_HISTORY_SIZE)
}
