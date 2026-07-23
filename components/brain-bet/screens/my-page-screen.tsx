'use client'

import { LogOut, User } from 'lucide-react'
import { StatBadge } from '@/components/brain-bet/stat-badge'
import { STATLING_TYPES, STATS, type StatId } from '@/lib/brain-bet'

interface MyPageScreenProps {
  statlingName: string
  topStat: StatId
}

/** Basic Placeholder — no real account/auth state is wired up in PHASE 1. */
export function MyPageScreen({ statlingName, topStat }: MyPageScreenProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-5 pb-28 pt-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          마이페이지
        </p>
        <h1 className="font-display text-2xl font-extrabold text-foreground">내 정보</h1>
      </header>

      <div className="mt-6 flex items-center gap-3 rounded-2xl bg-card px-4 py-4 toy-border">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground toy-border">
          <User size={20} strokeWidth={2.2} />
        </span>
        <div>
          <p className="font-display text-base font-extrabold text-foreground">게스트</p>
          <p className="text-xs text-muted-foreground">로그인 기능은 준비 중이에요.</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-card px-4 py-4 toy-border">
        <StatBadge stat={STATS[topStat]} size="sm" />
        <div>
          <p className="font-display text-sm font-extrabold text-foreground">{statlingName}</p>
          <p className="text-xs text-muted-foreground">{STATLING_TYPES[topStat].typeName}</p>
        </div>
      </div>

      <button
        type="button"
        disabled
        className="mt-6 flex cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-card px-4 py-3 text-sm font-bold text-muted-foreground toy-border opacity-70"
      >
        <LogOut size={16} strokeWidth={2.4} />
        로그아웃 (준비 중)
      </button>
    </div>
  )
}
