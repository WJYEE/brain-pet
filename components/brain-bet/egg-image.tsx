import { AssetImage } from '@/components/brain-bet/asset-image'
import { EGG_HATCH_SEQUENCE } from '@/lib/egg-assets'

/** Real file paths under public/assets/statling/eggs/hatch-sequence — resolved through the EGG_HATCH_SEQUENCE registry (lib/egg-assets.ts), never hardcoded. */
const EGG_IMAGE_SRC: Record<number, string> = Object.fromEntries(EGG_HATCH_SEQUENCE.map((stage) => [stage.stage, stage.src]))

/** Per-stage fine-tune multiplier — start every stage at 1, adjust only the stage(s) that read visually off once seen on a real screen. */
const EGG_SCALE: Record<number, number> = {
  0: 1,
  1: 1,
  2: 1,
  3: 1,
  4: 1,
  5: 1,
  6: 1,
}

interface EggImageProps {
  stage: number
  size?: number
  className?: string
}

/** Renders the given egg growth-stage PNG (0-6) at a unified on-screen size. */
export function EggImage({ stage, size = 160, className }: EggImageProps) {
  const clampedStage = Math.min(6, Math.max(0, Math.round(stage)))
  return (
    <AssetImage
      src={EGG_IMAGE_SRC[clampedStage]}
      alt={`알 성장 단계 ${clampedStage}`}
      size={size}
      scale={EGG_SCALE[clampedStage]}
      className={className}
    />
  )
}
