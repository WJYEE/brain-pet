import Image from 'next/image'
import { cn } from '@/lib/utils'
import statlingLogo from '@/public/assets/statling/logo/ChatGPT_tight.png'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { box: 'h-8 w-8', icon: 32, text: 'text-lg' },
  md: { box: 'h-11 w-11', icon: 44, text: 'text-2xl' },
  lg: { box: 'h-16 w-16', icon: 64, text: 'text-4xl sm:text-5xl' },
}

export function Logo({ size = 'md', className }: LogoProps) {
  const s = sizes[size]
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className={cn('relative grid place-items-center', s.box)} aria-hidden="true">
        <Image
          src={statlingLogo}
          alt=""
          width={s.icon}
          height={s.icon}
          className="h-full w-full object-contain"
          priority
        />
      </span>
      <span className={cn('font-display font-extrabold tracking-tight text-foreground', s.text)}>
        Statling
      </span>
    </div>
  )
}
