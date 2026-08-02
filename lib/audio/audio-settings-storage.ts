const SFX_ENABLED_KEY = 'statling:audio:sfxEnabled'

/**
 * Device-level playback preference (not game data), so unlike
 * lib/pet-care/pet-care-storage.ts this is deliberately NOT namespaced by
 * device id — it's the same "is sound on for this browser" flag regardless
 * of which anonymous device record is active.
 *
 * Defaults to OFF: sound only turns on once the player explicitly flips the
 * switch in MyPageScreen (spec: silent Intro, silent Room until opted in).
 */
export function loadSfxEnabled(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = window.localStorage.getItem(SFX_ENABLED_KEY)
    if (raw === null) return false
    return raw === 'true'
  } catch {
    return false
  }
}

export function saveSfxEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SFX_ENABLED_KEY, String(enabled))
  } catch {
    // Storage unavailable (private mode, quota) — the in-memory toggle still works for this session.
  }
}
