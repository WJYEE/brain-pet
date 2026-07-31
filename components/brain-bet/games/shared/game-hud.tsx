import type { ReactNode } from 'react'
import { HelpCircle } from 'lucide-react'
import { Logo } from '@/components/brain-bet/logo'
import { ProgressTrack } from '@/components/brain-bet/progress-track'
import { StatBadge } from '@/components/brain-bet/stat-badge'
import type { StatDef } from '@/lib/brain-bet'

interface GameHudProps {
  stat: StatDef
  gameName: string
  mode: 'first' | 'free'
  index: number
  /** One short line always visible (spec §3: "게임 시작 전 짧은 한 줄 목표는 항상 표시 가능") — e.g. "목표 색만 클릭하세요". */
  objective: string
  /** Right-aligned status chip content — a timer, round counter, or score-in-progress. */
  statusSlot?: ReactNode
  onHelp: () => void
}

/**
 * Common header for every new mini-game — kept visually identical across
 * all 6 so they read as one game system rather than six different design
 * languages (spec §13). Mirrors the existing games' own header structure
 * (Logo + ProgressTrack/FREE PLAY, then a stat/title row) so the new games
 * don't feel like a bolt-on.
 */
export function GameHud({ stat, gameName, mode, index, objective, statusSlot, onHelp }: GameHudProps) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <Logo size="sm" />
        {mode === 'first' ? (
          <ProgressTrack current={index} />
        ) : (
          <span className="rounded-xl bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground toy-border">
            FREE PLAY
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <StatBadge stat={stat} size="md" />
          <div>
            <h1 className="font-display text-xl font-extrabold leading-none text-foreground">{gameName}</h1>
            <p className="mt-1 max-w-[14rem] text-pretty text-xs font-semibold text-muted-foreground">
              {objective}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {statusSlot}
          <button
            type="button"
            onClick={onHelp}
            aria-label={`${gameName} 게임 방법 보기`}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card text-foreground toy-border toy-shadow-sm"
          >
            <HelpCircle size={20} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}
