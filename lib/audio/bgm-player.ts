/**
 * A single persistent <audio> element for the whole app. Unlike SoundPlayer
 * (audio-player.ts), BGM is never more than one track at a time and needs
 * loop/`ended` handling instead of pooled overlap — so this swaps `.src` on
 * one element rather than round-robining a pool.
 *
 * All failures (missing file, decode error, autoplay block) are swallowed —
 * same contract as SoundPlayer, BGM that can't play must never throw.
 */
export class BgmPlayer {
  private element: HTMLAudioElement | null = null
  private created = false

  private ensureElement(): HTMLAudioElement | null {
    if (this.created) return this.element
    this.created = true
    if (typeof window === 'undefined') return null
    try {
      this.element = new Audio()
      this.element.preload = 'auto'
    } catch {
      this.element = null
    }
    return this.element
  }

  /** Registered once; survives every load()/play() call since it's the same element for the app's whole lifetime. */
  onEnded(handler: () => void): void {
    this.ensureElement()?.addEventListener('ended', handler)
  }

  getElement(): HTMLAudioElement | null {
    return this.ensureElement()
  }

  setVolume(volume: number): void {
    const el = this.ensureElement()
    if (el) el.volume = volume
  }

  setLoop(loop: boolean): void {
    const el = this.ensureElement()
    if (el) el.loop = loop
  }

  /** Swaps the track without touching play/pause state — caller decides whether to play() after. */
  load(src: string): void {
    const el = this.ensureElement()
    if (!el) return
    el.src = src
    el.currentTime = 0
  }

  play(): void {
    const el = this.ensureElement()
    if (!el) return
    try {
      // Rejects if the browser blocks autoplay before a user gesture —
      // silently ignored, resolved later by AudioManager#unlockBgm().
      void el.play()?.catch(() => {})
    } catch {
      // Some mobile browsers throw synchronously instead of rejecting.
    }
  }

  pause(): void {
    try {
      this.ensureElement()?.pause()
    } catch {
      // ignore
    }
  }

  stop(): void {
    const el = this.ensureElement()
    if (!el) return
    try {
      el.pause()
      el.currentTime = 0
    } catch {
      // ignore
    }
  }
}
