'use client'

import { ArrowRight, Check, PartyPopper, Trophy } from 'lucide-react'
import { ProgressTrack } from '@/components/brain-bet/progress-track'
import { StatBadge } from '@/components/brain-bet/stat-badge'
import { PLAY_ORDER, STATS, TOTAL_GAMES, type RawRecord, type StatId } from '@/lib/brain-bet'

interface CompleteScreenProps {
  statId: StatId
  /** zero-based index of the game just finished */
  index: number
  /** display raw record for this round (formatted per-game, see lib/scoring/*) */
  raw: RawRecord
  /** current Personal Best raw record, if one exists and differs from this round's */
  personalBestRaw?: RawRecord | null
  /** whether this round's result is now the Personal Best */
  isNewRecord?: boolean
  onNext: () => void
}

export function CompleteScreen({
  statId,
  index,
  raw,
  personalBestRaw,
  isNewRecord,
  onNext,
}: CompleteScreenProps) {
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
        <div className="flex items-center justify-center gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            이번 기록
          </p>
          {isNewRecord && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              <Trophy size={10} strokeWidth={3} />
              NEW RECORD
            </span>
          )}
        </div>
        <p className="mt-1 font-display text-4xl font-extrabold leading-none text-foreground">
          {raw.primary}
        </p>
        {raw.secondary && <p className="mt-2 text-sm text-muted-foreground">{raw.secondary}</p>}

        {personalBestRaw && !isNewRecord && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              개인 최고
            </p>
            <p className="mt-1 font-display text-lg font-extrabold text-foreground">
              {personalBestRaw.primary}
            </p>
          </div>
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
