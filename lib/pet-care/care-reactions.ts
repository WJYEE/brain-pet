import {
  FEED_EFFECT,
  FEED_SATIETY_MAX_THRESHOLD,
  PET_EFFECT,
  PET_REACTION_THRESHOLDS,
  PLAY_EFFECT,
  SHOWER_CLEANLINESS_MAX_THRESHOLD,
  SHOWER_EFFECT,
} from '@/lib/config/pet-care.config'
import type { CareStatId } from '@/lib/pet-care/types'

/**
 * Shared 3-tier split for a care action's reaction, driven by the stat
 * value *before* the action was applied (never the action's own status
 * field, so the tier reflects how the pet actually felt walking in).
 */
export type IntensityTier = 'low' | 'mid' | 'high'

// ---- 밥 주기 ----

export function feedTier(satietyBefore: number): IntensityTier {
  if (satietyBefore >= FEED_SATIETY_MAX_THRESHOLD) return 'high'
  if (satietyBefore < PET_REACTION_THRESHOLDS.lowHunger) return 'low'
  return 'mid'
}

/** `high` keeps the existing suppression (no numeric change) — `low`/`mid` both get the same full FEED_EFFECT, since "낮음" only changes the reaction, not a bigger number than the existing max. */
export function feedEffectFor(tier: IntensityTier): Partial<Record<CareStatId, number>> {
  return tier === 'high' ? {} : { satiety: FEED_EFFECT.satiety, happiness: FEED_EFFECT.happiness }
}

export function feedMessageFor(tier: IntensityTier): string | undefined {
  if (tier === 'high') return '지금은 배가 불러요.'
  if (tier === 'low') return '정말 맛있어!'
  return '잘 먹었어.'
}

// ---- 씻기 ----

export function showerTier(cleanlinessBefore: number): IntensityTier {
  if (cleanlinessBefore >= SHOWER_CLEANLINESS_MAX_THRESHOLD) return 'high'
  if (cleanlinessBefore < PET_REACTION_THRESHOLDS.lowCleanliness) return 'low'
  return 'mid'
}

/** `low` (was genuinely dirty) gets a small extra happiness bonus on top of the normal SHOWER_EFFECT — "개운한 반응". `high` keeps the existing suppression. */
export function showerEffectFor(tier: IntensityTier): Partial<Record<CareStatId, number>> {
  if (tier === 'high') return {}
  const happinessBonus = tier === 'low' ? 2 : 0
  return { cleanliness: SHOWER_EFFECT.cleanliness, happiness: SHOWER_EFFECT.happiness + happinessBonus }
}

export function showerMessageFor(tier: IntensityTier): string | undefined {
  if (tier === 'high') return '아직 깨끗해요!'
  if (tier === 'low') return '아, 개운해!'
  return undefined
}

// ---- 놀기 ----

/** Below lowEnergy: a gentler play instead of the old full suppression — still applies a (reduced) effect rather than zero, per this feature's spec. */
export function playTier(energyBefore: number): IntensityTier {
  return energyBefore < PET_REACTION_THRESHOLDS.lowEnergy ? 'low' : 'mid'
}

export function playEffectFor(tier: IntensityTier, happinessBefore: number): Partial<Record<CareStatId, number>> {
  if (tier === 'low') {
    return {
      happiness: Math.round(PLAY_EFFECT.happiness * 0.6),
      affection: PLAY_EFFECT.affection,
      energy: Math.round(PLAY_EFFECT.energy * 0.5),
    }
  }
  const lowHappinessBonus = happinessBefore < PET_REACTION_THRESHOLDS.lowHappiness ? 5 : 0
  return { happiness: PLAY_EFFECT.happiness + lowHappinessBonus, affection: PLAY_EFFECT.affection, energy: PLAY_EFFECT.energy }
}

export function playMessageFor(tier: IntensityTier): string | undefined {
  return tier === 'low' ? '오늘은 천천히 놀자.' : undefined
}

// ---- 쓰다듬기 ----

export function petIntimacyTier(intimacyLevel: number): IntensityTier {
  if (intimacyLevel <= 2) return 'low'
  if (intimacyLevel <= 5) return 'mid'
  return 'high'
}

/** Numeric effect never changes by intimacy tier (PET_EFFECT stays constant) — only the reaction text/animation nuance does. */
export function petEffectFor(): Partial<Record<CareStatId, number>> {
  return { affection: PET_EFFECT.affection, happiness: PET_EFFECT.happiness }
}

export function petMessageFor(tier: IntensityTier): string | undefined {
  if (tier === 'low') return '앗, 깜짝이야...'
  if (tier === 'high') return '더 가까이 있고 싶어요.'
  return undefined
}
