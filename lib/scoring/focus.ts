import type { RawRecord } from '@/lib/brain-bet'
import { FOCUS_DIFFICULTY_ACCURACY_WEIGHTS } from '@/lib/config/focus.config'
import type { FocusRawSummary, FocusRoundTrial } from '@/lib/game/types'
import { clampScore } from '@/lib/scoring/shared'

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
 * Focus Game Score — normalizedScore = weightedAccuracy 85% + 15점 감점 예산
 * (놓침 5점/회, 오답 2점/회 — 2.5:1 비율로 놓침을 더 무겁게), clampScore
 * 0-100. weightedAccuracy는 이미 모든 오답 라운드(놓침이든 오답이든)를
 * "틀림"으로 반영하지만 *어떤 종류로* 틀렸는지는 구분하지 못하므로, 이
 * 감점 예산은 정확도와 중복 반영이 아니라 실수의 성격(부주의 vs 성급함)을
 * 추가로 구분해 반영하는 것이다. 속도 항목은 없다 — 라운드마다 강제
 * 제한시간(FOCUS_ROUND_TIME_LIMIT_MS)이 이미 있어 시간 압박이 라운드
 * 타이머 자체에 내장돼 있으므로 별도 반응속도 점수는 중복.
 */
export const FOCUS_SCORE_WEIGHTS = {
  /** weightedAccuracy (0-1) × this — the dominant term. */
  accuracyWeight: 85,
  /** 15점 감점 예산의 최대치 — 실수가 없으면 전액 획득. */
  cleanPlayBudget: 15,
  /** 놓친 타겟(부주의) 1회당 감점. */
  missPenalty: 5,
  /** 오답 클릭(성급함) 1회당 감점. */
  falseClickPenalty: 2,
}

export function calculateFocusScore(summary: FocusRawSummary): number {
  const { accuracyWeight, cleanPlayBudget, missPenalty, falseClickPenalty } = FOCUS_SCORE_WEIGHTS
  const penaltyPart = summary.missedTargets * missPenalty + summary.falseClicks * falseClickPenalty
  return clampScore(summary.weightedAccuracy * accuracyWeight + cleanPlayBudget - penaltyPart)
}

/** Formats the raw summary into the display RawRecord — never invents a "pts" unit (GAME_SPEC §3-5). */
export function formatFocusRawRecord(summary: FocusRawSummary): RawRecord {
  return {
    primary: `정확도 ${Math.round(summary.weightedAccuracy * 100)}%`,
    secondary: `False Click ${summary.falseClicks} · Miss ${summary.missedTargets}`,
  }
}
