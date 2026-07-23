/**
 * Grid cells are identified by flat row-major index strings ("0".."n²-1") so
 * neither the UI nor the scoring logic needs to assume a 2D (row, col) shape.
 */
export function totalCells(gridSize: number): number {
  return gridSize * gridSize
}

export function allCellIds(gridSize: number): string[] {
  return Array.from({ length: totalCells(gridSize) }, (_, i) => String(i))
}

function shuffled(cells: string[]): string[] {
  const result = [...cells]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function toRowCol(cellId: string, gridSize: number): [number, number] {
  const idx = Number(cellId)
  return [Math.floor(idx / gridSize), idx % gridSize]
}

/** Max attempts to reroll an overly-regular pattern before giving up and using the last roll (safety cap, not expected to be hit in practice). */
export const MEMORY_PATTERN_MAX_RETRIES = 20

/**
 * Rejects patterns that feel too "designed" rather than randomly scattered:
 * a perfect row/column/diagonal line, a fully rotation-symmetric layout, or
 * every target packed into one unbroken connected blob. Intentionally simple
 * — this is a cheap sanity filter, not a full randomness test, and some
 * randomness is expected to still occasionally look regular by chance.
 */
function isTooRegular(cells: string[], gridSize: number): boolean {
  if (cells.length < 3) return false

  const coords = cells.map((c) => toRowCol(c, gridSize))
  const [r0, c0] = coords[0]
  const allSameRow = coords.every(([r]) => r === r0)
  const allSameCol = coords.every(([, c]) => c === c0)
  const allSameDiag1 = coords.every(([r, c]) => r - c === r0 - c0)
  const allSameDiag2 = coords.every(([r, c]) => r + c === r0 + c0)
  if (allSameRow || allSameCol || allSameDiag1 || allSameDiag2) return true

  if (cells.length < 4) return false

  const cellSet = new Set(cells)

  const isSymmetric = cells.every((c) => {
    const [r, col] = toRowCol(c, gridSize)
    const mirrored = String((gridSize - 1 - r) * gridSize + (gridSize - 1 - col))
    return cellSet.has(mirrored)
  })
  if (isSymmetric) return true

  // Flood-fill from one target: if every target is reachable through
  // 4-directional neighbors that are also targets, they form one solid blob.
  const start = cells[0]
  const visited = new Set([start])
  const stack = [start]
  while (stack.length > 0) {
    const cur = stack.pop() as string
    const [r, c] = toRowCol(cur, gridSize)
    const neighbors: [number, number][] = [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ]
    for (const [nr, nc] of neighbors) {
      if (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize) continue
      const neighborId = String(nr * gridSize + nc)
      if (cellSet.has(neighborId) && !visited.has(neighborId)) {
        visited.add(neighborId)
        stack.push(neighborId)
      }
    }
  }
  return visited.size === cellSet.size
}

/**
 * Picks `targetCount` unique cells at random out of the grid, rerolling a
 * bounded number of times if the result looks too regular (see isTooRegular).
 * Falls back to the last roll if MEMORY_PATTERN_MAX_RETRIES is exhausted —
 * in practice this should be vanishingly rare.
 */
export function pickRandomTargetCells(gridSize: number, targetCount: number): string[] {
  let candidate = shuffled(allCellIds(gridSize)).slice(0, targetCount)
  for (let attempt = 1; attempt < MEMORY_PATTERN_MAX_RETRIES && isTooRegular(candidate, gridSize); attempt++) {
    candidate = shuffled(allCellIds(gridSize)).slice(0, targetCount)
  }
  return candidate
}
