import { HARD_TO_EXTREME_SCORE, NORMAL_TO_HARD_SCORE } from '@/lib/config/difficulty.config'
import type { GameDifficulty } from '@/lib/game/difficulty'
import { getBestScoreAtDifficulty, type PlayerSkillState } from '@/lib/game/player-skill-storage'

/**
 * Whether `difficulty` is playable right now for `gameId`. Easy and Normal
 * are always unlocked (Easy is pure practice, Normal is what Intro/First
 * Play always uses — see spec §17's role table). Hard unlocks once this
 * exact game's own best Normal score clears NORMAL_TO_HARD_SCORE; Extreme
 * unlocks once its best Hard score clears HARD_TO_EXTREME_SCORE. Unlock is
 * per-game, not global — clearing the bar on one game never unlocks Hard on
 * a different game.
 */
export function isDifficultyUnlocked(state: PlayerSkillState, gameId: string, difficulty: GameDifficulty): boolean {
  if (difficulty === 'easy' || difficulty === 'normal') return true
  if (difficulty === 'hard') return (getBestScoreAtDifficulty(state, gameId, 'normal') ?? 0) >= NORMAL_TO_HARD_SCORE
  return (getBestScoreAtDifficulty(state, gameId, 'hard') ?? 0) >= HARD_TO_EXTREME_SCORE
}
