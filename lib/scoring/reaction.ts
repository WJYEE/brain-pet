import type { RawRecord } from '@/lib/brain-bet'
import {
  REACTION_ABNORMAL_MS_THRESHOLD,
  REACTION_ABNORMAL_REPEAT_COUNT,
} from '@/lib/config/reaction.config'
import type { InvalidReason, ReactionRawSummary, ReactionTrial } from '@/lib/game/types'

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0
  const avg = mean(values)
  const variance = mean(values.map((v) => (v - avg) ** 2))
  return Math.sqrt(variance)
}

/** Summarizes valid trials into the aggregate fields GAME_SPEC §29-30 lists. */
export function summarizeReactionTrials(trials: ReactionTrial[]): ReactionRawSummary {
  const validTimes = trials
    .filter((t) => !t.isFalseStart && t.reactionMs != null)
    .map((t) => t.reactionMs as number)
  const falseStarts = trials.filter((t) => t.isFalseStart).length

  return {
    validTrials: validTimes.length,
    falseStarts,
    averageReactionMs: Math.round(mean(validTimes)),
    medianReactionMs: Math.round(median(validTimes)),
    bestReactionMs: Math.min(...validTimes),
    consistency: Math.round(standardDeviation(validTimes)),
  }
}

/**
 * Reaction Game Score — internal only, draft formula (GAME_SPEC §128 rule 14:
 * "정확한 Score Formula는 실제 테스트 및 데이터 확보 후 보정 가능하도록 구성").
 * Never shown to the user, never used for Percentile/Ranking yet. Weights are
 * constants so they're easy to retune once real usage data exists.
 */
export const REACTION_SCORE_WEIGHTS = {
  /** Base score chosen so a typical ~250ms median lands near a readable mid-range number. */
  base: 1000,
  falseStartPenalty: 20,
  consistencyPenalty: 0.5,
}

export function calculateReactionScore(summary: ReactionRawSummary): number {
  const { base, falseStartPenalty, consistencyPenalty } = REACTION_SCORE_WEIGHTS
  return Math.round(
    base -
      summary.medianReactionMs -
      summary.falseStarts * falseStartPenalty -
      summary.consistency * consistencyPenalty,
  )
}

/**
 * Reaction Personal Best ranking (GAME_SPEC §31): lower median wins; ties
 * broken by fewer false starts, then by better (lower) consistency.
 */
export function isBetterReactionResult(
  candidate: { rawSummary: ReactionRawSummary },
  current: { rawSummary: ReactionRawSummary } | null,
): boolean {
  if (!current) return true
  if (candidate.rawSummary.medianReactionMs !== current.rawSummary.medianReactionMs) {
    return candidate.rawSummary.medianReactionMs < current.rawSummary.medianReactionMs
  }
  if (candidate.rawSummary.falseStarts !== current.rawSummary.falseStarts) {
    return candidate.rawSummary.falseStarts < current.rawSummary.falseStarts
  }
  return candidate.rawSummary.consistency < current.rawSummary.consistency
}

/** Formats the raw summary into the display RawRecord — never invents a "pts" unit (GAME_SPEC §3-5). */
export function formatReactionRawRecord(summary: ReactionRawSummary): RawRecord {
  const secondaryParts = [`Best ${summary.bestReactionMs} ms`]
  if (summary.falseStarts > 0) secondaryParts.push(`False Start ${summary.falseStarts}회`)
  return {
    primary: `${summary.medianReactionMs} ms`,
    secondary: secondaryParts.join(' · '),
  }
}

/**
 * Minimal anti-cheat (GAME_SPEC §33, §95-96): flags sessions with clearly
 * abnormal timing without invalidating a whole session from a single fast
 * trial — only repeated abnormal trials trigger the flag.
 */
export function evaluateReactionValidity(trials: ReactionTrial[]): {
  isValidAttempt: boolean
  invalidReason: InvalidReason
} {
  const validTimes = trials
    .filter((t) => !t.isFalseStart && t.reactionMs != null)
    .map((t) => t.reactionMs as number)
  const abnormalCount = validTimes.filter((ms) => ms <= REACTION_ABNORMAL_MS_THRESHOLD).length

  if (abnormalCount >= REACTION_ABNORMAL_REPEAT_COUNT) {
    return { isValidAttempt: false, invalidReason: 'abnormally_fast_repeat' }
  }
  return { isValidAttempt: true, invalidReason: null }
}
