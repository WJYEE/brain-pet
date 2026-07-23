import { Egg } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { box: 'h-8 w-8', icon: 16, text: 'text-lg' },
  md: { box: 'h-11 w-11', icon: 22, text: 'text-2xl' },
  lg: { box: 'h-16 w-16', icon: 32, text: 'text-4xl sm:text-5xl' },
}

export function Logo({ size = 'md', className }: LogoProps) {
  const s = sizes[size]
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'relative grid place-items-center rounded-2xl bg-primary text-primary-foreground toy-border toy-shadow-sm',
          s.box,
        )}
        aria-hidden="true"
      >
        <Egg size={s.icon} strokeWidth={2.4} />
        {/* tiny spark hinting at something about to hatch */}
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent toy-border" />
      </span>
      <span className={cn('font-display font-extrabold tracking-tight text-foreground', s.text)}>
        Statling
      </span>
    </div>
  )
}
