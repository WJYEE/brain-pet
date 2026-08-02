import type { ReactNode } from 'react'
import { getSupportedDecoAssetById } from '@/lib/deco-supported-assets'
import { DECO_BEHIND_Z_BASE, DECO_FRONT_Z_BASE, DECO_STATLING_Z_INDEX } from '@/lib/deco-placement-layout'
import type { DecoPlacementItem } from '@/lib/deco-placement-state'
import { cn } from '@/lib/utils'

interface DecoOverlayProps {
  items: DecoPlacementItem[]
  /** The character's own rendered box size — e.g. AssetImage's `size` prop (number = px, or a CSS size string like `clamp()`). The overlay box is exactly this size (not a bigger canvas), so the normalized DECO_ZONE coordinates (lib/deco-placement-layout.ts) land on the same relative spot around the character everywhere this is used, at any box size. */
  characterSize: number | string
  characterSlot: ReactNode
  className?: string
}

/**
 * Static (non-editable) Deco rendering — the single source of truth for
 * "what does this saved Deco data actually look like," reused as-is by the
 * live Room screen (pet-mood-view.tsx) and by the editable Deco stage
 * (deco-canvas.tsx wraps this same component for its non-editable branch,
 * and mirrors its exact box-size/z-index scheme for the editable one) — so
 * a Statling never looks different in Room than it did in the editor.
 */
export function DecoOverlay({ items, characterSize, characterSlot, className }: DecoOverlayProps) {
  return (
    <div className={cn('relative', className)} style={{ width: characterSize, height: characterSize }}>
      {items.map((item, index) => {
        const asset = getSupportedDecoAssetById(item.itemId)
        if (!asset || item.layer !== 'behind') return null
        return <StaticDecoItem key={item.instanceId} item={item} src={asset.src} name={asset.name} naturalWidth={asset.naturalWidth} naturalHeight={asset.naturalHeight} zIndex={DECO_BEHIND_Z_BASE + index} />
      })}

      <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: DECO_STATLING_Z_INDEX }}>
        {characterSlot}
      </div>

      {items.map((item, index) => {
        const asset = getSupportedDecoAssetById(item.itemId)
        if (!asset || item.layer !== 'front') return null
        return <StaticDecoItem key={item.instanceId} item={item} src={asset.src} name={asset.name} naturalWidth={asset.naturalWidth} naturalHeight={asset.naturalHeight} zIndex={DECO_FRONT_Z_BASE + index} />
      })}
    </div>
  )
}

interface StaticDecoItemProps {
  item: DecoPlacementItem
  src: string
  name: string
  naturalWidth: number
  naturalHeight: number
  zIndex: number
}

export function StaticDecoItem({ item, src, name, naturalWidth, naturalHeight, zIndex }: StaticDecoItemProps) {
  return (
    <div
      className="absolute"
      style={{
        left: `${item.x * 100}%`,
        top: `${item.y * 100}%`,
        width: `${item.width * 100}%`,
        zIndex,
        transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale})`,
      }}
    >
      <img
        src={src}
        alt=""
        aria-hidden="true"
        title={name}
        className="h-auto w-full object-contain"
        style={{ aspectRatio: `${naturalWidth} / ${naturalHeight}` }}
        draggable={false}
      />
    </div>
  )
}
