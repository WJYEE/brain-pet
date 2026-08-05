'use client'

import { ArrowDownToLine, ArrowUpToLine, FlipHorizontal2, Trash2 } from 'lucide-react'
import type { CharacterAnchorKey } from '@/lib/character-anchor.config'
import type { DecoPlacementItem } from '@/lib/deco-placement-state'
import type { SupportedDecoAsset } from '@/lib/deco-supported-assets'
import { cn } from '@/lib/utils'

interface DecoPropertiesPanelProps {
  item: DecoPlacementItem
  asset: SupportedDecoAsset
  onFlip: () => void
  onSetLayer: (layer: 'behind' | 'front') => void
  onSetAnchor: (anchor: CharacterAnchorKey) => void
  onDelete: () => void
}

const ANCHOR_OPTIONS: { value: CharacterAnchorKey; label: string }[] = [
  { value: 'head', label: '머리' },
  { value: 'face', label: '얼굴' },
  { value: 'body', label: '몸통' },
]

/** Mirrors room-properties-panel.tsx's actionButtonClass exactly — same button shape/style everywhere a placed object's properties are edited, Room or Deco. */
const actionButtonClass =
  'flex flex-col items-center gap-1 rounded-xl bg-card px-2 py-2 text-[11px] font-bold text-foreground toy-border transition-transform active:translate-y-0.5'

/**
 * Action panel for whichever sticker is currently selected — identical
 * button-grid UI/layout to room-properties-panel.tsx. Crop/size/rotation
 * are no longer here: dragging the sticker itself, its corner handles, and
 * its rotate handle (see deco-item-handle.tsx) covers all of that now, the
 * same way Room's furniture is only ever moved on-canvas. "앞으로"/"뒤로" set
 * `layer` relative to the Statling (only two possible values) rather than
 * reordering a z-index stack, since that's Deco's own placement model —
 * everything else is a direct port of Room's buttons.
 */
export function DecoPropertiesPanel({ item, asset, onFlip, onSetLayer, onSetAnchor, onDelete }: DecoPropertiesPanelProps) {
  return (
    <div className="mt-2 rounded-2xl bg-secondary p-3 toy-border" aria-label="선택한 스티커 속성">
      <span className="font-display text-sm font-extrabold text-foreground">{asset.name}</span>

      {/* Which anchor (lib/character-anchor.config.ts) this sticker follows — a hat defaults to 머리 but can be reassigned, e.g. if it reads better tracking 얼굴 on a particular character. */}
      <div role="radiogroup" aria-label="붙는 위치" className="mt-2 grid grid-cols-3 gap-2">
        {ANCHOR_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={item.anchor === opt.value}
            className={cn(actionButtonClass, item.anchor === opt.value && 'bg-accent text-accent-foreground')}
            onClick={() => onSetAnchor(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-4 gap-2">
        <button type="button" className={actionButtonClass} onClick={() => onSetLayer('front')} aria-label="앞으로 가져오기">
          <ArrowUpToLine size={16} />
          앞으로
        </button>
        <button type="button" className={actionButtonClass} onClick={() => onSetLayer('behind')} aria-label="뒤로 보내기">
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
