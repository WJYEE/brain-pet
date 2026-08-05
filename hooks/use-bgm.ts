import { audioManager } from '@/lib/audio/audio-manager'
import { BGM_TRACKS } from '@/lib/audio/bgm-config'
import type { BgmTrackId } from '@/lib/audio/bgm-config'
import type { BgmMode } from '@/lib/audio/types'

/**
 * Thin wrapper over the audioManager BGM singleton — mirrors hooks/use-sound.ts.
 * `tracks` is exported for the settings UI's track-picker list; every other
 * getter reads audioManager's live state (safe pre-init too, since
 * AudioManager seeds `bgmSettings` with a hardcoded default before
 * initBgm() ever runs — see audio-manager.ts).
 *
 * Playback itself is never started from here: AudioProvider calls
 * audioManager.initBgm()/unlockBgm() once at the app root, and nothing in
 * components/brain-bet/screens or games should call play/stop directly —
 * this hook only exposes the settings surface (mode, track selection,
 * on/off, skip).
 */
export function useBgm() {
  return {
    tracks: BGM_TRACKS,
    isEnabled: () => audioManager.isBgmEnabled(),
    setEnabled: (enabled: boolean) => audioManager.setBgmEnabled(enabled),
    getMode: () => audioManager.getBgmMode(),
    setMode: (mode: BgmMode) => audioManager.setBgmMode(mode),
    getRepeatTrackId: () => audioManager.getBgmRepeatTrackId(),
    setRepeatTrack: (id: BgmTrackId) => audioManager.setBgmRepeatTrack(id),
    getSelectedTrackIds: () => audioManager.getBgmSelectedTrackIds(),
    setSelectedTrackIds: (ids: BgmTrackId[]) => audioManager.setBgmSelectedTrackIds(ids),
    getCurrentTrackId: () => audioManager.getCurrentBgmTrackId(),
    skip: () => audioManager.skipBgm(),
    setVolume: (volume: number) => audioManager.setBgmVolume(volume),
  }
}
