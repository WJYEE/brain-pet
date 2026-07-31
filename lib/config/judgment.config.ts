import type { JudgmentRuleId, JudgmentStimulus } from '@/lib/game/types'

/**
 * Judgment ("Rule Switch") tuning constants — GAME_SPEC §55-63.
 *
 * v2: Time Attack rework. Instead of a fixed 16-Trial session, the player
 * keeps clearing a continuous queue of Blocks until a global timer runs out;
 * "Score priority: Accuracy > Rule Switch Adaptation > Speed" is preserved,
 * but Speed is now inherent to the format (processing more Blocks in the same
 * window requires being fast) rather than a separate per-trial timer.
 * v3: gameScore reworked to accuracy 60% + switch 15% + conflict 15% +
 * throughput 10%, clamped 0-100 (was an unbounded ~1000+-scale formula where
 * throughput dominated far more than the stated priority intended).
 */
export const JUDGMENT_GAME_VERSION = 'judgment_v3'

/** Total real-play session length. Shortened three times now (First Play fatigue reduction): 35s → 25s → 20s, and now → 15s — see getSegmentConfig for how the segment lengths were compressed alongside each cut to still reach full 3-way/Conflict difficulty at least once inside the shorter window. Draft value — easy to retune after Beta data. */
export const JUDGMENT_GAME_DURATION_MS = 15_000

/** Default Block count per fixed-rule segment (used from segment index 2 onward — see getSegmentConfig for the shorter early-segment lengths). Processing-count-based switching (not time-based) keeps a fast player's extra throughput naturally reaching more/harder segments. */
export const JUDGMENT_SEGMENT_LENGTH = 8

/** Block count for segments 0-1 (the eased-difficulty ramp, before the single Rule Switch) — shortened from JUDGMENT_SEGMENT_LENGTH so the session actually reaches segment 2 (3-way + full Conflict) at least once, without changing anything about how easy those early segments themselves are (same Conflict ratios, same 2-way choice count). Trimmed from 4 to 3 alongside the 20s→15s session cut, same ~25% ratio. */
export const JUDGMENT_EARLY_SEGMENT_LENGTH = 3

/** How many Blocks are visible in the queue at once (current + upcoming preview). */
export const JUDGMENT_QUEUE_PREVIEW_COUNT = 6

/** Target band for the share of Conflict-type stimuli within a segment once full difficulty is reached (segment index 2+); the actual ratio is randomized inside this band per segment. */
export const JUDGMENT_CONFLICT_RATIO_MIN = 0.4
export const JUDGMENT_CONFLICT_RATIO_MAX = 0.6

/** Conflict ratio ceiling for segment index 1 (the one-and-only Rule Switch) — kept low so the switch itself is the only new thing a first-time player has to absorb. */
export const JUDGMENT_EARLY_CONFLICT_RATIO_MAX = 0.15

/** How long the departing Block's clear/shake + "+1"/"MISS" flourish stays visible. Purely cosmetic — input for the next Block is already accepted before this finishes. */
export const JUDGMENT_BLOCK_EXIT_MS = 220
/** How long the compact "RULE CHANGE!" overlay blocks input at the one-time Rule Switch — long enough to actually read the freshly-shuffled mapping, not just the rule name. */
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
/** Lowered three times now, each time alongside a session-duration cut, to keep a full 2-grant bonus roughly the same ~6% share of the base duration: 2000ms (35s session) → 1500ms (25s session) → 1200ms (20s session) → 900ms (15s session). */
export const JUDGMENT_COMBO_BONUS_TIME_MS = 900
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
 * The fixed rule/difficulty progression by segment index.
 *
 * Simplified (First Play fatigue reduction): the Rule now switches exactly
 * ONCE for the whole session — segment 0 plays the base rule (no switch yet,
 * no Conflict possible anyway — nothing to conflict against), segment 1 is
 * the one-and-only Rule Switch, still 2-way, with Conflict capped low so the
 * switch itself is the only new thing to absorb ("어? 규칙 바뀌었네"). From
 * segment 2 onward the rule that segment 1 switched to just stays fixed
 * forever, while 3-way and the full Conflict band kick in and continue
 * indefinitely, so a fast player who clears many segments keeps facing the
 * hardest difficulty rather than the progression running out ("집중해야겠다")
 * — but never a second rule switch. (Previously the rule alternated every
 * segment; this dropped a whole layer of "which rule is it now" tracking
 * while keeping the difficulty ramp itself intact.) The per-segment mapping
 * (Left/Down/Right assignment) still reshuffles every segment regardless —
 * that's a fresh read each time even when the rule itself hasn't changed.
 * Score/PB and Combo Bonus Time are untouched, since both read from
 * per-trial flags computed generically regardless of which segment produced
 * them.
 *
 * `length` is JUDGMENT_EARLY_SEGMENT_LENGTH (3, not the default 8) for
 * segments 0-1 — purely a pacing change (fewer Blocks before the Switch),
 * not a difficulty change (same Conflict ratios/choiceCount as before) — so
 * the shortened 15s Time Attack still reaches segment 2 (3-way + full
 * Conflict) at least once for a normally-paced player, without touching how
 * easy those early segments themselves feel.
 */
export function getSegmentConfig(
  segmentIndex: number,
): { ruleId: JudgmentRuleId; choiceCount: 2 | 3; length: number; conflictRatioMin: number; conflictRatioMax: number } {
  // The one-and-only switch: base rule at segment 0, the other rule from segment 1 onward, forever.
  const ruleId: JudgmentRuleId = segmentIndex === 0 ? 'shape' : 'count'
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
  return {
    ruleId,
    choiceCount: 3,
    length: JUDGMENT_SEGMENT_LENGTH,
    conflictRatioMin: JUDGMENT_CONFLICT_RATIO_MIN,
    conflictRatioMax: JUDGMENT_CONFLICT_RATIO_MAX,
  }
}

/**
 * Judgment Game Score — normalizedScore = overallAccuracy 60% + switchAccuracy
 * 15% + conflictAccuracy 15% + throughput 10%, clampScore 0-100.
 *
 * Stated priority is Accuracy > Rule Switch Adaptation > Speed — the old
 * unbounded formula (`correctBlocks * overallAccuracy * 100`) didn't actually
 * match that: correctBlocks scales with raw session length/pace (roughly
 * 5-20+), so in practice throughput dominated the score far more than
 * switchAccuracyBonus/conflictAccuracyBonus (both capped at 100/80 flat)
 * ever could. This version enforces the stated priority directly as
 * percentage weights instead. wrongBlocks isn't penalized separately —
 * overallAccuracy already reflects every wrong Block, so a flat penalty on
 * top would double-count the same mistake (same reasoning as dropping
 * Focus's old speed term and Memory's perfectRounds bonus).
 */
export const JUDGMENT_SCORE_WEIGHTS = {
  /** overallAccuracy (0-1) × this — the dominant term. */
  accuracyWeight: 60,
  /** switchAccuracy (0-1) × this — Judgment's signature trait: adapting the instant the rule changes. */
  switchWeight: 15,
  /** conflictAccuracy (0-1) × this — resisting interference from the previous rule. */
  conflictWeight: 15,
  /** throughputScore (0-1, normalizeUpward of correctBlocks) × this — speed, ranked last per the stated priority. */
  throughputWeight: 10,
}

/**
 * correctBlocks-to-throughputScore bounds — draft values based on the 15s
 * session length (scaled down from the 20s-session 4/16 bounds by the same
 * ~25% the session itself was cut) and ~8-block segments
 * (JUDGMENT_SEGMENT_LENGTH): a slow but careful player might clear ~3, a fast
 * accurate player ~12+ (helped by Combo Bonus Time). Retune once real usage
 * data exists.
 */
export const JUDGMENT_THROUGHPUT_MIN_BLOCKS = 3
export const JUDGMENT_THROUGHPUT_MAX_BLOCKS = 12
