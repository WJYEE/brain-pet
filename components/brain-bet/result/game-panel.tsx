import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GamePanelProps {
  icon?: ReactNode
  label: string
  children: ReactNode
  className?: string
}

/**
 * RPG-status-window panel: a thick-bordered box with a small tab label
 * overlapping its top edge, standing in for the repeated plain white
 * rounded cards the old layout used. Shared across the result sections so
 * the "game panel" look (not "SaaS card" look) stays consistent without
 * re-typing the same border/tab markup five times.
 */
export function GamePanel({ icon, label, children, className }: GamePanelProps) {
  return (
    <section className={cn('relative mt-6 w-full rounded-2xl border-2 border-foreground/15 bg-card px-4 pb-4 pt-6', className)}>
      <h2 className="absolute -top-3.5 left-4 inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 font-display text-xs font-extrabold text-primary-foreground toy-border">
        {icon}
        {label}
      </h2>
      {children}
    </section>
  )
}
