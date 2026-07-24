export type FocusShape = 'star' | 'diamond' | 'circle' | 'square' | 'triangle'

export interface FocusSymbolSpec {
  shape: FocusShape
  rotationDeg: number
  hasDot: boolean
  /** True = the dot sits slightly off-center (Lv4's subtle structural tell). */
  dotOffset: boolean
}

/**
 * The one thing to find, fixed for the entire session — Focus measures
 * sustained selective attention to a constant target, never a changing rule
 * (that's Judgment's job, not Focus's).
 */
export const FOCUS_TARGET_SYMBOL: FocusSymbolSpec = {
  shape: 'star',
  rotationDeg: 0,
  hasDot: true,
  dotOffset: false,
}

const DIFFERENT_FAMILY_SHAPES: FocusShape[] = ['circle', 'square', 'triangle']

function randomRightAngle(): number {
  return Math.floor(Math.random() * 4) * 90
}

/**
 * Distractor appearance by similarity level. Never color-only (GAME_SPEC:
 * display/color-vision differences shouldn't drive the difficulty):
 * Lv1 — an unrelated shape family entirely.
 * Lv2 — same "pointy" family (diamond), but a different outline than the star target.
 * Lv3 — identical star shape, just missing the target's inner dot.
 * Lv4 — identical star + dot, but the dot sits slightly off-center — a real
 *       structural difference that rewards close inspection, not a color trick.
 */
export function generateDistractorSymbol(similarityLevel: number): FocusSymbolSpec {
  if (similarityLevel <= 1) {
    const shape = DIFFERENT_FAMILY_SHAPES[Math.floor(Math.random() * DIFFERENT_FAMILY_SHAPES.length)]
    return { shape, rotationDeg: randomRightAngle(), hasDot: false, dotOffset: false }
  }
  if (similarityLevel === 2) {
    return { shape: 'diamond', rotationDeg: randomRightAngle(), hasDot: false, dotOffset: false }
  }
  if (similarityLevel === 3) {
    return { shape: 'star', rotationDeg: 0, hasDot: false, dotOffset: false }
  }
  return { shape: 'star', rotationDeg: 0, hasDot: true, dotOffset: true }
}
