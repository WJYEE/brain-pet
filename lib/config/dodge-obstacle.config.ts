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
