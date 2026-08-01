import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

/**
 * OAuth (Google) and email-confirmation redirect target. Exchanges the
 * `code` param for a session cookie, then bounces back to the app — the
 * client-side GameFlow phase machine always boots fresh at `landing`
 * anyway (see game-flow.tsx), so a full-page redirect here matches existing
 * reload behavior rather than introducing a new one.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await getSupabaseServerClient()
    if (supabase) {
      await supabase.auth.exchangeCodeForSession(code)
    }
  }

  return NextResponse.redirect(origin)
}
