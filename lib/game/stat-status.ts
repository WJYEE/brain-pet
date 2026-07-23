import { PLAY_ORDER, type StatId } from '@/lib/brain-bet'
import type { GameResult, StatStatus, StatStatusMap } from '@/lib/game/types'

export function emptyStatStatus(): StatStatus {
  return { initial: null, current: null, history: [] }
}

export function emptyStatStatusMap(): StatStatusMap {
  return Object.fromEntries(PLAY_ORDER.map((id) => [id, emptyStatStatus()])) as StatStatusMap
}

/**
 * Applies a new result to a stat's status:
 * - `initial` locks the first time this stat is ever completed and is never overwritten again
 * - `current` is replaced only when the new result is flagged as a personal best
 * - `history` always grows, even for invalid attempts (kept for audit; initial/current ignore them)
 */
export function applyGameResult(
  statId: StatId,
  map: StatStatusMap,
  result: GameResult,
): StatStatusMap {
  const prev = map[statId]
  const history = [...prev.history, result]

  if (!result.isValidAttempt) {
    return { ...map, [statId]: { ...prev, history } }
  }

  const initial = prev.initial ?? result
  const current = result.isPersonalBest || !prev.current ? result : prev.current

  return { ...map, [statId]: { initial, current, history } }
}
