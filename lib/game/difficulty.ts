/**
 * Every minigame now has 4 tiers. Easy is practice-only (always available,
 * never contributes to a representative record or currentStats — see
 * lib/game/player-skill-storage.ts). Normal is the baseline (what Intro/
 * First Play always uses). Hard/Extreme unlock progressively per-game based
 * on the player's own best score at the tier below (see
 * lib/config/difficulty.config.ts's NORMAL_TO_HARD_SCORE/
 * HARD_TO_EXTREME_SCORE and lib/game/difficulty-unlock.ts).
 */
export type GameDifficulty = 'easy' | 'normal' | 'hard' | 'extreme'

/** Ascending order — index also doubles as "tier rank" for unlock/representative-record comparisons. */
export const GAME_DIFFICULTY_ORDER: GameDifficulty[] = ['easy', 'normal', 'hard', 'extreme']

export interface GameDifficultyDef {
  id: GameDifficulty
  label: string
  /** One short line shown on every game's start/HUD screen — see spec §19. Identical layout across all games, only the copy differs per tier. */
  hint: string
}

export const GAME_DIFFICULTIES: Record<GameDifficulty, GameDifficultyDef> = {
  easy: { id: 'easy', label: 'EASY', hint: '연습용이에요.' },
  normal: { id: 'normal', label: 'NORMAL', hint: '기본 난이도예요.' },
  hard: { id: 'hard', label: 'HARD', hint: '대표 기록에 반영되는 도전 난이도예요.' },
  extreme: { id: 'extreme', label: 'EXTREME', hint: '최고 난이도예요.' },
}
