'use client'

import { useState } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Statling } from '@/components/brain-bet/statling'
import { StatBadge } from '@/components/brain-bet/stat-badge'
import { ToyButton } from '@/components/brain-bet/toy-button'
import { STATS, type StatId } from '@/lib/brain-bet'
import { CARE_ACTIONS, INITIAL_ROOM_STATUS, ROOM_STATUS_META, type CareActionId } from '@/lib/room'
import { cn } from '@/lib/utils'

interface RoomScreenProps {
  statlingName: string
  topStat: StatId
  onGrow: () => void
}

/**
 * Statling Room (Home). Care buttons only trigger a short visual reaction —
 * PHASE 1 does not compute or persist satiety/cleanliness/affection changes.
 */
export function RoomScreen({ statlingName, topStat, onGrow }: RoomScreenProps) {
  const [mood, setMood] = useState<'happy' | 'excited' | 'sleepy'>('happy')
  const [feedbackId, setFeedbackId] = useState<CareActionId | null>(null)
  const [comingSoonId, setComingSoonId] = useState<CareActionId | null>(null)

  const react = (id: CareActionId) => {
    setMood('excited')
    setFeedbackId(id)
    window.setTimeout(() => setMood('happy'), 900)
    window.setTimeout(() => setFeedbackId((cur) => (cur === id ? null : cur)), 1100)
  }

  const handleCare = (action: (typeof CARE_ACTIONS)[number]) => {
    if (action.status === 'comingSoon') {
      setComingSoonId(action.id)
      window.setTimeout(
        () => setComingSoonId((cur) => (cur === action.id ? null : cur)),
        1400,
      )
      return
    }
    react(action.id)
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-5 pb-28 pt-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">우리 방</p>
          <h1 className="font-display text-2xl font-extrabold text-foreground">{statlingName}</h1>
        </div>
        <StatBadge stat={STATS[topStat]} size="sm" />
      </header>

      {/* room stage */}
      <div className="relative mt-6 flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-card px-6 py-12 toy-border toy-shadow-lg">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background: 'radial-gradient(circle at 50% 20%, var(--pastel-mint), transparent 60%)',
          }}
        />
        <div className="relative">
          <Statling
            type={topStat}
            size={180}
            mood={mood}
            className={mood === 'happy' ? 'animate-float' : 'animate-wobble'}
          />
          {feedbackId && (
            <span
              className="animate-pop-in absolute -right-2 -top-2 text-3xl"
              aria-hidden="true"
            >
              💗
            </span>
          )}
        </div>
      </div>

      {/* status meters — static display only, no decay/growth logic yet */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {ROOM_STATUS_META.map((meta) => (
          <div key={meta.id} className="rounded-2xl bg-card px-3 py-3 text-center toy-border">
            <p className="text-lg">{meta.emoji}</p>
            <p className="mt-1 text-xs font-bold text-muted-foreground">{meta.label}</p>
            <p className="font-display text-lg font-extrabold text-foreground">
              {INITIAL_ROOM_STATUS[meta.id]}
            </p>
          </div>
        ))}
      </div>

      {/* care actions */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {CARE_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => handleCare(action)}
              className="relative flex flex-col items-center gap-1.5 rounded-2xl bg-card px-2 py-3 toy-border transition-transform active:translate-y-0.5"
            >
              <Icon size={22} strokeWidth={2.2} className="text-foreground" />
              <span className="text-xs font-bold text-foreground">{action.label}</span>
              {comingSoonId === action.id && (
                <span
                  className={cn(
                    'animate-pop-in absolute -top-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground toy-border',
                  )}
                >
                  준비 중
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* grow CTA */}
      <ToyButton className="mt-6 w-full" onClick={onGrow}>
        <Sparkles size={20} strokeWidth={2.6} />
        성장시키기
        <ArrowRight size={20} strokeWidth={2.8} />
      </ToyButton>
    </div>
  )
}
