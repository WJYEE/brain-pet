import { DIFFICULTY_LOAD_MULTIPLIER, DIFFICULTY_TIME_MULTIPLIER } from '@/lib/config/difficulty.config'
import type { GameDifficulty } from '@/lib/game/difficulty'

export const DODGE_OBSTACLE_GAME_VERSION = 'dodge_obstacle_v1'

export const DODGE_OBSTACLE_INTRO_COUNTDOWN_SECONDS = 3
export const DODGE_OBSTACLE_DURATION_MS = 35_000

export const DODGE_OBSTACLE_LANE_COUNT = 3

/** Obstacle fall speed (px/s) ramps from MIN to MAX across the session. */
export const DODGE_OBSTACLE_SPEED_PX_PER_S_START = 220
export const DODGE_OBSTACLE_SPEED_PX_PER_S_END = 420

/** Time between new obstacle spawns, ramping down (faster spawns later). */
export const DODGE_OBSTACLE_SPAWN_INTERVAL_MS_START = 1500
export const DODGE_OBSTACLE_SPAWN_INTERVAL_MS_END = 900

/** After this many ms, a double-obstacle (2 of the 3 lanes) may spawn — always leaving at least one lane open. */
export const DODGE_OBSTACLE_DOUBLE_SPAWN_UNLOCK_MS = 15_000

/** Player is invulnerable-to-repeat-hit for this long after a collision, so one obstacle can't register twice. */
export const DODGE_OBSTACLE_COLLISION_COOLDOWN_MS = 600

/** Obstacle fall speed scaled by difficulty — faster falling = more pressure = harder (LOAD axis). */
export function getDodgeObstacleSpeedForDifficulty(difficulty: GameDifficulty): { start: number; end: number } {
  return {
    start: Math.round(DODGE_OBSTACLE_SPEED_PX_PER_S_START * DIFFICULTY_LOAD_MULTIPLIER[difficulty]),
    end: Math.round(DODGE_OBSTACLE_SPEED_PX_PER_S_END * DIFFICULTY_LOAD_MULTIPLIER[difficulty]),
  }
}

/** Time between obstacle spawns scaled by difficulty — more time between spawns = easier (TIME axis). */
export function getDodgeObstacleSpawnIntervalForDifficulty(difficulty: GameDifficulty): { start: number; end: number } {
  return {
    start: Math.round(DODGE_OBSTACLE_SPAWN_INTERVAL_MS_START * DIFFICULTY_TIME_MULTIPLIER[difficulty]),
    end: Math.round(DODGE_OBSTACLE_SPAWN_INTERVAL_MS_END * DIFFICULTY_TIME_MULTIPLIER[difficulty]),
  }
}
