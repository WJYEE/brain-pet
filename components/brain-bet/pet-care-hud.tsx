import { BatteryMedium, Smile } from 'lucide-react'
import { FloatingDeltaText } from '@/components/brain-bet/floating-delta-text'
import type { FloatingDelta } from '@/hooks/use-pet-care'
import { ATTENTION_THRESHOLD } from '@/lib/config/pet-care.config'
import { BowlIcon, BubbleIcon, HeartIcon, type RoomIconProps } from '@/components/brain-bet/room-icons'
import type { CareStatId } from '@/lib/pet-care/types'
import { cn } from '@/lib/utils'

const STAT_ICON: Record<CareStatId, (props: RoomIconProps) => React.ReactElement> = {
  satiety: BowlIcon,
  cleanliness: BubbleIcon,
  affection: HeartIcon,
  energy: (props) => <BatteryMedium {...props} />,
  happiness: (props) => <Smile {...props} />,
}

const STAT_LABEL: Record<CareStatId, string> = {
  satiety: '포만감',
  cleanliness: '청결도',
  affection: '애정도',
  energy: '에너지',
  happiness: '행복도',
}

const STAT_STATUS_LABEL: Record<CareStatId, { low: string; mid: string; high: string }> = {
  satiety: { low: '배고파요', mid: '적당해요', high: '든든해요' },
  cleanliness: { low: '더러워요', mid: '보통이에요', high: '깨끗해요' },
  affection: { low: '서먹해요', mid: '친해지는 중이에요', high: '많이 좋아해요' },
  energy: { low: '지쳤어요', mid: '보통이에요', high: '활기차요' },
  happiness: { low: '우울해요', mid: '보통이에요', high: '행복해요' },
}

const STAT_ORDER: CareStatId[] = ['satiety', 'cleanliness', 'affection', 'energy', 'happiness']
const HIGH_THRESHOLD = 70

function statusLabel(statId: CareStatId, value: number): string {
  const labels = STAT_STATUS_LABEL[statId]
  if (value < ATTENTION_THRESHOLD[statId]) return labels.low
  if (value >= HIGH_THRESHOLD) return labels.high
  return labels.mid
}

interface PetCareHudProps {
  stats: Record<CareStatId, number>
  intimacyLevel: number
  intimacyExp: number
  expToNext: number
  floatingDeltas: FloatingDelta[]
}

export function PetCareHud({ stats, intimacyLevel, intimacyExp, expToNext, floatingDeltas }: PetCareHudProps) {
  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-1.5 toy-border">
        <span className="font-display text-xs font-extrabold text-secondary-foreground">Lv.{intimacyLevel}</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-card">
          <div
            role="progressbar"
            aria-label="친밀도 레벨 진행도"
            aria-valuemin={0}
            aria-valuemax={expToNext}
            aria-valuenow={intimacyExp}
            className="h-full rounded-full bg-accent transition-[width] duration-300"
            style={{ width: `${Math.min(100, (intimacyExp / expToNext) * 100)}%` }}
          />
        </div>
        <span className="text-[10px] font-bold text-muted-foreground">
          {intimacyExp}/{expToNext}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {STAT_ORDER.map((statId) => {
          const Icon = STAT_ICON[statId]
          const value = stats[statId]
          const low = value < ATTENTION_THRESHOLD[statId]
          const delta = floatingDeltas.find((d) => d.statId === statId)
          return (
            <div
              key={statId}
              className={cn(
                'relative flex items-center gap-2 rounded-xl bg-card px-3 py-2 toy-border',
                low && 'ring-2 ring-destructive/50',
              )}
            >
              <Icon size={20} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[11px] font-bold text-muted-foreground">{STAT_LABEL[statId]}</span>
                  <span className="font-display text-sm font-extrabold tabular-nums text-foreground">{value}</span>
                </div>
                <div
                  role="progressbar"
                  aria-label={STAT_LABEL[statId]}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={value}
                  className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary"
                >
                  <div
                    className={cn('h-full rounded-full transition-[width] duration-500', low ? 'bg-destructive' : 'bg-primary')}
                    style={{ width: `${value}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground">{statusLabel(statId, value)}</span>
              </div>
              {delta && <FloatingDeltaText key={delta.id} delta={delta.delta} className="right-2 top-1" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
