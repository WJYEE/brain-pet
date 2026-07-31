import type { RawRecord } from '@/lib/brain-bet'
import type { StoryMemoryAnswer, StoryMemoryRawSummary } from '@/lib/game/types'
import { clampScore, scoreFromReactionTime } from '@/lib/scoring/shared'

export function summarizeStoryMemoryAnswers(storyId: string, answers: StoryMemoryAnswer[]): StoryMemoryRawSummary {
  const correctAnswers = answers.filter((a) => a.isCorrect).length
  const averageResponseTimeMs =
    answers.reduce((sum, a) => sum + a.responseTimeMs, 0) / Math.max(1, answers.length)

  return {
    storyId,
    totalQuestions: answers.length,
    correctAnswers,
    accuracy: answers.length > 0 ? correctAnswers / answers.length : 0,
    averageResponseTimeMs: Math.round(averageResponseTimeMs),
  }
}

/**
 * normalizedScore = 질문 정확도 85% + 질문 응답 속도 15%. 읽기 시간은 이제
 * 스토리별로 고정·스킵 불가(story-memory-data.ts의 readingSeconds)라
 * "읽기 효율"이라는 축 자체가 더 이상 변별력이 없다 — 대신 다른 게임들과
 * 같은 패턴(정확도 지배적 + 반응속도 보조)으로 15%를 질문 응답 속도에
 * 할당한다. 2초 이내 응답이면 만점, STORY_MEMORY_QUESTION_TIME_LIMIT_MS(12초)에
 * 가까울수록 0점.
 */
export function calculateStoryMemoryScore(summary: StoryMemoryRawSummary): number {
  const accuracyPart = summary.accuracy * 85
  const speedPart = (scoreFromReactionTime(summary.averageResponseTimeMs, 2000, 11000) / 100) * 15
  return clampScore(accuracyPart + speedPart)
}

export function formatStoryMemoryRawRecord(summary: StoryMemoryRawSummary): RawRecord {
  return {
    primary: `정답 ${summary.correctAnswers}/${summary.totalQuestions}`,
    secondary: `기억 정확도 ${Math.round(summary.accuracy * 100)}%`,
  }
}
