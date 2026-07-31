import { ALL_SOUND_NAMES, SFX_CONFIG } from '@/lib/audio/audio-config'
import { SoundPlayer } from '@/lib/audio/audio-player'
import type { BgmName, SoundName } from '@/lib/audio/types'

/**
 * App-wide SFX manager — a plain singleton (not a React hook/context) so it
 * can be preloaded, muted, or played from anywhere (including outside React,
 * e.g. a future imperative call from a non-component module) without
 * threading state through the component tree. hooks/use-sound.ts is a thin
 * wrapper over this for the "usual" component call site.
 *
 * Playback state (muted, last-played-at, unlocked) intentionally lives here
 * and not in React state — sounds are fire-and-forget side effects, never
 * something a component re-renders in response to.
 */
class AudioManager {
  private players = new Map<SoundName, SoundPlayer>()
  private lastPlayedAt = new Map<SoundName, number>()
  private muted = false
  private unlocked = false
  private preloaded = false

  private getPlayer(name: SoundName): SoundPlayer {
    let player = this.players.get(name)
    if (!player) {
      player = new SoundPlayer(SFX_CONFIG[name])
      this.players.set(name, player)
    }
    return player
  }

  /** Creates (but does not play) every pooled <audio> element up front, so the first real play() has zero network/decode delay. */
  preloadAll(): void {
    if (this.preloaded || typeof window === 'undefined') return
    this.preloaded = true
    for (const name of ALL_SOUND_NAMES) {
      this.getPlayer(name).preload()
    }
  }

  play(name: SoundName): void {
    if (this.muted || typeof window === 'undefined') return
    try {
      const config = SFX_CONFIG[name]
      const minInterval = config.minIntervalMs ?? 0
      if (minInterval > 0) {
        const last = this.lastPlayedAt.get(name) ?? 0
        const now = performance.now()
        if (now - last < minInterval) return
        this.lastPlayedAt.set(name, now)
      }
      this.getPlayer(name).play()
    } catch {
      // A missing/broken sound must never interrupt the caller's flow.
    }
  }

  stop(name: SoundName): void {
    this.players.get(name)?.stop()
  }

  stopAll(): void {
    for (const player of this.players.values()) player.stop()
  }

  setVolume(name: SoundName, volume: number): void {
    this.getPlayer(name).setVolume(volume)
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    if (muted) this.stopAll()
  }

  isMuted(): boolean {
    return this.muted
  }

  /**
   * Mobile Safari (and Chrome autoplay policy generally) refuses to play
   * *any* <audio> until a real user gesture has reached the page — playing
   * one muted, zero-volume-safe tick here on the very first pointerdown
   * "unlocks" the pooled elements for every sound played afterward. Safe to
   * call repeatedly; only the first call after a fresh load does anything.
   */
  unlock(): void {
    if (this.unlocked || typeof window === 'undefined') return
    this.unlocked = true
    for (const name of ALL_SOUND_NAMES) {
      this.getPlayer(name).unlock()
    }
  }

  /**
   * Not implemented yet — no BGM assets exist in
   * public/assets/statling/audio/bgm/ today. This method (and BgmName)
   * exist purely so hooks/use-bgm.ts has a real singleton to call into;
   * wiring an actual track in later is a change to this method's body only,
   * never to call sites.
   */
  playBgm(_name: BgmName): void {}
  stopBgm(): void {}
  setBgmVolume(_volume: number): void {}
}

export const audioManager = new AudioManager()
