import { PLAY_ORDER, type StatId } from '@/lib/brain-bet'
import { getOrCreateDeviceId } from '@/lib/room/room-storage'
import { loadXpState } from '@/lib/ranking/xp-ledger'

export interface RankingEntry {
  id: string
  displayName: string
  statId: StatId
  totalXp: number
  weeklyXp: number
  isMe: boolean
}

export interface RankingQuery {
  displayName: string
  statId: StatId
  /** Real Supabase user id when logged in, null for a guest — see LocalRankingProvider for how the "me" row's id is picked. */
  userId?: string | null
}

/**
 * Ranking's swap seam: RankingScreen only ever talks to `rankingProvider`
 * (the singleton below), never to a concrete implementation. Today that's
 * LocalRankingProvider (device-local XP + placeholder rivals, no backend).
 * Once a real leaderboard exists server-side, adding a SupabaseRankingProvider
 * that implements this same interface and swapping the singleton's
 * assignment is the entire migration — RankingScreen, RankingEntry, and
 * RankingQuery all stay exactly as they are. Methods are async even though
 * the local implementation resolves synchronously, so that swap changes
 * nothing about how callers await the result.
 */
export interface RankingProvider {
  /** Sorted descending by totalXp. */
  getGlobalRanking(query: RankingQuery): Promise<RankingEntry[]>
  /** Sorted descending by weeklyXp (this Monday-anchored week only — see lib/ranking/xp-ledger.ts). */
  getWeeklyRanking(query: RankingQuery): Promise<RankingEntry[]>
}

/**
 * Deterministic placeholder rivals — there is no backend yet, so these stand
 * in for "other players" until a real leaderboard exists. Fixed (not
 * Math.random()) so the board doesn't reshuffle on every remount and stays
 * identical across sessions/devices; index-derived spread just needs to look
 * like a plausible ladder, not be statistically meaningful.
 */
const PLACEHOLDER_NAMES = ['몽글이', '또리', '살구', '두부', '콩콩이', '보리', '구름이', '또랑이', '마루']

function buildPlaceholderEntries(): RankingEntry[] {
  return PLACEHOLDER_NAMES.map((name, i) => {
    const totalXp = 820 - i * 71 + (i % 3) * 19
    const weeklyXp = Math.round(totalXp * (0.12 + (i % 4) * 0.06))
    return {
      id: `placeholder_${i}`,
      displayName: name,
      statId: PLAY_ORDER[i % PLAY_ORDER.length],
      totalXp: Math.max(0, totalXp),
      weeklyXp: Math.max(0, weeklyXp),
      isMe: false,
    }
  })
}

class LocalRankingProvider implements RankingProvider {
  private buildMyEntry(query: RankingQuery): RankingEntry {
    const xp = loadXpState()
    return {
      id: query.userId ?? getOrCreateDeviceId(),
      displayName: query.displayName,
      statId: query.statId,
      totalXp: xp.totalXp,
      weeklyXp: xp.weeklyXp,
      isMe: true,
    }
  }

  async getGlobalRanking(query: RankingQuery): Promise<RankingEntry[]> {
    const entries = [...buildPlaceholderEntries(), this.buildMyEntry(query)]
    return entries.sort((a, b) => b.totalXp - a.totalXp)
  }

  async getWeeklyRanking(query: RankingQuery): Promise<RankingEntry[]> {
    const entries = [...buildPlaceholderEntries(), this.buildMyEntry(query)]
    return entries.sort((a, b) => b.weeklyXp - a.weeklyXp)
  }
}

export const rankingProvider: RankingProvider = new LocalRankingProvider()
