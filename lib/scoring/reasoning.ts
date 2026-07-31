import type { RawRecord } from '@/lib/brain-bet'
import {
  REASONING_DIFFICULTY_WEIGHTS,
  REASONING_SCORE_WEIGHTS,
  REASONING_TIME_SCORE_BEST_MS,
  REASONING_TIME_SCORE_WORST_MS,
} from '@/lib/config/reasoning.config'
import type { InputType, ReasoningRawSummary, ReasoningTrial, ReasoningType } from '@/lib/game/types'
import { clampScore, normalizeForInput, scoreFromReactionTime } from '@/lib/scoring/shared'

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

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
 * "규칙 찾기" — 추리력 스탯의 두 게임 중 시각적·추상적 규칙 추론(도형·기호
 * 배열에서 숨은 규칙을 찾는 능력)을 측정하는 쪽. 짝인 "숫자 규칙"
 * (lib/scoring/number-pattern.ts)은 수리적 규칙 추론(숫자 수열의 규칙을
 * 찾는 능력)을 측정한다.
 *
 * Reasoning Game Score — difficultyWeightedAccuracy 75% + timeScore 15% +
 * timeoutScore 10%, clampScore 0-100. `inputType`(see lib/game/device.ts)은
 * 순발력·기억력·공간감각과 동일하게 timeScore 계산 직전에만 터치 입력
 * 지연을 보정한다 — raw 표시값은 건드리지 않는다.
 */
export function calculateReasoningScore(summary: ReasoningRawSummary, inputType: InputType): number {
  const { accuracyWeight, timeWeight, timeoutWeight } = REASONING_SCORE_WEIGHTS

  const accuracyScore = clamp01(summary.difficultyWeightedAccuracy)
  const timeScore = clamp01(
    scoreFromReactionTime(
      normalizeForInput(summary.averageResponseTimeMs, inputType),
      REASONING_TIME_SCORE_BEST_MS,
      REASONING_TIME_SCORE_WORST_MS,
    ) / 100,
  )
  const timeoutScore = clamp01(summary.totalQuestions > 0 ? 1 - summary.timeoutCount / summary.totalQuestions : 1)

  return clampScore(accuracyScore * accuracyWeight + timeScore * timeWeight + timeoutScore * timeoutWeight)
}

/** Formats the raw summary into the display RawRecord — never invents a "pts" unit (GAME_SPEC §3-5). */
export function formatReasoningRawRecord(summary: ReasoningRawSummary): RawRecord {
  return {
    primary: `${summary.correctAnswers}/${summary.totalQuestions} 정답`,
    secondary: `난이도 가중 정확도 ${Math.round(summary.difficultyWeightedAccuracy * 100)}%`,
  }
}
