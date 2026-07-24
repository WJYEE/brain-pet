import type { RawRecord } from '@/lib/brain-bet'
import { FOCUS_DIFFICULTY_ACCURACY_WEIGHTS } from '@/lib/config/focus.config'
import type { FocusRawSummary, FocusRoundTrial } from '@/lib/game/types'

/** Summarizes the 8 real rounds into the aggregate fields GAME_SPEC §51-52 lists. */
export function summarizeFocusRounds(rounds: FocusRoundTrial[]): FocusRawSummary {
  const weights = rounds.map((_, i) => FOCUS_DIFFICULTY_ACCURACY_WEIGHTS[i] ?? 1)
  const correctness: number[] = rounds.map((r) => (r.selectedCorrectly ? 1 : 0))

  const weightedSum = correctness.reduce((sum, c, i) => sum + c * weights[i], 0)
  const weightSum = weights.reduce((sum, w) => sum + w, 0)

  const totalTargetsPresent = rounds.filter((r) => r.targetPresent).length
  const correctTargetsFound = rounds.filter((r) => r.targetPresent && r.selectedCorrectly).length
  const correctNoneCalls = rounds.filter((r) => !r.targetPresent && r.selectedCorrectly).length
  const missedTargets = rounds.filter((r) => r.missedTarget).length
  const falseClicks = rounds.filter((r) => r.falseClick).length
  const timeouts = rounds.filter((r) => r.timedOut).length
  const accuracy = correctness.reduce((s, c) => s + c, 0) / rounds.length
  const averageResponseTimeMs = Math.round(
    rounds.reduce((s, r) => s + r.responseTimeMs, 0) / rounds.length,
  )

  return {
    roundsCompleted: rounds.length,
    totalTargetsPresent,
    correctTargetsFound,
    correctNoneCalls,
    missedTargets,
    falseClicks,
    timeouts,
    accuracy,
    weightedAccuracy: weightSum === 0 ? 0 : weightedSum / weightSum,
    falseClickRate: falseClicks / rounds.length,
    missRate: totalTargetsPresent === 0 ? 0 : missedTargets / totalTargetsPresent,
    averageResponseTimeMs,
  }
}

/**
 * Focus Game Score — internal only, draft formula (GAME_SPEC §128 rule 14:
 * "정확한 Score Formula는 실제 테스트 및 데이터 확보 후 보정 가능하도록 구성").
 * Never shown to the user, never used for Percentile/Ranking yet.
 *
 * weightedAccuracy already reflects every wrong round (false click or miss)
 * as "not correct," so falseClickPenalty/missPenalty are kept small — they
 * exist only to break ties between two equally-inaccurate sessions (a
 * distractor-resistance failure should rank slightly below a simple miss),
 * not to double-penalize the same mistake on top of the accuracy term.
 * Speed stays a tiny supplementary factor (lesson learned from Memory's
 * speedPenalty tuning: keep it conservatively low from the start).
 */
export const FOCUS_SCORE_WEIGHTS = {
  /** weightedAccuracy (0-1) × this — the dominant term. */
  accuracyScale: 1000,
  /** Per false click — a distractor-resistance failure, penalized more than a miss. */
  falseClickPenalty: 15,
  /** Per missed target — a vigilance lapse, penalized less than a false click. */
  missPenalty: 8,
  /** averageResponseTimeMs × this, subtracted — a small supplementary factor. */
  speedPenalty: 0.01,
}

export function calculateFocusScore(summary: FocusRawSummary): number {
  const { accuracyScale, falseClickPenalty, missPenalty, speedPenalty } = FOCUS_SCORE_WEIGHTS
  return Math.round(
    summary.weightedAccuracy * accuracyScale -
      summary.falseClicks * falseClickPenalty -
      summary.missedTargets * missPenalty -
      summary.averageResponseTimeMs * speedPenalty,
  )
}

/**
 * Focus Personal Best ranking: higher Weighted Accuracy wins; ties broken by
 * fewer False Clicks (distractor resistance is Focus's defining trait), then
 * fewer Missed Targets, then faster Average Response Time.
 */
export function isBetterFocusResult(
  candidate: { rawSummary: FocusRawSummary },
  current: { rawSummary: FocusRawSummary } | null,
): boolean {
  if (!current) return true
  if (candidate.rawSummary.weightedAccuracy !== current.rawSummary.weightedAccuracy) {
    return candidate.rawSummary.weightedAccuracy > current.rawSummary.weightedAccuracy
  }
  if (candidate.rawSummary.falseClicks !== current.rawSummary.falseClicks) {
    return candidate.rawSummary.falseClicks < current.rawSummary.falseClicks
  }
  if (candidate.rawSummary.missedTargets !== current.rawSummary.missedTargets) {
    return candidate.rawSummary.missedTargets < current.rawSummary.missedTargets
  }
  return candidate.rawSummary.averageResponseTimeMs < current.rawSummary.averageResponseTimeMs
}

/** Formats the raw summary into the display RawRecord — never invents a "pts" unit (GAME_SPEC §3-5). */
export function formatFocusRawRecord(summary: FocusRawSummary): RawRecord {
  return {
    primary: `정확도 ${Math.round(summary.weightedAccuracy * 100)}%`,
    secondary: `False Click ${summary.falseClicks} · Miss ${summary.missedTargets}`,
  }
}
