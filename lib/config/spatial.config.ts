import { DIFFICULTY_TIME_MULTIPLIER } from '@/lib/config/difficulty.config'
import type { GameDifficulty } from '@/lib/game/difficulty'
import type { SpatialDistractorType } from '@/lib/game/types'

/** Spatial ("2D Mental Rotation") tuning constants — GAME_SPEC §64-73. */
/** v2: gameScore reworked to accuracy 60% + mirror 20% + time 15% + timeout 5%, clamped 0-100 (was an unbounded ~800+-scale formula). */
export const SPATIAL_GAME_VERSION = 'spatial_v2'

export const SPATIAL_LEVELS = [1, 2, 3, 4] as const

/**
 * Real question count per Level. Compressed three times now (First Play
 * fatigue reduction): originally a uniform 2/2/2/2 (8 total), then 1/1/1/2,
 * then 1/1/1/1 (4 total), and now 1/0/1/1 (3 total) — Level 2 (the
 * "similar"-only step, the least distinct from Level 1's baseline) dropped
 * entirely. mirrorAccuracy is still measurable (Level 3 already introduces
 * the Mirror distractor too, per SPATIAL_LEVEL_DISTRACTOR_TYPES below), just
 * from fewer samples; retune if that signal turns out too noisy after Beta
 * data.
 */
export const SPATIAL_QUESTIONS_PER_LEVEL: Record<number, number> = { 1: 1, 2: 0, 3: 1, 4: 1 }
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

/** SPATIAL_TIME_LIMIT_MS[level] scaled by the shared game-wide difficulty tier (DIFFICULTY_TIME_MULTIPLIER) — at 'normal' this is exactly SPATIAL_TIME_LIMIT_MS[level]. */
export function getSpatialTimeLimitForDifficulty(level: number, difficulty: GameDifficulty): number {
  return Math.round(SPATIAL_TIME_LIMIT_MS[level] * DIFFICULTY_TIME_MULTIPLIER[difficulty])
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
 * Spatial ("회전 도형 찾기") Game Score — measures 공간 인지 능력(주어진
 * 도형이 회전했을 때 같은 모양인지 즉시 알아보는 능력). normalizedScore =
 * 정확도 60% + 거울상 정확도 20% + 반응속도 15% + Timeout 5%, clampScore
 * 0-100. 우선순위(정확도 > 거울상 정확도 > 반응속도 > Timeout)를 판단력과
 * 동일한 구조(명시적 퍼센트 가중치, 암묵적 스케일 상수 아님)로 표현한다.
 * mirrorAccuracy는 거울상 도형(반전) 구분이라는 공간감각 특화 하위 능력을
 * 별도 지표로 뽑아낸 것 — difficultyWeightedAccuracy가 이미 "그 문제를
 * 맞았는지"는 반영하지만 "거울상 오답에 특히 잘 속는지"는 구분하지 못하므로
 * 중복이 아니다(판단력의 switch/conflictAccuracy와 같은 논리).
 */
export const SPATIAL_SCORE_WEIGHTS = {
  /** difficultyWeightedAccuracy (0-1) × this — the dominant term. */
  accuracyWeight: 60,
  /** mirrorAccuracy (0-1) × this — Spatial's signature sub-skill. */
  mirrorWeight: 20,
  /** timeScore(0-1, scoreFromReactionTime 결과) × this. */
  timeWeight: 15,
  /** timeoutScore(0-1, 시간초과 안 한 비율) × this. */
  timeoutWeight: 5,
}

/** averageResponseTimeMs가 이 값 이하면 만점, 이 값 이상이면 timeScore 0점 — 회전 판단은 단순 반응보다 느리므로 순발력/기억력보다 넓은 구간. */
export const SPATIAL_TIME_SCORE_BEST_MS = 3000
export const SPATIAL_TIME_SCORE_WORST_MS = 9000
