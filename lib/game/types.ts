import type { RawRecord, StatId } from '@/lib/brain-bet'

export type GameId = StatId

export type FlowModeType = 'first' | 'free'

export type DeviceType = 'desktop' | 'mobile' | 'tablet' | 'unknown'
export type InputType = 'mouse' | 'touch' | 'keyboard' | 'unknown'

export interface DeviceInfo {
  deviceType: DeviceType
  inputType: InputType
}

/** Reason a session was flagged invalid. Null when the attempt is valid. */
export type InvalidReason = 'abnormally_fast_repeat' | null

/** Fields every game result shares, regardless of which game produced it. */
export interface BaseGameResult {
  sessionId: string
  gameId: GameId
  gameVersion: string
  mode: FlowModeType
  playedAt: string
  device: DeviceInfo
  /** Internal composite score — never shown to the user, never used for Percentile/Ranking yet. */
  gameScore: number
  raw: RawRecord
  /** Real 0-100 Final Stat. Left undefined until real Percentile exists — never faked. */
  final?: number
  isPersonalBest: boolean
  isValidAttempt: boolean
  invalidReason: InvalidReason
}

export interface ReactionTrial {
  trialIndex: number
  delayMs: number
  reactionMs: number | null
  isFalseStart: boolean
  createdAt: string
}

export interface ReactionRawSummary {
  validTrials: number
  falseStarts: number
  averageReactionMs: number
  medianReactionMs: number
  bestReactionMs: number
  /** Standard deviation of valid reaction times — internal tie-breaker only, never shown to the user. */
  consistency: number
}

export interface ReactionGameResult extends BaseGameResult {
  gameId: 'reaction'
  trials: ReactionTrial[]
  rawSummary: ReactionRawSummary
}

/**
 * Temporary shape for the 5 stats without real game logic yet (memory/focus/
 * judgment/spatial/reasoning). Mirrors the PHASE 1 mock generator's output.
 * Replace with a dedicated *GameResult type per game as each one ships,
 * the same way Reaction just was promoted out of this shape.
 */
export interface PlaceholderGameResult extends BaseGameResult {
  gameId: Exclude<GameId, 'reaction'>
}

export type GameResult = ReactionGameResult | PlaceholderGameResult

export interface StatStatus {
  /** First-play result. Locked the first time this stat is ever completed; never overwritten after. */
  initial: GameResult | null
  /** Best Valid Performance so far. */
  current: GameResult | null
  /** Every attempt (valid or not), oldest to newest. */
  history: GameResult[]
}

export type StatStatusMap = Record<StatId, StatStatus>
