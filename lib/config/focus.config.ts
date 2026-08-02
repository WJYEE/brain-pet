import { DIFFICULTY_TIME_MULTIPLIER } from '@/lib/config/difficulty.config'
import type { GameDifficulty } from '@/lib/game/difficulty'

/** Focus ("Target Hunt") tuning constants — GAME_SPEC §45-54. */
/** v2: gameScore reworked to weightedAccuracy 85% + miss/false-click penalty budget (15pt, miss weighted 2.5x), clamped 0-100 (was an unbounded ~1000-scale formula). */
export const FOCUS_GAME_VERSION = 'focus_v2'

export const FOCUS_TUTORIAL_ROUNDS = 1
export const FOCUS_REAL_ROUNDS = 3
export const FOCUS_NO_TARGET_ROUND_COUNT = 1

/** Tutorial keeps a small, easy search area — it's for learning the rule, not testing it. */
export const FOCUS_TUTORIAL_GRID_SIZE = 4
/** Real rounds use a much larger search area so the target isn't visible at a glance. */
export const FOCUS_REAL_GRID_SIZE = 6

export interface FocusDifficultyLevel {
  level: number
  /** Total symbols shown this round (target + distractors when present, all-distractor when not). */
  totalPlacementCount: number
  /** 1 = very different shape family ... 4 = same shape, subtle structural difference only (never color-only). */
  similarityLevel: number
}

/** Tutorial uses an easy, fixed difficulty for both the target-present and no-target practice rounds. */
export const FOCUS_TUTORIAL_DIFFICULTY: FocusDifficultyLevel = {
  level: 0,
  totalPlacementCount: 5,
  similarityLevel: 1,
}

/**
 * Fixed 3-round sequence on a 6x6 (36-cell) grid. Placement density and
 * similarity climb together, round over round. Compressed three times now
 * (First Play fatigue reduction): 8 → 4 → 3 rounds (this pass drops the old
 * round 2 — 28 placements/similarity 2). Round 3 still lands on the same
 * hardest difficulty (36 placements/similarity 4) the original round 8 used,
 * so the peak difficulty a fast player can reach is unchanged. Values are a
 * draft per product decision; adjust here after Beta testing.
 */
export const FOCUS_DIFFICULTY_SEQUENCE: FocusDifficultyLevel[] = [
  { level: 1, totalPlacementCount: 18, similarityLevel: 1 },
  { level: 2, totalPlacementCount: 32, similarityLevel: 3 },
  { level: 3, totalPlacementCount: 36, similarityLevel: 4 },
]

/** Per-round weight for Weighted Accuracy — harder rounds count slightly more. Index matches FOCUS_DIFFICULTY_SEQUENCE (re-spread across 3 entries, was 4, was 8). */
export const FOCUS_DIFFICULTY_ACCURACY_WEIGHTS = [1.0, 1.15, 1.2]

/**
 * Per-round time limit (ms), index matches FOCUS_DIFFICULTY_SEQUENCE. Unlike
 * Memory, Focus enforces a real timeout — without one, users could search
 * indefinitely and eventually always find the target, which would stop
 * measuring sustained attention at all. Tutorial rounds have no limit.
 * Final round keeps the same 3500ms pressure the old round 8 used.
 */
export const FOCUS_ROUND_TIME_LIMIT_MS = [5000, 3800, 3500]

/** Difficulty-scaled per-round time limits — bigger DIFFICULTY_TIME_MULTIPLIER = more time = easier. At 'normal' (multiplier 1) this is identical to FOCUS_ROUND_TIME_LIMIT_MS. */
export function getFocusRoundTimeLimitForDifficulty(difficulty: GameDifficulty): number[] {
  return FOCUS_ROUND_TIME_LIMIT_MS.map((ms) => Math.round(ms * DIFFICULTY_TIME_MULTIPLIER[difficulty]))
}

/** How long the per-round correct/wrong/missed feedback stays up before advancing. */
export const FOCUS_ROUND_FEEDBACK_MS = 650

/** How long each Tutorial transition message stays up — raised from 1100ms to 2200ms so the rule callout was actually readable, then trimmed back down ~1s once the callout got its own persistent reminder alongside it. */
export const FOCUS_TUTORIAL_TRANSITION_MS = 1200
