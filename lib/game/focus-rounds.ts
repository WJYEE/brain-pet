const FOCUS_NO_TARGET_SELECTION_MAX_RETRIES = 20

function shuffled<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Picks which real rounds have no target this session. Round 0 (first) and
 * the last round are always excluded so a fresh session opens — and, where
 * possible, closes — with a target present. Picks are re-rolled if any two
 * land adjacent (no back-to-back no-target rounds), bounded by
 * FOCUS_NO_TARGET_SELECTION_MAX_RETRIES; falls back to an evenly spaced pick
 * if that's exhausted (not expected to trigger in practice).
 */
export function selectNoTargetRoundIndices(totalRounds: number, noTargetCount: number): Set<number> {
  const candidates = Array.from({ length: totalRounds - 2 }, (_, i) => i + 1)

  for (let attempt = 0; attempt < FOCUS_NO_TARGET_SELECTION_MAX_RETRIES; attempt++) {
    const picked = shuffled(candidates).slice(0, noTargetCount).sort((a, b) => a - b)
    const nonAdjacent = picked.every((v, i) => i === 0 || v - picked[i - 1] > 1)
    if (nonAdjacent) return new Set(picked)
  }

  const step = Math.max(1, Math.floor(candidates.length / noTargetCount))
  return new Set(candidates.filter((_, i) => i % step === 0).slice(0, noTargetCount))
}
