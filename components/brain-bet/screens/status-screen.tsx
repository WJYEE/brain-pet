'use client'

import { ArrowRight, RotateCcw, Trophy } from 'lucide-react'
import { Logo } from '@/components/brain-bet/logo'
import { RadarChart } from '@/components/brain-bet/radar-chart'
import { StatBadge } from '@/components/brain-bet/stat-badge'
import { ToyButton } from '@/components/brain-bet/toy-button'
import { STATS, STAT_DISPLAY_ORDER, type StatId } from '@/lib/brain-bet'
import { cn } from '@/lib/utils'

interface StatusScreenProps {
  values: Record<StatId, number>
  /** first-complete: right after the first 6 games. my-stats: viewed via Room nav. */
  context?: 'first-complete' | 'my-stats'
  onMeetStatling?: () => void
  onReplay?: () => void
}

export function StatusScreen({
  values,
  context = 'first-complete',
  onMeetStatling,
  onReplay,
}: StatusScreenProps) {
  const topStat = STAT_DISPLAY_ORDER.reduce((best, id) =>
    (values[id] ?? 0) > (values[best] ?? 0) ? id : best,
  )
  const isFirstComplete = context === 'first-complete'

  return (
    <div
      className={cn(
        'mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-5 py-8',
        !isFirstComplete && 'pb-28',
      )}
    >
      <header className="flex items-center justify-between">
        <Logo size="sm" />
        {isFirstComplete ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground toy-border toy-shadow-sm">
            <Trophy size={14} strokeWidth={2.6} />
            6개 게임 모두 완료
          </span>
        ) : (
          <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            내 스탯
          </span>
        )}
      </header>

      <div className="mt-6 text-center">
        <h1 className="text-balance font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
          MY <span className="text-primary">STATUS</span>
        </h1>
        <p className="mt-2 text-pretty text-muted-foreground">
          가장 강한 능력은{' '}
          <span className="font-bold text-foreground">{STATS[topStat].name}</span>
          이에요.
        </p>
      </div>

      <div className="mt-6 grid items-center gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* radar */}
        <div className="rounded-3xl bg-card p-6 toy-border toy-shadow-lg sm:p-8">
          <RadarChart values={values} />
        </div>

        {/* stat values */}
        <ul className="grid gap-3">
          {STAT_DISPLAY_ORDER.map((id) => {
            const stat = STATS[id]
            const value = Math.round(values[id] ?? 0)
            return (
              <li
                key={id}
                className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 toy-border toy-shadow-sm"
              >
                <StatBadge stat={stat} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-display text-sm font-extrabold text-foreground">
                      {stat.name}
                    </span>
                    <span className="font-display text-lg font-extrabold leading-none text-foreground">
                      {value}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full border-2 border-[color:var(--ink)] bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${value}%`,
                        backgroundColor: `var(${stat.colorVar})`,
                      }}
                    />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {/* actions */}
      {isFirstComplete && (
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ToyButton onClick={onMeetStatling}>
            나의 Statling 만나러 가기
            <ArrowRight size={20} strokeWidth={2.8} />
          </ToyButton>
          <ToyButton variant="secondary" onClick={onReplay}>
            <RotateCcw size={20} strokeWidth={2.6} />
            다시 하기
          </ToyButton>
        </div>
      )}
    </div>
  )
}
