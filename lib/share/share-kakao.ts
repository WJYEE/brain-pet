'use client'

/**
 * Kakao-specific sharing via the official JS SDK — a structural placeholder
 * for a *future* dedicated "카카오톡 공유" button, not wired into the
 * default share flow. For now, the default "공유하기" button's Web Share
 * API already lets a user pick KakaoTalk from their OS share sheet if it's
 * installed, which is the primary requirement for this pass.
 *
 * Every function here is inert unless NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY is
 * set — no key means no SDK script injection, no init attempt, and no
 * thrown errors; callers never need to guard twice.
 */

declare global {
  interface Window {
    Kakao?: {
      isInitialized: () => boolean
      init: (key: string) => void
      Share: {
        sendDefault: (options: Record<string, unknown>) => void
      }
    }
  }
}

const KAKAO_SDK_SRC = 'https://developers.kakao.com/sdk/js/kakao.js'

let sdkLoadPromise: Promise<void> | null = null

/** Whether a Kakao JS key is configured at all — check this before offering any Kakao-specific UI. */
export function isKakaoShareConfigured(): boolean {
  return typeof process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY === 'string' && process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY.length > 0
}

/** Loads + initializes the SDK at most once per page (module-level promise guards concurrent/duplicate calls), and does nothing if it's already initialized. */
function loadKakaoSdk(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.Kakao?.isInitialized()) return Promise.resolve()
  if (sdkLoadPromise) return sdkLoadPromise

  sdkLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = KAKAO_SDK_SRC
    script.onload = () => {
      const key = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
      if (key && !window.Kakao?.isInitialized()) {
        window.Kakao?.init(key)
      }
      resolve()
    }
    script.onerror = () => reject(new Error('Failed to load the Kakao JS SDK'))
    document.head.appendChild(script)
  })

  return sdkLoadPromise
}

export interface KakaoShareInput {
  title: string
  description: string
  /**
   * Must be an absolute, publicly-reachable URL — Kakao fetches it
   * server-side to build the link preview, so a localhost or blob: URL
   * (e.g. a freshly-generated share-card image) will not render.
   */
  imageUrl: string
  url: string
}

/**
 * Sends a Kakao "feed" template via the official SDK. Returns `false`
 * (never throws) whenever Kakao isn't configured/available, so this can be
 * called speculatively without a separate feature-detection step.
 */
export async function shareViaKakao(input: KakaoShareInput): Promise<boolean> {
  if (!isKakaoShareConfigured()) return false

  try {
    await loadKakaoSdk()
    if (!window.Kakao) return false

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: input.title,
        description: input.description,
        imageUrl: input.imageUrl,
        link: { mobileWebUrl: input.url, webUrl: input.url },
      },
    })
    return true
  } catch {
    return false
  }
}
