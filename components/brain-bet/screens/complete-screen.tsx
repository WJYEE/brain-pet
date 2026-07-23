'use client'

import { ArrowRight, Check, PartyPopper } from 'lucide-react'
import { ProgressTrack } from '@/components/brain-bet/progress-track'
import { StatBadge } from '@/components/brain-bet/stat-badge'
import { PLAY_ORDER, STATS, TOTAL_GAMES, type StatId, type StatResult } from '@/lib/brain-bet'

interface CompleteScreenProps {
  statId: StatId
  /** zero-based index of the game just finished */
  index: number
  /** raw record + final stat earned this round (see lib/brain-bet.ts generateResult) */
  result: StatResult
  onNext: () => void
}

export function CompleteScreen({ statId, index, result, onNext }: CompleteScreenProps) {
  const stat = STATS[statId]
  const isLast = index === TOTAL_GAMES - 1
  const nextStat = isLast ? null : STATS[PLAY_ORDER[index + 1]]

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-5 py-10 text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground toy-border toy-shadow-sm">
        <PartyPopper size={14} strokeWidth={2.6} />
        {stat.name} 발견
      </span>

      <div className="relative mt-6">
        <StatBadge stat={stat} size="lg" />
        <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground toy-border">
          <Check size={14} strokeWidth={3.5} />
        </span>
      </div>

      <h1 className="mt-5 text-balance font-display text-3xl font-extrabold leading-tight text-foreground">
        좋아요! {stat.name} 스탯을 발견했어요.
      </h1>

      {/* this round's raw record */}
      <div className="mt-6 w-full rounded-2xl bg-card px-6 py-5 toy-border toy-shadow">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          이번 기록
        </p>
        <p className="mt-1 font-display text-4xl font-extrabold leading-none text-foreground">
          {result.raw.primary}
        </p>
        {result.raw.secondary && (
          <p className="mt-2 text-sm text-muted-foreground">{result.raw.secondary}</p>
        )}
      </div>

      {/* overall progress */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <ProgressTrack current={index + 1} />
      </div>

      {/* continue CTA */}
      <button
        type="button"
        onClick={onNext}
        className="group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-display text-lg font-extrabold text-primary-foreground toy-border toy-shadow-lg transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        {isLast ? 'MY STATUS 보기' : `다음: ${nextStat?.name}`}
        <ArrowRight
          size={20}
          strokeWidth={2.8}
          className="transition-transform duration-150 group-hover:translate-x-1"
        />
      </button>
    </div>
  )
}
