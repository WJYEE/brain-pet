import type { SpatialDistractorType } from '@/lib/game/types'

/** Spatial ("2D Mental Rotation") tuning constants — GAME_SPEC §64-73. */
export const SPATIAL_GAME_VERSION = 'spatial_v1'

export const SPATIAL_LEVELS = [1, 2, 3, 4] as const

/**
 * Real question count per Level — deliberately uneven rather than the
 * original uniform 2/2/2/2 (8 total), for the First Play length reduction:
 * Levels 1-3 (mostly "learn the mechanic") get 1 question each, Level 4
 * (where the full distractor mix incl. Mirror lands) keeps 2, so early
 * questions establish the format quickly while later questions still do the
 * actual spatial-reasoning measurement — "초반 2문제로 방식 이해 → 중후반
 * 3문제로 실제 공간감각 측정".
 */
export const SPATIAL_QUESTIONS_PER_LEVEL: Record<number, number> = { 1: 1, 2: 1, 3: 1, 4: 2 }
export const SPATIAL_REAL_QUESTIONS = SPATIAL_LEVELS.reduce(
  (sum, level) => sum + SPATIAL_QUESTIONS_PER_LEVEL[level],
  0,
)

/**
 * Per-question time limit by Level — GAME_SPEC's "8~12초, 난이도에 따라 조정"
 * narrowed to a concrete 4-step schedule. A per-question timer (not a global
 * Time Attack like Judgment) fits Spatial best: the signature skill here is
 * accurate mental rotation, not continuous throughput, so each question gets
 * real thinking time while still preventing unbounded trial-and-error.
 */
export const SPATIAL_TIME_LIMIT_MS: Record<number, number> = {
  1: 10_000,
  2: 9_000,
  3: 8_000,
  4: 7_000,
}

/**
 * Difficulty weights for difficultyWeightedAccuracy / Score — draft values,
 * easy to retune after Beta data (GAME_SPEC §128 rule 14). Deliberately NOT
 * varied by rotation angle (90°/180°/270° are treated as equally hard) —
 * only difficultyLevel drives this weight.
 */
export const SPATIAL_DIFFICULTY_WEIGHTS: Record<number, number> = {
  1: 1.0,
  2: 1.3,
  3: 1.6,
  4: 2.0,
}

/** Which 3 distractor types fill a question's non-correct options, by Level — GAME_SPEC §68's 4-step progression, one new element per Level. */
export const SPATIAL_LEVEL_DISTRACTOR_TYPES: Record<number, SpatialDistractorType[]> = {
  1: ['unrelated', 'unrelated', 'unrelated'],
  2: ['similar', 'similar', 'similar'],
  3: ['mirror', 'similar', 'similar'],
  4: ['mirror', 'similar', 'unrelated'],
}

export const SPATIAL_OPTION_COUNT = 4

/** How long the per-question correct/wrong/timeout feedback (with the correct-answer highlight) stays up before advancing. */
export const SPATIAL_FEEDBACK_MS = 750
/** How long the Tutorial → Tutorial / Tutorial → Real transition message stays up. */
export const SPATIAL_TUTORIAL_TRANSITION_MS = 1100

/**
 * Spatial Game Score — internal only, draft formula (GAME_SPEC §128 rule 14).
 * Never shown to the user, never used for Percentile/Ranking yet.
 *
 * Priority is Accuracy > Difficulty > Speed: difficultyWeightedAccuracy is
 * the dominant term (getting harder Levels right is worth more, per
 * GAME_SPEC §72); mirrorAccuracy is a small bonus for Spatial's signature
 * sub-skill (never double-penalized — a missed Mirror question already
 * lowers difficultyWeightedAccuracy); responseTime and timeouts are small
 * supplementary deductions, kept conservative so a "guess fast" strategy is
 * never favorable. averageResponseTimeMs is on the order of a few thousand
 * ms, so speedPenalty is deliberately much smaller than Reaction/Memory/
 * Focus/Judgment's — verified via extreme-scenario tests before shipping.
 */
export const SPATIAL_SCORE_WEIGHTS = {
  /** difficultyWeightedAccuracy (0-1) × this — the dominant term. */
  difficultyWeightedAccuracyScale: 800,
  /** mirrorAccuracy (0-1) × this — Spatial's signature sub-skill, added as a small bonus. */
  mirrorAccuracyBonus: 60,
  /** averageResponseTimeMs × this, subtracted — deliberately conservative (0.001~0.005 band). */
  speedPenalty: 0.003,
  /** Flat points subtracted per timed-out question. */
  timeoutPenalty: 20,
}
