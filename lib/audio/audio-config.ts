import type { SoundConfig, SoundName } from '@/lib/audio/types'

const SFX_BASE_PATH = '/assets/statling/audio/sfx_fix'

function sfxSrc(name: SoundName): string {
  return `${SFX_BASE_PATH}/${name}.mp3`
}

/**
 * Starting volumes match public/assets/statling/audio/sfx_fix/readme's "볼륨
 * 기준" table 1:1 — tune per-sound here as real mixed assets come in, no
 * call site ever hardcodes a volume.
 *
 * minIntervalMs/maxConcurrent encode spec §3 (dedup/overlap rules):
 * - ui-click-soft: dropped if retriggered within 70ms (spec: 50~80ms)
 * - countdown-whole: one baked-in clip covering the entire 3-2-1-go
 *   countdown (countdown-intro's 3 ticks immediately followed by
 *   countdown-final's "go" accent, pre-mixed — see sfx_fix/countdown-whole.mp3)
 *   — played once per countdown, never overlapped with itself
 * - pet-chirp-happy: up to 2 overlapping instances, never a 3rd
 */
export const SFX_CONFIG: Record<SoundName, SoundConfig> = {
  'ui-click-soft': { src: sfxSrc('ui-click-soft'), volume: 0.25, minIntervalMs: 70, maxConcurrent: 2 },
  'ui-confirm': { src: sfxSrc('ui-confirm'), volume: 0.35, minIntervalMs: 80, maxConcurrent: 1 },
  'ui-back': { src: sfxSrc('ui-back'), volume: 0.25, minIntervalMs: 80, maxConcurrent: 1 },
  'modal-open': { src: sfxSrc('modal-open'), volume: 0.3, minIntervalMs: 100, maxConcurrent: 1 },
  'countdown-whole': { src: sfxSrc('countdown-whole'), volume: 0.4, minIntervalMs: 500, maxConcurrent: 1 },
  'game-start': { src: sfxSrc('game-start'), volume: 0.45, minIntervalMs: 200, maxConcurrent: 1 },
  'answer-correct': { src: sfxSrc('answer-correct'), volume: 0.35, minIntervalMs: 60, maxConcurrent: 3 },
  'answer-wrong-soft': { src: sfxSrc('answer-wrong-soft'), volume: 0.3, minIntervalMs: 60, maxConcurrent: 3 },
  'game-complete': { src: sfxSrc('game-complete'), volume: 0.5, minIntervalMs: 300, maxConcurrent: 1 },
  'pet-chirp-happy': { src: sfxSrc('pet-chirp-happy'), volume: 0.35, minIntervalMs: 150, maxConcurrent: 2 },
  'pet-care-pop': { src: sfxSrc('pet-care-pop'), volume: 0.35, minIntervalMs: 100, maxConcurrent: 2 },
  'pet-level-up': { src: sfxSrc('pet-level-up'), volume: 0.55, minIntervalMs: 300, maxConcurrent: 1 },
  'pet-feed': { src: sfxSrc('pet-feed'), volume: 0.35, minIntervalMs: 150, maxConcurrent: 1 },
  'pet-wash': { src: sfxSrc('pet-wash'), volume: 0.35, minIntervalMs: 150, maxConcurrent: 1 },
  'pet-play': { src: sfxSrc('pet-play'), volume: 0.35, minIntervalMs: 150, maxConcurrent: 1 },
  'pet-reveal': { src: sfxSrc('pet-reveal'), volume: 0.55, minIntervalMs: 300, maxConcurrent: 1 },
}

export const ALL_SOUND_NAMES = Object.keys(SFX_CONFIG) as SoundName[]
