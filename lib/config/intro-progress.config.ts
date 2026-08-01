/**
 * How long an in-progress (not fully completed) Intro checkpoint stays
 * resumable after its last update. Past this, loadIntroProgress() silently
 * discards it and the player just starts fresh — a multi-week-old partial
 * run isn't worth surfacing a "이어서 하기" prompt for.
 */
export const INTRO_PROGRESS_STALE_MS = 7 * 24 * 60 * 60 * 1000
