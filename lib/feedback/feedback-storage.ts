import { getOrCreateDeviceId } from '@/lib/room/room-storage'
import { generateSessionId } from '@/lib/game/id'
import type {
  FavoritePartValue,
  FeedbackRecord,
  ImprovementAreaValue,
  ReturnIntentValue,
  SatisfactionValue,
} from '@/lib/feedback/feedback-types'

/**
 * Local-only repository for submitted feedback — no Supabase table exists
 * yet (see game-flow's completion-report notes on this), so this reads/
 * writes localStorage today. Every call site only ever goes through
 * loadFeedbackRecords/addFeedbackRecord, so swapping the bodies below for
 * real Supabase insert/select calls later is the entire migration surface,
 * same convention as lib/deco-placement-storage.ts and lib/pets/dex-storage.ts.
 */
function feedbackStorageKey(deviceId: string): string {
  return `statling:feedback:${deviceId}`
}

function isWellFormedRecord(value: Record<string, unknown>): value is Record<string, unknown> & FeedbackRecord {
  return (
    typeof value.id === 'string' &&
    typeof value.satisfaction === 'string' &&
    typeof value.favoritePart === 'string' &&
    typeof value.improvementArea === 'string' &&
    typeof value.returnIntent === 'string' &&
    typeof value.comment === 'string' &&
    typeof value.submittedAt === 'string'
  )
}

export function loadFeedbackRecords(): FeedbackRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(feedbackStorageKey(getOrCreateDeviceId()))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (entry): entry is FeedbackRecord => !!entry && typeof entry === 'object' && isWellFormedRecord(entry as Record<string, unknown>),
    )
  } catch {
    return []
  }
}

function saveFeedbackRecords(records: FeedbackRecord[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(feedbackStorageKey(getOrCreateDeviceId()), JSON.stringify(records))
}

/**
 * Appends one submission and persists it. Every required field on
 * FeedbackDraft must already be non-null — the caller (feedback-section.tsx)
 * is responsible for that validation before calling this, so this function
 * never has to reject a call or report a validation error itself.
 */
export function addFeedbackRecord(draft: {
  satisfaction: SatisfactionValue
  favoritePart: FavoritePartValue
  improvementArea: ImprovementAreaValue
  returnIntent: ReturnIntentValue
  comment: string
}): FeedbackRecord {
  const record: FeedbackRecord = {
    id: generateSessionId(),
    satisfaction: draft.satisfaction,
    favoritePart: draft.favoritePart,
    improvementArea: draft.improvementArea,
    returnIntent: draft.returnIntent,
    comment: (draft.comment ?? '').trim(),
    submittedAt: new Date().toISOString(),
  }
  saveFeedbackRecords([...loadFeedbackRecords(), record])
  return record
}
