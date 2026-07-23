import type { DeviceInfo } from '@/lib/game/types'

/** Minimal device/input capture (GAME_SPEC §89-90) — no fingerprinting, browser, or refresh-rate detection. */
export function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { deviceType: 'unknown', inputType: 'unknown' }
  }

  const ua = navigator.userAgent
  const isTablet = /iPad|Tablet/i.test(ua)
  const isMobile = !isTablet && /Mobi|Android|iPhone/i.test(ua)
  const deviceType: DeviceInfo['deviceType'] = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'

  const hasCoarsePointer =
    typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
  const inputType: DeviceInfo['inputType'] = hasCoarsePointer ? 'touch' : 'mouse'

  return { deviceType, inputType }
}
