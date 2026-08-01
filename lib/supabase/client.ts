import { createBrowserClient } from '@supabase/ssr'

type BrowserClient = ReturnType<typeof createBrowserClient>

let cached: BrowserClient | null | undefined

/**
 * Returns null (never throws) when NEXT_PUBLIC_SUPABASE_URL / ANON_KEY
 * aren't set yet — see .env.local.example. This lets the rest of the app
 * (games, room, etc.) keep working before a Supabase project is wired up;
 * callers just treat auth as "not configured" instead of crashing.
 */
export function getSupabaseBrowserClient(): BrowserClient | null {
  if (cached !== undefined) return cached

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set — login is disabled. See .env.local.example.',
      )
    }
    cached = null
    return cached
  }

  cached = createBrowserClient(url, anonKey)
  return cached
}
