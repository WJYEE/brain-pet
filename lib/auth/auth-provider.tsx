/**
 * The single import path every consumer uses (AuthForm, MyPageScreen,
 * SaveScreen, app/layout.tsx) — which backend is actually active is decided
 * only here. Currently the localStorage-backed implementation (no server
 * required); to switch to real Supabase auth once a project is configured,
 * change the export below to:
 *
 *   export { SupabaseAuthProvider as AuthProvider } from './supabase-auth-provider'
 *
 * No other file needs to change — every provider implementation satisfies
 * the same AuthContextValue contract (see lib/auth/auth-context.tsx).
 */
export { LocalAuthProvider as AuthProvider } from './local-auth-provider'
export { useAuth } from './auth-context'
