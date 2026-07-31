import type { RawRecord } from '@/lib/brain-bet'
import type { BestChoiceAnswer, BestChoiceRawSummary } from '@/lib/game/types'
import { clampScore, scoreFromReactionTime } from '@/lib/scoring/shared'

export function summarizeBestChoiceAnswers(answers: BestChoiceAnswer[]): BestChoiceRawSummary {
  const optimalChoices = answers.filter((a) => a.selectedScore >= a.bestPossibleScore).length
  const averageChoiceQuality =
    answers.length > 0 ? answers.reduce((s, a) => s + a.selectedScore, 0) / answers.length : 0
  const answered = answers.filter((a) => !a.timedOut)
  const averageResponseTimeMs =
    answered.length > 0 ? answered.reduce((s, a) => s + a.responseTimeMs, 0) / answered.length : 0

  return {
    totalRounds: answers.length,
    optimalChoices,
    averageChoiceQuality: Math.round(averageChoiceQuality),
    averageResponseTimeMs: Math.round(averageResponseTimeMs),
    timeouts: answers.filter((a) => a.timedOut).length,
  }
}

/** normalizedScore = 선택 품질 80% + 응답 시간 20% (spec §7) — a fast wrong choice never outscores a slower correct one, since choice quality dominates the formula. */
export function calculateBestChoiceScore(summary: BestChoiceRawSummary): number {
  const qualityPart = (summary.averageChoiceQuality / 100) * 80
  const timePart =
    summary.averageResponseTimeMs > 0
      ? (scoreFromReactionTime(summary.averageResponseTimeMs, 1500, 8000) / 100) * 20
      : 0
  return clampScore(qualityPart + timePart)
}

export function formatBestChoiceRawRecord(summary: BestChoiceRawSummary): RawRecord {
  return {
    primary: `최적 선택 ${summary.optimalChoices}/${summary.totalRounds}`,
    secondary: `판단 정확도 ${Math.round(summary.averageChoiceQuality)}%`,
  }
}
