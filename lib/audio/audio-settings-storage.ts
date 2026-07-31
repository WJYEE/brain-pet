const SFX_ENABLED_KEY = 'statling:audio:sfxEnabled'

/**
 * Device-level playback preference (not game data), so unlike
 * lib/pet-care/pet-care-storage.ts this is deliberately NOT namespaced by
 * device id — it's the same "is sound on for this browser" flag regardless
 * of which anonymous device record is active.
 */
export function loadSfxEnabled(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const raw = window.localStorage.getItem(SFX_ENABLED_KEY)
    if (raw === null) return true
    return raw === 'true'
  } catch {
    return true
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
