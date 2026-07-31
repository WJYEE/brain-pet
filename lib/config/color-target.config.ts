export const COLOR_TARGET_GAME_VERSION = 'color_target_v1'

export const COLOR_TARGET_INTRO_COUNTDOWN_SECONDS = 3
export const COLOR_TARGET_GAME_DURATION_MS = 40_000

/** Target color changes every N ms — narrows over the course of the session per spec §5 (5s -> 4s -> 3s). */
export const COLOR_TARGET_CHANGE_INTERVAL_STAGES_MS = [5000, 4000, 3000]
/** How long the newly-picked target color is visually emphasized right after a change. */
export const COLOR_TARGET_CHANGE_HIGHLIGHT_MS = 500

export const COLOR_TARGET_OBJECT_COUNT_MIN = 8
export const COLOR_TARGET_OBJECT_COUNT_MAX = 16
/** How often the on-screen objects reshuffle position/color (independent of the target-color change cadence). */
export const COLOR_TARGET_RESHUFFLE_INTERVAL_MS = 1400

export interface ColorTargetPalette {
  id: string
  colorVar: string
  /** Extra non-color cue (spec §5: colorblind-safe symbol backup) — never rely on hue alone. */
  symbol: string
}

export const COLOR_TARGET_PALETTE: ColorTargetPalette[] = [
  { id: 'red', colorVar: '--stat-spatial', symbol: '▲' },
  { id: 'blue', colorVar: '--stat-focus', symbol: '●' },
  { id: 'green', colorVar: '--stat-judgment', symbol: '■' },
  { id: 'yellow', colorVar: '--stat-reaction', symbol: '★' },
  { id: 'purple', colorVar: '--stat-reasoning', symbol: '◆' },
]
