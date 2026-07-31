import type { RawRecord } from '@/lib/brain-bet'
import type { DodgeObstacleEvent, DodgeObstacleRawSummary } from '@/lib/game/types'
import { clampScore, scoreFromReactionTime } from '@/lib/scoring/shared'

export function summarizeDodgeObstacleEvents(
  events: DodgeObstacleEvent[],
  survivedMs: number,
  moveReactionTimesMs: number[],
): DodgeObstacleRawSummary {
  const obstaclesDodged = events.filter((e) => e.kind === 'dodged').length
  const collisions = events.filter((e) => e.kind === 'collided').length
  const averageMoveReactionMs =
    moveReactionTimesMs.length > 0
      ? moveReactionTimesMs.reduce((s, v) => s + v, 0) / moveReactionTimesMs.length
      : 0

  return {
    obstaclesDodged,
    collisions,
    survivedMs,
    averageMoveReactionMs: Math.round(averageMoveReactionMs),
  }
}

/** normalizedScore = 회피율 60% + 반응 속도 25% + 생존 보너스 15% (spec §6). */
export function calculateDodgeObstacleScore(summary: DodgeObstacleRawSummary, durationMs: number): number {
  const total = summary.obstaclesDodged + summary.collisions
  const dodgeRate = total > 0 ? summary.obstaclesDodged / total : 0
  const dodgePart = dodgeRate * 60
  const reactionPart =
    summary.averageMoveReactionMs > 0
      ? (scoreFromReactionTime(summary.averageMoveReactionMs, 200, 900) / 100) * 25
      : 25
  const survivalPart = Math.min(1, summary.survivedMs / durationMs) * 15
  return clampScore(dodgePart + reactionPart + survivalPart)
}

export function formatDodgeObstacleRawRecord(summary: DodgeObstacleRawSummary): RawRecord {
  return {
    primary: `${summary.obstaclesDodged}개 회피`,
    secondary: `충돌 ${summary.collisions}회`,
  }
}
