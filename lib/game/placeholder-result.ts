import { generateResult, type StatId } from '@/lib/brain-bet'
import { generateSessionId } from '@/lib/game/id'
import type { DeviceInfo, FlowModeType, GameResult, PlaceholderGameResult } from '@/lib/game/types'

/**
 * Builds a result for the 5 stats without real game logic yet. Reuses the
 * PHASE 1 mock generator (lib/brain-bet.ts generateResult) for the display
 * raw record, and treats its mock 0-100 value purely as an internal ordering
 * key for Personal Best bookkeeping — never as a real Game Score or Final Stat.
 */
export function buildPlaceholderResult(
  statId: Exclude<StatId, 'reaction'>,
  mode: FlowModeType,
  device: DeviceInfo,
  prevBest: GameResult | null,
): PlaceholderGameResult {
  const mock = generateResult(statId)
  const gameScore = mock.final
  const isPersonalBest = !prevBest || gameScore > prevBest.gameScore

  return {
    sessionId: generateSessionId(),
    gameId: statId,
    gameVersion: `${statId}_placeholder`,
    mode,
    playedAt: new Date().toISOString(),
    device,
    gameScore,
    raw: mock.raw,
    final: undefined,
    isPersonalBest,
    isValidAttempt: true,
    invalidReason: null,
  }
}
