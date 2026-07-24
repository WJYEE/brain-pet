/** Reasoning ("Pattern Reasoning") tuning constants — GAME_SPEC §74-84. */
export const REASONING_GAME_VERSION = 'reasoning_v1'

export const REASONING_LEVELS = [1, 2, 3, 4] as const

/**
 * Real question count per Level — deliberately uneven rather than the
 * original uniform 2/2/2/2 (8 total), for the First Play length reduction.
 * Level 3 (not Level 4) gets the extra 2nd question: Level 4's Compound
 * Rule templates are the ones most likely to make a new player feel "왜 이게
 * 정답이지?" even after the earlier ambiguity-fix pass, so weighting toward
 * Level 3 (2-attribute, still easily justifiable) keeps the shortened
 * session from front-loading dropout risk onto its last question.
 */
export const REASONING_QUESTIONS_PER_LEVEL: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 1 }
export const REASONING_REAL_QUESTIONS = REASONING_LEVELS.reduce(
  (sum, level) => sum + REASONING_QUESTIONS_PER_LEVEL[level],
  0,
)

export const REASONING_OPTION_COUNT = 4

/**
 * Per-question time limit by Level — GAME_SPEC §79's Easy/Normal/Hard bands
 * extended to 4 steps. Unlike Spatial, time INCREASES with difficulty here:
 * a harder Reasoning question needs more time to analyze the rule, not less
 * (the skill being measured is correct rule discovery, not speed).
 */
export const REASONING_TIME_LIMIT_MS: Record<number, number> = {
  1: 10_000,
  2: 12_000,
  3: 15_000,
  4: 18_000,
}

/**
 * Difficulty weights for difficultyWeightedAccuracy / Score — draft values,
 * easy to retune after Beta data (GAME_SPEC §128 rule 14).
 */
export const REASONING_DIFFICULTY_WEIGHTS: Record<number, number> = {
  1: 1.0,
  2: 1.3,
  3: 1.6,
  4: 2.0,
}

/**
 * How long the per-question correct/wrong/timeout feedback (with the
 * correct-answer highlight and the 1-line Rule Explanation) stays up before
 * advancing. Raised from 800ms so there's actually time to read the
 * Explanation (~1-1.5s), while staying short enough that the real questions
 * don't make the whole session feel like it's dragging.
 */
export const REASONING_FEEDBACK_MS = 1400
/** How long the Tutorial → Tutorial / Tutorial → Real transition message stays up. */
export const REASONING_TUTORIAL_TRANSITION_MS = 1100

/**
 * Reasoning Game Score — internal only, draft formula (GAME_SPEC §128 rule 14).
 * Never shown to the user, never used for Percentile/Ranking yet.
 *
 * Priority is Accuracy > Difficulty > Speed: difficultyWeightedAccuracy is
 * the dominant term (getting harder Levels right is worth more). No separate
 * Compound Rule bonus is added — Level 3/4's higher difficulty weight already
 * reflects that tier's accuracy more heavily, so a second bonus term would
 * double-count the same signal. responseTime/timeouts are small,
 * conservative deductions so a "guess fast" strategy is never favorable.
 */
export const REASONING_SCORE_WEIGHTS = {
  /** difficultyWeightedAccuracy (0-1) × this — the dominant term. */
  difficultyWeightedAccuracyScale: 800,
  /** averageResponseTimeMs × this, subtracted — deliberately conservative. */
  speedPenalty: 0.003,
  /** Flat points subtracted per timed-out question. */
  timeoutPenalty: 20,
}
