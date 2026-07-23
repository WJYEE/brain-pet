'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Egg as EggIcon, Sparkles } from 'lucide-react'
import { Logo } from '@/components/brain-bet/logo'
import { ToyButton } from '@/components/brain-bet/toy-button'
import { cn } from '@/lib/utils'

type Stage = 'idle' | 'shaking' | 'crack' | 'hatched'

interface EggScreenProps {
  onHatched: () => void
}

/**
 * Egg Idle → Egg Move → Egg Crack → HATCH, auto-playing over ~3.5s (per
 * MVP_SCOPE's "3~5초" target), then waits for the user to continue so the
 * reveal never flashes by unread.
 */
export function EggScreen({ onHatched }: EggScreenProps) {
  const [stage, setStage] = useState<Stage>('idle')

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStage('shaking'), 900),
      window.setTimeout(() => setStage('crack'), 2200),
      window.setTimeout(() => setStage('hatched'), 3400),
    ]
    return () => timers.forEach(window.clearTimeout)
  }, [])

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-5 py-10 text-center">
      <Logo size="sm" />

      <p className="mt-8 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {stage === 'hatched' ? '태어났어요!' : '알이 움직이고 있어요...'}
      </p>

      <div className="relative mt-6 grid h-48 w-48 place-items-center">
        {stage !== 'hatched' ? (
          <span
            className={cn(
              'relative grid h-36 w-36 place-items-center rounded-[46%] bg-card toy-border toy-shadow-lg',
              stage === 'idle' && 'animate-float',
              (stage === 'shaking' || stage === 'crack') && 'animate-shake',
            )}
          >
            <EggIcon size={64} strokeWidth={2} className="text-accent-foreground" />
            {stage === 'crack' && (
              <span className="absolute -right-1 -top-1 text-3xl" aria-hidden="true">
                ✨
              </span>
            )}
          </span>
        ) : (
          <span className="animate-pop-in grid h-40 w-40 place-items-center rounded-full bg-accent toy-border toy-shadow-lg">
            <Sparkles size={56} strokeWidth={2} className="text-accent-foreground" />
          </span>
        )}
      </div>

      <h1 className="mt-6 text-balance font-display text-3xl font-extrabold text-foreground">
        {stage === 'hatched' ? 'HATCH!' : '곧 무언가 태어나요...'}
      </h1>

      {stage === 'hatched' && (
        <ToyButton className="mt-8 w-full" onClick={onHatched}>
          나의 Statling 확인하기
          <ArrowRight size={20} strokeWidth={2.8} />
        </ToyButton>
      )}
    </div>
  )
}
