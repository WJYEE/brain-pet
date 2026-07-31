export type PuzzleRotation = 0 | 90

export interface PuzzlePieceSpec {
  id: string
  /** Footprint at rotation 0. Always non-square (width !== height) so 0 vs 90 is never visually ambiguous — spec §8's "대칭 조각은 방향 판별이 모호하지 않게". */
  widthCells: number
  heightCells: number
  /** Rotation the piece must be turned to before it can snap into its target. */
  correctRotation: PuzzleRotation
  color: string
  targetCol: number
  targetRow: number
}

export interface PuzzleLevel {
  id: string
  /** 1 = 3 pieces / 0-1 rotation, 2 = 4-5 pieces / 2+ rotations, 3 = 6 pieces / multiple rotations + similarly-shaped pieces. */
  difficulty: 1 | 2 | 3
  boardCols: number
  boardRows: number
  pieces: PuzzlePieceSpec[]
  timeLimitSeconds: number
}

/** The footprint (in cells) a piece occupies once rotated to its correct orientation — this is the shape drawn as the empty target silhouette. */
export function finalFootprint(piece: PuzzlePieceSpec): { width: number; height: number } {
  return piece.correctRotation === 90
    ? { width: piece.heightCells, height: piece.widthCells }
    : { width: piece.widthCells, height: piece.heightCells }
}

/**
 * 12 levels (spec: "최소 12개, 난이도별 최소 4개" — 4 per difficulty here).
 * The original 4 rounds (level-1..4) are unchanged, just tagged with a
 * difficulty; level-5..12 fill out the pool so every difficulty tier has
 * enough variety for `pickFitPuzzleSession` to draw a fresh combination
 * each playthrough. Difficulty 3 levels intentionally include
 * similarly-shaped pieces (spec: "유사한 형태 포함") that only differ by
 * which slot/rotation they belong to, so shape alone can't solve them.
 */
export const PUZZLE_LEVELS: PuzzleLevel[] = [
  {
    id: 'level-1',
    difficulty: 1,
    boardCols: 3,
    boardRows: 3,
    timeLimitSeconds: 20,
    pieces: [
      { id: 'p1', widthCells: 1, heightCells: 2, correctRotation: 0, color: 'var(--stat-spatial)', targetCol: 1, targetRow: 0 },
    ],
  },
  {
    id: 'level-2',
    difficulty: 1,
    boardCols: 4,
    boardRows: 3,
    timeLimitSeconds: 25,
    pieces: [
      { id: 'p1', widthCells: 1, heightCells: 2, correctRotation: 0, color: 'var(--stat-spatial)', targetCol: 0, targetRow: 0 },
      { id: 'p2', widthCells: 1, heightCells: 2, correctRotation: 90, color: 'var(--stat-reasoning)', targetCol: 2, targetRow: 2 },
    ],
  },
  {
    id: 'level-3',
    difficulty: 2,
    boardCols: 4,
    boardRows: 4,
    timeLimitSeconds: 30,
    pieces: [
      { id: 'p1', widthCells: 1, heightCells: 3, correctRotation: 0, color: 'var(--stat-spatial)', targetCol: 0, targetRow: 0 },
      { id: 'p2', widthCells: 1, heightCells: 2, correctRotation: 90, color: 'var(--stat-reasoning)', targetCol: 1, targetRow: 3 },
      { id: 'p3', widthCells: 1, heightCells: 2, correctRotation: 0, color: 'var(--stat-judgment)', targetCol: 3, targetRow: 1 },
    ],
  },
  {
    id: 'level-4',
    difficulty: 2,
    boardCols: 4,
    boardRows: 4,
    timeLimitSeconds: 35,
    pieces: [
      { id: 'p1', widthCells: 1, heightCells: 2, correctRotation: 90, color: 'var(--stat-spatial)', targetCol: 0, targetRow: 0 },
      { id: 'p2', widthCells: 1, heightCells: 2, correctRotation: 0, color: 'var(--stat-reasoning)', targetCol: 0, targetRow: 2 },
      { id: 'p3', widthCells: 1, heightCells: 3, correctRotation: 90, color: 'var(--stat-judgment)', targetCol: 1, targetRow: 3 },
      { id: 'p4', widthCells: 1, heightCells: 2, correctRotation: 0, color: 'var(--stat-focus)', targetCol: 3, targetRow: 0 },
    ],
  },
  {
    id: 'level-5',
    difficulty: 1,
    boardCols: 3,
    boardRows: 2,
    timeLimitSeconds: 22,
    pieces: [
      { id: 'p1', widthCells: 1, heightCells: 2, correctRotation: 0, color: 'var(--stat-spatial)', targetCol: 0, targetRow: 0 },
      { id: 'p2', widthCells: 1, heightCells: 2, correctRotation: 0, color: 'var(--stat-reasoning)', targetCol: 1, targetRow: 0 },
      { id: 'p3', widthCells: 2, heightCells: 1, correctRotation: 90, color: 'var(--stat-judgment)', targetCol: 2, targetRow: 0 },
    ],
  },
  {
    id: 'level-6',
    difficulty: 1,
    boardCols: 4,
    boardRows: 3,
    timeLimitSeconds: 22,
    pieces: [
      { id: 'p1', widthCells: 1, heightCells: 3, correctRotation: 0, color: 'var(--stat-spatial)', targetCol: 0, targetRow: 0 },
      { id: 'p2', widthCells: 2, heightCells: 1, correctRotation: 0, color: 'var(--stat-reasoning)', targetCol: 1, targetRow: 2 },
      { id: 'p3', widthCells: 1, heightCells: 2, correctRotation: 0, color: 'var(--stat-focus)', targetCol: 3, targetRow: 0 },
    ],
  },
  {
    id: 'level-7',
    difficulty: 2,
    boardCols: 4,
    boardRows: 4,
    timeLimitSeconds: 28,
    pieces: [
      { id: 'p1', widthCells: 1, heightCells: 2, correctRotation: 0, color: 'var(--stat-spatial)', targetCol: 0, targetRow: 0 },
      { id: 'p2', widthCells: 2, heightCells: 1, correctRotation: 90, color: 'var(--stat-reasoning)', targetCol: 1, targetRow: 0 },
      { id: 'p3', widthCells: 2, heightCells: 1, correctRotation: 0, color: 'var(--stat-judgment)', targetCol: 2, targetRow: 0 },
      { id: 'p4', widthCells: 1, heightCells: 3, correctRotation: 0, color: 'var(--stat-focus)', targetCol: 3, targetRow: 1 },
      { id: 'p5', widthCells: 1, heightCells: 3, correctRotation: 90, color: 'var(--stat-memory)', targetCol: 0, targetRow: 2 },
    ],
  },
  {
    id: 'level-8',
    difficulty: 2,
    boardCols: 4,
    boardRows: 4,
    timeLimitSeconds: 28,
    pieces: [
      { id: 'p1', widthCells: 2, heightCells: 1, correctRotation: 0, color: 'var(--stat-spatial)', targetCol: 0, targetRow: 0 },
      { id: 'p2', widthCells: 2, heightCells: 1, correctRotation: 90, color: 'var(--stat-reasoning)', targetCol: 2, targetRow: 0 },
      { id: 'p3', widthCells: 1, heightCells: 2, correctRotation: 0, color: 'var(--stat-judgment)', targetCol: 3, targetRow: 0 },
      { id: 'p4', widthCells: 1, heightCells: 3, correctRotation: 90, color: 'var(--stat-focus)', targetCol: 0, targetRow: 2 },
    ],
  },
  {
    id: 'level-9',
    difficulty: 3,
    boardCols: 5,
    boardRows: 3,
    timeLimitSeconds: 34,
    pieces: [
      { id: 'p1', widthCells: 1, heightCells: 2, correctRotation: 0, color: 'var(--stat-spatial)', targetCol: 0, targetRow: 0 },
      { id: 'p2', widthCells: 2, heightCells: 1, correctRotation: 90, color: 'var(--stat-reasoning)', targetCol: 1, targetRow: 0 },
      { id: 'p3', widthCells: 1, heightCells: 2, correctRotation: 0, color: 'var(--stat-judgment)', targetCol: 2, targetRow: 0 },
      { id: 'p4', widthCells: 1, heightCells: 3, correctRotation: 0, color: 'var(--stat-focus)', targetCol: 3, targetRow: 0 },
      { id: 'p5', widthCells: 1, heightCells: 3, correctRotation: 90, color: 'var(--stat-memory)', targetCol: 0, targetRow: 2 },
      { id: 'p6', widthCells: 2, heightCells: 1, correctRotation: 90, color: 'var(--stat-reaction)', targetCol: 4, targetRow: 0 },
    ],
  },
  {
    id: 'level-10',
    difficulty: 3,
    boardCols: 4,
    boardRows: 4,
    timeLimitSeconds: 34,
    pieces: [
      { id: 'p1', widthCells: 1, heightCells: 2, correctRotation: 0, color: 'var(--stat-spatial)', targetCol: 0, targetRow: 0 },
      { id: 'p2', widthCells: 2, heightCells: 1, correctRotation: 90, color: 'var(--stat-reasoning)', targetCol: 1, targetRow: 0 },
      { id: 'p3', widthCells: 1, heightCells: 3, correctRotation: 0, color: 'var(--stat-judgment)', targetCol: 2, targetRow: 0 },
      { id: 'p4', widthCells: 3, heightCells: 1, correctRotation: 90, color: 'var(--stat-focus)', targetCol: 3, targetRow: 0 },
      { id: 'p5', widthCells: 1, heightCells: 2, correctRotation: 0, color: 'var(--stat-memory)', targetCol: 0, targetRow: 2 },
      { id: 'p6', widthCells: 2, heightCells: 1, correctRotation: 90, color: 'var(--stat-reaction)', targetCol: 1, targetRow: 2 },
    ],
  },
  {
    id: 'level-11',
    difficulty: 3,
    boardCols: 5,
    boardRows: 3,
    timeLimitSeconds: 34,
    pieces: [
      { id: 'p1', widthCells: 1, heightCells: 2, correctRotation: 0, color: 'var(--stat-spatial)', targetCol: 0, targetRow: 0 },
      { id: 'p2', widthCells: 1, heightCells: 2, correctRotation: 0, color: 'var(--stat-reasoning)', targetCol: 1, targetRow: 0 },
      { id: 'p3', widthCells: 2, heightCells: 1, correctRotation: 90, color: 'var(--stat-judgment)', targetCol: 2, targetRow: 0 },
      { id: 'p4', widthCells: 1, heightCells: 3, correctRotation: 0, color: 'var(--stat-focus)', targetCol: 3, targetRow: 0 },
      { id: 'p5', widthCells: 3, heightCells: 1, correctRotation: 90, color: 'var(--stat-memory)', targetCol: 4, targetRow: 0 },
      { id: 'p6', widthCells: 1, heightCells: 2, correctRotation: 90, color: 'var(--stat-reaction)', targetCol: 0, targetRow: 2 },
    ],
  },
  {
    id: 'level-12',
    difficulty: 3,
    boardCols: 4,
    boardRows: 5,
    timeLimitSeconds: 34,
    pieces: [
      { id: 'p1', widthCells: 1, heightCells: 2, correctRotation: 0, color: 'var(--stat-spatial)', targetCol: 0, targetRow: 0 },
      { id: 'p2', widthCells: 2, heightCells: 1, correctRotation: 90, color: 'var(--stat-reasoning)', targetCol: 1, targetRow: 0 },
      { id: 'p3', widthCells: 2, heightCells: 1, correctRotation: 90, color: 'var(--stat-judgment)', targetCol: 2, targetRow: 0 },
      { id: 'p4', widthCells: 1, heightCells: 3, correctRotation: 0, color: 'var(--stat-focus)', targetCol: 3, targetRow: 0 },
      { id: 'p5', widthCells: 3, heightCells: 1, correctRotation: 90, color: 'var(--stat-memory)', targetCol: 0, targetRow: 2 },
      { id: 'p6', widthCells: 1, heightCells: 2, correctRotation: 0, color: 'var(--stat-reaction)', targetCol: 3, targetRow: 3 },
    ],
  },
]

/**
 * Draws one session's worth of levels (1 easy + 2 normal + 1 hard = 4
 * rounds, ascending difficulty), matching the original fixed 4-round ramp
 * shape while sampling from the larger 12-level pool so replays vary.
 */
export function pickFitPuzzleSession(): PuzzleLevel[] {
  const byDifficulty = (d: 1 | 2 | 3) => PUZZLE_LEVELS.filter((l) => l.difficulty === d)
  const pick = (pool: PuzzleLevel[], count: number) => {
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, shuffled.length))
  }
  return [...pick(byDifficulty(1), 1), ...pick(byDifficulty(2), 2), ...pick(byDifficulty(3), 1)]
}
