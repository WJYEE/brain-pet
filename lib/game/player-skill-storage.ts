import { PLAY_ORDER, type StatId } from '@/lib/brain-bet'
import { clampScore, isBetterByGameScore } from '@/lib/scoring/shared'

/**
 * One mini-game's representative performance — REUSES the game's own
 * already-validated `gameScore` (0-100, see lib/game/types.ts#BaseGameResult)
 * as `normalizedScore` rather than recomputing anything from raw accuracy/
 * response-time fields. `gameId` here is the *specific* registered game (a
 * lib/game/game-registry.ts#GamePoolEntry.key, e.g. 'memory-story-recall'),
 * not the stat category — game-flow.tsx's `activeGameKey` state already
 * tracks exactly this and is threaded straight through.
 */
export interface MiniGamePerformanceRecord {
  completionId: string
  gameId: string
  statCategory: StatId
  normalizedScore: number
  completedAt: string
}

/**
 * Cross-session ledger of "how well have I actually played," kept
 * deliberately separate from lib/game/stat-status.ts's StatStatusMap
 * (in-memory-only, resets every reload, and tracks one cross-game
 * best-per-*stat*) and from lib/pets/pet-storage.ts's StoredPetProfile
 * (initialFinals/latestFinals — the hatch-time snapshot, untouched by this
 * file). `currentStats` (a category's real-skill average) is deliberately
 * NOT stored here — it's always derived fresh from `gameBestRecords` via
 * computeCurrentStats, so there is exactly one source of truth and no risk
 * of the two drifting apart.
 */
export interface PlayerSkillState {
  version: 1
  /** Keyed by GamePoolEntry.key — one representative (highest-normalizedScore-ever) record per registered game. */
  gameBestRecords: Record<string, MiniGamePerformanceRecord>
  /** Idempotency ledger (see recordMiniGameCompletion) — capped, not a full history. */
  processedCompletionIds: string[]
  updatedAt: string
}

const STORAGE_KEY = 'statling.playerSkill.v1'
/** processedCompletionIds is a dedupe window, not an audit log — this comfortably outlives any realistic burst of accidental duplicate calls (Strict Mode double-invoke, a few stray re-renders) without growing unbounded across a long play history. */
const MAX_PROCESSED_IDS = 200

export function createDefaultPlayerSkillState(): PlayerSkillState {
  return { version: 1, gameBestRecords: {}, processedCompletionIds: [], updatedAt: new Date(0).toISOString() }
}

function isWellFormed(value: Record<string, unknown>): boolean {
  return (
    typeof value.gameBestRecords === 'object' &&
    value.gameBestRecords !== null &&
    Array.isArray(value.processedCompletionIds)
  )
}

export function loadPlayerSkillState(): PlayerSkillState {
  if (typeof window === 'undefined') return createDefaultPlayerSkillState()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultPlayerSkillState()
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (!parsed || typeof parsed !== 'object' || !isWellFormed(parsed)) return createDefaultPlayerSkillState()
    return parsed as unknown as PlayerSkillState
  } catch {
    return createDefaultPlayerSkillState()
  }
}

export function savePlayerSkillState(state: PlayerSkillState): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export interface RecordCompletionInput {
  completionId: string
  gameId: string
  statCategory: StatId
  normalizedScore: number
  completedAt: string
}

export interface RecordCompletionResult {
  state: PlayerSkillState
  /** False when completionId was already processed (see the idempotency doc below) — every other field is unchanged from the input state in that case. */
  applied: boolean
}

/**
 * Idempotent entry point for "one mini-game finished." Safe to call more
 * than once with the *same* completionId (React Strict Mode double-invoke,
 * a duplicate click before UI disables, re-entering a result screen, ...) —
 * only the first call for a given completionId has any effect; every repeat
 * is a no-op (`applied: false`). The caller (game-flow.tsx) is responsible
 * for generating a completionId that stays stable across accidental
 * repeats of the *same* logical completion but changes for a genuinely new
 * one — see game-flow.tsx's `currentAttemptIdRef`.
 *
 * Within a single completionId, gameBestRecords[gameId] only ever improves:
 * a new normalizedScore replaces the stored one exactly when
 * isBetterByGameScore says so (lib/scoring/shared.ts — the same "higher
 * gameScore wins" rule the rest of the app's Personal Best logic already
 * uses), so replaying a game with a lower score never lowers its
 * contribution to the category average.
 */
export function recordMiniGameCompletion(
  state: PlayerSkillState,
  input: RecordCompletionInput,
): RecordCompletionResult {
  if (state.processedCompletionIds.includes(input.completionId)) {
    return { state, applied: false }
  }

  const existing = state.gameBestRecords[input.gameId]
  const shouldReplace = !existing || isBetterByGameScore(input.normalizedScore, existing.normalizedScore)

  const gameBestRecords = shouldReplace
    ? {
        ...state.gameBestRecords,
        [input.gameId]: {
          completionId: input.completionId,
          gameId: input.gameId,
          statCategory: input.statCategory,
          normalizedScore: clampScore(input.normalizedScore),
          completedAt: input.completedAt,
        },
      }
    : state.gameBestRecords

  const processedCompletionIds = [...state.processedCompletionIds, input.completionId].slice(-MAX_PROCESSED_IDS)

  return {
    applied: true,
    state: { ...state, gameBestRecords, processedCompletionIds, updatedAt: input.completedAt },
  }
}

/**
 * currentStats["카테고리 평균"]: the average of that category's registered
 * games' best-ever normalizedScore, one representative score per gameId (a
 * game played 50 times still contributes exactly once — its single best
 * run) — so no category can be inflated just by grinding one game, and a
 * category with more registered games isn't automatically favored over one
 * with fewer, since each game contributes one score regardless of how many
 * siblings it has.
 *
 * A stat with zero recorded games yet falls back to `initialStats[stat]`
 * (the Intro diagnostic) rather than showing 0 or a fake value — real data,
 * just not from repeated play — see StatusScreen's "최초 진단값" display for
 * why this reads better than either alternative.
 */
export function computeCurrentStats(
  gameBestRecords: Record<string, MiniGamePerformanceRecord>,
  initialStats: Record<StatId, number>,
): Record<StatId, number> {
  const scoresByStat: Record<StatId, number[]> = Object.fromEntries(
    PLAY_ORDER.map((stat) => [stat, [] as number[]]),
  ) as Record<StatId, number[]>

  for (const record of Object.values(gameBestRecords)) {
    scoresByStat[record.statCategory].push(record.normalizedScore)
  }

  return Object.fromEntries(
    PLAY_ORDER.map((stat) => {
      const scores = scoresByStat[stat]
      if (scores.length === 0) return [stat, clampScore(initialStats[stat] ?? 0)]
      const average = scores.reduce((sum, v) => sum + v, 0) / scores.length
      return [stat, clampScore(average)]
    }),
  ) as Record<StatId, number>
}

/** How many distinct registered games actually contributed to a stat's current average — shown alongside the number per section 11's UI spec ("반영된 미니게임 수"). */
export function countContributingGames(
  gameBestRecords: Record<string, MiniGamePerformanceRecord>,
  stat: StatId,
): number {
  return Object.values(gameBestRecords).filter((record) => record.statCategory === stat).length
}
