'use client'

import { useRef, type RefObject } from 'react'
import type { RoomAsset } from '@/lib/room-assets'
import { applyMove } from '@/lib/room/room-layout'
import type { RoomItem } from '@/lib/room/room-state'
import { cn } from '@/lib/utils'

interface RoomItemHandleProps {
  item: RoomItem
  asset: RoomAsset
  stageRef: RefObject<HTMLDivElement | null>
  selected: boolean
  onSelect: () => void
  onChange: (patch: Partial<RoomItem>) => void
}

/**
 * One placed asset inside the editable Room Stage. Position is the only
 * thing a drag can change — size is a fixed, curated per-asset value (see
 * lib/room/room-layout.ts#getFixedWidth), never user-resizable, so there is
 * intentionally no resize handle here. Built on plain Pointer Events (no
 * drag library exists in this project yet, and the spec prefers a light
 * custom approach over adding a heavy dependency for this one interaction).
 * Pointer Events unify mouse + touch, so no separate touch handling is
 * needed; updates are throttled to one commit per animation frame so
 * dragging never floods parent state updates faster than the screen paints.
 */
/** Beyond this many raw pixels of pointer movement, a press counts as a drag rather than a tap-to-select — see the comment in handlePointerMove. */
const TAP_MOVE_THRESHOLD_PX = 8

export function RoomItemHandle({ item, asset, stageRef, selected, onSelect, onChange }: RoomItemHandleProps) {
  const dragState = useRef<{ startX: number; startY: number; itemX: number; itemY: number; moved: boolean } | null>(null)
  const pendingFrame = useRef<number | null>(null)
  const pendingPatch = useRef<Partial<RoomItem> | null>(null)

  const flushPatch = () => {
    pendingFrame.current = null
    if (pendingPatch.current) {
      onChange(pendingPatch.current)
      pendingPatch.current = null
    }
  }

  const schedulePatch = (patch: Partial<RoomItem>) => {
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
    // Fixed pixel tolerance, not a fraction of stage size: at 0.002 of a
    // ~330px-wide mobile canvas that's under 1px, so ordinary finger-contact
    // jitter on a tap (a mouse click has ~0px of movement, a touch tap
    // routinely has several) almost always tripped `moved`, which meant
    // onSelect() below never fired on touch — tapping a placed item to
    // select it silently failed on mobile while working every time with a
    // mouse. TAP_MOVE_THRESHOLD_PX gives touch the same tap-to-select
    // reliability as a mouse click while still being far tighter than any
    // intentional drag.
    if (
      Math.abs(event.clientX - dragState.current.startX) > TAP_MOVE_THRESHOLD_PX ||
      Math.abs(event.clientY - dragState.current.startY) > TAP_MOVE_THRESHOLD_PX
    )
      dragState.current.moved = true
    const moved = applyMove(item, asset, dragState.current.itemX + deltaX, dragState.current.itemY + deltaY)
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
      className="absolute touch-none"
      style={{
        left: `${item.x * 100}%`,
        top: `${item.y * 100}%`,
        width: `${item.width * 100}%`,
        zIndex: item.zIndex,
        transform: `translate(-50%, -50%) scaleX(${item.flipped ? -1 : 1})`,
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
        className={cn('h-auto w-full cursor-grab object-contain active:cursor-grabbing', selected && 'outline-dashed outline-2 outline-offset-4 outline-primary')}
        style={{ aspectRatio: `${asset.naturalWidth} / ${asset.naturalHeight}` }}
        draggable={false}
      />
    </div>
  )
}
