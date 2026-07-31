'use client'

import { useState } from 'react'
import { LogOut, User, Volume2, VolumeX } from 'lucide-react'
import { StatBadge } from '@/components/brain-bet/stat-badge'
import { STATLING_TYPES, STATS, type StatId } from '@/lib/brain-bet'
import { audioManager } from '@/lib/audio/audio-manager'
import { loadSfxEnabled, saveSfxEnabled } from '@/lib/audio/audio-settings-storage'

interface MyPageScreenProps {
  statlingName: string
  topStat: StatId
}

/** Basic Placeholder — no real account/auth state is wired up in PHASE 1. */
export function MyPageScreen({ statlingName, topStat }: MyPageScreenProps) {
  const [sfxEnabled, setSfxEnabled] = useState(() => loadSfxEnabled())

  function toggleSfx() {
    const next = !sfxEnabled
    setSfxEnabled(next)
    saveSfxEnabled(next)
    audioManager.setMuted(!next)
  }

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

      <p className="mt-6 text-xs font-bold uppercase tracking-wide text-muted-foreground">설정</p>
      <button
        type="button"
        data-sfx-skip
        onClick={toggleSfx}
        className="mt-2 flex items-center gap-3 rounded-2xl bg-card px-4 py-4 text-left toy-border"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground toy-border">
          {sfxEnabled ? <Volume2 size={20} strokeWidth={2.2} /> : <VolumeX size={20} strokeWidth={2.2} />}
        </span>
        <div className="flex-1">
          <p className="font-display text-sm font-extrabold text-foreground">효과음 (SFX)</p>
          <p className="text-xs text-muted-foreground">버튼음, 게임 효과음 등을 켜고 꺼요.</p>
        </div>
        <span
          aria-hidden="true"
          className={`grid h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors ${sfxEnabled ? 'justify-end bg-primary' : 'justify-start bg-muted'}`}
        >
          <span className="h-5 w-5 rounded-full bg-white shadow" />
        </span>
      </button>

      <button
        type="button"
        disabled
        className="mt-3 flex cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-card px-4 py-3 text-sm font-bold text-muted-foreground toy-border opacity-70"
      >
        <LogOut size={16} strokeWidth={2.4} />
        로그아웃 (준비 중)
      </button>
    </div>
  )
}
