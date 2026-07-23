/** Memory ("Memory Tiles") tuning constants — GAME_SPEC §34-44. */
export const MEMORY_GAME_VERSION = 'memory_v1'

export const MEMORY_PRACTICE_ROUNDS = 1
export const MEMORY_REAL_ROUNDS = 6

export interface MemoryDifficultyLevel {
  level: number
  gridSize: number
  targetCount: number
  /** Flash duration — how long target cells stay highlighted before disappearing. */
  exposureMs: number
}

/** Tutorial has its own (easier) difficulty, separate from the real sequence; its result is always discarded. */
export const MEMORY_TUTORIAL_DIFFICULTY: MemoryDifficultyLevel = {
  level: 0,
  gridSize: 3,
  targetCount: 3,
  exposureMs: 1000,
}

/**
 * Fixed difficulty sequence — every user plays the same 6 rounds regardless
 * of performance (no Life system, no early termination). Values are a draft
 * per product decision; adjust here after Beta testing.
 */
export const MEMORY_DIFFICULTY_SEQUENCE: MemoryDifficultyLevel[] = [
  { level: 1, gridSize: 3, targetCount: 4, exposureMs: 900 },
  { level: 2, gridSize: 4, targetCount: 5, exposureMs: 850 },
  { level: 3, gridSize: 4, targetCount: 6, exposureMs: 800 },
  { level: 4, gridSize: 5, targetCount: 7, exposureMs: 750 },
  { level: 5, gridSize: 5, targetCount: 8, exposureMs: 700 },
  { level: 6, gridSize: 6, targetCount: 9, exposureMs: 650 },
]

/**
 * Per-round weight for Weighted Accuracy — harder rounds count slightly more.
 * Index matches MEMORY_DIFFICULTY_SEQUENCE (round 1 = index 0, ...). Kept
 * modest (1.0 → 1.25) so difficulty nudges the score without dominating it.
 * Reviewed after the difficulty increase — the spread still only affects the
 * accuracy fraction (0-1), not raw counts, so it stays proportionate and was
 * left unchanged.
 */
export const MEMORY_DIFFICULTY_ACCURACY_WEIGHTS = [1.0, 1.05, 1.1, 1.15, 1.2, 1.25]

/** Delay before the flash starts, so the grid doesn't flash the instant it appears. */
export const MEMORY_PRE_FLASH_DELAY_MS = 150

/** How long a single tile's correct/wrong click-feedback flash stays up before settling to a neutral "selected" mark. */
export const MEMORY_CLICK_FEEDBACK_MS = 220

/** How long the per-round result (PERFECT! / x/y 기억했어요 + full reveal) stays up before advancing. */
export const MEMORY_ROUND_FEEDBACK_MS = 800

/** How long the Tutorial → Real transition message stays up. */
export const MEMORY_TUTORIAL_TRANSITION_MS = 1100

/** Added to a round's response time per wrong click, before it counts toward scoring/Personal Best. */
export const MEMORY_WRONG_TIME_PENALTY_MS = 500

/** How long the small "MISS +0.5s" penalty flash stays up (absolutely positioned — never shifts layout). */
export const MEMORY_PENALTY_FLASH_MS = 700
