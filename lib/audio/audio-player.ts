import type { SoundConfig } from '@/lib/audio/types'

/**
 * One pooled, reusable set of <audio> elements for a single sound. Playing
 * never does `new Audio()` per call (perf requirement in the spec) — it
 * round-robins across `maxConcurrent` pre-created elements so a sound can be
 * retriggered before its previous instance finishes without either cutting
 * it off or allocating anything.
 *
 * All failures (missing file, decode error, autoplay block) are swallowed —
 * a sound that can't play must never throw or break the calling screen.
 */
export class SoundPlayer {
  private elements: HTMLAudioElement[] = []
  private nextIndex = 0
  private loaded = false

  constructor(private readonly config: SoundConfig) {}

  preload(): void {
    if (this.loaded || typeof window === 'undefined') return
    this.loaded = true
    const count = Math.max(1, this.config.maxConcurrent ?? 1)
    try {
      for (let i = 0; i < count; i += 1) {
        const el = new Audio()
        el.src = this.config.src
        el.preload = 'auto'
        el.volume = this.config.volume
        this.elements.push(el)
      }
    } catch {
      // Audio() unavailable (non-browser env) — play() below no-ops safely.
    }
  }

  setVolume(volume: number): void {
    for (const el of this.elements) el.volume = volume
  }

  play(): void {
    if (typeof window === 'undefined') return
    this.preload()
    if (this.elements.length === 0) return

    const el = this.elements[this.nextIndex]
    this.nextIndex = (this.nextIndex + 1) % this.elements.length
    try {
      el.currentTime = 0
      // play() returns a Promise that rejects if the browser blocks
      // autoplay before any user gesture — silently ignored, never surfaced.
      void el.play()?.catch(() => {})
    } catch {
      // Some mobile browsers throw synchronously instead of rejecting.
    }
  }

  stop(): void {
    for (const el of this.elements) {
      try {
        el.pause()
        el.currentTime = 0
      } catch {
        // ignore
      }
    }
  }

  /**
   * Mobile Safari/Chrome only allow an <audio> element to play once it has
   * been play()'d inside a real user-gesture call stack — immediately
   * pausing it again keeps this silent (no audible blip) while still
   * satisfying that one-time requirement for every future untrusted-context
   * play() call (a setTimeout, a countdown tick, etc.).
   */
  unlock(): void {
    this.preload()
    for (const el of this.elements) {
      try {
        const playResult = el.play()
        if (playResult && typeof playResult.then === 'function') {
          playResult
            .then(() => {
              el.pause()
              el.currentTime = 0
            })
            .catch(() => {})
        } else {
          el.pause()
          el.currentTime = 0
        }
      } catch {
        // ignore — nothing to unlock in this environment
      }
    }
  }
}
