import type { CSSProperties } from 'react'
import type { StatDef } from '@/lib/brain-bet'
import { cn } from '@/lib/utils'

interface StatBadgeProps {
  stat: StatDef
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  xs: { box: 'h-6 w-6 rounded-lg', icon: 13 },
  sm: { box: 'h-9 w-9 rounded-xl', icon: 18 },
  md: { box: 'h-12 w-12 rounded-2xl', icon: 24 },
  lg: { box: 'h-16 w-16 rounded-2xl', icon: 32 },
}

/** A colored, sticker-style icon chip for a single stat. */
export function StatBadge({ stat, size = 'md', className }: StatBadgeProps) {
  const s = sizes[size]
  const Icon = stat.icon
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center toy-border toy-shadow-sm text-[color:var(--ink)]',
        s.box,
        className,
      )}
      style={{ backgroundColor: `var(${stat.colorVar})` } as CSSProperties}
      aria-hidden="true"
    >
      <Icon size={s.icon} strokeWidth={2.4} />
    </span>
  )
}
