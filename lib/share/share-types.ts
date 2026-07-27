/**
 * Data needed to share a user's representative Statling result. Kept as a
 * plain, serializable shape (not tied to PetProfile/StatId) so it can be
 * reused later by something like a dynamic Open Graph image/metadata route
 * without depending on React/DOM APIs — this module has none.
 */
export interface ShareStatlingInput {
  petName: string
  petImage: string
  tagline: string
  primaryStat: string
  secondaryStat: string
  /** Explicit override — if omitted, buildShareUrl() resolves it (NEXT_PUBLIC_APP_URL -> window.location.origin -> dev fallback). */
  url?: string
}

export type ShareOutcome =
  | { status: 'shared'; method: 'file' | 'web-share' }
  | { status: 'copied'; method: 'clipboard' }
  | { status: 'cancelled' }
  | { status: 'manual-copy'; title: string; text: string; url: string }
  | { status: 'error' }
