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

export type JudgmentRuleId = 'shape' | 'count'
export type JudgmentAnswer = 'left' | 'right' | 'down'

export interface JudgmentStimulus {
  shape: 'circle' | 'square' | 'triangle'
  dotCount: 1 | 2 | 3
}

/** A value a Rule Mapping can point Left/Down/Right at — a shape identity or a dot count. Extending this later (e.g. a Color union) is what lets a future Color Rule slot in without reworking this type. */
export type JudgmentMappingValue = JudgmentStimulus['shape'] | JudgmentStimulus['dotCount']

/**
 * Which on-screen direction each rule value is currently assigned to — regenerated
 * (shuffled) once per rule segment so the direction can't be memorized by position.
 * `down` is null on 2-way segments (Down isn't in play yet).
 */
export interface JudgmentRuleMapping {
  ruleId: JudgmentRuleId
  choiceCount: 2 | 3
  left: JudgmentMappingValue
  right: JudgmentMappingValue
  down: JudgmentMappingValue | null
}

export interface JudgmentTrial {
  /** Processing order within the session (0, 1, 2... in the order the block was resolved). */
  trialIndex: number
  /** Which rule segment this block belonged to (a "segment" = a run of blocks under one fixed rule; distinct from the on-screen "Block" queue item). */
  segmentIndex: number
  ruleId: JudgmentRuleId
  /** The rule active in the immediately preceding segment. Null for the very first segment (nothing to switch from). */
  previousRuleId: JudgmentRuleId | null
  stimulus: JudgmentStimulus
  /** The Left/Down/Right assignment active for this Block's segment — stored so a specific mapping or a direction bias can be analyzed later. */
  ruleMapping: JudgmentRuleMapping
  correctAnswer: JudgmentAnswer
  selectedAnswer: JudgmentAnswer | null
  isCorrect: boolean
  responseTimeMs: number
  /** True only for a segment's first block, and only when that segment isn't the session's first (no prior rule to switch from). */
  isSwitchTrial: boolean
  /** 0 for the switch trial itself (or the first block of the first segment), 1/2/3... afterward within the same segment. */
  trialsSinceSwitch: number
  /** True when the previous rule and the current rule would disagree on this stimulus's answer (generalizes across 2-way and 3-way segments). */
  isConflictTrial: boolean
  /** 2 for 2-way segments (Left/Right only), 3 for 3-way segments (Left/Down/Right) — lets 2-way vs 3-way difficulty be analyzed separately. */
  choiceCount: 2 | 3
  createdAt: string
}

/**
 * Time Attack session summary — replaces the old fixed-16-trial summary now
 * that the session is "however many Blocks got processed before the timer
 * ran out" rather than a fixed trial count.
 */
export interface JudgmentRawSummary {
  processedBlocks: number
  correctBlocks: number
  wrongBlocks: number
  overallAccuracy: number

  /** Longest consecutive-correct streak reached during the session. Game-feel metric, not a Score input. */
  maxCombo: number
  averageResponseTimeMs: number
  /** processedBlocks divided by the actual session duration in seconds. */
  blocksPerSecond: number

  switchTrials: number
  switchCorrect: number
  switchAccuracy: number

  nonSwitchTrials: number
  nonSwitchCorrect: number
  nonSwitchAccuracy: number

  conflictTrials: number
  conflictCorrect: number
  conflictAccuracy: number

  switchAverageResponseTimeMs: number
  nonSwitchAverageResponseTimeMs: number
  /** switchAverageResponseTimeMs - nonSwitchAverageResponseTimeMs. Internal raw metric only — never shown to the user as a scientific claim. */
  switchCostMs: number
  /** How many times the rule changed during the session (i.e. how many segments beyond the first were reached). */
  ruleSwitchCount: number
}

export interface JudgmentGameResult extends BaseGameResult {
  gameId: 'judgment'
  trials: JudgmentTrial[]
  rawSummary: JudgmentRawSummary
}

/**
 * Temporary shape for the stats without real game logic yet (spatial/
 * reasoning). Mirrors the PHASE 1 mock generator's output. Replace with a
 * dedicated *GameResult type per game as each one ships, the same way
 * Reaction, Memory, Focus, and Judgment just were promoted out of this shape.
 */
export interface PlaceholderGameResult extends BaseGameResult {
  gameId: Exclude<GameId, 'reaction' | 'memory' | 'focus' | 'judgment'>
}

export type GameResult =
  | ReactionGameResult
  | MemoryGameResult
  | FocusGameResult
  | JudgmentGameResult
  | PlaceholderGameResult

export interface StatStatus {
  /** First-play result. Locked the first time this stat is ever completed; never overwritten after. */
  initial: GameResult | null
  /** Best Valid Performance so far. */
  current: GameResult | null
  /** Every attempt (valid or not), oldest to newest. */
  history: GameResult[]
}

export type StatStatusMap = Record<StatId, StatStatus>
