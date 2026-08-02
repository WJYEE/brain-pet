import { DIFFICULTY_LOAD_MULTIPLIER } from '@/lib/config/difficulty.config'
import type { GameDifficulty } from '@/lib/game/difficulty'

export const BEST_CHOICE_GAME_VERSION = 'best_choice_v1'

export const BEST_CHOICE_INTRO_COUNTDOWN_SECONDS = 3
export const BEST_CHOICE_ROUND_COUNT = 6

/**
 * Round count scaled by the shared difficulty Load multiplier — more rounds
 * means more decisions required to stay consistent, i.e. more pressure, so
 * this uses the Load axis rather than Time. Per-round time budgets come from
 * each scenario's own `timeLimitSeconds` (lib/game/decision-scenarios.ts,
 * content — not a tunable knob here), so there is no per-round duration
 * constant in this game to scale instead. At 'normal' (multiplier 1) this
 * returns exactly BEST_CHOICE_ROUND_COUNT, so First Play stays unchanged.
 */
export function getBestChoiceRoundCountForDifficulty(difficulty: GameDifficulty): number {
  return Math.max(1, Math.round(BEST_CHOICE_ROUND_COUNT * DIFFICULTY_LOAD_MULTIPLIER[difficulty]))
}
