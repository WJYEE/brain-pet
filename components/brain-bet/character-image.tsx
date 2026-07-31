import { AssetImage } from '@/components/brain-bet/asset-image'
import { characterIdlePath } from '@/lib/character-assets'
import { STATS, type StatId } from '@/lib/brain-bet'

/**
 * Real file paths under public/assets/statling/characters — resolved through
 * the CHARACTER_ASSETS registry (lib/character-assets.ts), never hardcoded.
 * The original hand-drawn 순발력.png/기억력.png/etc. were removed as duplicates
 * once the cropped pet_NNN sprites covered the same ground, so each stat now
 * points at its highest-affinity pet from PET_CATALOG (lib/pets/pet-profile.ts)
 * instead — reaction -> pet_001 (reaction 0.95), memory -> pet_002 (0.92),
 * focus -> pet_005 (0.92), judgment -> pet_004 (0.93), spatial -> pet_017
 * (0.85), reasoning -> pet_003 (0.9).
 */
const CHARACTER_IMAGE_SRC: Record<StatId, string> = {
  reaction: characterIdlePath('pet_001'),
  memory: characterIdlePath('pet_002'),
  focus: characterIdlePath('pet_005'),
  judgment: characterIdlePath('pet_004'),
  spatial: characterIdlePath('pet_017'),
  reasoning: characterIdlePath('pet_003'),
}

/**
 * Per-character fine-tune multiplier — start every type at 1. Adjust only
 * the specific type(s) that end up reading visually smaller/larger than the
 * rest once seen on a real screen (each source PNG can have a different
 * amount of internal transparent padding baked in).
 */
const CHARACTER_SCALE: Record<StatId, number> = {
  reaction: 1,
  memory: 1,
  focus: 1,
  judgment: 1,
  spatial: 1,
  reasoning: 1,
}

/**
 * The original 빛나는타입.png/신비타입.png (a "balanced" bonus type and an
 * "undiscovered" mystery type) were removed as duplicates alongside the rest
 * of the old character set — replaced with their closest PET_CATALOG
 * equivalents (pet_007 is an evenly-balanced-across-all-stats profile,
 * pet_008 leans mysterious/shadowy). Still not wired into any screen yet:
 * StatId has no key for them, and there's no selection logic (e.g. "all
 * stats roughly equal") to decide when either would apply. Kept here as a
 * real, verified path for whenever that's designed, not a guess.
 */
export const BONUS_CHARACTER_IMAGE_SRC = {
  shining: characterIdlePath('pet_007'),
  mystery: characterIdlePath('pet_008'),
} as const

interface CharacterImageProps {
  type: StatId
  size?: number
  className?: string
}

/** Renders the given Stat's Statling character PNG at a unified on-screen size. */
export function CharacterImage({ type, size = 160, className }: CharacterImageProps) {
  return (
    <AssetImage
      src={CHARACTER_IMAGE_SRC[type]}
      alt={`${STATS[type].name} 타입 Statling`}
      size={size}
      scale={CHARACTER_SCALE[type]}
      className={className}
    />
  )
}
