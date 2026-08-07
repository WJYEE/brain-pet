import type { AutonomousActionId, PetZone } from '@/lib/pet-care/types'

/** All timing knobs for the autonomous behavior scheduler — see hooks/use-pet-autonomy.ts. */
export const PET_AUTONOMY_CONFIG = {
  minIntervalMs: 8_000,
  maxIntervalMs: 20_000,
  pauseAfterUserActionMs: 5_000,
  initiatedDialogueCooldownMs: 90_000,
  requestDialogueCooldownMs: 300_000,
  longAbsenceHours: 24,
  welcomeDelayMinMs: 700,
  welcomeDelayMaxMs: 1500,
}

/** How long each autonomous action's animation/hold plays before falling back to the mood idle. */
export const AUTONOMOUS_ACTION_HOLD_MS: Record<AutonomousActionId, number> = {
  idle: 2_200,
  lookLeft: 1_400,
  lookRight: 1_400,
  smallHop: 900,
  walkLeft: 1_800,
  walkRight: 1_800,
  sleep: 3_500,
  askFood: 2_400,
  askPlay: 2_400,
  askAttention: 2_400,
  celebrate: 1_600,
  playAlone: 2_600,
  ponder: 1_800,
}

/**
 * How far the 'left'/'right' zone sits from center, as a CSS length —
 * expressed as a vw-clamp (same technique as pet-mood-view.tsx's
 * CHARACTER_BOX_SIZE) so it scales with the Room canvas's own actual
 * rendered width at every breakpoint, instead of a fixed px value that reads
 * as barely-there on a wide desktop Room and edge-hugging on a narrow phone
 * one. Chosen so the full left<->right span works out to roughly 60% of the
 * Room's width at both the ~330px mobile floor and the ~700px desktop
 * ceiling those same breakpoints correspond to (see CHARACTER_BOX_SIZE's own
 * doc comment for those reference numbers) — comfortably short of the edges
 * ("방의 좌우 끝까지는 아니더라도"), and still leaves the character's own box
 * (up to 270px wide) safely inside the Room at its widest. See
 * pet-mood-view.tsx's `translateX(calc(sign * WALK_OFFSET_DISTANCE))`.
 */
export const WALK_OFFSET_DISTANCE = 'clamp(100px, 30vw, 210px)'

/** Sign multiplier per zone — the actual distance comes from WALK_OFFSET_DISTANCE above; this only says which side. */
export const ZONE_OFFSET_SIGN: Record<PetZone, -1 | 0 | 1> = { left: -1, center: 0, right: 1 }

/**
 * Matches `.pet-zone-transition`'s CSS duration (app/globals.css) — kept
 * here purely as the documented reference that class's own comment points
 * back to; no JS reads this constant directly. Slower than before (was
 * 700ms) since a walk now covers a noticeably longer distance — keeps the
 * pace reading as an actual walk rather than a teleport.
 */
export const ZONE_TRANSITION_MS = 1400

/** How far the character leans into a walkLeft/walkRight move (degrees, signed by travel direction) — see pet-mood-view.tsx's `tiltDeg`. Reset to 0 once the walk's hold ends, same timer as the animation itself. */
export const WALK_TILT_DEG = 20

/** Autonomous actions never move the needle much — and never past these daily totals (reset when the calendar date changes). */
export const AUTONOMY_DAILY_ENERGY_CAP = 5
export const AUTONOMY_DAILY_HAPPINESS_CAP = 5
export const AUTONOMOUS_SLEEP_ENERGY_BONUS = 1
export const AUTONOMOUS_PLAY_ALONE_HAPPINESS_BONUS = 1
