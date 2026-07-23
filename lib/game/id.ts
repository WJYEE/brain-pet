let counter = 0

/** Lightweight local-only session id. No backend/DB yet, so global uniqueness isn't required. */
export function generateSessionId(): string {
  counter += 1
  return `session_${Date.now()}_${counter}_${Math.random().toString(36).slice(2, 8)}`
}
