'use client'

import { RotateCcw, Share2, Trophy } from 'lucide-react'
import { Logo } from '@/components/brain-bet/logo'
import { RadarChart } from '@/components/brain-bet/radar-chart'
import { StatBadge } from '@/components/brain-bet/stat-badge'
import { STATS, STAT_DISPLAY_ORDER, type StatId } from '@/lib/brain-bet'

interface StatusScreenProps {
  values: Record<StatId, number>
  onReplay: () => void
}

export function StatusScreen({ values, onReplay }: StatusScreenProps) {
  const topStat = STAT_DISPLAY_ORDER.reduce((best, id) =>
    (values[id] ?? 0) > (values[best] ?? 0) ? id : best,
  )

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-5 py-8">
      <header className="flex items-center justify-between">
        <Logo size="sm" />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground toy-border toy-shadow-sm">
          <Trophy size={14} strokeWidth={2.6} />
          6개 게임 모두 완료
        </span>
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
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onReplay}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-display text-lg font-extrabold text-primary-foreground toy-border toy-shadow transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          <RotateCcw size={20} strokeWidth={2.6} />
          다시 하기
        </button>
        <button
          type="button"
          disabled
          className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-card px-6 py-4 font-display text-lg font-extrabold text-muted-foreground toy-border opacity-70"
          title="공유 기능은 곧 추가돼요"
        >
          <Share2 size={20} strokeWidth={2.6} />
          공유하기 (준비 중)
        </button>
      </div>
    </div>
  )
}
