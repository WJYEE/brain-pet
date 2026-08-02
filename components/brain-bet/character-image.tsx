import { AssetImage } from '@/components/brain-bet/asset-image'
import { STATS, type StatId } from '@/lib/brain-bet'
import { getPetProfileById } from '@/lib/pets/pet-profile'

/**
 * Fallback art shown only when no representative pet has been assigned yet
 * (petProfile is null — see pet-mood-view.tsx). One character per stat: the
 * lowest-numbered roster entry (see lib/pets/pet-profile.ts#CHARACTER_CATALOG)
 * whose primaryStat is that stat — reaction -> 01_치즈털실냥이, memory ->
 * 05_노란병아리, focus -> 03_양, judgment -> 02_로봇, spatial -> 08_고래,
 * reasoning -> 07_별사막여우.
 */
const CHARACTER_IMAGE_SRC: Record<StatId, string> = {
  reaction: getPetProfileById('01_치즈털실냥이')!.imageSrc,
  memory: getPetProfileById('05_노란병아리')!.imageSrc,
  focus: getPetProfileById('03_양')!.imageSrc,
  judgment: getPetProfileById('02_로봇')!.imageSrc,
  spatial: getPetProfileById('08_고래')!.imageSrc,
  reasoning: getPetProfileById('07_별사막여우')!.imageSrc,
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

interface CharacterImageProps {
  type: StatId
  size?: number | string
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
