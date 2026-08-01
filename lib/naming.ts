/** Statling naming constraints. Kept as constants so limits are easy to tune later. */
export const STATLING_NAME_MIN_LENGTH = 1
export const STATLING_NAME_MAX_LENGTH = 8

/**
 * Best-effort blocklist. Names end up embedded in the share card/downloaded
 * image (see lib/share/), which is the most visible surface in the app, so
 * this exists to catch the obvious cases — not an exhaustive moderation
 * pipeline. Matched against a normalized (lowercased, whitespace/punctuation
 * stripped) form so simple spacing tricks ("시  발") don't slip through.
 */
const BLOCKED_SUBSTRINGS = [
  '씨발', '시발', '씨팔', '병신', '개새끼', '개새', '지랄', '좆', '섹스', '자지', '보지', '창녀', '느금', '느그',
  'fuck', 'shit', 'bitch', 'nigger', 'nigga', 'cunt', 'rape',
]

function normalize(name: string): string {
  return name.toLowerCase().replace(/[\s.,!?~\-_]/g, '')
}

function containsBlockedWord(trimmedName: string): boolean {
  const normalized = normalize(trimmedName)
  return BLOCKED_SUBSTRINGS.some((word) => normalized.includes(word))
}

export function isValidStatlingName(name: string): boolean {
  const trimmed = name.trim()
  if (trimmed.length < STATLING_NAME_MIN_LENGTH || trimmed.length > STATLING_NAME_MAX_LENGTH) return false
  return !containsBlockedWord(trimmed)
}

/**
 * UI-facing reason a name is currently blocked, or null when there's nothing
 * to say (either it's fine, or it's just too short/long — the length hint in
 * NamingScreen already covers that case). Kept separate from
 * isValidStatlingName so the button-disable check stays a plain boolean.
 */
export function getStatlingNameBlockedReason(name: string): string | null {
  const trimmed = name.trim()
  const withinLength = trimmed.length >= STATLING_NAME_MIN_LENGTH && trimmed.length <= STATLING_NAME_MAX_LENGTH
  if (withinLength && containsBlockedWord(trimmed)) {
    return '사용할 수 없는 단어가 포함되어 있어요.'
  }
  return null
}
