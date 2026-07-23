'use client'

import type { CSSProperties } from 'react'
import { Gamepad2, Play, Timer, Trophy } from 'lucide-react'
import { Logo } from '@/components/brain-bet/logo'
import { ProgressTrack } from '@/components/brain-bet/progress-track'
import { StatBadge } from '@/components/brain-bet/stat-badge'
import { STATS, type StatId } from '@/lib/brain-bet'

interface GameScreenProps {
  statId: StatId
  /** zero-based index of this game in the sequence (ignored when mode is 'free') */
  index: number
  /** 'first' = onboarding sequence with progress pips; 'free' = single Free Play round */
  mode?: 'first' | 'free'
  /** called when the (placeholder) game round is finished */
  onComplete: () => void
}

export function GameScreen({ statId, index, mode = 'first', onComplete }: GameScreenProps) {
  const stat = STATS[statId]
  const Icon = stat.icon
  const tint = { backgroundColor: `color-mix(in oklch, var(${stat.colorVar}) 14%, var(--card))` } as CSSProperties

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-5 py-6">
      {/* top bar */}
      <header className="flex items-center justify-between gap-4">
        <Logo size="sm" />
        {mode === 'first' ? (
          <ProgressTrack current={index} />
        ) : (
          <span className="rounded-xl bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground toy-border">
            FREE PLAY
          </span>
        )}
      </header>

      {/* current stat + round */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <StatBadge stat={stat} size="md" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              지금 측정 중
            </p>
            <h1 className="font-display text-2xl font-extrabold leading-none text-foreground">
              {stat.name}
            </h1>
          </div>
        </div>
        <span className="rounded-xl bg-secondary px-3 py-2 text-center font-display text-sm font-extrabold text-secondary-foreground toy-border">
          ROUND <span className="text-primary">1</span> / 3
        </span>
      </div>

      {/* large central game area — reusable placeholder for all six games */}
      <div
        className="mt-5 flex flex-1 flex-col items-center justify-center gap-5 rounded-3xl px-6 py-12 text-center toy-border toy-shadow-lg"
        style={tint}
      >
        <span
          className="grid h-24 w-24 place-items-center rounded-3xl toy-border toy-shadow text-[color:var(--ink)]"
          style={{ backgroundColor: `var(${stat.colorVar})` }}
          aria-hidden="true"
        >
          <Icon size={48} strokeWidth={2.2} />
        </span>
        <div className="max-w-sm">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-bold text-muted-foreground toy-border">
            <Gamepad2 size={14} strokeWidth={2.4} />
            게임 화면
          </p>
          <p className="mt-3 text-pretty font-display text-lg font-bold leading-snug text-foreground">
            {stat.howTo}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {stat.name} 미니게임이 이곳에서 시작돼요.
          </p>
        </div>
      </div>

      {/* score / time + action */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="grid flex-1 grid-cols-2 gap-3">
          <div className="flex items-center gap-2.5 rounded-2xl bg-card px-4 py-3 toy-border">
            <Trophy size={20} strokeWidth={2.4} className="text-primary" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground">SCORE</p>
              <p className="font-display text-lg font-extrabold leading-none text-foreground">
                0
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-2xl bg-card px-4 py-3 toy-border">
            <Timer size={20} strokeWidth={2.4} className="text-primary" />
            <div>
              <p className="text-xs font-semibold text-muted-foreground">TIME</p>
              <p className="font-display text-lg font-extrabold leading-none text-foreground">
                0.0s
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onComplete}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-display text-lg font-extrabold text-primary-foreground toy-border toy-shadow transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          <Play size={20} strokeWidth={2.8} />
          라운드 완료
        </button>
      </div>
    </div>
  )
}
