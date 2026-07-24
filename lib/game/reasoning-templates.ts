import type { ReasoningDistractorType, ReasoningType } from '@/lib/game/types'

export type ReasoningShape = 'circle' | 'triangle' | 'square' | 'diamond'

const SHAPE_POOL: ReasoningShape[] = ['circle', 'triangle', 'square', 'diamond']
const ANGLE_POOL: Array<0 | 90 | 180 | 270> = [0, 90, 180, 270]

/**
 * One cell of a sequence — deliberately a flat set of independent attributes
 * (never a "rotate this shape to match" instruction) so Reasoning stays about
 * discovering how attributes evolve, not about performing a mental
 * transformation the way Spatial does. `position` is null whenever a
 * template doesn't vary position (rendered centered); when set, it's one of
 * 4 fixed quadrant slots.
 */
export interface ReasoningSymbolSpec {
  shape: ReasoningShape
  count: number
  rotationDeg: 0 | 90 | 180 | 270
  position: 0 | 1 | 2 | 3 | null
}

function sym(overrides: Partial<ReasoningSymbolSpec> = {}): ReasoningSymbolSpec {
  return { shape: 'circle', count: 1, rotationDeg: 0, position: null, ...overrides }
}

export function symbolSignature(symbol: ReasoningSymbolSpec): string {
  return `${symbol.shape}|${symbol.count}|${symbol.rotationDeg}|${symbol.position ?? 'none'}`
}

function shuffled<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function shuffledShapes(): ReasoningShape[] {
  return shuffled(SHAPE_POOL)
}

function pickOneShape(): ReasoningShape {
  return SHAPE_POOL[randomInt(0, SHAPE_POOL.length - 1)]
}

function pickTwoDistinctCounts(min: number, max: number): [number, number] {
  const a = randomInt(min, max)
  let b = randomInt(min, max)
  while (b === a) b = randomInt(min, max)
  return [a, b]
}

export interface ReasoningDistractorSpec {
  symbol: ReasoningSymbolSpec
  type: ReasoningDistractorType | null
}

export interface ReasoningTemplateInstance {
  /** The known cells shown before the "?" slot, in order. */
  sequence: ReasoningSymbolSpec[]
  correctAnswer: ReasoningSymbolSpec
  /** Exactly 3 — one per option slot alongside the correct answer. */
  distractors: ReasoningDistractorSpec[]
}

export interface ReasoningTemplate {
  id: string
  reasoningType: ReasoningType
  difficultyLevel: number
  generate: () => ReasoningTemplateInstance
}

// ---------------------------------------------------------------------------
// Level 1 — Single Rule. Exactly one attribute changes. No rotation yet (it's
// introduced starting Level 2, per design — rotation needs a non-circular
// shape to read visually, which is a slightly higher bar than shape/count/position).
// ---------------------------------------------------------------------------

const shapeAlternation2: ReasoningTemplate = {
  id: 'shape-alternation-2',
  reasoningType: 'alternation',
  difficultyLevel: 1,
  generate: () => {
    const [A, B, C, D] = shuffledShapes()
    return {
      sequence: [sym({ shape: A }), sym({ shape: B }), sym({ shape: A }), sym({ shape: B })],
      correctAnswer: sym({ shape: A }),
      distractors: [
        { symbol: sym({ shape: B }), type: 'repeat-previous' },
        { symbol: sym({ shape: C }), type: null },
        { symbol: sym({ shape: D }), type: null },
      ],
    }
  },
}

const countIncreaseBy1: ReasoningTemplate = {
  id: 'count-increase-by-1',
  reasoningType: 'count',
  difficultyLevel: 1,
  generate: () => {
    const shape = pickOneShape()
    const start = randomInt(1, 4)
    return {
      sequence: [sym({ shape, count: start }), sym({ shape, count: start + 1 }), sym({ shape, count: start + 2 })],
      correctAnswer: sym({ shape, count: start + 3 }),
      distractors: [
        { symbol: sym({ shape, count: start + 2 }), type: 'repeat-previous' },
        { symbol: sym({ shape, count: start + 1 }), type: 'reverse-direction' },
        { symbol: sym({ shape, count: start }), type: null },
      ],
    }
  },
}

const countDecreaseBy1: ReasoningTemplate = {
  id: 'count-decrease-by-1',
  reasoningType: 'count',
  difficultyLevel: 1,
  generate: () => {
    const shape = pickOneShape()
    const start = randomInt(4, 7)
    return {
      sequence: [sym({ shape, count: start }), sym({ shape, count: start - 1 }), sym({ shape, count: start - 2 })],
      correctAnswer: sym({ shape, count: start - 3 }),
      distractors: [
        { symbol: sym({ shape, count: start - 2 }), type: 'repeat-previous' },
        { symbol: sym({ shape, count: start - 1 }), type: 'reverse-direction' },
        { symbol: sym({ shape, count: start }), type: null },
      ],
    }
  },
}

const positionCycle3: ReasoningTemplate = {
  id: 'position-cycle-3',
  reasoningType: 'position',
  difficultyLevel: 1,
  generate: () => {
    const [p0, p1, p2, pUnused] = shuffled([0, 1, 2, 3]) as [0 | 1 | 2 | 3, 0 | 1 | 2 | 3, 0 | 1 | 2 | 3, 0 | 1 | 2 | 3]
    return {
      sequence: [sym({ position: p0 }), sym({ position: p1 }), sym({ position: p2 })],
      correctAnswer: sym({ position: p0 }),
      distractors: [
        { symbol: sym({ position: p2 }), type: 'repeat-previous' },
        { symbol: sym({ position: p1 }), type: 'reverse-direction' },
        { symbol: sym({ position: pUnused }), type: null },
      ],
    }
  },
}

const countToggle2: ReasoningTemplate = {
  id: 'count-toggle-2',
  reasoningType: 'alternation',
  difficultyLevel: 1,
  generate: () => {
    const shape = pickOneShape()
    const [a, b] = pickTwoDistinctCounts(2, 5)
    const usedCounts = new Set([a, b])
    const foreignCounts = [2, 3, 4, 5, 6, 7].filter((c) => !usedCounts.has(c))
    const [c, d] = shuffled(foreignCounts)
    return {
      sequence: [sym({ shape, count: a }), sym({ shape, count: b }), sym({ shape, count: a }), sym({ shape, count: b })],
      correctAnswer: sym({ shape, count: a }),
      distractors: [
        { symbol: sym({ shape, count: b }), type: 'repeat-previous' },
        { symbol: sym({ shape, count: c }), type: null },
        { symbol: sym({ shape, count: d }), type: null },
      ],
    }
  },
}

// ---------------------------------------------------------------------------
// Level 2 — Two-step Pattern. Longer periods, alternating step sizes, and
// (first appearance) rotation — always on a directional shape (triangle),
// always just one ingredient among several template structures, never
// "rotate to match a reference" the way Spatial works.
// ---------------------------------------------------------------------------

const shapeCycleAbbc: ReasoningTemplate = {
  id: 'shape-cycle-abbc',
  reasoningType: 'alternation',
  difficultyLevel: 2,
  generate: () => {
    const [A, B, C, D] = shuffledShapes()
    return {
      sequence: [sym({ shape: A }), sym({ shape: B }), sym({ shape: B }), sym({ shape: C })],
      correctAnswer: sym({ shape: A }),
      distractors: [
        { symbol: sym({ shape: C }), type: 'repeat-previous' },
        { symbol: sym({ shape: B }), type: null },
        { symbol: sym({ shape: D }), type: null },
      ],
    }
  },
}

const countAlternatingIncrement: ReasoningTemplate = {
  id: 'count-alternating-increment',
  reasoningType: 'count',
  difficultyLevel: 2,
  generate: () => {
    const shape = pickOneShape()
    const start = randomInt(1, 3)
    const v0 = start
    const v1 = v0 + 1
    const v2 = v1 + 2
    const v3 = v2 + 1
    return {
      sequence: [sym({ shape, count: v0 }), sym({ shape, count: v1 }), sym({ shape, count: v2 })],
      correctAnswer: sym({ shape, count: v3 }),
      distractors: [
        { symbol: sym({ shape, count: v2 }), type: 'repeat-previous' },
        { symbol: sym({ shape, count: v2 + 2 }), type: 'reverse-direction' },
        { symbol: sym({ shape, count: v0 }), type: null },
      ],
    }
  },
}

const positionTwoStep: ReasoningTemplate = {
  id: 'position-two-step',
  reasoningType: 'position',
  difficultyLevel: 2,
  generate: () => {
    const p0 = randomInt(0, 3) as 0 | 1 | 2 | 3
    const p1 = (((p0 + 1) % 4) as 0 | 1 | 2 | 3)
    const p2 = (((p1 + 2) % 4) as 0 | 1 | 2 | 3)
    const p3 = (((p2 + 1) % 4) as 0 | 1 | 2 | 3)
    const reverseGuess = ((p2 + 2) % 4) as 0 | 1 | 2 | 3
    const usedInOptions = new Set([p3, p2, reverseGuess])
    const remaining = ([0, 1, 2, 3] as const).find((p) => !usedInOptions.has(p)) ?? p2
    return {
      sequence: [sym({ position: p0 }), sym({ position: p1 }), sym({ position: p2 })],
      correctAnswer: sym({ position: p3 }),
      distractors: [
        { symbol: sym({ position: p2 }), type: 'repeat-previous' },
        { symbol: sym({ position: reverseGuess }), type: 'reverse-direction' },
        { symbol: sym({ position: remaining }), type: null },
      ],
    }
  },
}

const rotationToggle2: ReasoningTemplate = {
  id: 'rotation-toggle-2',
  reasoningType: 'alternation',
  difficultyLevel: 2,
  generate: () => {
    const [a, b, c, d] = shuffled(ANGLE_POOL)
    return {
      sequence: [
        sym({ shape: 'triangle', rotationDeg: a }),
        sym({ shape: 'triangle', rotationDeg: b }),
        sym({ shape: 'triangle', rotationDeg: a }),
        sym({ shape: 'triangle', rotationDeg: b }),
      ],
      correctAnswer: sym({ shape: 'triangle', rotationDeg: a }),
      distractors: [
        { symbol: sym({ shape: 'triangle', rotationDeg: b }), type: 'repeat-previous' },
        { symbol: sym({ shape: 'triangle', rotationDeg: c }), type: null },
        { symbol: sym({ shape: 'triangle', rotationDeg: d }), type: null },
      ],
    }
  },
}

const shapeCycle3Period: ReasoningTemplate = {
  id: 'shape-cycle-3period',
  reasoningType: 'alternation',
  difficultyLevel: 2,
  generate: () => {
    const [A, B, C, D] = shuffledShapes()
    return {
      sequence: [sym({ shape: A }), sym({ shape: B }), sym({ shape: C }), sym({ shape: A })],
      correctAnswer: sym({ shape: B }),
      distractors: [
        { symbol: sym({ shape: A }), type: 'repeat-previous' },
        { symbol: sym({ shape: C }), type: null },
        { symbol: sym({ shape: D }), type: null },
      ],
    }
  },
}

// ---------------------------------------------------------------------------
// Level 3 — Multiple Attribute. Two attributes change simultaneously, each
// via its own independent Level-1-style rule. Both attributes must be
// tracked to identify the correct answer — the two "partial-attribute"
// distractors specifically reward/punish tracking only one.
// ---------------------------------------------------------------------------

const shapeAltPlusCountIncrease: ReasoningTemplate = {
  id: 'shape-alt-plus-count-increase',
  reasoningType: 'compound',
  difficultyLevel: 3,
  generate: () => {
    const [A, B] = shuffledShapes()
    const start = randomInt(1, 4)
    return {
      sequence: [sym({ shape: A, count: start }), sym({ shape: B, count: start + 1 }), sym({ shape: A, count: start + 2 })],
      correctAnswer: sym({ shape: B, count: start + 3 }),
      distractors: [
        { symbol: sym({ shape: A, count: start + 2 }), type: 'repeat-previous' },
        { symbol: sym({ shape: B, count: start + 2 }), type: 'partial-attribute' },
        { symbol: sym({ shape: A, count: start + 3 }), type: 'partial-attribute' },
      ],
    }
  },
}

const positionCyclePlusShapeAlt: ReasoningTemplate = {
  id: 'position-cycle-plus-shape-alt',
  reasoningType: 'compound',
  difficultyLevel: 3,
  generate: () => {
    const [A, B] = shuffledShapes()
    const [p0, p1, p2] = shuffled([0, 1, 2, 3]).slice(0, 3) as [0 | 1 | 2 | 3, 0 | 1 | 2 | 3, 0 | 1 | 2 | 3]
    return {
      sequence: [sym({ shape: A, position: p0 }), sym({ shape: B, position: p1 }), sym({ shape: A, position: p2 })],
      correctAnswer: sym({ shape: B, position: p0 }),
      distractors: [
        { symbol: sym({ shape: A, position: p2 }), type: 'repeat-previous' },
        { symbol: sym({ shape: A, position: p0 }), type: 'partial-attribute' },
        { symbol: sym({ shape: B, position: p2 }), type: 'partial-attribute' },
      ],
    }
  },
}

const rotationTogglePlusCountIncrease: ReasoningTemplate = {
  id: 'rotation-toggle-plus-count-increase',
  reasoningType: 'compound',
  difficultyLevel: 3,
  generate: () => {
    const [a, b] = shuffled(ANGLE_POOL).slice(0, 2) as [0 | 90 | 180 | 270, 0 | 90 | 180 | 270]
    const start = randomInt(1, 4)
    return {
      sequence: [
        sym({ shape: 'triangle', rotationDeg: a, count: start }),
        sym({ shape: 'triangle', rotationDeg: b, count: start + 1 }),
        sym({ shape: 'triangle', rotationDeg: a, count: start + 2 }),
      ],
      correctAnswer: sym({ shape: 'triangle', rotationDeg: b, count: start + 3 }),
      distractors: [
        { symbol: sym({ shape: 'triangle', rotationDeg: a, count: start + 2 }), type: 'repeat-previous' },
        { symbol: sym({ shape: 'triangle', rotationDeg: b, count: start + 2 }), type: 'partial-attribute' },
        { symbol: sym({ shape: 'triangle', rotationDeg: a, count: start + 3 }), type: 'partial-attribute' },
      ],
    }
  },
}

const shapeCycle3PlusPositionToggle: ReasoningTemplate = {
  id: 'shape-cycle3-plus-position-toggle',
  reasoningType: 'compound',
  difficultyLevel: 3,
  generate: () => {
    const [A, B, C] = shuffledShapes()
    const [q0, q1] = shuffled([0, 1, 2, 3]).slice(0, 2) as [0 | 1 | 2 | 3, 0 | 1 | 2 | 3]
    return {
      sequence: [sym({ shape: A, position: q0 }), sym({ shape: B, position: q1 }), sym({ shape: C, position: q0 })],
      correctAnswer: sym({ shape: A, position: q1 }),
      distractors: [
        { symbol: sym({ shape: C, position: q0 }), type: 'repeat-previous' },
        { symbol: sym({ shape: A, position: q0 }), type: 'partial-attribute' },
        { symbol: sym({ shape: C, position: q1 }), type: 'partial-attribute' },
      ],
    }
  },
}

const countDecreasePlusShapeAlt: ReasoningTemplate = {
  id: 'count-decrease-plus-shape-alt',
  reasoningType: 'compound',
  difficultyLevel: 3,
  generate: () => {
    const [A, B] = shuffledShapes()
    const start = randomInt(4, 7)
    return {
      sequence: [sym({ shape: A, count: start }), sym({ shape: B, count: start - 1 }), sym({ shape: A, count: start - 2 })],
      correctAnswer: sym({ shape: B, count: start - 3 }),
      distractors: [
        { symbol: sym({ shape: A, count: start - 2 }), type: 'repeat-previous' },
        { symbol: sym({ shape: B, count: start - 2 }), type: 'partial-attribute' },
        { symbol: sym({ shape: A, count: start - 3 }), type: 'partial-attribute' },
      ],
    }
  },
}

// ---------------------------------------------------------------------------
// Level 4 — Compound Rule. Two attributes change together, at least one via
// a Level-2-tier sub-rule (a longer cycle or an uneven step) rather than a
// simple 2-step alternation — genuinely harder to fully verify by eye,
// while every sub-rule reuses a structure already exercised earlier.
// ---------------------------------------------------------------------------

const shapeCycle3PlusCountToggle: ReasoningTemplate = {
  id: 'shape-cycle3-plus-count-toggle',
  reasoningType: 'compound',
  difficultyLevel: 4,
  generate: () => {
    const [A, B, C] = shuffledShapes()
    const [c0, c1] = pickTwoDistinctCounts(2, 6)
    return {
      sequence: [sym({ shape: A, count: c0 }), sym({ shape: B, count: c1 }), sym({ shape: C, count: c0 }), sym({ shape: A, count: c1 })],
      correctAnswer: sym({ shape: B, count: c0 }),
      distractors: [
        { symbol: sym({ shape: A, count: c1 }), type: 'repeat-previous' },
        { symbol: sym({ shape: B, count: c1 }), type: 'partial-attribute' },
        { symbol: sym({ shape: A, count: c0 }), type: 'partial-attribute' },
      ],
    }
  },
}

const positionTwoStepPlusRotationToggle: ReasoningTemplate = {
  id: 'position-two-step-plus-rotation-toggle',
  reasoningType: 'compound',
  difficultyLevel: 4,
  generate: () => {
    const [a, b] = shuffled(ANGLE_POOL).slice(0, 2) as [0 | 90 | 180 | 270, 0 | 90 | 180 | 270]
    const p0 = randomInt(0, 3) as 0 | 1 | 2 | 3
    const p1 = (((p0 + 1) % 4) as 0 | 1 | 2 | 3)
    const p2 = (((p1 + 2) % 4) as 0 | 1 | 2 | 3)
    const p3 = (((p2 + 1) % 4) as 0 | 1 | 2 | 3)
    return {
      sequence: [
        sym({ shape: 'triangle', position: p0, rotationDeg: a }),
        sym({ shape: 'triangle', position: p1, rotationDeg: b }),
        sym({ shape: 'triangle', position: p2, rotationDeg: a }),
      ],
      correctAnswer: sym({ shape: 'triangle', position: p3, rotationDeg: b }),
      distractors: [
        { symbol: sym({ shape: 'triangle', position: p2, rotationDeg: a }), type: 'repeat-previous' },
        { symbol: sym({ shape: 'triangle', position: p3, rotationDeg: a }), type: 'partial-attribute' },
        { symbol: sym({ shape: 'triangle', position: p2, rotationDeg: b }), type: 'partial-attribute' },
      ],
    }
  },
}

const countAltIncrementPlusShapeCycle3: ReasoningTemplate = {
  id: 'count-alt-increment-plus-shape-cycle3',
  reasoningType: 'compound',
  difficultyLevel: 4,
  generate: () => {
    const [A, B, C] = shuffledShapes()
    const start = randomInt(1, 3)
    const v0 = start
    const v1 = v0 + 1
    const v2 = v1 + 2
    const v3 = v2 + 1
    return {
      sequence: [sym({ shape: A, count: v0 }), sym({ shape: B, count: v1 }), sym({ shape: C, count: v2 })],
      correctAnswer: sym({ shape: A, count: v3 }),
      distractors: [
        { symbol: sym({ shape: C, count: v2 }), type: 'repeat-previous' },
        { symbol: sym({ shape: A, count: v2 }), type: 'partial-attribute' },
        { symbol: sym({ shape: C, count: v3 }), type: 'partial-attribute' },
      ],
    }
  },
}

const rotationCycle3PlusCountToggle: ReasoningTemplate = {
  id: 'rotation-cycle3-plus-count-toggle',
  reasoningType: 'compound',
  difficultyLevel: 4,
  generate: () => {
    const [a, b, c] = shuffled(ANGLE_POOL).slice(0, 3) as [0 | 90 | 180 | 270, 0 | 90 | 180 | 270, 0 | 90 | 180 | 270]
    const [x, y] = pickTwoDistinctCounts(2, 6)
    return {
      sequence: [
        sym({ shape: 'triangle', rotationDeg: a, count: x }),
        sym({ shape: 'triangle', rotationDeg: b, count: y }),
        sym({ shape: 'triangle', rotationDeg: c, count: x }),
      ],
      correctAnswer: sym({ shape: 'triangle', rotationDeg: a, count: y }),
      distractors: [
        { symbol: sym({ shape: 'triangle', rotationDeg: c, count: x }), type: 'repeat-previous' },
        { symbol: sym({ shape: 'triangle', rotationDeg: a, count: x }), type: 'partial-attribute' },
        { symbol: sym({ shape: 'triangle', rotationDeg: c, count: y }), type: 'partial-attribute' },
      ],
    }
  },
}

const shapeAltPlusPositionTwoStep: ReasoningTemplate = {
  id: 'shape-alt-plus-position-two-step',
  reasoningType: 'compound',
  difficultyLevel: 4,
  generate: () => {
    const [A, B] = shuffledShapes()
    const p0 = randomInt(0, 3) as 0 | 1 | 2 | 3
    const p1 = (((p0 + 1) % 4) as 0 | 1 | 2 | 3)
    const p2 = (((p1 + 2) % 4) as 0 | 1 | 2 | 3)
    const p3 = (((p2 + 1) % 4) as 0 | 1 | 2 | 3)
    return {
      sequence: [sym({ shape: A, position: p0 }), sym({ shape: B, position: p1 }), sym({ shape: A, position: p2 })],
      correctAnswer: sym({ shape: B, position: p3 }),
      distractors: [
        { symbol: sym({ shape: A, position: p2 }), type: 'repeat-previous' },
        { symbol: sym({ shape: B, position: p2 }), type: 'partial-attribute' },
        { symbol: sym({ shape: A, position: p3 }), type: 'partial-attribute' },
      ],
    }
  },
}

/** All 20 hand-authored Templates — 5 per Level, verified for correctness/uniqueness by scripts/verify-reasoning-templates.ts during implementation. */
export const REASONING_TEMPLATES: ReasoningTemplate[] = [
  shapeAlternation2,
  countIncreaseBy1,
  countDecreaseBy1,
  positionCycle3,
  countToggle2,
  shapeCycleAbbc,
  countAlternatingIncrement,
  positionTwoStep,
  rotationToggle2,
  shapeCycle3Period,
  shapeAltPlusCountIncrease,
  positionCyclePlusShapeAlt,
  rotationTogglePlusCountIncrease,
  shapeCycle3PlusPositionToggle,
  countDecreasePlusShapeAlt,
  shapeCycle3PlusCountToggle,
  positionTwoStepPlusRotationToggle,
  countAltIncrementPlusShapeCycle3,
  rotationCycle3PlusCountToggle,
  shapeAltPlusPositionTwoStep,
]

export function templatesForLevel(level: number): ReasoningTemplate[] {
  return REASONING_TEMPLATES.filter((t) => t.difficultyLevel === level)
}

/** Tutorial 1 — ABAB shape alternation, fixed (not randomized) for a consistent first teaching moment. */
export function buildTutorial1Instance(): ReasoningTemplateInstance {
  return {
    sequence: [sym({ shape: 'circle' }), sym({ shape: 'triangle' }), sym({ shape: 'circle' }), sym({ shape: 'triangle' })],
    correctAnswer: sym({ shape: 'circle' }),
    distractors: [
      { symbol: sym({ shape: 'triangle' }), type: 'repeat-previous' },
      { symbol: sym({ shape: 'square' }), type: null },
      { symbol: sym({ shape: 'diamond' }), type: null },
    ],
  }
}

/** Tutorial 2 — count increase (●, ●●, ●●●, ?), fixed — teaches that the rule can be about "how many", not just "which shape". */
export function buildTutorial2Instance(): ReasoningTemplateInstance {
  return {
    sequence: [sym({ shape: 'circle', count: 1 }), sym({ shape: 'circle', count: 2 }), sym({ shape: 'circle', count: 3 })],
    correctAnswer: sym({ shape: 'circle', count: 4 }),
    distractors: [
      { symbol: sym({ shape: 'circle', count: 3 }), type: 'repeat-previous' },
      { symbol: sym({ shape: 'circle', count: 2 }), type: 'reverse-direction' },
      { symbol: sym({ shape: 'circle', count: 1 }), type: null },
    ],
  }
}
