import { AssetImage } from '@/components/brain-bet/asset-image'

/** Real file paths under public/assets/statling/eggs — verified against the actual filenames on disk before wiring, never guessed. */
const EGG_IMAGE_SRC: Record<number, string> = {
  0: '/assets/statling/eggs/0알.png',
  1: '/assets/statling/eggs/1알.png',
  2: '/assets/statling/eggs/2알.png',
  3: '/assets/statling/eggs/3알.png',
  4: '/assets/statling/eggs/4알.png',
  5: '/assets/statling/eggs/5알.png',
  6: '/assets/statling/eggs/6알.png',
}

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
