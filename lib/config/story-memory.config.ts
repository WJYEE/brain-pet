import { DIFFICULTY_TIME_MULTIPLIER } from '@/lib/config/difficulty.config'
import type { GameDifficulty } from '@/lib/game/difficulty'

export const STORY_MEMORY_GAME_VERSION = 'story_memory_v1'

/** Countdown shown before the story appears. */
export const STORY_MEMORY_INTRO_COUNTDOWN_SECONDS = 3
/** How long the multiple-choice question itself stays up before auto-advancing as unanswered. */
export const STORY_MEMORY_QUESTION_TIME_LIMIT_MS = 12_000

/**
 * STORY_MEMORY_QUESTION_TIME_LIMIT_MS scaled by the player's chosen game
 * difficulty. At 'normal' DIFFICULTY_TIME_MULTIPLIER is exactly 1, so this
 * returns the same value as the base constant.
 */
export function getStoryMemoryQuestionTimeLimitForDifficulty(difficulty: GameDifficulty): number {
  return Math.round(STORY_MEMORY_QUESTION_TIME_LIMIT_MS * DIFFICULTY_TIME_MULTIPLIER[difficulty])
}
