import { DIFFICULTY_LOAD_MULTIPLIER } from '@/lib/config/difficulty.config'
import type { GameDifficulty } from '@/lib/game/difficulty'

export const FIT_PUZZLE_GAME_VERSION = 'fit_puzzle_v1'

export const FIT_PUZZLE_INTRO_COUNTDOWN_SECONDS = 3
export const FIT_PUZZLE_CELL_SIZE_PX = 56
/** How far (in px) a dragged piece's center may land from a target zone's center and still snap — generous on purpose (spec §8: drag precision must never dominate the spatial score). */
export const FIT_PUZZLE_SNAP_TOLERANCE_PX = 34

/** FIT_PUZZLE_SNAP_TOLERANCE_PX scaled by the shared game-wide difficulty tier (DIFFICULTY_LOAD_MULTIPLIER) — harder tiers get a smaller/less forgiving tolerance, floored at 16px so it never becomes unusably precise on touch. At 'normal' this is exactly FIT_PUZZLE_SNAP_TOLERANCE_PX. */
export function getFitPuzzleSnapToleranceForDifficulty(difficulty: GameDifficulty): number {
  return Math.max(16, Math.round(FIT_PUZZLE_SNAP_TOLERANCE_PX / DIFFICULTY_LOAD_MULTIPLIER[difficulty]))
}
