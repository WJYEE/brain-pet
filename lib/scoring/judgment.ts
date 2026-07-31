import type { RawRecord } from '@/lib/brain-bet'
import {
  JUDGMENT_GAME_DURATION_MS,
  JUDGMENT_SCORE_WEIGHTS,
  JUDGMENT_THROUGHPUT_MAX_BLOCKS,
  JUDGMENT_THROUGHPUT_MIN_BLOCKS,
} from '@/lib/config/judgment.config'
import type { JudgmentRawSummary, JudgmentTrial } from '@/lib/game/types'
import { clampScore, normalizeUpward } from '@/lib/scoring/shared'

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
 * Judgment Time Attack Score — see lib/config/judgment.config.ts for the full
 * weight rationale. overallAccuracy dominates (60%), switchAccuracy and
 * conflictAccuracy (Judgment's two signature sub-skills) each get 15%, and
 * throughput (correctBlocks normalized against a realistic session range)
 * gets the smallest share (10%) since it's ranked last in the stated
 * priority. Note: switchAccuracy/conflictAccuracy read 0 when their trial set
 * is empty (e.g. an extremely slow session that never reaches a rule switch)
 * — worth watching during testing since that's a real edge case, not just a
 * safe default.
 */
export function calculateJudgmentScore(summary: JudgmentRawSummary): number {
  const { accuracyWeight, switchWeight, conflictWeight, throughputWeight } = JUDGMENT_SCORE_WEIGHTS
  const throughputScore = normalizeUpward(summary.correctBlocks, JUDGMENT_THROUGHPUT_MIN_BLOCKS, JUDGMENT_THROUGHPUT_MAX_BLOCKS)

  return clampScore(
    summary.overallAccuracy * accuracyWeight +
      summary.switchAccuracy * switchWeight +
      summary.conflictAccuracy * conflictWeight +
      throughputScore * throughputWeight,
  )
}

/** Formats the raw summary into the display RawRecord — never invents a "pts" unit (GAME_SPEC §3-5), never overstates as a scientific claim. */
export function formatJudgmentRawRecord(summary: JudgmentRawSummary): RawRecord {
  return {
    primary: `${summary.correctBlocks}개 처리 (정확도 ${Math.round(summary.overallAccuracy * 100)}%)`,
    secondary: `최고 콤보 ${summary.maxCombo} · 전환 직후 정확도 ${Math.round(summary.switchAccuracy * 100)}%`,
  }
}
