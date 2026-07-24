import { allCellIds } from '@/lib/game/memory-grid'

function shuffled(cells: string[]): string[] {
  const result = [...cells]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export interface FocusLayout {
  occupiedCells: string[]
  targetCellId: string | null
}

/**
 * Randomly places the target (if present) among distractorCount distractor
 * cells within a gridSize x gridSize grid (Tutorial and Real use different
 * fixed sizes — see FOCUS_TUTORIAL_GRID_SIZE / FOCUS_REAL_GRID_SIZE). Unlike
 * Memory's target-cell picker, Focus doesn't need a "too regular pattern"
 * filter — the cognitive task here is visual discrimination among
 * simultaneous symbols, not memorizing a layout, so uniform random placement
 * is sufficient and keeps this simple.
 */
export function generateFocusLayout(
  gridSize: number,
  distractorCount: number,
  targetPresent: boolean,
): FocusLayout {
  const neededCount = distractorCount + (targetPresent ? 1 : 0)
  const occupiedCells = shuffled(allCellIds(gridSize)).slice(0, neededCount)
  const targetCellId = targetPresent ? occupiedCells[0] : null
  return { occupiedCells, targetCellId }
}
