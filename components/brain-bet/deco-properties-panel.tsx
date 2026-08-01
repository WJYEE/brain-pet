'use client'

import { ArrowDownToLine, ArrowUpToLine, Trash2 } from 'lucide-react'
import { DECO_ROTATION_MAX, DECO_ROTATION_MIN, DECO_ROTATION_STEP, DECO_SCALE_MAX, DECO_SCALE_MIN } from '@/lib/deco-placement-layout'
import type { DecoPlacementItem } from '@/lib/deco-placement-state'
import type { SupportedDecoAsset } from '@/lib/deco-supported-assets'
import { cn } from '@/lib/utils'

interface DecoPropertiesPanelProps {
  item: DecoPlacementItem
  asset: SupportedDecoAsset
  onScaleChange: (scale: number) => void
  onRotationChange: (rotation: number) => void
  onSetLayer: (layer: 'behind' | 'front') => void
  onDelete: () => void
}

const layerButtonClass =
  'flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-card px-2 py-2.5 text-xs font-bold text-foreground toy-border transition-transform active:translate-y-0.5'

/**
 * Property panel for whichever sticker is currently selected — sliders for
 * scale/rotation (not on-canvas resize/rotate handles) so the same controls
 * work identically with mouse or touch and never overlap each other even at
 * a 375px viewport, since the whole panel sits below the canvas rather than
 * floating over it. Mirrors room-properties-panel.tsx's front/back + delete
 * layout, but "앞으로"/"뒤로" here directly set `layer` relative to the
 * Statling (only two possible values) rather than reordering a z-index stack.
 */
export function DecoPropertiesPanel({ item, asset, onScaleChange, onRotationChange, onSetLayer, onDelete }: DecoPropertiesPanelProps) {
  return (
    <div className="mt-2 rounded-2xl bg-secondary p-3 toy-border" aria-label="선택한 스티커 속성">
      <span className="font-display text-sm font-extrabold text-foreground">{asset.name}</span>

      <div className="mt-3">
        <div className="flex items-center justify-between">
          <label htmlFor="deco-scale" className="text-xs font-bold text-foreground">
            크기
          </label>
          <span className="text-xs font-bold text-muted-foreground">{Math.round(item.scale * 100)}%</span>
        </div>
        <input
          id="deco-scale"
          type="range"
          min={DECO_SCALE_MIN}
          max={DECO_SCALE_MAX}
          step={0.1}
          value={item.scale}
          onChange={(e) => onScaleChange(Number(e.target.value))}
          className="mt-1 h-8 w-full touch-none"
          aria-label="스티커 크기"
        />
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between">
          <label htmlFor="deco-rotation" className="text-xs font-bold text-foreground">
            회전
          </label>
          <span className="text-xs font-bold text-muted-foreground">{item.rotation}°</span>
        </div>
        <input
          id="deco-rotation"
          type="range"
          min={DECO_ROTATION_MIN}
          max={DECO_ROTATION_MAX}
          step={DECO_ROTATION_STEP}
          value={item.rotation}
          onChange={(e) => onRotationChange(Number(e.target.value))}
          className="mt-1 h-8 w-full touch-none"
          aria-label="스티커 회전"
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          className={cn(layerButtonClass, item.layer === 'behind' && 'bg-accent text-accent-foreground')}
          onClick={() => onSetLayer('behind')}
          aria-pressed={item.layer === 'behind'}
        >
          <ArrowDownToLine size={15} />
          뒤로
        </button>
        <button
          type="button"
          className={cn(layerButtonClass, item.layer === 'front' && 'bg-accent text-accent-foreground')}
          onClick={() => onSetLayer('front')}
          aria-pressed={item.layer === 'front'}
        >
          <ArrowUpToLine size={15} />
          앞으로
        </button>
        <button
          type="button"
          className={cn(layerButtonClass, 'bg-destructive text-primary-foreground')}
          onClick={onDelete}
          aria-label="스티커 삭제"
        >
          <Trash2 size={15} />
          삭제
        </button>
      </div>
    </div>
  )
}
