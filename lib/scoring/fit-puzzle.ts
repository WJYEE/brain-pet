import type { RawRecord } from '@/lib/brain-bet'
import type { FitPuzzleRoundResult, FitPuzzleRawSummary } from '@/lib/game/types'
import { clampScore } from '@/lib/scoring/shared'

export function summarizeFitPuzzleRounds(rounds: FitPuzzleRoundResult[]): FitPuzzleRawSummary {
  return {
    totalRounds: rounds.length,
    roundsCompleted: rounds.filter((r) => r.completed).length,
    correctPlacements: rounds.reduce((s, r) => s + r.correctPlacements, 0),
    misplacements: rounds.reduce((s, r) => s + r.misplacements, 0),
    rotations: rounds.reduce((s, r) => s + r.rotations, 0),
    totalCompletionMs: rounds.reduce((s, r) => s + r.completionMs, 0),
  }
}

/**
 * "퍼즐 끼우기" — 공간감각 스탯의 두 게임 중 공간 구성 능력(조각들을 올바른
 * 위치·방향으로 조합해 전체를 완성하는 능력)을 측정하는 쪽. 짝인 "회전 도형
 * 찾기"(lib/scoring/spatial.ts)는 공간 인지 능력을 측정한다.
 *
 * normalizedScore = 정확도 60% + 완료 시간 30% + 회전 조작 효율 10% (spec §8).
 *
 * misplacements와 rotations는 서로 다른 항목에 각각 반영되며 중복되지
 * 않는다: misplacements는 accuracyPart(정확도 = 올바른 배치 / 전체 시도)에
 * 이미 전부 반영되고, manipulationPart는 misplacements를 다시 보지 않고
 * rotations(불필요한 회전 조작 횟수)만 본다 — 배치를 잘못한 건 정확도에서,
 * 회전을 낭비한 건 조작 효율에서 한 번씩만 감점된다.
 */
export function calculateFitPuzzleScore(summary: FitPuzzleRawSummary, totalTimeLimitMs: number): number {
  const totalPieces = summary.correctPlacements + summary.misplacements
  const accuracy = totalPieces > 0 ? summary.correctPlacements / totalPieces : 0
  const accuracyPart = accuracy * 60

  const timeRatio = Math.max(0, 1 - summary.totalCompletionMs / totalTimeLimitMs)
  const timePart = timeRatio * 30

  const expectedRotations = summary.correctPlacements // one rotation each is "expected", not wasted
  const wastedRotations = Math.max(0, summary.rotations - expectedRotations)
  const rotationPenalty = Math.min(10, wastedRotations * 2)
  const manipulationPart = 10 - rotationPenalty

  return clampScore(accuracyPart + timePart + manipulationPart)
}

export function formatFitPuzzleRawRecord(summary: FitPuzzleRawSummary): RawRecord {
  return {
    primary: `완성 시간 ${Math.round(summary.totalCompletionMs / 1000)}초`,
    secondary: `오배치 ${summary.misplacements}회`,
  }
}
