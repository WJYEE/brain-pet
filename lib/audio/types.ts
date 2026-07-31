/**
 * Every SFX name the app can play, keyed 1:1 to a file in
 * public/assets/statling/audio/sfx_fix/<name>.mp3 (see audio-config.ts).
 * Adding a new sound is: drop the mp3 in that folder, add one entry to
 * SoundName + SFX_CONFIG — nothing else in the audio system needs to change.
 */
export type SoundName =
  | 'ui-click-soft'
  | 'ui-confirm'
  | 'ui-back'
  | 'modal-open'
  | 'countdown-whole'
  | 'game-start'
  | 'answer-correct'
  | 'answer-wrong-soft'
  | 'game-complete'
  | 'pet-chirp-happy'
  | 'pet-care-pop'
  | 'pet-level-up'
  | 'pet-feed'
  | 'pet-wash'
  | 'pet-play'
  | 'pet-reveal'

export interface SoundConfig {
  /** Public path, e.g. /assets/statling/audio/sfx_fix/ui-click-soft.mp3 */
  src: string
  /** 0~1 relative volume — see audio-config.ts for the starting values. */
  volume: number
  /**
   * Repeat calls within this window are dropped (spec §3, e.g. rapid clicks
   * on ui-click-soft). 0 = no dedup window.
   */
  minIntervalMs?: number
  /**
   * How many overlapping instances of this one sound may play at once
   * (spec §3, e.g. pet-chirp-happy capped at 2). Also doubles as the pooled
   * <audio> element count, so repeated triggers never wait on a previous
   * instance to finish before a new one can start.
   */
  maxConcurrent?: number
}

/** Placeholder surface for a future BGM system — see hooks/use-bgm.ts. */
export type BgmName = 'none'
