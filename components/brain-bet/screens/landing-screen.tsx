'use client'

import { ArrowRight, Clock, Egg, Sparkles } from 'lucide-react'
import { Logo } from '@/components/brain-bet/logo'
import { StatBadge } from '@/components/brain-bet/stat-badge'
import { PLAY_ORDER, STATS, TOTAL_GAMES } from '@/lib/brain-bet'

interface LandingScreenProps {
  onStart: () => void
}

export function LandingScreen({ onStart }: LandingScreenProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center px-5 py-10 sm:py-16">
      <Logo size="md" />

      <div className="mt-10 flex flex-col items-center text-center sm:mt-14">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground toy-border toy-shadow-sm">
          <Sparkles size={14} strokeWidth={2.6} />
          {TOTAL_GAMES}개의 게임 · 하나의 MY STATUS
        </span>

        <h1 className="mt-5 text-balance font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-6xl">
          나의 숨겨진
          <br />
          <span className="text-primary">스탯</span>을 발견해보세요.
        </h1>

        <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          6개의 짧은 미니게임을 플레이하고
          <br className="hidden sm:block" /> 나만의 6가지 능력치를 확인해보세요.
        </p>
      </div>

      {/* six stat preview — a peek at what you'll discover, not a menu */}
      <div className="mt-9 w-full">
        <p className="mb-3 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">
          앞으로 발견하게 될 6가지 능력
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-2.5">
          {PLAY_ORDER.map((id) => {
            const stat = STATS[id]
            return (
              <li
                key={id}
                className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 toy-border"
              >
                <StatBadge stat={stat} size="xs" />
                <span className="font-display text-sm font-extrabold leading-none text-foreground">
                  {stat.name}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* CTA */}
      <div className="mt-9 flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={onStart}
          className="group inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-display text-xl font-extrabold text-primary-foreground toy-border toy-shadow-lg transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          게임 시작하기
          <ArrowRight
            size={22}
            strokeWidth={2.8}
            className="transition-transform duration-150 group-hover:translate-x-1"
          />
        </button>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <Clock size={15} strokeWidth={2.4} />약 4~5분
        </span>
      </div>

      {/* Statling curiosity hook — hint at a birth, never reveal the character */}
      <div className="mt-auto flex w-full flex-col items-center pt-12">
        <div className="flex max-w-xs items-center gap-3 rounded-2xl bg-card px-4 py-3 toy-border toy-shadow-sm">
          <span
            className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground toy-border"
            aria-hidden="true"
          >
            <Egg size={20} strokeWidth={2.4} />
            <span className="absolute inset-0 animate-ping rounded-full bg-accent/40" />
          </span>
          <p className="text-pretty text-xs font-semibold leading-relaxed text-muted-foreground">
            6개의 스탯을 모두 발견하면
            <br />
            나만의{' '}
            <span className="font-display font-extrabold text-foreground">Statling</span>이
            깨어나요.
          </p>
        </div>
      </div>
    </div>
  )
}
