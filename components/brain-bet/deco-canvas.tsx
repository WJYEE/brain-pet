'use client'

import { useRef, type ReactNode } from 'react'
import type { CharacterAnchorSet } from '@/lib/character-anchor.config'
import { DecoItemHandle } from '@/components/brain-bet/deco-item-handle'
import { DecoOverlay } from '@/components/brain-bet/deco-overlay'
import { getSupportedDecoAssetById } from '@/lib/deco-supported-assets'
import { DECO_BEHIND_Z_BASE, DECO_FRONT_Z_BASE, DECO_STATLING_Z_INDEX } from '@/lib/deco-placement-layout'
import type { DecoPlacementItem } from '@/lib/deco-placement-state'
import { cn } from '@/lib/utils'

interface DecoCanvasProps {
  items: DecoPlacementItem[]
  /** The Statling itself, centered — same pattern as room-canvas.tsx's statlingSlot, left entirely to the caller so existing character rendering is untouched. */
  statlingSlot: ReactNode
  /** Must match whatever size `statlingSlot` actually renders at (e.g. AssetImage's `size` prop) — see DecoOverlay. Number = px, or a CSS size string (e.g. `clamp()`) for a responsive box without a JS resize listener. Defaults to 200, matching statling-screen.tsx's editor preview. */
  characterSize?: number | string
  /** Resolved head/face/body anchor points for whatever character/state `statlingSlot` is currently showing — see lib/character-anchor.config.ts. Passed straight through to DecoOverlay/DecoItemHandle. */
  anchors: CharacterAnchorSet
  editable?: boolean
  selectedInstanceId?: string | null
  onSelectItem?: (instanceId: string) => void
  onDeselectItem?: () => void
  onChangeItem?: (instanceId: string, patch: Partial<DecoPlacementItem>) => void
  className?: string
}

/**
 * The Deco stage. Non-editable: a thin wrapper around DecoOverlay (the exact
 * same renderer the live Room screen uses — see pet-mood-view.tsx) so a
 * static preview here always matches Room pixel-for-pixel. Editable: the
 * outer panel stays a big, comfortable touch-drag surface (unchanged from
 * before), but the actual coordinate reference box inside it is pinned to
 * `characterSize` — the same box size DecoOverlay uses everywhere else — so
 * drag math and the saved (x, y) values mean the same thing in the editor
 * as they do in Room.
 */
export function DecoCanvas({
  items,
  statlingSlot,
  characterSize = 200,
  anchors,
  editable = false,
  selectedInstanceId = null,
  onSelectItem,
  onDeselectItem,
  onChangeItem,
  className,
}: DecoCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null)

  if (!editable) {
    return (
      <div className={cn('flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl bg-secondary', className)}>
        <DecoOverlay items={items} characterSize={characterSize} anchors={anchors} characterSlot={statlingSlot} />
      </div>
    )
  }

  return (
    <div
      className={cn('relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl bg-secondary', className)}
      onClick={(event) => {
        if (event.target === event.currentTarget) onDeselectItem?.()
      }}
    >
      <div
        ref={stageRef}
        className="relative"
        style={{ width: characterSize, height: characterSize }}
        onClick={(event) => {
          if (event.target === event.currentTarget) onDeselectItem?.()
        }}
      >
        {items.map((item, index) => {
          const asset = getSupportedDecoAssetById(item.itemId)
          if (!asset || item.layer !== 'behind') return null
          return (
            <DecoItemHandle
              key={item.instanceId}
              item={item}
              asset={asset}
              anchorPoint={anchors[item.anchor]}
              stageRef={stageRef}
              selected={selectedInstanceId === item.instanceId}
              zIndex={DECO_BEHIND_Z_BASE + index}
              onSelect={() => onSelectItem?.(item.instanceId)}
              onChange={(patch) => onChangeItem?.(item.instanceId, patch)}
            />
          )
        })}

        {/* pointer-events-none so a click always falls through to whatever Deco handle sits at that point, regardless of whether it's painted behind or in front of the character — the Statling itself is never an interactive target inside this canvas. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ zIndex: DECO_STATLING_Z_INDEX }}>
          {statlingSlot}
        </div>

        {items.map((item, index) => {
          const asset = getSupportedDecoAssetById(item.itemId)
          if (!asset || item.layer !== 'front') return null
          return (
            <DecoItemHandle
              key={item.instanceId}
              item={item}
              asset={asset}
              anchorPoint={anchors[item.anchor]}
              stageRef={stageRef}
              selected={selectedInstanceId === item.instanceId}
              zIndex={DECO_FRONT_Z_BASE + index}
              onSelect={() => onSelectItem?.(item.instanceId)}
              onChange={(patch) => onChangeItem?.(item.instanceId, patch)}
            />
          )
        })}
      </div>
    </div>
  )
}
