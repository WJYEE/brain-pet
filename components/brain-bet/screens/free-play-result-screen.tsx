'use client'

import { ArrowRight, Trophy } from 'lucide-react'
import { StatBadge } from '@/components/brain-bet/stat-badge'
import { ToyButton } from '@/components/brain-bet/toy-button'
import { STATS, type StatId, type StatResult } from '@/lib/brain-bet'

interface FreePlayResultScreenProps {
  statId: StatId
  result: StatResult
  isRecommended: boolean
  onReturnToRoom: () => void
}

/**
 * Free Play completion screen (distinct from the first-play Stat Discovery
 * screen per GAME_SPEC §109-110). Shows only the raw record — no Personal
 * Best comparison, NEW RECORD flag, or real XP math yet.
 */
export function FreePlayResultScreen({
  statId,
  result,
  isRecommended,
  onReturnToRoom,
}: FreePlayResultScreenProps) {
  const stat = STATS[statId]

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-5 py-10 text-center">
      <StatBadge stat={stat} size="lg" />
      <h1 className="mt-5 text-balance font-display text-2xl font-extrabold text-foreground">
        {stat.name} 게임을 완료했어요!
      </h1>

      <div className="mt-6 w-full rounded-2xl bg-card px-6 py-5 toy-border toy-shadow">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          이번 기록
        </p>
        <p className="mt-1 font-display text-4xl font-extrabold leading-none text-foreground">
          {result.raw.primary}
        </p>
        {result.raw.secondary && (
          <p className="mt-2 text-sm text-muted-foreground">{result.raw.secondary}</p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-2xl bg-secondary px-4 py-3 toy-border">
        <Trophy size={18} strokeWidth={2.4} className="text-primary" />
        <span className="font-display text-sm font-extrabold text-secondary-foreground">
          EXP 획득{isRecommended ? ' · 추천 보너스 ×1.5' : ''}
        </span>
      </div>

      <ToyButton className="mt-8 w-full" onClick={onReturnToRoom}>
        방으로 돌아가기
        <ArrowRight size={20} strokeWidth={2.8} />
      </ToyButton>
    </div>
  )
}
