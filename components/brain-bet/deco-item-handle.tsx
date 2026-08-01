'use client'

import { useRef, type RefObject } from 'react'
import type { SupportedDecoAsset } from '@/lib/deco-supported-assets'
import { applyDecoMove } from '@/lib/deco-placement-layout'
import type { DecoPlacementItem } from '@/lib/deco-placement-state'
import { cn } from '@/lib/utils'

interface DecoItemHandleProps {
  item: DecoPlacementItem
  asset: SupportedDecoAsset
  stageRef: RefObject<HTMLDivElement | null>
  selected: boolean
  /** Paint order, computed by DecoCanvas from layer + array position — see DECO_BEHIND_Z_BASE/DECO_FRONT_Z_BASE. */
  zIndex: number
  onSelect: () => void
  onChange: (patch: Partial<DecoPlacementItem>) => void
}

/**
 * One placed sticker inside the editable Deco stage — same Pointer Events
 * drag pattern as components/brain-bet/room-item-handle.tsx (unifies
 * mouse + touch, no drag library, rAF-throttled commits), reimplemented
 * against DecoPlacementItem instead of shared with RoomItemHandle since the
 * two operate on different item/asset shapes and clamp against a single
 * fixed zone (lib/deco-placement-layout.ts) rather than room's
 * wall/floor/free anchor bands. Scale/rotation are applied as a pure CSS
 * transform here (drag only ever changes x/y) — the properties panel
 * (deco-properties-panel.tsx) is what actually changes scale/rotation/layer,
 * via sliders/buttons rather than an in-canvas handle, so this component
 * only needs to render whatever the current values are.
 */
export function DecoItemHandle({ item, asset, stageRef, selected, zIndex, onSelect, onChange }: DecoItemHandleProps) {
  const dragState = useRef<{ startX: number; startY: number; itemX: number; itemY: number; moved: boolean } | null>(null)
  const pendingFrame = useRef<number | null>(null)
  const pendingPatch = useRef<Partial<DecoPlacementItem> | null>(null)

  const flushPatch = () => {
    pendingFrame.current = null
    if (pendingPatch.current) {
      onChange(pendingPatch.current)
      pendingPatch.current = null
    }
  }

  const schedulePatch = (patch: Partial<DecoPlacementItem>) => {
    pendingPatch.current = patch
    if (pendingFrame.current === null) {
      pendingFrame.current = requestAnimationFrame(flushPatch)
    }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragState.current = { startX: event.clientX, startY: event.clientY, itemX: item.x, itemY: item.y, moved: false }
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current || !stageRef.current) return
    const rect = stageRef.current.getBoundingClientRect()
    const deltaX = (event.clientX - dragState.current.startX) / rect.width
    const deltaY = (event.clientY - dragState.current.startY) / rect.height
    if (Math.abs(deltaX) > 0.002 || Math.abs(deltaY) > 0.002) dragState.current.moved = true
    const moved = applyDecoMove(item, dragState.current.itemX + deltaX, dragState.current.itemY + deltaY)
    schedulePatch({ x: moved.x, y: moved.y })
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current) {
      event.currentTarget.releasePointerCapture(event.pointerId)
      if (!dragState.current.moved) onSelect()
    }
    dragState.current = null
  }

  return (
    <div
      // touch-none is required, not decorative — it's what stops the page from
      // scrolling underneath a finger mid-drag on mobile.
      className="absolute touch-none"
      style={{
        left: `${item.x * 100}%`,
        top: `${item.y * 100}%`,
        width: `${item.width * 100}%`,
        zIndex,
        transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale})`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-label={`${asset.name} (${selected ? '선택됨' : '선택하기'})`}
      aria-pressed={selected}
    >
      <img
        src={asset.src}
        alt=""
        aria-hidden="true"
        className={cn(
          'h-auto w-full cursor-grab object-contain active:cursor-grabbing',
          selected && 'outline-dashed outline-2 outline-offset-4 outline-primary',
        )}
        style={{ aspectRatio: `${asset.naturalWidth} / ${asset.naturalHeight}` }}
        draggable={false}
      />
    </div>
  )
}
