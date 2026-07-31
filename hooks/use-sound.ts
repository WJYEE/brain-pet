import { audioManager } from '@/lib/audio/audio-manager'
import type { SoundName } from '@/lib/audio/types'

/**
 * The one hook call sites use to play/stop SFX — `useSound().play('ui-confirm')`.
 * Deliberately a thin pass-through to the audioManager singleton (see
 * lib/audio/audio-manager.ts): playback is a fire-and-forget side effect,
 * not React state, so this hook never causes a re-render and is safe to
 * call from event handlers, effects, or setTimeout callbacks alike.
 */
export function useSound() {
  return {
    play: (name: SoundName) => audioManager.play(name),
    stop: (name: SoundName) => audioManager.stop(name),
    stopAll: () => audioManager.stopAll(),
    setVolume: (name: SoundName, volume: number) => audioManager.setVolume(name, volume),
  }
}
