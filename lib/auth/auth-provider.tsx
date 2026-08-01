'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export interface AuthResult {
  error: string | null
  /** true when signUp succeeded but Supabase requires email confirmation before a session exists. */
  needsEmailConfirmation?: boolean
}

interface AuthContextValue {
  user: User | null
  /** true until the initial session check resolves. */
  loading: boolean
  /** false when NEXT_PUBLIC_SUPABASE_URL/ANON_KEY aren't set — see .env.local.example. */
  isConfigured: boolean
  signInWithGoogle: () => Promise<AuthResult>
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>
  signUpWithPassword: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const NOT_CONFIGURED_ERROR = '로그인 기능이 아직 준비되지 않았어요. 잠시 후 다시 시도해주세요.'

/** Supabase's raw error messages translated to the copy used elsewhere in the app. */
function translateAuthError(message: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않아요.',
    'User already registered': '이미 가입된 이메일이에요. 로그인해주세요.',
    'Password should be at least 6 characters': '비밀번호는 6자 이상이어야 해요.',
    'Email not confirmed': '이메일 인증을 먼저 완료해주세요.',
    'Unable to validate email address: invalid format': '이메일 형식이 올바르지 않아요.',
  }
  // Anything unmapped is a network/config-level failure (e.g. "Failed to
  // fetch" when the Supabase project is unreachable) — never surface raw
  // English error text to the user.
  return map[message] ?? '로그인에 실패했어요. 잠시 후 다시 시도해주세요.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabaseBrowserClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(Boolean(supabase))

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [supabase])

  const value: AuthContextValue = {
    user,
    loading,
    isConfigured: Boolean(supabase),

    async signInWithGoogle() {
      if (!supabase) return { error: NOT_CONFIGURED_ERROR }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      return { error: error ? translateAuthError(error.message) : null }
    },

    async signInWithPassword(email, password) {
      if (!supabase) return { error: NOT_CONFIGURED_ERROR }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error ? translateAuthError(error.message) : null }
    },

    async signUpWithPassword(email, password) {
      if (!supabase) return { error: NOT_CONFIGURED_ERROR }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) return { error: translateAuthError(error.message) }
      return { error: null, needsEmailConfirmation: !data.session }
    },

    async signOut() {
      if (!supabase) return
      await supabase.auth.signOut()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
