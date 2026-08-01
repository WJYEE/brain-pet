'use client'

import { useRef, type ReactNode } from 'react'
import { DecoItemHandle } from '@/components/brain-bet/deco-item-handle'
import { getSupportedDecoAssetById } from '@/lib/deco-supported-assets'
import { DECO_BEHIND_Z_BASE, DECO_FRONT_Z_BASE, DECO_STATLING_Z_INDEX } from '@/lib/deco-placement-layout'
import type { DecoPlacementItem } from '@/lib/deco-placement-state'
import { cn } from '@/lib/utils'

interface DecoCanvasProps {
  items: DecoPlacementItem[]
  /** The Statling itself, centered — same pattern as room-canvas.tsx's statlingSlot, left entirely to the caller so existing character rendering is untouched. */
  statlingSlot: ReactNode
  editable?: boolean
  selectedInstanceId?: string | null
  onSelectItem?: (instanceId: string) => void
  onDeselectItem?: () => void
  onChangeItem?: (instanceId: string, patch: Partial<DecoPlacementItem>) => void
  className?: string
}

/**
 * The Deco stage — a square canvas with the Statling centered and every
 * placed sticker layered around it per its own `layer` ('behind' renders
 * under the Statling, 'front' on top — see DECO_BEHIND_Z_BASE/
 * DECO_FRONT_Z_BASE/DECO_STATLING_Z_INDEX). Items within the same layer keep
 * their saved array order (stable — never re-sorted by any other key), so a
 * saved arrangement always paints identically. Mirrors
 * components/brain-bet/room-canvas.tsx's structure (square stage,
 * editable-vs-static item rendering) but with no background image (the
 * character itself is the whole point of this canvas) and no
 * category/anchor system — every item is just a sticker.
 */
export function DecoCanvas({
  items,
  statlingSlot,
  editable = false,
  selectedInstanceId = null,
  onSelectItem,
  onDeselectItem,
  onChangeItem,
  className,
}: DecoCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={stageRef}
      className={cn('relative aspect-square w-full overflow-hidden rounded-3xl bg-secondary', className)}
      onClick={(event) => {
        if (editable && event.target === event.currentTarget) onDeselectItem?.()
      }}
    >
      {items.map((item, index) => {
        const asset = getSupportedDecoAssetById(item.itemId)
        if (!asset) return null // defensively skip a placement whose asset no longer exists in 1supported
        if (item.layer !== 'behind') return null
        const zIndex = DECO_BEHIND_Z_BASE + index
        return renderDecoItem(item, asset, zIndex, editable, stageRef, selectedInstanceId, onSelectItem, onChangeItem)
      })}

      {/* pointer-events-none so a click always falls through to whatever Deco handle sits at that point, regardless of whether it's painted behind or in front of the character — the Statling itself is never an interactive target inside this canvas. */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ zIndex: DECO_STATLING_Z_INDEX }}
      >
        {statlingSlot}
      </div>

      {items.map((item, index) => {
        const asset = getSupportedDecoAssetById(item.itemId)
        if (!asset) return null
        if (item.layer !== 'front') return null
        const zIndex = DECO_FRONT_Z_BASE + index
        return renderDecoItem(item, asset, zIndex, editable, stageRef, selectedInstanceId, onSelectItem, onChangeItem)
      })}
    </div>
  )
}

function renderDecoItem(
  item: DecoPlacementItem,
  asset: ReturnType<typeof getSupportedDecoAssetById>,
  zIndex: number,
  editable: boolean,
  stageRef: React.RefObject<HTMLDivElement | null>,
  selectedInstanceId: string | null,
  onSelectItem?: (instanceId: string) => void,
  onChangeItem?: (instanceId: string, patch: Partial<DecoPlacementItem>) => void,
) {
  if (!asset) return null

  if (editable) {
    return (
      <DecoItemHandle
        key={item.instanceId}
        item={item}
        asset={asset}
        stageRef={stageRef}
        selected={selectedInstanceId === item.instanceId}
        zIndex={zIndex}
        onSelect={() => onSelectItem?.(item.instanceId)}
        onChange={(patch) => onChangeItem?.(item.instanceId, patch)}
      />
    )
  }

  return (
    <div
      key={item.instanceId}
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
        src={asset.src}
        alt=""
        aria-hidden="true"
        className="h-auto w-full object-contain"
        style={{ aspectRatio: `${asset.naturalWidth} / ${asset.naturalHeight}` }}
        draggable={false}
      />
    </div>
  )
}
