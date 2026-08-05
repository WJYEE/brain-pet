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
   * been play()'d inside a real user-gesture call stack. Muting before
   * play() (and restoring the original muted state after) is what actually
   * keeps this silent — pausing alone still let a real chorus of blips
   * through on some mobile in-app browsers (e.g. KakaoTalk's WebView),
   * because el.play() can render a frame of audible audio before the
   * pause() in the .then() callback lands. Every pooled element across every
   * sound gets unlocked here in one pass (see AudioManager.unlock), so
   * without muting this was the "several SFX auto-play on first mobile
   * touch" bug.
   */
  unlock(): void {
    this.preload()
    for (const el of this.elements) {
      try {
        const wasMuted = el.muted
        el.muted = true
        const restore = () => {
          el.pause()
          el.currentTime = 0
          el.muted = wasMuted
        }
        const playResult = el.play()
        if (playResult && typeof playResult.then === 'function') {
          playResult.then(restore).catch(() => {
            el.muted = wasMuted
          })
        } else {
          restore()
        }
      } catch {
        // ignore — nothing to unlock in this environment
      }
    }
  }
}
