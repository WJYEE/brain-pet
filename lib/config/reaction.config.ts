/** Reaction ("Catch the Signal") tuning constants — GAME_SPEC §23-33. */
export const REACTION_GAME_VERSION = 'reaction_v1'

export const REACTION_PRACTICE_TRIALS = 1
export const REACTION_REAL_TRIALS = 5

export const REACTION_DELAY_MS_MIN = 1500
export const REACTION_DELAY_MS_MAX = 4000

/** Anti-cheat: flag the session once this many (or more) valid trials come in at/under the threshold. */
export const REACTION_ABNORMAL_MS_THRESHOLD = 80
export const REACTION_ABNORMAL_REPEAT_COUNT = 2
