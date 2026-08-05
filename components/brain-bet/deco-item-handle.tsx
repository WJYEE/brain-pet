'use client'

import { useRef, type RefObject } from 'react'
import type { AnchorPoint } from '@/lib/character-anchor.config'
import type { SupportedDecoAsset } from '@/lib/deco-supported-assets'
import { applyDecoMove, applyDecoTransform } from '@/lib/deco-placement-layout'
import type { DecoPlacementItem } from '@/lib/deco-placement-state'
import { cn } from '@/lib/utils'

interface DecoItemHandleProps {
  item: DecoPlacementItem
  asset: SupportedDecoAsset
  /** This item's own `anchor` key, already resolved to a point for whatever character/state is currently showing — see lib/character-anchor.config.ts. */
  anchorPoint: AnchorPoint
  stageRef: RefObject<HTMLDivElement | null>
  selected: boolean
  /** Paint order, computed by DecoCanvas from layer + array position — see DECO_BEHIND_Z_BASE/DECO_FRONT_Z_BASE. */
  zIndex: number
  onSelect: () => void
  onChange: (patch: Partial<DecoPlacementItem>) => void
}

type Gesture =
  | { type: 'move'; pointerId: number; startX: number; startY: number; itemAbsX: number; itemAbsY: number; moved: boolean }
  | { type: 'resize'; pointerId: number; centerX: number; centerY: number; startDist: number; startScale: number }
  | { type: 'rotate'; pointerId: number; centerX: number; centerY: number; startAngle: number; startRotation: number }
  | { type: 'pinch'; idA: number; idB: number; startDist: number; startAngle: number; startScale: number; startRotation: number }

const HANDLE_SIZE = 22
const ROTATE_HANDLE_GAP = 30

/** Beyond this many raw pixels of pointer movement, a press counts as a drag rather than a tap-to-select — see the comment in handleRootPointerMove. */
const TAP_MOVE_THRESHOLD_PX = 8

/**
 * One placed sticker inside the editable Deco stage — a direct-manipulation
 * "PPT/Figma" handle: drag the sticker itself to move it, drag a corner dot
 * to resize (aspect-locked, around the sticker's own center rather than the
 * opposite corner — simplest match for a data model that stores a center
 * point + uniform scale, and correct for something anchored "around the
 * Statling"), drag the dot above it to rotate freely, or pinch with two
 * fingers to do both at once. No slider/step-button UI exists anymore (see
 * deco-properties-panel.tsx) — this component is now the only way scale and
 * rotation ever change.
 *
 * All four gestures share one Pointer Events plumbing (unifies mouse +
 * touch, no drag library) and one `gesture` ref so at most one is active at
 * a time; each only ever computes a magnitude/angle *delta* from its own
 * start snapshot, so it's insensitive to whatever the last rAF-committed
 * `item` prop happens to be mid-drag.
 */
export function DecoItemHandle({ item, asset, anchorPoint, stageRef, selected, zIndex, onSelect, onChange }: DecoItemHandleProps) {
  const gesture = useRef<Gesture | null>(null)
  const touchPoints = useRef<Map<number, { x: number; y: number }>>(new Map())
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

  /** The sticker's own center in viewport px — the pivot every resize/rotate/pinch gesture below measures itself against. */
  function centerPx() {
    const rect = stageRef.current!.getBoundingClientRect()
    const x = anchorPoint.x + item.offsetX
    const y = anchorPoint.y + item.offsetY
    return { x: rect.left + x * rect.width, y: rect.top + y * rect.height }
  }

  const handleRootPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if (!stageRef.current) return

    if (event.pointerType === 'touch') {
      touchPoints.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
      event.currentTarget.setPointerCapture(event.pointerId)
      // A second finger landing on the sticker while the first is already
      // down switches the whole gesture to a pinch — scale and rotation
      // together, anchored on the sticker's current center (not the
      // fingers' own midpoint, so it stays "around the Statling" the same
      // way a corner-handle resize does).
      if (touchPoints.current.size === 2) {
        const [idA, idB] = [...touchPoints.current.keys()]
        const a = touchPoints.current.get(idA)!
        const b = touchPoints.current.get(idB)!
        gesture.current = {
          type: 'pinch',
          idA,
          idB,
          startDist: Math.max(Math.hypot(b.x - a.x, b.y - a.y), 1),
          startAngle: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
          startScale: item.scale,
          startRotation: item.rotation,
        }
        onSelect()
        return
      }
    } else {
      event.currentTarget.setPointerCapture(event.pointerId)
    }

    gesture.current = {
      type: 'move',
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      itemAbsX: anchorPoint.x + item.offsetX,
      itemAbsY: anchorPoint.y + item.offsetY,
      moved: false,
    }
  }

  const handleRootPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' && touchPoints.current.has(event.pointerId)) {
      touchPoints.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    }
    const g = gesture.current
    if (!g || !stageRef.current) return

    if (g.type === 'pinch') {
      const a = touchPoints.current.get(g.idA)
      const b = touchPoints.current.get(g.idB)
      if (!a || !b) return
      const dist = Math.hypot(b.x - a.x, b.y - a.y)
      const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
      const next = applyDecoTransform(item, anchorPoint, {
        scale: g.startScale * (dist / g.startDist),
        rotation: g.startRotation + (angle - g.startAngle),
      })
      schedulePatch({ scale: next.scale, rotation: next.rotation, offsetX: next.offsetX, offsetY: next.offsetY })
      return
    }

    if (g.type === 'move' && event.pointerId === g.pointerId) {
      const rect = stageRef.current.getBoundingClientRect()
      const deltaX = (event.clientX - g.startX) / rect.width
      const deltaY = (event.clientY - g.startY) / rect.height
      // Fixed pixel tolerance, not a fraction of stage size — see the
      // matching comment in room-item-handle.tsx. A normalized 0.002
      // threshold was under 1px on a phone-width stage, so ordinary
      // finger-contact jitter on a tap almost always tripped `moved` and
      // silently broke tap-to-select on touch while a mouse click never
      // had the problem.
      if (
        Math.abs(event.clientX - g.startX) > TAP_MOVE_THRESHOLD_PX ||
        Math.abs(event.clientY - g.startY) > TAP_MOVE_THRESHOLD_PX
      )
        g.moved = true
      const moved = applyDecoMove(item, anchorPoint, g.itemAbsX + deltaX, g.itemAbsY + deltaY)
      schedulePatch({ offsetX: moved.offsetX, offsetY: moved.offsetY })
    }
  }

  const endRootGesture = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') touchPoints.current.delete(event.pointerId)
    const g = gesture.current
    if (!g) return

    if (g.type === 'move' && event.pointerId === g.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId)
      if (!g.moved) onSelect()
      gesture.current = null
    } else if (g.type === 'pinch' && (event.pointerId === g.idA || event.pointerId === g.idB)) {
      // Either finger lifting ends the pinch outright rather than trying to
      // hand off to a single-finger drag with the remaining one — simpler,
      // and matches how the corner/rotate handles below also fully commit
      // on release rather than chaining into another gesture type.
      gesture.current = null
    }
  }

  const handleCornerPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation()
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if (!stageRef.current) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const { x: centerX, y: centerY } = centerPx()
    gesture.current = {
      type: 'resize',
      pointerId: event.pointerId,
      centerX,
      centerY,
      startDist: Math.max(Math.hypot(event.clientX - centerX, event.clientY - centerY), 1),
      startScale: item.scale,
    }
  }

  const handleCornerPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current
    if (!g || g.type !== 'resize' || event.pointerId !== g.pointerId) return
    const dist = Math.hypot(event.clientX - g.centerX, event.clientY - g.centerY)
    const next = applyDecoTransform(item, anchorPoint, { scale: g.startScale * (dist / g.startDist) })
    schedulePatch({ scale: next.scale, offsetX: next.offsetX, offsetY: next.offsetY })
  }

  const endCornerGesture = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation()
    const g = gesture.current
    if (g?.type === 'resize' && g.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId)
      gesture.current = null
    }
  }

  const handleRotatePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation()
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if (!stageRef.current) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const { x: centerX, y: centerY } = centerPx()
    gesture.current = {
      type: 'rotate',
      pointerId: event.pointerId,
      centerX,
      centerY,
      startAngle: (Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180) / Math.PI,
      startRotation: item.rotation,
    }
  }

  const handleRotatePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current
    if (!g || g.type !== 'rotate' || event.pointerId !== g.pointerId) return
    const angle = (Math.atan2(event.clientY - g.centerY, event.clientX - g.centerX) * 180) / Math.PI
    const next = applyDecoTransform(item, anchorPoint, { rotation: g.startRotation + (angle - g.startAngle) })
    schedulePatch({ rotation: next.rotation, offsetX: next.offsetX, offsetY: next.offsetY })
  }

  const endRotateGesture = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation()
    const g = gesture.current
    if (g?.type === 'rotate' && g.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId)
      gesture.current = null
    }
  }

  return (
    <div
      // touch-none is required, not decorative — it's what stops the page
      // from scrolling/pinch-zooming underneath a finger mid-gesture.
      className="absolute touch-none"
      style={{
        left: `${(anchorPoint.x + item.offsetX) * 100}%`,
        top: `${(anchorPoint.y + item.offsetY) * 100}%`,
        // The item's box IS its effective (scaled) size — not a fixed box
        // scaled up via CSS transform — so the handles below (fixed pixel
        // size, positioned by percentage against this box) never grow or
        // shrink along with the sticker itself.
        width: `${item.width * item.scale * 100}%`,
        zIndex,
        transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scaleX(${item.flipped ? -1 : 1})`,
      }}
      onPointerDown={handleRootPointerDown}
      onPointerMove={handleRootPointerMove}
      onPointerUp={endRootGesture}
      onPointerCancel={endRootGesture}
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

      {selected && (
        <>
          {(
            [
              { corner: 'nw', left: '0%', top: '0%', cursor: 'nwse-resize' },
              { corner: 'ne', left: '100%', top: '0%', cursor: 'nesw-resize' },
              { corner: 'sw', left: '0%', top: '100%', cursor: 'nesw-resize' },
              { corner: 'se', left: '100%', top: '100%', cursor: 'nwse-resize' },
            ] as const
          ).map(({ corner, left, top, cursor }) => (
            <div
              key={corner}
              className="absolute touch-none rounded-full border-2 border-primary bg-card shadow-md"
              style={{
                left,
                top,
                width: HANDLE_SIZE,
                height: HANDLE_SIZE,
                transform: 'translate(-50%, -50%)',
                cursor,
              }}
              onPointerDown={handleCornerPointerDown}
              onPointerMove={handleCornerPointerMove}
              onPointerUp={endCornerGesture}
              onPointerCancel={endCornerGesture}
              role="presentation"
              aria-hidden="true"
            />
          ))}

          <div
            className="absolute bg-primary/70"
            style={{
              left: '50%',
              top: 0,
              width: 2,
              height: ROTATE_HANDLE_GAP,
              transform: `translate(-50%, -100%)`,
            }}
            aria-hidden="true"
          />
          <div
            className="absolute touch-none cursor-grab rounded-full border-2 border-primary bg-card shadow-md active:cursor-grabbing"
            style={{
              left: '50%',
              top: -ROTATE_HANDLE_GAP,
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              transform: 'translate(-50%, -50%)',
            }}
            onPointerDown={handleRotatePointerDown}
            onPointerMove={handleRotatePointerMove}
            onPointerUp={endRotateGesture}
            onPointerCancel={endRotateGesture}
            role="presentation"
            aria-hidden="true"
          />
        </>
      )}
    </div>
  )
}
