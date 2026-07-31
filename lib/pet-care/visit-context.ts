import { PET_AUTONOMY_CONFIG } from '@/lib/config/pet-autonomy.config'
import type { PetMemory } from '@/lib/pet-care/pet-memory'

export type EntryEventType =
  | 'firstMeeting'
  | 'longAbsenceReturn'
  | 'todayFirstVisit'
  | 'pendingGameReaction'
  | 'regularRevisit'

export interface VisitContext {
  isFirstEverVisit: boolean
  isFirstVisitToday: boolean
  elapsedHoursSinceLastVisit: number
  isLongAbsence: boolean
  streak: number
}

/** YYYY-MM-DD in the browser's local timezone — never UTC, so "today" matches what the player actually sees. */
export function toLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function computeVisitContext(memory: PetMemory, now: Date): VisitContext {
  const isFirstEverVisit = memory.totalVisits === 0
  const lastVisit = new Date(memory.lastVisitedAt)
  const elapsedHoursSinceLastVisit = isFirstEverVisit
    ? 0
    : Math.max(0, (now.getTime() - lastVisit.getTime()) / (60 * 60 * 1000))
  const todayKey = toLocalDateKey(now)

  return {
    isFirstEverVisit,
    isFirstVisitToday: memory.lastVisitDate !== todayKey,
    elapsedHoursSinceLastVisit,
    isLongAbsence: !isFirstEverVisit && elapsedHoursSinceLastVisit >= PET_AUTONOMY_CONFIG.longAbsenceHours,
    streak: memory.consecutiveVisitDays,
  }
}

/**
 * Priority per spec: first meeting > long-absence return > today's first
 * visit > a waiting minigame reaction > a plain revisit. A pending game
 * reaction never preempts the first two (a returning-after-days pet still
 * greets first) but does preempt a plain "today's first visit" greeting —
 * the two never show at once.
 */
export function computeEntryEvent(visit: VisitContext, hasPendingGameReaction: boolean): EntryEventType {
  if (visit.isFirstEverVisit) return 'firstMeeting'
  if (visit.isLongAbsence) return 'longAbsenceReturn'
  if (visit.isFirstVisitToday) return 'todayFirstVisit'
  if (hasPendingGameReaction) return 'pendingGameReaction'
  return 'regularRevisit'
}

/**
 * Advances visit bookkeeping for "entering the Room now" — called once per
 * mount by hooks/use-pet-memory.ts. Same-day re-entry only bumps
 * `totalVisits`; a next-calendar-day entry bumps the streak; any gap of
 * more than one calendar day resets the streak to 1.
 */
export function updateVisitMemory(memory: PetMemory, now: Date): PetMemory {
  const todayKey = toLocalDateKey(now)

  if (memory.totalVisits === 0) {
    return {
      ...memory,
      firstMetAt: now.toISOString(),
      lastVisitedAt: now.toISOString(),
      lastVisitDate: todayKey,
      totalVisits: 1,
      consecutiveVisitDays: 1,
      longestVisitStreak: 1,
    }
  }

  if (memory.lastVisitDate === todayKey) {
    return { ...memory, lastVisitedAt: now.toISOString(), totalVisits: memory.totalVisits + 1 }
  }

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isConsecutiveDay = memory.lastVisitDate === toLocalDateKey(yesterday)
  const nextStreak = isConsecutiveDay ? memory.consecutiveVisitDays + 1 : 1

  return {
    ...memory,
    lastVisitedAt: now.toISOString(),
    lastVisitDate: todayKey,
    totalVisits: memory.totalVisits + 1,
    consecutiveVisitDays: nextStreak,
    longestVisitStreak: Math.max(memory.longestVisitStreak, nextStreak),
  }
}
