'use client'

import { useEffect, useState } from 'react'
import { StatBadge } from '@/components/brain-bet/stat-badge'
import { STATS, type StatId } from '@/lib/brain-bet'
import { useAuth } from '@/lib/auth/auth-provider'
import { rankingProvider, type RankingEntry } from '@/lib/ranking/ranking-provider'
import { cn } from '@/lib/utils'

type RankingTab = 'global' | 'weekly'

const RANKING_TABS: { id: RankingTab; label: string }[] = [
  { id: 'global', label: '전체 랭킹' },
  { id: 'weekly', label: '주간 랭킹' },
]

interface RankingScreenProps {
  /** Shown as "나"'s row label — the pet's own given name, same identity MyPageScreen already shows next to its topStat badge. */
  statlingName: string
  topStat: StatId
}

/** Bottom tab bar's 랭킹 destination — XP-based (see lib/ranking/xp-ledger.ts), 전체/주간 tabs, backed by lib/ranking/ranking-provider.ts so a future Supabase-backed leaderboard is a provider swap, not a UI rewrite. */
export function RankingScreen({ statlingName, topStat }: RankingScreenProps) {
  const [activeTab, setActiveTab] = useState<RankingTab>('global')
  const [entries, setEntries] = useState<RankingEntry[] | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    let cancelled = false
    setEntries(null)
    const query = { displayName: statlingName || '게스트', statId: topStat, userId: user?.id ?? null }
    const request = activeTab === 'global' ? rankingProvider.getGlobalRanking(query) : rankingProvider.getWeeklyRanking(query)
    request.then((result) => {
      if (!cancelled) setEntries(result)
    })
    return () => {
      cancelled = true
    }
  }, [activeTab, statlingName, topStat, user?.id])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-5 pb-28 pt-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">랭킹</p>
        <h1 className="font-display text-2xl font-extrabold text-foreground">XP 랭킹</h1>
      </header>

      <div role="tablist" aria-label="랭킹 종류" className="mt-6 flex gap-2">
        {RANKING_TABS.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 rounded-2xl px-4 py-2.5 text-sm font-bold toy-border transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div role="tabpanel" className="mt-6 flex flex-col gap-2">
        {entries === null
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[60px] animate-pulse rounded-2xl bg-muted/60" aria-hidden="true" />
            ))
          : entries.map((entry, index) => (
              <RankingRow
                key={entry.id}
                rank={index + 1}
                entry={entry}
                xp={activeTab === 'global' ? entry.totalXp : entry.weeklyXp}
              />
            ))}
      </div>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        게임을 완료할 때마다 점수만큼 XP를 얻어요. 다른 유저의 실제 기록은 서버 연동 후 반영될 예정이에요.
      </p>
    </div>
  )
}

function RankingRow({ rank, entry, xp }: { rank: number; entry: RankingEntry; xp: number }) {
  const stat = STATS[entry.statId]
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl px-4 py-3 toy-border',
        entry.isMe ? 'bg-accent toy-shadow-sm' : 'bg-card',
      )}
    >
      <span
        className={cn(
          'w-6 shrink-0 text-center font-display text-sm font-extrabold',
          rank <= 3 ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        {rank}
      </span>
      <StatBadge stat={stat} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-extrabold text-foreground">
          {entry.displayName}
          {entry.isMe && <span className="ml-1.5 text-[10px] font-bold text-primary">나</span>}
        </p>
      </div>
      <p className="shrink-0 font-display text-sm font-extrabold text-foreground">{xp.toLocaleString()} XP</p>
    </div>
  )
}
