import { AssetImage } from '@/components/brain-bet/asset-image'
import { STATS, type StatId } from '@/lib/brain-bet'

/** Real file paths under public/assets/statling/characters — verified against the actual filenames on disk before wiring, never guessed. */
const CHARACTER_IMAGE_SRC: Record<StatId, string> = {
  reaction: '/assets/statling/characters/순발력.png',
  memory: '/assets/statling/characters/기억력.png',
  focus: '/assets/statling/characters/집중력.png',
  judgment: '/assets/statling/characters/판단력.png',
  spatial: '/assets/statling/characters/공간감각.png',
  reasoning: '/assets/statling/characters/추리력.png',
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
 * Two extra character PNGs exist on disk (빛나는타입/신비타입 — a "balanced"
 * bonus type and an "undiscovered" mystery type) but aren't wired into any
 * screen yet: StatId has no key for them, and there's no selection logic
 * (e.g. "all stats roughly equal") to decide when either would apply. Kept
 * here as a real, verified path for whenever that's designed, not a guess.
 */
export const BONUS_CHARACTER_IMAGE_SRC = {
  shining: '/assets/statling/characters/빛나는타입.png',
  mystery: '/assets/statling/characters/신비타입.png',
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
