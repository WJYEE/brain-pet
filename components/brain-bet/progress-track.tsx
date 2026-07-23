import { Check } from 'lucide-react'
import { PLAY_ORDER, STATS, TOTAL_GAMES } from '@/lib/brain-bet'
import { cn } from '@/lib/utils'

interface ProgressTrackProps {
  /** Zero-based index of the current game. Use TOTAL_GAMES for "all done". */
  current: number
  className?: string
}

/** A row of game pips showing completed / current / upcoming games. */
export function ProgressTrack({ current, className }: ProgressTrackProps) {
  return (
    <div className={cn('flex items-center gap-2', className)} aria-hidden="true">
      {PLAY_ORDER.map((id, i) => {
        const done = i < current
        const active = i === current
        return (
          <span
            key={id}
            className={cn(
              'grid h-7 w-7 place-items-center rounded-full border-2 text-xs font-bold transition-transform',
              done && 'border-[color:var(--ink)] bg-primary text-primary-foreground',
              active &&
                'scale-110 border-[color:var(--ink)] bg-accent text-accent-foreground toy-shadow-sm',
              !done && !active && 'border-border bg-muted text-muted-foreground',
            )}
            title={STATS[id].name}
          >
            {done ? <Check size={14} strokeWidth={3} /> : i + 1}
          </span>
        )
      })}
      <span className="ml-1 font-display text-sm font-bold text-muted-foreground">
        {Math.min(current + (current < TOTAL_GAMES ? 1 : 0), TOTAL_GAMES)}
        {' / '}
        {TOTAL_GAMES}
      </span>
    </div>
  )
}
