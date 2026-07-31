'use client'

import { ArrowDownToLine, ArrowUpToLine, FlipHorizontal2, Trash2 } from 'lucide-react'
import type { RoomAsset } from '@/lib/room-assets'
import type { RoomItem } from '@/lib/room/room-state'
import { cn } from '@/lib/utils'

interface RoomPropertiesPanelProps {
  item: RoomItem
  asset: RoomAsset
  onDelete: () => void
  onBringToFront: () => void
  onSendToBack: () => void
  onFlip: () => void
}

const actionButtonClass =
  'flex flex-col items-center gap-1 rounded-xl bg-card px-2 py-2 text-[11px] font-bold text-foreground toy-border transition-transform active:translate-y-0.5'

/**
 * Property/action panel for whichever room item is currently selected.
 * Size is a fixed, curated per-asset value — never user-adjustable, so
 * there's intentionally no resize control here. Left-right flip is the only
 * appearance change a user can make; position is changed by dragging the
 * item on the canvas itself, not from here.
 */
export function RoomPropertiesPanel({ item, asset, onDelete, onBringToFront, onSendToBack, onFlip }: RoomPropertiesPanelProps) {
  return (
    <div className="rounded-2xl bg-secondary p-3 toy-border" aria-label="선택한 오브젝트 속성">
      <span className="font-display text-sm font-extrabold text-foreground">{asset.name}</span>

      <div className="mt-3 grid grid-cols-4 gap-2">
        <button type="button" className={actionButtonClass} onClick={onBringToFront} aria-label="앞으로 가져오기">
          <ArrowUpToLine size={16} />
          앞으로
        </button>
        <button type="button" className={actionButtonClass} onClick={onSendToBack} aria-label="뒤로 보내기">
          <ArrowDownToLine size={16} />
          뒤로
        </button>
        <button
          type="button"
          className={cn(actionButtonClass, item.flipped && 'bg-accent text-accent-foreground')}
          onClick={onFlip}
          aria-pressed={!!item.flipped}
          aria-label="좌우 반전"
        >
          <FlipHorizontal2 size={16} />
          반전
        </button>
        <button
          type="button"
          className={cn(actionButtonClass, 'bg-destructive text-primary-foreground')}
          onClick={onDelete}
          aria-label="삭제"
        >
          <Trash2 size={16} />
          삭제
        </button>
      </div>
    </div>
  )
}
