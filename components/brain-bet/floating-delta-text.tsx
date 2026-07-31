import { cn } from '@/lib/utils'

interface FloatingDeltaTextProps {
  delta: number
  className?: string
}

/** A single "+20"/"-10" pop-drift-fade — must be placed inside a `relative` ancestor by the caller. */
export function FloatingDeltaText({ delta, className }: FloatingDeltaTextProps) {
  const positive = delta > 0
  return (
    <span
      aria-hidden="true"
      className={cn(
        'animate-stat-float pointer-events-none absolute select-none font-display text-sm font-extrabold tabular-nums',
        positive ? 'text-primary' : 'text-destructive',
        className,
      )}
    >
      {positive ? `+${delta}` : delta}
    </span>
  )
}
