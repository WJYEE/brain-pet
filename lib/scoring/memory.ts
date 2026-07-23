import type { RawRecord } from '@/lib/brain-bet'
import { MEMORY_DIFFICULTY_ACCURACY_WEIGHTS, MEMORY_WRONG_TIME_PENALTY_MS } from '@/lib/config/memory.config'
import type { MemoryRawSummary, MemoryRoundTrial } from '@/lib/game/types'

export function computeRoundAccuracy(round: MemoryRoundTrial): number {
  return round.targetCount === 0 ? 0 : round.correctSelections / round.targetCount
}

/** responseTimeMs plus a fixed penalty per wrong click — used for scoring/Personal Best, never for display. */
export function computeAdjustedResponseTimeMs(round: MemoryRoundTrial): number {
  return round.responseTimeMs + round.wrongSelections * MEMORY_WRONG_TIME_PENALTY_MS
}

/** Summarizes the 6 real rounds into the aggregate fields GAME_SPEC §41-42 lists. */
export function summarizeMemoryRounds(rounds: MemoryRoundTrial[]): MemoryRawSummary {
  const accuracies = rounds.map(computeRoundAccuracy)
  const weights = rounds.map((_, i) => MEMORY_DIFFICULTY_ACCURACY_WEIGHTS[i] ?? 1)

  const weightedSum = accuracies.reduce((sum, acc, i) => sum + acc * weights[i], 0)
  const weightSum = weights.reduce((sum, w) => sum + w, 0)

  const perfectRounds = rounds.filter(
    (r) => r.wrongSelections === 0 && r.missedTargets === 0,
  ).length
  const averageAccuracy = accuracies.reduce((s, a) => s + a, 0) / accuracies.length
  const averageResponseTimeMs = Math.round(
    rounds.reduce((s, r) => s + r.responseTimeMs, 0) / rounds.length,
  )
  const averageAdjustedResponseTimeMs = Math.round(
    rounds.reduce((s, r) => s + computeAdjustedResponseTimeMs(r), 0) / rounds.length,
  )

  return {
    roundsCompleted: rounds.length,
    weightedAccuracy: weightSum === 0 ? 0 : weightedSum / weightSum,
    averageAccuracy,
    perfectRounds,
    averageResponseTimeMs,
    averageAdjustedResponseTimeMs,
  }
}

/**
 * Memory Game Score — internal only, draft formula (GAME_SPEC §128 rule 14:
 * "정확한 Score Formula는 실제 테스트 및 데이터 확보 후 보정 가능하도록 구성").
 * Never shown to the user, never used for Percentile/Ranking yet. Priority is
 * Accuracy > Difficulty > Speed: weightedAccuracy (which already leans toward
 * harder rounds) dominates, perfect rounds get a small difficulty-scaled
 * bonus, and speed is only a minor deduction. Weights are constants so
 * they're easy to retune once real usage data exists.
 */
export const MEMORY_SCORE_WEIGHTS = {
  /** weightedAccuracy (0-1) × this — the dominant term. */
  accuracyScale: 1000,
  /** Added per perfect round, so acing harder rounds counts a bit more. */
  perfectRoundBonus: 15,
  /**
   * averageResponseTimeMs × this, subtracted — a small supplementary factor.
   * Lowered from 0.05 after the difficulty increase (up to 9 targets/round
   * means naturally longer response times): at 0.05 a slow-but-perfect
   * session could score below a faster session with a genuine miss, which
   * breaks the intended Accuracy > Difficulty > Speed priority. At 0.002 the
   * speed term stays clearly minor even for slow sessions (~10s average).
   */
  speedPenalty: 0.002,
}

export function calculateMemoryScore(summary: MemoryRawSummary): number {
  const { accuracyScale, perfectRoundBonus, speedPenalty } = MEMORY_SCORE_WEIGHTS
  return Math.round(
    summary.weightedAccuracy * accuracyScale +
      summary.perfectRounds * perfectRoundBonus -
      summary.averageAdjustedResponseTimeMs * speedPenalty,
  )
}

/**
 * Memory Personal Best ranking: higher Weighted Accuracy wins; ties broken by
 * more Perfect Rounds, then by faster Adjusted Average Response Time (which
 * already includes the wrong-click time penalty). `roundsCompleted` is
 * intentionally NOT part of this comparison — every normal completion
 * finishes all 6 rounds, so it carries no differentiating signal.
 */
export function isBetterMemoryResult(
  candidate: { rawSummary: MemoryRawSummary },
  current: { rawSummary: MemoryRawSummary } | null,
): boolean {
  if (!current) return true
  if (candidate.rawSummary.weightedAccuracy !== current.rawSummary.weightedAccuracy) {
    return candidate.rawSummary.weightedAccuracy > current.rawSummary.weightedAccuracy
  }
  if (candidate.rawSummary.perfectRounds !== current.rawSummary.perfectRounds) {
    return candidate.rawSummary.perfectRounds > current.rawSummary.perfectRounds
  }
  return candidate.rawSummary.averageAdjustedResponseTimeMs < current.rawSummary.averageAdjustedResponseTimeMs
}

/** Formats the raw summary into the display RawRecord — never invents a "pts" unit (GAME_SPEC §3-5). */
export function formatMemoryRawRecord(summary: MemoryRawSummary): RawRecord {
  return {
    primary: `정확도 ${Math.round(summary.weightedAccuracy * 100)}%`,
    secondary: `완벽하게 기억한 라운드 ${summary.perfectRounds}/${summary.roundsCompleted}`,
  }
}
