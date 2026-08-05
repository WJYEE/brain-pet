'use client'

import { createContext, useContext } from 'react'

/**
 * Minimal user shape shared by every auth backend this app can plug in —
 * deliberately just `id`/`email` (not Supabase's full `User` type) so a
 * localStorage-only implementation and a real Supabase implementation can
 * both satisfy the same contract. Every call site only ever reads `.email`
 * (see MyPageScreen), so this is not a narrowing in practice today.
 */
export interface AuthUser {
  id: string
  email: string
}

export interface AuthResult {
  error: string | null
  /** true when sign-up succeeded but a confirmation step is still needed before a session exists (unused by the localStorage backend — always false there). */
  needsEmailConfirmation?: boolean
}

/**
 * The one contract every auth provider implementation must satisfy —
 * see lib/auth/local-auth-provider.tsx (current default, localStorage-backed)
 * and lib/auth/supabase-auth-provider.tsx (Supabase-backed, ready to swap
 * back in). Swapping which one is active is a one-line change in
 * lib/auth/auth-provider.tsx; no consumer (AuthForm, MyPageScreen,
 * SaveScreen) needs to change since they only ever import from there.
 */
export interface AuthContextValue {
  user: AuthUser | null
  /** true until the initial session check resolves. */
  loading: boolean
  /** false when this backend isn't usable yet (e.g. Supabase env vars missing). The localStorage backend is always true — it needs no external config. */
  isConfigured: boolean
  signInWithGoogle: () => Promise<AuthResult>
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>
  signUpWithPassword: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
