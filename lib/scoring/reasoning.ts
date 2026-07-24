import type { RawRecord } from '@/lib/brain-bet'
import { REASONING_DIFFICULTY_WEIGHTS, REASONING_SCORE_WEIGHTS } from '@/lib/config/reasoning.config'
import type { ReasoningRawSummary, ReasoningTrial, ReasoningType } from '@/lib/game/types'

/** Summarizes a completed 8-question Reasoning session into the aggregate fields GAME_SPEC §80-82 lists. */
export function summarizeReasoningTrials(trials: ReasoningTrial[]): ReasoningRawSummary {
  const totalQuestions = trials.length
  const correctAnswers = trials.filter((t) => t.isCorrect).length
  const overallAccuracy = totalQuestions === 0 ? 0 : correctAnswers / totalQuestions

  const totalWeight = trials.reduce((sum, t) => sum + (REASONING_DIFFICULTY_WEIGHTS[t.difficultyLevel] ?? 1), 0)
  const earnedWeight = trials.reduce(
    (sum, t) => sum + (t.isCorrect ? (REASONING_DIFFICULTY_WEIGHTS[t.difficultyLevel] ?? 1) : 0),
    0,
  )
  const difficultyWeightedAccuracy = totalWeight === 0 ? 0 : earnedWeight / totalWeight

  const averageResponseTimeMs =
    totalQuestions === 0 ? 0 : Math.round(trials.reduce((sum, t) => sum + t.responseTimeMs, 0) / totalQuestions)
  const timeoutCount = trials.filter((t) => t.timedOut).length

  const accuracyByDifficulty: Record<number, number> = {}
  for (const level of new Set(trials.map((t) => t.difficultyLevel))) {
    const atLevel = trials.filter((t) => t.difficultyLevel === level)
    accuracyByDifficulty[level] = atLevel.filter((t) => t.isCorrect).length / atLevel.length
  }

  const accuracyByReasoningType: Partial<Record<ReasoningType, number>> = {}
  for (const type of new Set(trials.map((t) => t.reasoningType))) {
    const ofType = trials.filter((t) => t.reasoningType === type)
    accuracyByReasoningType[type] = ofType.filter((t) => t.isCorrect).length / ofType.length
  }

  return {
    totalQuestions,
    correctAnswers,
    overallAccuracy,
    difficultyWeightedAccuracy,
    accuracyByDifficulty,
    accuracyByReasoningType,
    averageResponseTimeMs,
    timeoutCount,
  }
}

/**
 * Reasoning Game Score — internal only. See lib/config/reasoning.config.ts
 * for the weight rationale: difficultyWeightedAccuracy dominates (Accuracy >
 * Difficulty), with no separate Compound Rule bonus (Level 3/4's own weight
 * already accounts for that), and responseTime/timeouts are small,
 * conservative deductions (> Speed last).
 */
export function calculateReasoningScore(summary: ReasoningRawSummary): number {
  const { difficultyWeightedAccuracyScale, speedPenalty, timeoutPenalty } = REASONING_SCORE_WEIGHTS

  return Math.round(
    summary.difficultyWeightedAccuracy * difficultyWeightedAccuracyScale -
      summary.averageResponseTimeMs * speedPenalty -
      summary.timeoutCount * timeoutPenalty,
  )
}

/**
 * Reasoning Personal Best ranking: higher Difficulty-weighted Accuracy wins;
 * ties broken by higher Overall Accuracy, then faster Average Response Time.
 */
export function isBetterReasoningResult(
  candidate: { rawSummary: ReasoningRawSummary },
  current: { rawSummary: ReasoningRawSummary } | null,
): boolean {
  if (!current) return true
  if (candidate.rawSummary.difficultyWeightedAccuracy !== current.rawSummary.difficultyWeightedAccuracy) {
    return candidate.rawSummary.difficultyWeightedAccuracy > current.rawSummary.difficultyWeightedAccuracy
  }
  if (candidate.rawSummary.overallAccuracy !== current.rawSummary.overallAccuracy) {
    return candidate.rawSummary.overallAccuracy > current.rawSummary.overallAccuracy
  }
  return candidate.rawSummary.averageResponseTimeMs < current.rawSummary.averageResponseTimeMs
}

/** Formats the raw summary into the display RawRecord — never invents a "pts" unit (GAME_SPEC §3-5). */
export function formatReasoningRawRecord(summary: ReasoningRawSummary): RawRecord {
  return {
    primary: `${summary.correctAnswers}/${summary.totalQuestions} 정답`,
    secondary: `난이도 가중 정확도 ${Math.round(summary.difficultyWeightedAccuracy * 100)}%`,
  }
}
