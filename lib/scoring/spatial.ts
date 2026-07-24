import type { RawRecord } from '@/lib/brain-bet'
import { SPATIAL_DIFFICULTY_WEIGHTS, SPATIAL_SCORE_WEIGHTS } from '@/lib/config/spatial.config'
import type { SpatialRawSummary, SpatialTrial } from '@/lib/game/types'

/** Summarizes a completed 8-question Spatial session into the aggregate fields GAME_SPEC §70-72 lists. */
export function summarizeSpatialTrials(trials: SpatialTrial[]): SpatialRawSummary {
  const totalQuestions = trials.length
  const correctAnswers = trials.filter((t) => t.isCorrect).length
  const overallAccuracy = totalQuestions === 0 ? 0 : correctAnswers / totalQuestions

  const totalWeight = trials.reduce((sum, t) => sum + (SPATIAL_DIFFICULTY_WEIGHTS[t.difficultyLevel] ?? 1), 0)
  const earnedWeight = trials.reduce(
    (sum, t) => sum + (t.isCorrect ? (SPATIAL_DIFFICULTY_WEIGHTS[t.difficultyLevel] ?? 1) : 0),
    0,
  )
  const difficultyWeightedAccuracy = totalWeight === 0 ? 0 : earnedWeight / totalWeight

  const mirrorTrials = trials.filter((t) => t.mirrorIncluded)
  const mirrorCorrect = mirrorTrials.filter((t) => t.isCorrect).length
  const mirrorAccuracy = mirrorTrials.length === 0 ? 0 : mirrorCorrect / mirrorTrials.length

  const averageResponseTimeMs =
    totalQuestions === 0 ? 0 : Math.round(trials.reduce((sum, t) => sum + t.responseTimeMs, 0) / totalQuestions)
  const timeoutCount = trials.filter((t) => t.timedOut).length

  const accuracyByDifficulty: Record<number, number> = {}
  const levels = new Set(trials.map((t) => t.difficultyLevel))
  for (const level of levels) {
    const atLevel = trials.filter((t) => t.difficultyLevel === level)
    accuracyByDifficulty[level] = atLevel.filter((t) => t.isCorrect).length / atLevel.length
  }

  return {
    totalQuestions,
    correctAnswers,
    overallAccuracy,
    difficultyWeightedAccuracy,
    mirrorQuestions: mirrorTrials.length,
    mirrorCorrect,
    mirrorAccuracy,
    averageResponseTimeMs,
    timeoutCount,
    accuracyByDifficulty,
  }
}

/**
 * Spatial Game Score — internal only. See lib/config/spatial.config.ts for
 * the weight rationale: difficultyWeightedAccuracy dominates (Accuracy >
 * Difficulty), mirrorAccuracy is a small bonus (not a penalty — a missed
 * Mirror question already lowers difficultyWeightedAccuracy), and
 * responseTime/timeouts are small, conservative deductions (> Speed last).
 */
export function calculateSpatialScore(summary: SpatialRawSummary): number {
  const { difficultyWeightedAccuracyScale, mirrorAccuracyBonus, speedPenalty, timeoutPenalty } = SPATIAL_SCORE_WEIGHTS

  return Math.round(
    summary.difficultyWeightedAccuracy * difficultyWeightedAccuracyScale +
      summary.mirrorAccuracy * mirrorAccuracyBonus -
      summary.averageResponseTimeMs * speedPenalty -
      summary.timeoutCount * timeoutPenalty,
  )
}

/**
 * Spatial Personal Best ranking: higher Difficulty-weighted Accuracy wins;
 * ties broken by higher Mirror Accuracy, then higher Overall Accuracy, then
 * faster Average Response Time. Mirror Accuracy is skipped as a tie-break
 * whenever either session has zero Mirror Questions (a degenerate/partial
 * session) — comparing a real 0/0 rate would distort the ranking, and a
 * normal completed Real session always has Level 3-4 Mirror questions.
 */
export function isBetterSpatialResult(
  candidate: { rawSummary: SpatialRawSummary },
  current: { rawSummary: SpatialRawSummary } | null,
): boolean {
  if (!current) return true
  if (candidate.rawSummary.difficultyWeightedAccuracy !== current.rawSummary.difficultyWeightedAccuracy) {
    return candidate.rawSummary.difficultyWeightedAccuracy > current.rawSummary.difficultyWeightedAccuracy
  }
  const bothHaveMirrorQuestions = candidate.rawSummary.mirrorQuestions > 0 && current.rawSummary.mirrorQuestions > 0
  if (bothHaveMirrorQuestions && candidate.rawSummary.mirrorAccuracy !== current.rawSummary.mirrorAccuracy) {
    return candidate.rawSummary.mirrorAccuracy > current.rawSummary.mirrorAccuracy
  }
  if (candidate.rawSummary.overallAccuracy !== current.rawSummary.overallAccuracy) {
    return candidate.rawSummary.overallAccuracy > current.rawSummary.overallAccuracy
  }
  return candidate.rawSummary.averageResponseTimeMs < current.rawSummary.averageResponseTimeMs
}

/** Formats the raw summary into the display RawRecord — "X/Y correct" matches the format already used in 기획.md/MVP_SCOPE.md/DEVELOPMENT_PLAN.md. */
export function formatSpatialRawRecord(summary: SpatialRawSummary): RawRecord {
  return {
    primary: `${summary.correctAnswers}/${summary.totalQuestions} correct`,
    secondary: `난이도 가중 정확도 ${Math.round(summary.difficultyWeightedAccuracy * 100)}%`,
  }
}
