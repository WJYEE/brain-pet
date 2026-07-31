import type { RawRecord } from '@/lib/brain-bet'
import type { ColorTargetClickEvent, ColorTargetRawSummary } from '@/lib/game/types'
import { clampScore, scoreFromReactionTime } from '@/lib/scoring/shared'

export function summarizeColorTargetEvents(
  events: ColorTargetClickEvent[],
  targetColorChanges: number,
): ColorTargetRawSummary {
  const correctClicks = events.filter((e) => e.kind === 'correct').length
  const wrongClicks = events.filter((e) => e.kind === 'wrong').length
  const missedTargets = events.filter((e) => e.kind === 'missed').length
  const reactionTimes = events
    .filter((e) => e.kind === 'correct' && e.reactionTimeMs != null)
    .map((e) => e.reactionTimeMs as number)
  const averageReactionTimeMs =
    reactionTimes.length > 0 ? reactionTimes.reduce((s, v) => s + v, 0) / reactionTimes.length : 0

  const totalAttempts = correctClicks + wrongClicks + missedTargets
  const accuracy = totalAttempts > 0 ? correctClicks / totalAttempts : 0

  return {
    correctClicks,
    wrongClicks,
    missedTargets,
    averageReactionTimeMs: Math.round(averageReactionTimeMs),
    targetColorChanges,
    accuracy,
  }
}

/** normalizedScore = 정확도 70% + 평균 반응 속도 30% (spec §5). */
export function calculateColorTargetScore(summary: ColorTargetRawSummary): number {
  const accuracyPart = summary.accuracy * 70
  const reactionPart =
    summary.averageReactionTimeMs > 0
      ? (scoreFromReactionTime(summary.averageReactionTimeMs, 350, 1500) / 100) * 30
      : 0
  return clampScore(accuracyPart + reactionPart)
}

export function formatColorTargetRawRecord(summary: ColorTargetRawSummary): RawRecord {
  return {
    primary: `정확도 ${Math.round(summary.accuracy * 100)}%`,
    secondary: `평균 반응 ${summary.averageReactionTimeMs}ms`,
  }
}
