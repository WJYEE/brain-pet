import type { JudgmentRuleId, JudgmentStimulus } from '@/lib/game/types'

/**
 * Judgment ("Rule Switch") tuning constants — GAME_SPEC §55-63.
 *
 * v2: Time Attack rework. Instead of a fixed 16-Trial session, the player
 * keeps clearing a continuous queue of Blocks until a global timer runs out;
 * "Score priority: Accuracy > Rule Switch Adaptation > Speed" is preserved,
 * but Speed is now inherent to the format (processing more Blocks in the same
 * window requires being fast) rather than a separate per-trial timer.
 */
export const JUDGMENT_GAME_VERSION = 'judgment_v2'

/** Total real-play session length. Draft value — easy to retune after Beta data. */
export const JUDGMENT_GAME_DURATION_MS = 35_000

/** How many Blocks make up one fixed-rule segment before the rule changes. Processing-count-based switching (not time-based) keeps a fast player's extra throughput naturally reaching more/harder segments. */
export const JUDGMENT_SEGMENT_LENGTH = 8

/** How many Blocks are visible in the queue at once (current + upcoming preview). */
export const JUDGMENT_QUEUE_PREVIEW_COUNT = 6

/** Target band for the share of Conflict-type stimuli within a segment; the actual ratio is randomized inside this band per segment. */
export const JUDGMENT_CONFLICT_RATIO_MIN = 0.4
export const JUDGMENT_CONFLICT_RATIO_MAX = 0.6

/** How long the departing Block's clear/shake + "+1"/"MISS" flourish stays visible. Purely cosmetic — input for the next Block is already accepted before this finishes. */
export const JUDGMENT_BLOCK_EXIT_MS = 220
/** How long the compact "RULE CHANGE!" overlay blocks input at a normal rule switch — long enough to actually read the freshly-shuffled mapping, not just the rule name. */
export const JUDGMENT_RULE_SWITCH_OVERLAY_MS = 650
/** How long the one-time "선택지가 하나 더 늘어났어요!" heads-up stays up — only at the 2-way → 3-way step (segment index 1 → 2). Not scored. */
export const JUDGMENT_THIRD_OPTION_INTRO_MS = 900

/** Tutorial: fixed, easy, always-2-way Blocks — 3 per rule, discarded from scoring, no timer. */
export const JUDGMENT_TUTORIAL_SEGMENT_LENGTH = 3
export const JUDGMENT_TUTORIAL_SHAPE_STIMULI: JudgmentStimulus[] = [
  { shape: 'circle', dotCount: 1 },
  { shape: 'square', dotCount: 2 },
  { shape: 'circle', dotCount: 2 },
]
export const JUDGMENT_TUTORIAL_COUNT_STIMULI: JudgmentStimulus[] = [
  { shape: 'square', dotCount: 1 },
  { shape: 'circle', dotCount: 2 },
  { shape: 'square', dotCount: 2 },
]

/**
 * The fixed rule/difficulty progression by segment index. Rule strictly
 * alternates every segment (matching the game's only two rule identities);
 * choiceCount steps from 2-way to 3-way starting at segment index 2. Beyond
 * index 3 the pattern keeps alternating at 3-way indefinitely, so a fast
 * player who clears many segments keeps facing switches at the hardest
 * difficulty rather than the progression simply running out.
 */
export function getSegmentConfig(segmentIndex: number): { ruleId: JudgmentRuleId; choiceCount: 2 | 3 } {
  const ruleId: JudgmentRuleId = segmentIndex % 2 === 0 ? 'shape' : 'count'
  const choiceCount: 2 | 3 = segmentIndex < 2 ? 2 : 3
  return { ruleId, choiceCount }
}

/**
 * Judgment Game Score — internal only, draft formula (GAME_SPEC §128 rule 14).
 * Never shown to the user, never used for Percentile/Ranking yet.
 *
 * Priority is Accuracy > Rule Switch Adaptation > Speed. Speed has no
 * separate term here: in a fixed-duration Time Attack, clearing more correct
 * Blocks already requires being fast, so `correctBlocks * overallAccuracy`
 * rewards accurate throughput while making inaccurate speed-running
 * (spam-clicking) actively counterproductive — a wrong Block both adds a
 * flat penalty AND drags down the accuracy multiplier applied to every
 * correct Block. switchAccuracy/conflictAccuracy stay BONUSES (not
 * penalties) since a failed switch/conflict Block already lowers
 * overallAccuracy — an extra penalty would double-count the same mistake.
 */
export const JUDGMENT_SCORE_WEIGHTS = {
  /** Each correct Block is worth this many points, scaled by overallAccuracy (0-1) — the dominant, accuracy-gated throughput term. */
  correctBlockValue: 100,
  /** Flat points subtracted per wrong Block. */
  wrongBlockPenalty: 20,
  /** switchAccuracy (0-1) × this — Judgment's signature trait, added as a bonus. */
  switchAccuracyBonus: 100,
  /** conflictAccuracy (0-1) × this — resisting old-rule interference, added as a bonus. */
  conflictAccuracyBonus: 80,
}
