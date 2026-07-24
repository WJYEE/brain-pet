import { cn } from '@/lib/utils'

interface AssetImageProps {
  src: string
  alt: string
  /** Wrapper (square) size in px — this, not the PNG's own dimensions, is what makes every asset read as the same visual size on screen. */
  size?: number
  /** Per-asset fine-tune multiplier (default 1) — compensates for a PNG having more/less internal transparent padding than its siblings. Never crops or resizes the file itself, only scales its on-screen presentation. */
  scale?: number
  className?: string
}

/**
 * Renders one transparent-background PNG asset (character or egg) inside a
 * fixed-size wrapper via object-contain, so the source files never need to
 * be cropped/resized/regenerated to look visually consistent next to each
 * other. `overflow-visible` is intentional: a `scale` > 1 (set per-asset,
 * see character-image.tsx / egg-image.tsx) is allowed to spill outside the
 * wrapper box rather than getting clipped.
 */
export function AssetImage({ src, alt, size = 160, scale = 1, className }: AssetImageProps) {
  return (
    <div className={cn('flex items-center justify-center overflow-visible', className)} style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- intentionally a plain <img>, not next/image: these are pre-authored static PNGs that must never be re-encoded/resized by an optimization pipeline. */}
      <img
        src={src}
        alt={alt}
        className="max-h-full max-w-full object-contain"
        style={scale !== 1 ? { transform: `scale(${scale})` } : undefined}
        draggable={false}
      />
    </div>
  )
}
