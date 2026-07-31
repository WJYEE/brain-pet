import type { RawRecord } from '@/lib/brain-bet'
import {
  SPATIAL_DIFFICULTY_WEIGHTS,
  SPATIAL_SCORE_WEIGHTS,
  SPATIAL_TIME_SCORE_BEST_MS,
  SPATIAL_TIME_SCORE_WORST_MS,
} from '@/lib/config/spatial.config'
import type { InputType, SpatialRawSummary, SpatialTrial } from '@/lib/game/types'
import { clampScore, normalizeForInput, scoreFromReactionTime } from '@/lib/scoring/shared'

/**
 * "회전 도형 찾기" — 공간감각 스탯의 두 게임 중 공간 인지 능력(주어진 도형이
 * 회전했을 때 같은 모양이 되는 조각을 즉시 알아보는 능력)을 측정하는 쪽.
 * 짝인 "퍼즐 끼우기"(lib/scoring/fit-puzzle.ts)는 공간 구성 능력(조각들을
 * 올바른 위치·방향으로 조합해 전체를 완성하는 능력)을 측정한다.
 */
/** Summarizes a completed 8-question Spatial session into the aggregate fields GAME_SPEC §70-72 lists. */
export function summarizeSpatialTrials(trials: SpatialTrial[]): SpatialRawSummary {
  const totalQuestions = trials.length
  const correctAnswers = trials.filter((t) => t.isCorrect).length
  const overallAccuracy = totalQuestions === 0 ? 0 : correctAnswers / totalQuestions

  const totalWeight = trials.reduce((sum, t) => sum + (SPATIAL_DIFFICULTY_WEIGHTS[t.difficultyLevel] ?? 1), 0)
  const earnedWeight = trials.reduce(
    (sum, t) => sum + (t.isCorrect ? (SPATIAL_DIFFICULTY_WEIGHTS[t.difficultyLevel] ?? 1) : 0),
    0,
  )
  const difficultyWeightedAccuracy = totalWeight === 0 ? 0 : earnedWeight / totalWeight

  const mirrorTrials = trials.filter((t) => t.mirrorIncluded)
  const mirrorCorrect = mirrorTrials.filter((t) => t.isCorrect).length
  const mirrorAccuracy = mirrorTrials.length === 0 ? 0 : mirrorCorrect / mirrorTrials.length

  const averageResponseTimeMs =
    totalQuestions === 0 ? 0 : Math.round(trials.reduce((sum, t) => sum + t.responseTimeMs, 0) / totalQuestions)
  const timeoutCount = trials.filter((t) => t.timedOut).length

  const accuracyByDifficulty: Record<number, number> = {}
  const levels = new Set(trials.map((t) => t.difficultyLevel))
  for (const level of levels) {
    const atLevel = trials.filter((t) => t.difficultyLevel === level)
    accuracyByDifficulty[level] = atLevel.filter((t) => t.isCorrect).length / atLevel.length
  }

  return {
    totalQuestions,
    correctAnswers,
    overallAccuracy,
    difficultyWeightedAccuracy,
    mirrorQuestions: mirrorTrials.length,
    mirrorCorrect,
    mirrorAccuracy,
    averageResponseTimeMs,
    timeoutCount,
    accuracyByDifficulty,
  }
}

/**
 * Spatial Game Score — 정확도 60% + 거울상 정확도 20% + 반응속도 15% +
 * Timeout 5%, clampScore 0-100. mirrorAccuracy가 0인 경우(mirrorQuestions=0,
 * 세션이 비정상 종료돼 Level 3-4에 도달 못한 극단적 케이스)는 판단력의
 * switch/conflictAccuracy와 같은 이유로 현재는 0으로 처리 — 실제 플레이로
 * 테스트하며 조정.
 */
export function calculateSpatialScore(summary: SpatialRawSummary, inputType: InputType): number {
  const { accuracyWeight, mirrorWeight, timeWeight, timeoutWeight } = SPATIAL_SCORE_WEIGHTS
  const timeScore =
    scoreFromReactionTime(
      normalizeForInput(summary.averageResponseTimeMs, inputType),
      SPATIAL_TIME_SCORE_BEST_MS,
      SPATIAL_TIME_SCORE_WORST_MS,
    ) / 100
  const timeoutScore = summary.totalQuestions > 0 ? 1 - summary.timeoutCount / summary.totalQuestions : 1

  return clampScore(
    summary.difficultyWeightedAccuracy * accuracyWeight +
      summary.mirrorAccuracy * mirrorWeight +
      timeScore * timeWeight +
      timeoutScore * timeoutWeight,
  )
}

/** Formats the raw summary into the display RawRecord — "X/Y correct" matches the format already used in 기획.md/MVP_SCOPE.md/DEVELOPMENT_PLAN.md. */
export function formatSpatialRawRecord(summary: SpatialRawSummary): RawRecord {
  return {
    primary: `${summary.correctAnswers}/${summary.totalQuestions} correct`,
    secondary: `난이도 가중 정확도 ${Math.round(summary.difficultyWeightedAccuracy * 100)}%`,
  }
}
