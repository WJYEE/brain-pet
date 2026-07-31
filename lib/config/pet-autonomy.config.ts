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
}

/** Fixed pixel offsets for the 3-zone horizontal layout — see pet-mood-view.tsx's `positionOffsetPx`. */
export const ZONE_OFFSET_PX: Record<PetZone, number> = { left: -64, center: 0, right: 64 }
export const ZONE_TRANSITION_MS = 700

/** How far the character leans into a walkLeft/walkRight move (degrees, signed by travel direction) — see pet-mood-view.tsx's `tiltDeg`. Reset to 0 once the walk's hold ends, same timer as the animation itself. */
export const WALK_TILT_DEG = 20

/** Autonomous actions never move the needle much — and never past these daily totals (reset when the calendar date changes). */
export const AUTONOMY_DAILY_ENERGY_CAP = 5
export const AUTONOMY_DAILY_HAPPINESS_CAP = 5
export const AUTONOMOUS_SLEEP_ENERGY_BONUS = 1
export const AUTONOMOUS_PLAY_ALONE_HAPPINESS_BONUS = 1
