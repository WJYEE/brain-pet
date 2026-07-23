/** Statling naming constraints. Kept as constants so limits are easy to tune later. */
export const STATLING_NAME_MIN_LENGTH = 1
export const STATLING_NAME_MAX_LENGTH = 8

/** PHASE 1 validation is length-only — no profanity/banned-word filtering yet. */
export function isValidStatlingName(name: string): boolean {
  const trimmed = name.trim()
  return trimmed.length >= STATLING_NAME_MIN_LENGTH && trimmed.length <= STATLING_NAME_MAX_LENGTH
}
