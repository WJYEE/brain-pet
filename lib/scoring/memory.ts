import type { RawRecord } from '@/lib/brain-bet'
import { MEMORY_DIFFICULTY_ACCURACY_WEIGHTS, MEMORY_WRONG_TIME_PENALTY_MS } from '@/lib/config/memory.config'
import type { InputType, MemoryRawSummary, MemoryRoundTrial } from '@/lib/game/types'
import { clampScore, normalizeForInput, scoreFromReactionTime } from '@/lib/scoring/shared'

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
 * Memory Game Score — normalizedScore = weightedAccuracy 85% + 응답속도
 * 15%(clampScore 0-100), 이야기 기억·순발력과 같은 "핵심 능력 지배적" 원칙.
 * perfectRounds 보너스는 weightedAccuracy와 신호가 겹쳐(완벽한 라운드는 이미
 * accuracy 1.0으로 반영됨) 점수에서 제외하고 raw record 표시용으로만 남긴다.
 * bestMs/worstMs(2500/9000)는 실제 클릭 메커니즘 기준: 라운드당 targetCount만큼
 * (4→9개) 클릭해야 라운드가 끝나므로, 클릭당 400~1500ms를 근거로 잡은 값 —
 * 라운드 수(4)가 줄어도 한 라운드의 targetCount 범위(4~9개)는 그대로라 이
 * 구간 자체는 영향받지 않음 — 실측 데이터가 쌓이면 재조정.
 */
export const MEMORY_SCORE_WEIGHTS = {
  /** weightedAccuracy (0-1) × this — the dominant term. */
  accuracyWeight: 85,
  /** speedScore(0-1, scoreFromReactionTime 결과) × this. */
  speedWeight: 15,
}

export const MEMORY_SPEED_BEST_MS = 2500
export const MEMORY_SPEED_WORST_MS = 9000

/** `inputType` (see lib/game/device.ts#detectDevice) normalizes the measured ms for touch's inherent input latency before scoring — never applied to the raw displayed record. */
export function calculateMemoryScore(summary: MemoryRawSummary, inputType: InputType): number {
  const { accuracyWeight, speedWeight } = MEMORY_SCORE_WEIGHTS
  const speedScore =
    scoreFromReactionTime(
      normalizeForInput(summary.averageAdjustedResponseTimeMs, inputType),
      MEMORY_SPEED_BEST_MS,
      MEMORY_SPEED_WORST_MS,
    ) / 100
  return clampScore(summary.weightedAccuracy * accuracyWeight + speedScore * speedWeight)
}

/** Formats the raw summary into the display RawRecord — never invents a "pts" unit (GAME_SPEC §3-5). */
export function formatMemoryRawRecord(summary: MemoryRawSummary): RawRecord {
  return {
    primary: `정확도 ${Math.round(summary.weightedAccuracy * 100)}%`,
    secondary: `완벽하게 기억한 라운드 ${summary.perfectRounds}/${summary.roundsCompleted}`,
  }
}
