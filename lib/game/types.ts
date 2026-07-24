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

export interface MemoryRoundTrial {
  roundIndex: number
  difficultyLevel: number
  gridSize: number
  targetCount: number
  exposureMs: number
  targetCells: string[]
  selectedCells: string[]
  correctSelections: number
  wrongSelections: number
  missedTargets: number
  responseTimeMs: number
  createdAt: string
}

export interface MemoryRawSummary {
  /** Always MEMORY_REAL_ROUNDS on a normal completion (no Life system) — record-only, NOT a Personal Best axis. */
  roundsCompleted: number
  /** Difficulty-weighted average of per-round accuracy (0-1). Primary Personal Best axis. */
  weightedAccuracy: number
  /** Simple unweighted average accuracy (0-1), kept for reference/display. */
  averageAccuracy: number
  perfectRounds: number
  /** Raw average selection time, unadjusted — kept for reference/display. */
  averageResponseTimeMs: number
  /** Average selection time with MEMORY_WRONG_TIME_PENALTY_MS added per wrong click. Used for scoring/Personal Best. */
  averageAdjustedResponseTimeMs: number
}

export interface MemoryGameResult extends BaseGameResult {
  gameId: 'memory'
  rounds: MemoryRoundTrial[]
  rawSummary: MemoryRawSummary
}

export interface FocusRoundTrial {
  roundIndex: number
  difficultyLevel: number
  distractorCount: number
  similarityLevel: number
  targetPresent: boolean
  /** Null when targetPresent is false. */
  targetCellId: string | null
  /** Null when the user pressed "없음" or the round timed out without a click. */
  selectedCellId: string | null
  /** True only when the user's action was pressing "없음" (regardless of whether that was correct). */
  selectedNone: boolean
  selectedCorrectly: boolean
  /** Clicked a non-target cell — either a real distractor while a target existed, or any cell when none existed. */
  falseClick: boolean
  /** A target existed but the user pressed "없음" or the round timed out. */
  missedTarget: boolean
  /** True if the round ended by hitting its time limit with no user action. */
  timedOut: boolean
  responseTimeMs: number
  createdAt: string
}

export interface FocusRawSummary {
  roundsCompleted: number
  totalTargetsPresent: number
  correctTargetsFound: number
  correctNoneCalls: number
  missedTargets: number
  falseClicks: number
  timeouts: number
  /** Simple unweighted accuracy (0-1). */
  accuracy: number
  /** Difficulty-weighted accuracy (0-1). Primary Personal Best axis. */
  weightedAccuracy: number
  falseClickRate: number
  missRate: number
  averageResponseTimeMs: number
}

export interface FocusGameResult extends BaseGameResult {
  gameId: 'focus'
  rounds: FocusRoundTrial[]
  rawSummary: FocusRawSummary
}

/**
 * Temporary shape for the stats without real game logic yet (judgment/
 * spatial/reasoning). Mirrors the PHASE 1 mock generator's output. Replace
 * with a dedicated *GameResult type per game as each one ships, the same way
 * Reaction, Memory, and Focus just were promoted out of this shape.
 */
export interface PlaceholderGameResult extends BaseGameResult {
  gameId: Exclude<GameId, 'reaction' | 'memory' | 'focus'>
}

export type GameResult = ReactionGameResult | MemoryGameResult | FocusGameResult | PlaceholderGameResult

export interface StatStatus {
  /** First-play result. Locked the first time this stat is ever completed; never overwritten after. */
  initial: GameResult | null
  /** Best Valid Performance so far. */
  current: GameResult | null
  /** Every attempt (valid or not), oldest to newest. */
  history: GameResult[]
}

export type StatStatusMap = Record<StatId, StatStatus>
