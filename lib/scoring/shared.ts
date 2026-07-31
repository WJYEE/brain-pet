import type { InputType } from '@/lib/game/types'

/** Clamps and rounds any weighted-formula output to the 0-100 normalizedScore range every game (old and new) reports in. */
export function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

/**
 * Cross-variant Personal Best comparator for the 6 new games — used instead
 * of each stat's existing isBetterXResult() (lib/scoring/reaction.ts etc.)
 * whenever the current best and the new attempt might be different game
 * variants under the same stat (their rawSummary shapes aren't comparable
 * field-by-field). Plain gameScore comparison; the untouched per-variant
 * comparators still govern same-variant vs same-variant comparisons.
 */
export function isBetterByGameScore(candidateScore: number, currentScore: number | null): boolean {
  if (currentScore === null) return true
  return candidateScore > currentScore
}

/** Reaction-time-to-score curve shared by the new timed games: faster reactions score higher, floored at 0 once responses are slower than `worstMs`. */
export function scoreFromReactionTime(reactionMs: number, bestMs: number, worstMs: number): number {
  if (reactionMs <= bestMs) return 100
  if (reactionMs >= worstMs) return 0
  return 100 * (1 - (reactionMs - bestMs) / (worstMs - bestMs))
}

/**
 * Touch input measurably registers slower than mouse/keyboard clicks —
 * touch-panel debounce and OS-level touch-event batching add roughly
 * 30-80ms of latency on consumer touchscreens (well-documented HCI
 * phenomenon), which would otherwise unfairly penalize a mobile player in
 * any speed-based score term. Conservative fixed offsets, applied only right
 * before a *_SCORE_WEIGHTS speed term is computed — the raw measured ms
 * shown to the user (raw.primary/secondary) is never touched.
 */
const INPUT_LATENCY_OFFSET_MS: Record<InputType, number> = {
  touch: 50,
  mouse: 0,
  keyboard: 0,
  unknown: 25,
}

/** Subtracts the input method's expected latency overhead from a raw measured ms value, floored at 0. */
export function normalizeForInput(rawMs: number, inputType: InputType): number {
  return Math.max(0, rawMs - INPUT_LATENCY_OFFSET_MS[inputType])
}

/** Linear 0-1 normalization where a higher raw value scores higher — the opposite direction from scoreFromReactionTime (used for count/throughput-style metrics, e.g. blocks processed). */
export function normalizeUpward(value: number, min: number, max: number): number {
  if (value <= min) return 0
  if (value >= max) return 1
  return (value - min) / (max - min)
}
