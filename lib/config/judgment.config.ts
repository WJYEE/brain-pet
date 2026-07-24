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

/** Total real-play session length. Shortened from 35s (First Play length reduction) — see getSegmentConfig for how the Difficulty Ramp's segment lengths were compressed to still reach full 3-way/Conflict difficulty at least once inside this shorter window. Draft value — easy to retune after Beta data. */
export const JUDGMENT_GAME_DURATION_MS = 25_000

/** Default Block count per fixed-rule segment (used from segment index 3 onward — see getSegmentConfig for the shorter early-segment lengths). Processing-count-based switching (not time-based) keeps a fast player's extra throughput naturally reaching more/harder segments. */
export const JUDGMENT_SEGMENT_LENGTH = 8

/** Block count for segments 0-2 (the eased-difficulty ramp) — shortened from JUDGMENT_SEGMENT_LENGTH so the 25s session actually reaches segment 3 (3-way + full Conflict) at least once, without changing anything about how easy those early segments themselves are (same Conflict ratios, same 2-way choice count). */
export const JUDGMENT_EARLY_SEGMENT_LENGTH = 5

/** How many Blocks are visible in the queue at once (current + upcoming preview). */
export const JUDGMENT_QUEUE_PREVIEW_COUNT = 6

/** Target band for the share of Conflict-type stimuli within a segment once the Difficulty Ramp reaches full difficulty (segment index 3+); the actual ratio is randomized inside this band per segment. */
export const JUDGMENT_CONFLICT_RATIO_MIN = 0.4
export const JUDGMENT_CONFLICT_RATIO_MAX = 0.6

/** Conflict ratio ceiling for segment index 1 (the very first Rule Switch) — kept low so the switch itself is the only new thing a first-time player has to absorb. */
export const JUDGMENT_EARLY_CONFLICT_RATIO_MAX = 0.15
/** Conflict ratio ceiling for segment index 2 — ramps partway toward the full band before 3-way/full-Conflict difficulty begins at segment index 3. */
export const JUDGMENT_MID_CONFLICT_RATIO_MAX = 0.35

/** How long the departing Block's clear/shake + "+1"/"MISS" flourish stays visible. Purely cosmetic — input for the next Block is already accepted before this finishes. */
export const JUDGMENT_BLOCK_EXIT_MS = 220
/** How long the compact "RULE CHANGE!" overlay blocks input at a normal rule switch — long enough to actually read the freshly-shuffled mapping, not just the rule name. */
export const JUDGMENT_RULE_SWITCH_OVERLAY_MS = 650
/** How long the one-time "선택지가 하나 더 늘어났어요!" heads-up stays up — only at the 2-way → 3-way step (segment index 1 → 2). Not scored. */
export const JUDGMENT_THIRD_OPTION_INTRO_MS = 900

/**
 * Combo Bonus Time — a pure gameplay reward (extends the Time Attack clock),
 * never a Score input (Score/PB keep their existing Accuracy > Switch >
 * Conflict priority untouched; more time just means more Blocks CAN be
 * processed, which naturally shows up in processedBlocks/correctBlocks).
 * Draft values, easy to retune after Beta data.
 */
export const JUDGMENT_COMBO_BONUS_INTERVAL = 10
/** Lowered from 2000ms alongside the 35s→25s session shortening, so a full 2-grant bonus (+3s) stays proportionate to the shorter base duration rather than ballooning to a bigger share of it. */
export const JUDGMENT_COMBO_BONUS_TIME_MS = 1_500
/** Caps total session length growth from Combo Bonuses (2 grants = max +3s). */
export const JUDGMENT_MAX_COMBO_TIME_BONUSES = 2
/** How long the "10 COMBO! +2초" pop-up stays visible. */
export const JUDGMENT_COMBO_BONUS_FEEDBACK_MS = 700

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
 * alternates every segment (matching the game's only two rule identities).
 *
 * Difficulty Ramp (new-player onboarding fix): segment 0 is a pure first pass
 * at the base rule (no switch yet, no Conflict possible anyway — nothing to
 * conflict against). Segment 1 is the first-ever Rule Switch, still 2-way,
 * with Conflict capped low so the switch itself is the only new thing to
 * absorb ("어? 규칙 바뀌었네"). Segment 2 is a second switch, still 2-way,
 * with Conflict ramped partway ("이제 좀 빨리 판단해야겠다"). 3-way and the
 * full Conflict band only begin at segment index 3, continuing indefinitely
 * beyond that so a fast player who clears many segments keeps facing
 * switches at the hardest difficulty rather than the progression running out
 * ("헷갈린다! 집중해야겠다"). Score/PB and Combo Bonus Time are untouched,
 * since both read from per-trial flags computed generically regardless of
 * which segment produced them.
 *
 * `length` is JUDGMENT_EARLY_SEGMENT_LENGTH (5, not the default 8) for
 * segments 0-2 — purely a pacing change (fewer Blocks before the rule
 * changes), not a difficulty change (same Conflict ratios/choiceCount as
 * before) — so the shortened 25s Time Attack still reaches segment 3 (3-way
 * + full Conflict) at least once for a normally-paced player, without
 * touching how easy those early segments themselves feel.
 */
export function getSegmentConfig(
  segmentIndex: number,
): { ruleId: JudgmentRuleId; choiceCount: 2 | 3; length: number; conflictRatioMin: number; conflictRatioMax: number } {
  const ruleId: JudgmentRuleId = segmentIndex % 2 === 0 ? 'shape' : 'count'
  if (segmentIndex === 0) {
    return { ruleId, choiceCount: 2, length: JUDGMENT_EARLY_SEGMENT_LENGTH, conflictRatioMin: 0, conflictRatioMax: 0 }
  }
  if (segmentIndex === 1) {
    return {
      ruleId,
      choiceCount: 2,
      length: JUDGMENT_EARLY_SEGMENT_LENGTH,
      conflictRatioMin: 0,
      conflictRatioMax: JUDGMENT_EARLY_CONFLICT_RATIO_MAX,
    }
  }
  if (segmentIndex === 2) {
    return {
      ruleId,
      choiceCount: 2,
      length: JUDGMENT_EARLY_SEGMENT_LENGTH,
      conflictRatioMin: JUDGMENT_EARLY_CONFLICT_RATIO_MAX,
      conflictRatioMax: JUDGMENT_MID_CONFLICT_RATIO_MAX,
    }
  }
  return {
    ruleId,
    choiceCount: 3,
    length: JUDGMENT_SEGMENT_LENGTH,
    conflictRatioMin: JUDGMENT_CONFLICT_RATIO_MIN,
    conflictRatioMax: JUDGMENT_CONFLICT_RATIO_MAX,
  }
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
