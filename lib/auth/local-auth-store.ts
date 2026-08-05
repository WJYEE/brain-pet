import type { AuthUser } from '@/lib/auth/auth-context'

const USERS_KEY = 'statling:auth:users'
const SESSION_KEY = 'statling:auth:session'

interface StoredUser {
  id: string
  email: string
  passwordHash: string
  createdAt: string
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * SHA-256 of the password, not a real password-hashing KDF (no salt, no
 * work factor) — this is a placeholder auth backend backed by localStorage,
 * which is already fully readable by anyone with devtools on the same
 * device, so there is no real security boundary to protect here either way.
 * This only exists so a password isn't sitting in plaintext for a casual
 * glance at localStorage. Swap to lib/auth/supabase-auth-provider.tsx (see
 * lib/auth/auth-provider.tsx) for real credential security.
 */
async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function loadUsers(): StoredUser[] {
  try {
    const raw = window.localStorage.getItem(USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveUsers(users: StoredUser[]): void {
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
  } catch {
    // Storage unavailable (private mode, quota) — signup/signin still works for this session via in-memory state.
  }
}

export function loadSession(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AuthUser> | null
    if (!parsed || typeof parsed.id !== 'string' || typeof parsed.email !== 'string') return null
    return { id: parsed.id, email: parsed.email }
  } catch {
    return null
  }
}

function saveSession(user: AuthUser): void {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  } catch {
    // Storage unavailable — the session still works in-memory for this tab/session.
  }
}

export function clearSession(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    // ignore
  }
}

/** Fires on the `storage` event key this module uses, so other tabs can react to sign-in/sign-out — see local-auth-provider.tsx. */
export const SESSION_STORAGE_KEY = SESSION_KEY

export async function registerUser(
  email: string,
  password: string,
): Promise<{ user: AuthUser } | { error: 'duplicate' | 'weak-password' }> {
  const normalized = normalizeEmail(email)
  if (password.length < 6) return { error: 'weak-password' }

  const users = loadUsers()
  if (users.some((u) => u.email === normalized)) return { error: 'duplicate' }

  const passwordHash = await hashPassword(password)
  const stored: StoredUser = {
    id: crypto.randomUUID(),
    email: normalized,
    passwordHash,
    createdAt: new Date().toISOString(),
  }
  saveUsers([...users, stored])

  const user: AuthUser = { id: stored.id, email: stored.email }
  saveSession(user)
  return { user }
}

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<{ user: AuthUser } | { error: 'invalid' }> {
  const normalized = normalizeEmail(email)
  const users = loadUsers()
  const match = users.find((u) => u.email === normalized)
  if (!match) return { error: 'invalid' }

  const passwordHash = await hashPassword(password)
  if (passwordHash !== match.passwordHash) return { error: 'invalid' }

  const user: AuthUser = { id: match.id, email: match.email }
  saveSession(user)
  return { user }
}
