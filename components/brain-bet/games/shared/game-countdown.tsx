'use client'

import { useEffect, useState } from 'react'
import { useSound } from '@/hooks/use-sound'

interface GameCountdownProps {
  /** Whole seconds to count down from, e.g. 3. */
  seconds: number
  onDone: () => void
  label?: string
}

/** Shared 3-2-1 countdown shown before a new game's real timer starts. */
export function GameCountdown({ seconds, onDone, label }: GameCountdownProps) {
  const [remaining, setRemaining] = useState(seconds)
  const { play } = useSound()

  // One pre-mixed clip (3 ticks + "go" accent, see lib/audio/audio-config.ts)
  // covers the whole countdown — played once when it starts, not per tick.
  useEffect(() => {
    play('countdown-whole')
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire exactly once when the countdown starts
  }, [])

  useEffect(() => {
    if (remaining <= 0) {
      onDone()
      return
    }
    const timer = window.setTimeout(() => setRemaining((n) => n - 1), 1000)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onDone is fired exactly once when remaining hits 0, not on every parent render
  }, [remaining])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
      {label && <p className="font-display text-base font-bold text-muted-foreground">{label}</p>}
      <p
        key={remaining}
        className="animate-pop-in font-display text-6xl font-extrabold text-primary"
        aria-live="assertive"
      >
        {remaining > 0 ? remaining : '시작!'}
      </p>
    </div>
  )
}
