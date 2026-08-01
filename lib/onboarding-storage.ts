const STORAGE_KEY = 'statling.onboardingSeen.v1'

/** Whether the first-visit onboarding card has already been dismissed with "다시 보지 않기" checked — see components/brain-bet/onboarding-modal.tsx. */
export function loadOnboardingSeen(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return true // fail open — never let a storage error force the modal to keep reappearing every render
  }
}

export function markOnboardingSeen(): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, '1')
}
