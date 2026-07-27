import { AssetImage } from '@/components/brain-bet/asset-image'
import { STATS, type StatId } from '@/lib/brain-bet'

/**
 * Real file paths under public/assets/statling/characters — verified against
 * the actual filenames on disk before wiring, never guessed. The original
 * hand-drawn 순발력.png/기억력.png/etc. were removed as duplicates once the
 * cropped pet_NNN.png sprites covered the same ground, so each stat now
 * points at its highest-affinity pet from PET_CATALOG (lib/pets/pet-profile.ts)
 * instead — reaction -> pet_001 (reaction 0.95), memory -> pet_002 (0.92),
 * focus -> pet_005 (0.92), judgment -> pet_004 (0.93), spatial -> pet_017
 * (0.85), reasoning -> pet_003 (0.9).
 */
const CHARACTER_IMAGE_SRC: Record<StatId, string> = {
  reaction: '/assets/statling/characters/pet_001.png',
  memory: '/assets/statling/characters/pet_002.png',
  focus: '/assets/statling/characters/pet_005.png',
  judgment: '/assets/statling/characters/pet_004.png',
  spatial: '/assets/statling/characters/pet_017.png',
  reasoning: '/assets/statling/characters/pet_003.png',
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
  shining: '/assets/statling/characters/pet_007.png',
  mystery: '/assets/statling/characters/pet_008.png',
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
