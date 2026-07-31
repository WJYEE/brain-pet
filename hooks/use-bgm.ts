import { audioManager } from '@/lib/audio/audio-manager'
import type { BgmName } from '@/lib/audio/types'

/**
 * Reserved for background music — not implemented yet (spec §8: no BGM
 * assets exist today, public/assets/statling/audio/bgm/ is still empty).
 * The API shape is real (backed by audioManager.playBgm/stopBgm, not a
 * local no-op) so wiring in an actual track later means: add files to
 * lib/audio/audio-config.ts's future BGM table + fill in
 * AudioManager#playBgm's body — call sites that adopt useBgm() now never
 * need to change.
 */
export function useBgm() {
  return {
    play: (name: BgmName) => audioManager.playBgm(name),
    stop: () => audioManager.stopBgm(),
    setVolume: (volume: number) => audioManager.setBgmVolume(volume),
  }
}
