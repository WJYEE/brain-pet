import type { RawRecord } from '@/lib/brain-bet'
import { JUDGMENT_GAME_DURATION_MS, JUDGMENT_SCORE_WEIGHTS } from '@/lib/config/judgment.config'
import type { JudgmentRawSummary, JudgmentTrial } from '@/lib/game/types'

function accuracyOf(set: JudgmentTrial[]): number {
  return set.length === 0 ? 0 : set.filter((t) => t.isCorrect).length / set.length
}

function averageResponseTimeOf(set: JudgmentTrial[]): number {
  return set.length === 0 ? 0 : Math.round(set.reduce((s, t) => s + t.responseTimeMs, 0) / set.length)
}

function longestCorrectStreak(trials: JudgmentTrial[]): number {
  let longest = 0
  let current = 0
  for (const trial of trials) {
    current = trial.isCorrect ? current + 1 : 0
    longest = Math.max(longest, current)
  }
  return longest
}

/**
 * Summarizes a Time Attack session's processed Blocks (in processing order)
 * into the aggregate fields GAME_SPEC §61-62 lists, extended with the
 * throughput/combo metrics the Time Attack format adds. `elapsedMs` defaults
 * to the full session duration since a Time Attack session always runs to
 * the timer's end (there's no early-completion path).
 */
export function summarizeJudgmentTrials(trials: JudgmentTrial[], elapsedMs: number = JUDGMENT_GAME_DURATION_MS): JudgmentRawSummary {
  const switchSet = trials.filter((t) => t.isSwitchTrial)
  const nonSwitchSet = trials.filter((t) => !t.isSwitchTrial)
  const conflictSet = trials.filter((t) => t.isConflictTrial)

  const switchAverageResponseTimeMs = averageResponseTimeOf(switchSet)
  const nonSwitchAverageResponseTimeMs = averageResponseTimeOf(nonSwitchSet)
  const correctBlocks = trials.filter((t) => t.isCorrect).length
  const elapsedSeconds = Math.max(elapsedMs, 1) / 1000
  const ruleSwitchCount = trials.length === 0 ? 0 : new Set(trials.map((t) => t.segmentIndex)).size - 1

  return {
    processedBlocks: trials.length,
    correctBlocks,
    wrongBlocks: trials.length - correctBlocks,
    overallAccuracy: accuracyOf(trials),

    maxCombo: longestCorrectStreak(trials),
    averageResponseTimeMs: averageResponseTimeOf(trials),
    blocksPerSecond: trials.length === 0 ? 0 : Math.round((trials.length / elapsedSeconds) * 100) / 100,

    switchTrials: switchSet.length,
    switchCorrect: switchSet.filter((t) => t.isCorrect).length,
    switchAccuracy: accuracyOf(switchSet),

    nonSwitchTrials: nonSwitchSet.length,
    nonSwitchCorrect: nonSwitchSet.filter((t) => t.isCorrect).length,
    nonSwitchAccuracy: accuracyOf(nonSwitchSet),

    conflictTrials: conflictSet.length,
    conflictCorrect: conflictSet.filter((t) => t.isCorrect).length,
    conflictAccuracy: accuracyOf(conflictSet),

    switchAverageResponseTimeMs,
    nonSwitchAverageResponseTimeMs,
    switchCostMs: switchAverageResponseTimeMs - nonSwitchAverageResponseTimeMs,
    ruleSwitchCount: Math.max(0, ruleSwitchCount),
  }
}

/**
 * Judgment Time Attack Score — internal only. See lib/config/judgment.config.ts
 * for the full weight rationale: correctBlocks is scaled by overallAccuracy
 * (the dominant, accuracy-gated throughput term, with no separate speed term
 * since throughput already implies speed), wrongBlocks is a flat penalty, and
 * switch/conflict accuracy are small bonuses layered on top.
 */
export function calculateJudgmentScore(summary: JudgmentRawSummary): number {
  const { correctBlockValue, wrongBlockPenalty, switchAccuracyBonus, conflictAccuracyBonus } = JUDGMENT_SCORE_WEIGHTS

  return Math.round(
    summary.correctBlocks * summary.overallAccuracy * correctBlockValue -
      summary.wrongBlocks * wrongBlockPenalty +
      summary.switchAccuracy * switchAccuracyBonus +
      summary.conflictAccuracy * conflictAccuracyBonus,
  )
}

/**
 * Judgment Personal Best ranking — priority is Accuracy > Rule Switch
 * Adaptation > Speed: higher Overall Accuracy wins; ties broken by higher
 * Switch Accuracy, then higher Conflict Accuracy, then more Correct Blocks
 * (higher accuracy-gated throughput), then faster Average Response Time.
 */
export function isBetterJudgmentResult(
  candidate: { rawSummary: JudgmentRawSummary },
  current: { rawSummary: JudgmentRawSummary } | null,
): boolean {
  if (!current) return true
  if (candidate.rawSummary.overallAccuracy !== current.rawSummary.overallAccuracy) {
    return candidate.rawSummary.overallAccuracy > current.rawSummary.overallAccuracy
  }
  if (candidate.rawSummary.switchAccuracy !== current.rawSummary.switchAccuracy) {
    return candidate.rawSummary.switchAccuracy > current.rawSummary.switchAccuracy
  }
  if (candidate.rawSummary.conflictAccuracy !== current.rawSummary.conflictAccuracy) {
    return candidate.rawSummary.conflictAccuracy > current.rawSummary.conflictAccuracy
  }
  if (candidate.rawSummary.correctBlocks !== current.rawSummary.correctBlocks) {
    return candidate.rawSummary.correctBlocks > current.rawSummary.correctBlocks
  }
  return candidate.rawSummary.averageResponseTimeMs < current.rawSummary.averageResponseTimeMs
}

/** Formats the raw summary into the display RawRecord — never invents a "pts" unit (GAME_SPEC §3-5), never overstates as a scientific claim. */
export function formatJudgmentRawRecord(summary: JudgmentRawSummary): RawRecord {
  return {
    primary: `${summary.correctBlocks}개 처리 (정확도 ${Math.round(summary.overallAccuracy * 100)}%)`,
    secondary: `최고 콤보 ${summary.maxCombo} · 전환 직후 정확도 ${Math.round(summary.switchAccuracy * 100)}%`,
  }
}
