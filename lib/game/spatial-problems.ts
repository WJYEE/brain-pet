import {
  SPATIAL_LEVELS,
  SPATIAL_LEVEL_DISTRACTOR_TYPES,
  SPATIAL_OPTION_COUNT,
  SPATIAL_QUESTIONS_PER_LEVEL,
} from '@/lib/config/spatial.config'
import {
  MIRROR_PARTNER_ID,
  SHAPE_BY_ID,
  SPATIAL_SHAPE_POOL,
  cellsSignature,
  normalizeCells,
  rotateCells,
  shapeIdsInTier,
  type CellCoord,
  type SpatialShapeTier,
} from '@/lib/game/spatial-shapes'
import type { SpatialDistractorType, SpatialRotationAngle } from '@/lib/game/types'

export interface GeneratedSpatialOption {
  shapeId: string
  rotationAngle: SpatialRotationAngle
  isMirrored: boolean
  isCorrect: boolean
  distractorType: SpatialDistractorType | null
  cells: CellCoord[]
}

export interface GeneratedSpatialQuestion {
  difficultyLevel: number
  referenceShapeId: string
  referenceCells: CellCoord[]
  correctRotationAngle: SpatialRotationAngle
  mirrorIncluded: boolean
  options: GeneratedSpatialOption[]
  correctOptionIndex: number
}

function shuffled<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** The correct option's rotation is always one of 90/180/270 — a 0° "already matching" card would let the user solve by simple visual comparison instead of Mental Rotation. */
function pickCorrectRotation(): SpatialRotationAngle {
  const angles: SpatialRotationAngle[] = [90, 180, 270]
  return angles[Math.floor(Math.random() * angles.length)]
}

/** Distractor rotation can be anything, including 0 — it's filler, not the thing being tested. */
function pickAnyRotation(): SpatialRotationAngle {
  const angles: SpatialRotationAngle[] = [0, 90, 180, 270]
  return angles[Math.floor(Math.random() * angles.length)]
}

/**
 * Picks a shape id for one distractor slot. 'mirror' always resolves to the
 * correct shape's registered mirror partner (a verified transform, not a new
 * shape). 'similar' draws from the correct shape's own tier (same rough
 * size/complexity); 'unrelated' draws from the whole pool.
 *
 * `usedInQuestion` is a HARD exclusion — a shape already chosen for one of
 * THIS question's other options can never be picked again, full stop
 * (otherwise two options could render as the identical shape). `usedInSession`
 * is a SOFT preference to avoid a shape that already appeared earlier this
 * session; it's relaxed (but `usedInQuestion` never is) if that would
 * otherwise leave no candidates, since the pools are small.
 */
function pickDistractorShapeId(
  type: SpatialDistractorType,
  correctShapeId: string,
  correctTier: SpatialShapeTier,
  usedInQuestion: Set<string>,
  usedInSession: Set<string>,
): string {
  const mirrorId = MIRROR_PARTNER_ID[correctShapeId]
  if (type === 'mirror') return mirrorId

  const candidatePool = type === 'similar' ? shapeIdsInTier(correctTier) : SPATIAL_SHAPE_POOL.map((s) => s.id)
  const hardExcluded = new Set([correctShapeId, mirrorId, ...usedInQuestion])
  const fresh = candidatePool.filter((id) => !hardExcluded.has(id) && !usedInSession.has(id))
  const fallback = candidatePool.filter((id) => !hardExcluded.has(id))
  const pool = fresh.length > 0 ? fresh : fallback
  return pool[Math.floor(Math.random() * pool.length)]
}

function shuffleOptionsPreservingCorrectIndex(
  options: GeneratedSpatialOption[],
): { options: GeneratedSpatialOption[]; correctIndex: number } {
  const order = shuffled(options.map((_, i) => i))
  const reordered = order.map((i) => options[i])
  return { options: reordered, correctIndex: reordered.findIndex((o) => o.isCorrect) }
}

/**
 * Dev-time safety net (GAME_SPEC §73's exact concerns): asserts exactly one
 * correct option, and that all 4 options render as pairwise-distinct
 * shapes. Should never actually fire given the pool-wide verification in
 * scripts/verify-spatial-shapes.ts, but throwing loudly here is cheap
 * insurance against a future pool edit silently breaking that guarantee.
 */
function validateQuestion(question: GeneratedSpatialQuestion): void {
  if (question.options.length !== SPATIAL_OPTION_COUNT) {
    throw new Error(`Spatial question has ${question.options.length} options, expected ${SPATIAL_OPTION_COUNT}`)
  }
  const correctCount = question.options.filter((o) => o.isCorrect).length
  if (correctCount !== 1) {
    throw new Error(`Spatial question has ${correctCount} correct options, expected exactly 1`)
  }
  const signatures = new Set(question.options.map((o) => cellsSignature(o.cells)))
  if (signatures.size !== question.options.length) {
    throw new Error('Spatial question has two options that render as the same shape')
  }
}

function buildQuestion(
  difficultyLevel: number,
  correctShapeId: string,
  distractorTypes: SpatialDistractorType[],
  usedShapeIds: Set<string>,
  fixedCorrectRotation?: SpatialRotationAngle,
): GeneratedSpatialQuestion {
  const correctShape = SHAPE_BY_ID[correctShapeId]
  const correctRotation = fixedCorrectRotation ?? pickCorrectRotation()
  const usedInQuestion = new Set<string>([correctShapeId])

  const options: GeneratedSpatialOption[] = [
    {
      shapeId: correctShapeId,
      rotationAngle: correctRotation,
      isMirrored: false,
      isCorrect: true,
      distractorType: null,
      cells: rotateCells(correctShape.cells, correctRotation),
    },
  ]

  for (const type of distractorTypes) {
    const shapeId = pickDistractorShapeId(type, correctShapeId, correctShape.tier, usedInQuestion, usedShapeIds)
    usedInQuestion.add(shapeId)
    usedShapeIds.add(shapeId)
    const rotation = pickAnyRotation()
    options.push({
      shapeId,
      rotationAngle: rotation,
      isMirrored: type === 'mirror',
      isCorrect: false,
      distractorType: type,
      cells: rotateCells(SHAPE_BY_ID[shapeId].cells, rotation),
    })
  }

  const { options: shuffledOptions, correctIndex } = shuffleOptionsPreservingCorrectIndex(options)

  const question: GeneratedSpatialQuestion = {
    difficultyLevel,
    referenceShapeId: correctShapeId,
    referenceCells: normalizeCells(correctShape.cells),
    correctRotationAngle: correctRotation,
    mirrorIncluded: distractorTypes.includes('mirror'),
    options: shuffledOptions,
    correctOptionIndex: correctIndex,
  }

  validateQuestion(question)
  return question
}

/**
 * Builds the fixed 8-question real session: Level 1 draws both 'simple'
 * (tetromino) shapes; Levels 2-4 sample 6 distinct 'complex' (pentomino)
 * shapes without replacement across the whole session (2 per Level) — no
 * base shape is ever the correct answer twice in one session.
 */
export function generateSpatialSession(): GeneratedSpatialQuestion[] {
  const simpleShapeIds = shuffled(shapeIdsInTier('simple'))
  const complexShapeIds = shuffled(shapeIdsInTier('complex')).slice(0, SPATIAL_LEVELS.length * SPATIAL_QUESTIONS_PER_LEVEL - SPATIAL_QUESTIONS_PER_LEVEL)

  const usedShapeIds = new Set<string>()
  const questions: GeneratedSpatialQuestion[] = []
  let complexCursor = 0

  for (const level of SPATIAL_LEVELS) {
    const shapeIdsForLevel =
      level === 1 ? simpleShapeIds : complexShapeIds.slice(complexCursor, complexCursor + SPATIAL_QUESTIONS_PER_LEVEL)
    if (level !== 1) complexCursor += SPATIAL_QUESTIONS_PER_LEVEL

    for (const shapeId of shapeIdsForLevel) {
      usedShapeIds.add(shapeId)
      questions.push(buildQuestion(level, shapeId, SPATIAL_LEVEL_DISTRACTOR_TYPES[level], usedShapeIds))
    }
  }
  return questions
}

/** Tutorial 1 — simple shape, fixed 90° rotation, no Mirror: "회전은 같은 도형이에요." Discarded from scoring. */
export function buildTutorialQuestion1(): GeneratedSpatialQuestion {
  return buildQuestion(0, 'tetro-l', ['unrelated', 'unrelated', 'unrelated'], new Set(['tetro-l']), 90)
}

/** Tutorial 2 — same shape, same fixed rotation, but one option is now the true Mirror: "거울에 비친 모양은 다른 도형이에요." Discarded from scoring. */
export function buildTutorialQuestion2(): GeneratedSpatialQuestion {
  return buildQuestion(0, 'tetro-l', ['mirror', 'unrelated', 'unrelated'], new Set(['tetro-l']), 90)
}
