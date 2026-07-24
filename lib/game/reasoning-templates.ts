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
  /**
   * One short sentence (readable in ~1-1.5s) explaining WHY the correct
   * answer is correct, shown only after the player has already answered
   * (never as a pre-answer hint). Static per Template rather than per
   * instance since the underlying rule shape doesn't change between
   * randomized instances of the same Template.
   */
  ruleExplanation: string
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
  ruleExplanation: '두 모양이 번갈아 나오는 규칙이에요.',
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
  ruleExplanation: '한 단계마다 개수가 1개씩 늘어나요.',
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
  ruleExplanation: '한 단계마다 개수가 1개씩 줄어들어요.',
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

/**
 * Revised (was ambiguous): the original 3-cell version showed only 3 distinct
 * positions with no repetition, so "the answer loops back to the first
 * position" was an unprovable assumption — nothing in the shown sequence
 * demonstrated that it cycles at all. Now the known sequence is 4 cells,
 * ending with a repeat of the first position, so the period-3 cycle is
 * directly evidenced before the player has to predict the next step.
 */
const positionCycle3: ReasoningTemplate = {
  id: 'position-cycle-3',
  reasoningType: 'position',
  difficultyLevel: 1,
  ruleExplanation: '세 위치가 순서대로 돌아가며 반복되는 규칙이에요.',
  generate: () => {
    const [p0, p1, p2, pUnused] = shuffled([0, 1, 2, 3]) as [0 | 1 | 2 | 3, 0 | 1 | 2 | 3, 0 | 1 | 2 | 3, 0 | 1 | 2 | 3]
    return {
      sequence: [sym({ position: p0 }), sym({ position: p1 }), sym({ position: p2 }), sym({ position: p0 })],
      correctAnswer: sym({ position: p1 }),
      distractors: [
        { symbol: sym({ position: p0 }), type: 'repeat-previous' },
        { symbol: sym({ position: p2 }), type: 'reverse-direction' },
        { symbol: sym({ position: pUnused }), type: null },
      ],
    }
  },
}

const countToggle2: ReasoningTemplate = {
  id: 'count-toggle-2',
  reasoningType: 'alternation',
  difficultyLevel: 1,
  ruleExplanation: '개수가 두 값을 번갈아 반복해요.',
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

/**
 * Revised (was ambiguous): the original 4-cell "A B B C" version never
 * showed the cycle repeating, so returning to A was an unproven guess.
 * Extended to 5 known cells ("A B B C A") so the loop-back to A is directly
 * observed before the player predicts the 6th cell.
 */
const shapeCycleAbbc: ReasoningTemplate = {
  id: 'shape-cycle-abbc',
  reasoningType: 'alternation',
  difficultyLevel: 2,
  ruleExplanation: '모양 네 개가 한 묶음으로 반복되는 규칙이에요.',
  generate: () => {
    const [A, B, C, D] = shuffledShapes()
    return {
      sequence: [sym({ shape: A }), sym({ shape: B }), sym({ shape: B }), sym({ shape: C }), sym({ shape: A })],
      correctAnswer: sym({ shape: B }),
      distractors: [
        { symbol: sym({ shape: A }), type: 'repeat-previous' },
        { symbol: sym({ shape: C }), type: null },
        { symbol: sym({ shape: D }), type: null },
      ],
    }
  },
}

/**
 * Revised (was ambiguous): the original 3-cell version showed only 2 diffs
 * (+1, then +2) and assumed the player would guess the alternation continues
 * with +1 — but 2 diffs alone don't distinguish "alternating +1/+2" from any
 * other next step. Extended to 4 known cells (diffs +1, +2, +1) so the
 * alternation is actually confirmed (the 1st and 3rd diffs match) before
 * asking for the 4th.
 */
const countAlternatingIncrement: ReasoningTemplate = {
  id: 'count-alternating-increment',
  reasoningType: 'count',
  difficultyLevel: 2,
  ruleExplanation: '개수가 늘어나는 폭이 1개, 2개씩 번갈아요.',
  generate: () => {
    const shape = pickOneShape()
    const start = randomInt(1, 3)
    const v0 = start
    const v1 = v0 + 1
    const v2 = v1 + 2
    const v3 = v2 + 1
    const v4 = v3 + 2
    return {
      sequence: [sym({ shape, count: v0 }), sym({ shape, count: v1 }), sym({ shape, count: v2 }), sym({ shape, count: v3 })],
      correctAnswer: sym({ shape, count: v4 }),
      distractors: [
        { symbol: sym({ shape, count: v3 }), type: 'repeat-previous' },
        { symbol: sym({ shape, count: v3 + 1 }), type: 'reverse-direction' },
        { symbol: sym({ shape, count: v0 }), type: null },
      ],
    }
  },
}

/**
 * Revised (was ambiguous, and structurally unfixable in its original form):
 * the original "position advances by +1, then +2" pattern lived in a 4-slot
 * (mod 4) position space, where the "return to the start after 2 steps"
 * coincidence made an alternating-step reading and a simple period-3 cycle
 * reading fit the same evidence, with no way to tell them apart even with a
 * longer sequence. Replaced with a full period-4 cycle (every quadrant used
 * once, then repeated) — a pattern that can be directly verified from the
 * shown cells rather than inferred from step arithmetic.
 */
const positionCycle4: ReasoningTemplate = {
  id: 'position-cycle-4',
  reasoningType: 'position',
  difficultyLevel: 2,
  ruleExplanation: '네 위치가 순서대로 돌아가며 반복되는 규칙이에요.',
  generate: () => {
    const [p0, p1, p2, p3] = shuffled([0, 1, 2, 3]) as [0 | 1 | 2 | 3, 0 | 1 | 2 | 3, 0 | 1 | 2 | 3, 0 | 1 | 2 | 3]
    return {
      sequence: [sym({ position: p0 }), sym({ position: p1 }), sym({ position: p2 }), sym({ position: p3 }), sym({ position: p0 })],
      correctAnswer: sym({ position: p1 }),
      distractors: [
        { symbol: sym({ position: p0 }), type: 'repeat-previous' },
        { symbol: sym({ position: p2 }), type: null },
        { symbol: sym({ position: p3 }), type: null },
      ],
    }
  },
}

const rotationToggle2: ReasoningTemplate = {
  id: 'rotation-toggle-2',
  reasoningType: 'alternation',
  difficultyLevel: 2,
  ruleExplanation: '회전 방향이 두 각도를 번갈아요.',
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
  ruleExplanation: '세 모양이 순서대로 돌아가며 반복되는 규칙이에요.',
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
  ruleExplanation: '모양은 번갈아 바뀌고, 개수는 하나씩 늘어나요.',
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

/**
 * Revised (was ambiguous): the original 3-cell version never showed the
 * position cycle repeat back to its start, so "answer = p0" was an
 * unproven guess (same root issue as Level 1's position-cycle-3 before its
 * fix). Extended to 4 known cells so the shape alternation continues one
 * more step AND the position cycle's return to its start is directly shown.
 */
const positionCyclePlusShapeAlt: ReasoningTemplate = {
  id: 'position-cycle-plus-shape-alt',
  reasoningType: 'compound',
  difficultyLevel: 3,
  ruleExplanation: '모양은 두 가지가 번갈아 바뀌고, 위치는 세 곳을 돌아가며 반복돼요.',
  generate: () => {
    const [A, B] = shuffledShapes()
    const [p0, p1, p2] = shuffled([0, 1, 2, 3]).slice(0, 3) as [0 | 1 | 2 | 3, 0 | 1 | 2 | 3, 0 | 1 | 2 | 3]
    return {
      sequence: [
        sym({ shape: A, position: p0 }),
        sym({ shape: B, position: p1 }),
        sym({ shape: A, position: p2 }),
        sym({ shape: B, position: p0 }),
      ],
      correctAnswer: sym({ shape: A, position: p1 }),
      distractors: [
        { symbol: sym({ shape: B, position: p0 }), type: 'repeat-previous' },
        { symbol: sym({ shape: A, position: p0 }), type: 'partial-attribute' },
        { symbol: sym({ shape: B, position: p1 }), type: 'partial-attribute' },
      ],
    }
  },
}

const rotationTogglePlusCountIncrease: ReasoningTemplate = {
  id: 'rotation-toggle-plus-count-increase',
  reasoningType: 'compound',
  difficultyLevel: 3,
  ruleExplanation: '회전은 두 각도를 번갈고, 개수는 하나씩 늘어나요.',
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

/**
 * Revised (was ambiguous): the original 3-cell version ("A B C") never
 * showed the shape cycle loop back to A, so the answer's shape (A again)
 * was an unproven guess. Extended to 4 known cells so the shape cycle's
 * return to A is directly shown, and the position toggle gets one more
 * confirming step too.
 */
const shapeCycle3PlusPositionToggle: ReasoningTemplate = {
  id: 'shape-cycle3-plus-position-toggle',
  reasoningType: 'compound',
  difficultyLevel: 3,
  ruleExplanation: '모양은 세 가지가 순서대로 돌아가고, 위치는 두 곳을 번갈아요.',
  generate: () => {
    const [A, B, C] = shuffledShapes()
    const [q0, q1] = shuffled([0, 1, 2, 3]).slice(0, 2) as [0 | 1 | 2 | 3, 0 | 1 | 2 | 3]
    return {
      sequence: [
        sym({ shape: A, position: q0 }),
        sym({ shape: B, position: q1 }),
        sym({ shape: C, position: q0 }),
        sym({ shape: A, position: q1 }),
      ],
      correctAnswer: sym({ shape: B, position: q0 }),
      distractors: [
        { symbol: sym({ shape: A, position: q1 }), type: 'repeat-previous' },
        { symbol: sym({ shape: B, position: q1 }), type: 'partial-attribute' },
        { symbol: sym({ shape: A, position: q0 }), type: 'partial-attribute' },
      ],
    }
  },
}

const countDecreasePlusShapeAlt: ReasoningTemplate = {
  id: 'count-decrease-plus-shape-alt',
  reasoningType: 'compound',
  difficultyLevel: 3,
  ruleExplanation: '모양은 번갈아 바뀌고, 개수는 하나씩 줄어들어요.',
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
// a Level-2-tier sub-rule (a longer cycle or a second independent cycle)
// rather than a simple 2-step alternation — genuinely harder to fully verify
// by eye, while every sub-rule reuses a structure already proven safe
// (fully evidenced, non-ambiguous) earlier. MVP scope: templates that stayed
// structurally ambiguous even after a fix attempt (position advancing by
// arithmetic steps in a 4-slot space) were replaced with an equally-compound
// but provable alternative rather than shipped as "hard but unfair".
// ---------------------------------------------------------------------------

const shapeCycle3PlusCountToggle: ReasoningTemplate = {
  id: 'shape-cycle3-plus-count-toggle',
  reasoningType: 'compound',
  difficultyLevel: 4,
  ruleExplanation: '모양은 세 가지가 순서대로 돌아가고, 개수는 두 값을 번갈아요.',
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

/**
 * Revised (was structurally ambiguous): the original position "two-step"
 * (advance by +1, then +2, mod 4) aliased with a simple period-3 position
 * cycle — both readings fit the same shown cells, with no sequence length
 * that disambiguates them (the mod-4 arithmetic makes them coincide exactly
 * where the proof cell would go). Replaced the position sub-rule with the
 * same provable period-3 cycle used elsewhere, kept alongside the rotation
 * toggle.
 */
const positionCyclePlusRotationToggle: ReasoningTemplate = {
  id: 'position-cycle-plus-rotation-toggle',
  reasoningType: 'compound',
  difficultyLevel: 4,
  ruleExplanation: '위치는 세 곳을 돌아가며 반복되고, 회전은 두 각도를 번갈아요.',
  generate: () => {
    const [a, b] = shuffled(ANGLE_POOL).slice(0, 2) as [0 | 90 | 180 | 270, 0 | 90 | 180 | 270]
    const [p0, p1, p2] = shuffled([0, 1, 2, 3]).slice(0, 3) as [0 | 1 | 2 | 3, 0 | 1 | 2 | 3, 0 | 1 | 2 | 3]
    return {
      sequence: [
        sym({ shape: 'triangle', position: p0, rotationDeg: a }),
        sym({ shape: 'triangle', position: p1, rotationDeg: b }),
        sym({ shape: 'triangle', position: p2, rotationDeg: a }),
        sym({ shape: 'triangle', position: p0, rotationDeg: b }),
      ],
      correctAnswer: sym({ shape: 'triangle', position: p1, rotationDeg: a }),
      distractors: [
        { symbol: sym({ shape: 'triangle', position: p0, rotationDeg: b }), type: 'repeat-previous' },
        { symbol: sym({ shape: 'triangle', position: p0, rotationDeg: a }), type: 'partial-attribute' },
        { symbol: sym({ shape: 'triangle', position: p1, rotationDeg: b }), type: 'partial-attribute' },
      ],
    }
  },
}

/**
 * Revised (was doubly ambiguous): the original combined an unproven shape
 * cycle ("A B C" with no shown repeat) with an unproven alternating count
 * step (only 2 diffs shown). Simplified to a plain +1-per-step count (already
 * proven unambiguous at Level 1) paired with a provable shape cycle (proven
 * via a 4th cell repeating the 1st) — still a genuine 2-attribute compound,
 * just without stacking two separately-unprovable rules on top of each other.
 */
const shapeCycle3PlusCountIncrease: ReasoningTemplate = {
  id: 'shape-cycle3-plus-count-increase',
  reasoningType: 'compound',
  difficultyLevel: 4,
  ruleExplanation: '모양은 세 가지가 순서대로 돌아가고, 개수는 한 단계마다 1개씩 늘어나요.',
  generate: () => {
    const [A, B, C] = shuffledShapes()
    const start = randomInt(1, 3)
    return {
      sequence: [
        sym({ shape: A, count: start }),
        sym({ shape: B, count: start + 1 }),
        sym({ shape: C, count: start + 2 }),
        sym({ shape: A, count: start + 3 }),
      ],
      correctAnswer: sym({ shape: B, count: start + 4 }),
      distractors: [
        { symbol: sym({ shape: A, count: start + 3 }), type: 'repeat-previous' },
        { symbol: sym({ shape: B, count: start + 3 }), type: 'partial-attribute' },
        { symbol: sym({ shape: A, count: start + 4 }), type: 'partial-attribute' },
      ],
    }
  },
}

/**
 * Revised (was ambiguous): the original rotation cycle ("a b c" with no
 * shown repeat) never proved it loops back to `a`. Extended to 4 known
 * cells so the rotation cycle's return to `a` is directly shown, alongside
 * one more confirming step of the count toggle.
 */
const rotationCycle3PlusCountToggle: ReasoningTemplate = {
  id: 'rotation-cycle3-plus-count-toggle',
  reasoningType: 'compound',
  difficultyLevel: 4,
  ruleExplanation: '회전은 세 각도가 순서대로 돌아가고, 개수는 두 값을 번갈아요.',
  generate: () => {
    const [a, b, c] = shuffled(ANGLE_POOL).slice(0, 3) as [0 | 90 | 180 | 270, 0 | 90 | 180 | 270, 0 | 90 | 180 | 270]
    const [x, y] = pickTwoDistinctCounts(2, 6)
    return {
      sequence: [
        sym({ shape: 'triangle', rotationDeg: a, count: x }),
        sym({ shape: 'triangle', rotationDeg: b, count: y }),
        sym({ shape: 'triangle', rotationDeg: c, count: x }),
        sym({ shape: 'triangle', rotationDeg: a, count: y }),
      ],
      correctAnswer: sym({ shape: 'triangle', rotationDeg: b, count: x }),
      distractors: [
        { symbol: sym({ shape: 'triangle', rotationDeg: a, count: y }), type: 'repeat-previous' },
        { symbol: sym({ shape: 'triangle', rotationDeg: b, count: y }), type: 'partial-attribute' },
        { symbol: sym({ shape: 'triangle', rotationDeg: a, count: x }), type: 'partial-attribute' },
      ],
    }
  },
}

/**
 * Revised (was structurally ambiguous, same mod-4 aliasing issue as
 * position-cycle-plus-rotation-toggle above): replaced the position
 * "two-step" sub-rule with the provable period-3 cycle, now paired with a
 * count toggle instead of shape alternation (position-cycle-plus-shape-alt
 * already covers that pairing at Level 3, so this stays a distinct puzzle
 * rather than a reskin of it).
 */
const positionCyclePlusCountToggle: ReasoningTemplate = {
  id: 'position-cycle-plus-count-toggle',
  reasoningType: 'compound',
  difficultyLevel: 4,
  ruleExplanation: '위치는 세 곳을 돌아가며 반복되고, 개수는 두 값을 번갈아요.',
  generate: () => {
    const shape = pickOneShape()
    const [p0, p1, p2] = shuffled([0, 1, 2, 3]).slice(0, 3) as [0 | 1 | 2 | 3, 0 | 1 | 2 | 3, 0 | 1 | 2 | 3]
    const [c0, c1] = pickTwoDistinctCounts(2, 6)
    return {
      sequence: [
        sym({ shape, position: p0, count: c0 }),
        sym({ shape, position: p1, count: c1 }),
        sym({ shape, position: p2, count: c0 }),
        sym({ shape, position: p0, count: c1 }),
      ],
      correctAnswer: sym({ shape, position: p1, count: c0 }),
      distractors: [
        { symbol: sym({ shape, position: p0, count: c1 }), type: 'repeat-previous' },
        { symbol: sym({ shape, position: p0, count: c0 }), type: 'partial-attribute' },
        { symbol: sym({ shape, position: p1, count: c1 }), type: 'partial-attribute' },
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
  positionCycle4,
  rotationToggle2,
  shapeCycle3Period,
  shapeAltPlusCountIncrease,
  positionCyclePlusShapeAlt,
  rotationTogglePlusCountIncrease,
  shapeCycle3PlusPositionToggle,
  countDecreasePlusShapeAlt,
  shapeCycle3PlusCountToggle,
  positionCyclePlusRotationToggle,
  shapeCycle3PlusCountIncrease,
  rotationCycle3PlusCountToggle,
  positionCyclePlusCountToggle,
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
