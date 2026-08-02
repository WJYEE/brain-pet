import { DIFFICULTY_LOAD_MULTIPLIER } from '@/lib/config/difficulty.config'
import type { GameDifficulty } from '@/lib/game/difficulty'

/** Reaction ("Catch the Signal") tuning constants — GAME_SPEC §23-33. */
/** v2: gameScore reworked to 유효시행비율 60% + 반응속도 40%, clamped 0-100 (was an unbounded ~1000-scale formula). */
export const REACTION_GAME_VERSION = 'reaction_v2'

export const REACTION_PRACTICE_TRIALS = 1
export const REACTION_REAL_TRIALS = 3

/** Real (scored) trial count scaled by difficulty — more trials required at harder tiers, since consistency across more trials is harder to maintain. Practice trials are never scaled. */
export function getReactionRealTrialsForDifficulty(difficulty: GameDifficulty): number {
  return Math.max(1, Math.round(REACTION_REAL_TRIALS * DIFFICULTY_LOAD_MULTIPLIER[difficulty]))
}

export const REACTION_DELAY_MS_MIN = 1500
export const REACTION_DELAY_MS_MAX = 4000

/** How long a Real Trial's Session-Best comparison feedback stays up before the next Trial begins automatically. */
export const REACTION_TRIAL_FEEDBACK_MS = 850

/** Anti-cheat: flag the session once this many (or more) valid trials come in at/under the threshold. */
export const REACTION_ABNORMAL_MS_THRESHOLD = 80
export const REACTION_ABNORMAL_REPEAT_COUNT = 2
