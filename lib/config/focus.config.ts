/** Focus ("Target Hunt") tuning constants — GAME_SPEC §45-54. */
export const FOCUS_GAME_VERSION = 'focus_v1'

export const FOCUS_TUTORIAL_ROUNDS = 2
export const FOCUS_REAL_ROUNDS = 8
export const FOCUS_NO_TARGET_ROUND_COUNT = 2

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
 * Fixed 8-round sequence on a 6x6 (36-cell) grid. Placement density and
 * similarity now climb together, gradually, round over round — a single
 * round never jumps more than one step on either axis at once. Values are a
 * draft per product decision; adjust here after Beta testing.
 */
export const FOCUS_DIFFICULTY_SEQUENCE: FocusDifficultyLevel[] = [
  { level: 1, totalPlacementCount: 18, similarityLevel: 1 },
  { level: 2, totalPlacementCount: 22, similarityLevel: 1 },
  { level: 3, totalPlacementCount: 26, similarityLevel: 2 },
  { level: 4, totalPlacementCount: 30, similarityLevel: 2 },
  { level: 5, totalPlacementCount: 32, similarityLevel: 3 },
  { level: 6, totalPlacementCount: 34, similarityLevel: 3 },
  { level: 7, totalPlacementCount: 35, similarityLevel: 4 },
  { level: 8, totalPlacementCount: 36, similarityLevel: 4 },
]

/** Per-round weight for Weighted Accuracy — harder rounds count slightly more. Index matches FOCUS_DIFFICULTY_SEQUENCE. */
export const FOCUS_DIFFICULTY_ACCURACY_WEIGHTS = [1.0, 1.0, 1.05, 1.05, 1.1, 1.15, 1.15, 1.2]

/**
 * Per-round time limit (ms), index matches FOCUS_DIFFICULTY_SEQUENCE. Unlike
 * Memory, Focus enforces a real timeout — without one, users could search
 * indefinitely and eventually always find the target, which would stop
 * measuring sustained attention at all. Tutorial rounds have no limit.
 */
export const FOCUS_ROUND_TIME_LIMIT_MS = [5000, 5000, 4500, 4500, 4000, 4000, 3500, 3500]

/** How long the per-round correct/wrong/missed feedback stays up before advancing. */
export const FOCUS_ROUND_FEEDBACK_MS = 650

/** How long each Tutorial transition message stays up. */
export const FOCUS_TUTORIAL_TRANSITION_MS = 1100
