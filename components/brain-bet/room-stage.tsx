import type { ReactNode } from 'react'
import { ROOM_ASSET_SCALE, type RoomPreset } from '@/lib/room-presets'
import { cn } from '@/lib/utils'

interface RoomStageProps {
  preset: RoomPreset
  /** The Statling (+ any per-mood overlay elements) — rendered as the top layer, centered per the room's own placement convention (x=50%, y≈64%), with a soft contact shadow just beneath it. Left entirely to the caller so existing character rendering/animation logic is untouched. */
  children: ReactNode
  className?: string
}

/**
 * The Room as a stack of independently-positioned PNG layers rather than one
 * flattened collage image: the preset's background fills the stage
 * (object-fit: cover — the only layer allowed to crop, since it's meant to
 * fill the stage edge-to-edge) with every other preset item placed at its
 * own percentage-based position and sized via object-fit: contain (so no
 * source PNG is ever stretched or cropped). Percentage-based placement
 * (rather than pixel coordinates) is what keeps this from breaking on
 * mobile vs. desktop widths.
 *
 * The Stage is a fixed 1:1 square — chosen because both real background
 * PNGs are themselves ~724x724, so cover-fitting them into a square stage
 * crops essentially nothing.
 */
export function RoomStage({ preset, children, className }: RoomStageProps) {
  return (
    <div className={cn('relative aspect-square w-full overflow-hidden rounded-3xl bg-card', className)}>
      <img
        src={preset.background.src}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: `scale(${ROOM_ASSET_SCALE[preset.background.id] ?? 1})` }}
        draggable={false}
      />

      {preset.items.map(({ asset, placement }) => (
        <div
          key={asset.id}
          className="absolute"
          style={{
            left: `${placement.xPercent}%`,
            top: `${placement.yPercent}%`,
            width: `${placement.widthPercent}%`,
            zIndex: placement.zIndex,
            transform: `translate(-50%, -50%) scale(${ROOM_ASSET_SCALE[asset.id] ?? 1})`,
          }}
        >
          <img
            src={asset.src}
            alt=""
            aria-hidden="true"
            className="h-auto w-full object-contain"
            style={{ aspectRatio: `${asset.naturalWidth} / ${asset.naturalHeight}` }}
            draggable={false}
          />
        </div>
      ))}

      {/* Statling's contact shadow — a lightweight CSS ellipse (not a PNG edit) sitting between the rug and the character, per the rug -> shadow -> Statling layering. */}
      <div
        className="absolute rounded-full bg-black/20 blur-[2px]"
        style={{ left: '50%', top: '76%', width: '30%', height: '6%', transform: 'translate(-50%, -50%)', zIndex: 35 }}
        aria-hidden="true"
      />

      <div className="absolute" style={{ left: '50%', top: '64%', zIndex: 40, transform: 'translate(-50%, -50%)' }}>
        {children}
      </div>
    </div>
  )
}
