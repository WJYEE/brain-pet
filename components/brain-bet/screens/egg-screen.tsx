'use client'

import { useEffect, useRef, useState } from 'react'
import { AssetImage } from '@/components/brain-bet/asset-image'
import { EggImage } from '@/components/brain-bet/egg-image'
import { Logo } from '@/components/brain-bet/logo'
import type { PetProfile } from '@/lib/pets/pet-profile'
import { cn } from '@/lib/utils'

type Stage = 'idle' | 'shaking' | 'crack' | 'light' | 'opening' | 'revealed'

interface EggScreenProps {
  /**
   * The pet to reveal — resolved from StoredPetProfile (candidate or
   * confirmed, see lib/pets/pet-flow.ts#resolveCurrentPetProfile), never the
   * old getTopStat-based CharacterImage. Only null in the (practically
   * unreachable, since handleMeetStatling always assigns a candidate pool
   * before this screen mounts) case where no pet has been matched yet — a
   * neutral silhouette is shown instead of guessing.
   */
  petProfile: PetProfile | null
  onHatched: () => void
}

const STAGE_MESSAGE: Record<Stage, string> = {
  idle: '알이 움직이고 있어요...',
  shaking: '알이 흔들리고 있어요!',
  crack: '어, 균열이 생겼어요!',
  light: '빛이 새어나오고 있어요...',
  opening: '껍질이 열리고 있어요!',
  revealed: '태어났어요!',
}

/** How long the revealed Statling + sparkle burst stays on screen before auto-advancing to Reveal — long enough for a satisfying beat, short enough to not feel like a second stop. */
const HATCH_REVEAL_HOLD_MS = 1300

/**
 * The Hatch sequence — 흔들리기 → 균열 발생 → 빛이 새어나와요 → 껍질이
 * 열리고 → Statling 등장 → 반짝!, auto-playing over ~4.5s, then auto-advancing
 * straight into Reveal after a short idle/sparkle beat. There is no
 * intermediate "HATCH!" stop screen or confirm button — the whole point is
 * one continuous "Hatch → Reveal" flow with nothing in between to break it
 * up. Reuses the egg PNG at its fullest (stage 6) growth look — this screen
 * is about what happens to an already-fully-grown egg, not the growth
 * itself (that's CompleteScreen's job between games). The revealed-stage
 * pet image is sized to match RevealScreen's (180) so it doesn't visibly
 * jump in size across the cut to the next screen.
 */
export function EggScreen({ petProfile, onHatched }: EggScreenProps) {
  const [stage, setStage] = useState<Stage>('idle')

  // onHatched is an inline prop (a fresh function reference every parent
  // render) — read it through a ref so the timer sequence below starts
  // exactly once on mount rather than restarting from an unrelated parent
  // re-render, the same stale-closure-avoidance pattern used elsewhere
  // (Focus/Spatial/Reasoning) in this codebase.
  const onHatchedRef = useRef(onHatched)
  onHatchedRef.current = onHatched

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStage('shaking'), 700),
      window.setTimeout(() => setStage('crack'), 1600),
      window.setTimeout(() => setStage('light'), 2300),
      window.setTimeout(() => setStage('opening'), 3000),
      window.setTimeout(() => setStage('revealed'), 3700),
      window.setTimeout(() => onHatchedRef.current(), 3700 + HATCH_REVEAL_HOLD_MS),
    ]
    return () => timers.forEach(window.clearTimeout)
  }, [])

  const isRevealed = stage === 'revealed'
  const isOpening = stage === 'opening'

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-5 py-10 text-center">
      <Logo size="sm" />

      <p className="mt-8 text-xs font-bold uppercase tracking-wide text-muted-foreground">{STAGE_MESSAGE[stage]}</p>

      <div className="relative mt-6 grid h-52 w-52 place-items-center">
        {!isRevealed && !isOpening && (
          <div className="relative">
            <EggImage stage={6} size={168} />
            {(stage === 'crack' || stage === 'light') && (
              <span
                className="animate-egg-crack-flash absolute left-1/2 top-10 -translate-x-1/2 text-2xl"
                aria-hidden="true"
              >
                ✨
              </span>
            )}
            {stage === 'light' && (
              <span
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: '0 0 40px 12px var(--accent)', opacity: 0.5 }}
                aria-hidden="true"
              />
            )}
          </div>
        )}

        {isOpening && (
          <div className="relative grid place-items-center">
            {/* the shell has already burst — two chips fly outward while the Statling pops in where the egg was */}
            <span className="animate-shell-open-left absolute -left-4 top-6 text-3xl" aria-hidden="true">
              🥚
            </span>
            <span className="animate-shell-open-right absolute -right-4 top-6 text-3xl" aria-hidden="true">
              🥚
            </span>
            {petProfile ? (
              <AssetImage
                src={petProfile.imageSrc}
                alt={petProfile.name}
                size={140}
                className="animate-pop-in"
              />
            ) : (
              <span
                className="grid h-35 w-35 animate-pop-in place-items-center rounded-full bg-muted text-4xl"
                aria-hidden="true"
              >
                ✨
              </span>
            )}
          </div>
        )}

        {isRevealed && (
          <div className="relative animate-pop-in">
            {petProfile ? (
              <AssetImage src={petProfile.imageSrc} alt={petProfile.name} size={180} />
            ) : (
              <span
                className="grid h-45 w-45 place-items-center rounded-full bg-muted text-5xl"
                aria-hidden="true"
              >
                ✨
              </span>
            )}
            {['-left-4 -top-2', 'right-0 top-0', 'left-2 bottom-2'].map((pos, i) => (
              <span
                key={pos}
                className={cn('animate-sparkle-burst absolute text-2xl', pos)}
                style={{ animationDelay: `${i * 120}ms` }}
                aria-hidden="true"
              >
                ✨
              </span>
            ))}
          </div>
        )}
      </div>

      {!isRevealed && (
        <h1 className="mt-6 text-balance font-display text-3xl font-extrabold text-foreground">곧 무언가 태어나요...</h1>
      )}
    </div>
  )
}
