/** Timing/threshold knobs for the post-minigame pet reaction — see lib/pet-care/game-reactions.ts. */
export const GAME_REACTION_DELAY_MIN_MS = 700
export const GAME_REACTION_DELAY_MAX_MS = 1200
/** Under 2000ms by design — this same value gates both the reaction's own animation/speech hold AND the care-action buttons' temporary disable, so no separate "lock" timer is needed. */
export const GAME_REACTION_HOLD_MS = 1800

export const GAME_REACTION_GREAT_THRESHOLD = 0.75
export const GAME_REACTION_GOOD_THRESHOLD = 0.45

export const GAME_REACTION_EXP_GAIN = 2
export const GAME_REACTION_HAPPINESS_BY_TIER: Record<'great' | 'good' | 'meh', number> = {
  great: 3,
  good: 2,
  meh: 2,
}
export const GAME_REACTION_ENERGY_BY_TIER: Record<'great' | 'good' | 'meh', number> = {
  great: 0,
  good: -1,
  meh: -1,
}

/** A pendingGameReaction older than this is discarded unconsumed rather than shown stale. */
export const PENDING_GAME_REACTION_MAX_AGE_MS = 24 * 60 * 60 * 1000
