'use client'

import { useState } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { AssetImage } from '@/components/brain-bet/asset-image'
import { CharacterImage } from '@/components/brain-bet/character-image'
import { RoomStage } from '@/components/brain-bet/room-stage'
import { StatBadge } from '@/components/brain-bet/stat-badge'
import { ToyButton } from '@/components/brain-bet/toy-button'
import { STATS, type StatId } from '@/lib/brain-bet'
import type { PetProfile } from '@/lib/pets/pet-profile'
import { CARE_ACTIONS, INITIAL_ROOM_STATUS, ROOM_STATUS_META, type CareActionId } from '@/lib/room'
import { WARM_WOOD_PRESET } from '@/lib/room-presets'
import { cn } from '@/lib/utils'

interface RoomScreenProps {
  statlingName: string
  topStat: StatId
  /**
   * The confirmed representative pet — same resolver (and same value) as
   * every other post-hatch screen (see lib/pets/pet-flow.ts
   * #resolveCurrentPetProfile), passed down from GameFlow's single
   * petRecord source of truth rather than read from storage here. Null only
   * when there's genuinely no saved pet data (e.g. legacy/no-data games
   * flow) — falls back to the original stat-type CharacterImage in that
   * case only, never for a confirmed pet.
   */
  petProfile: PetProfile | null
  onGrow: () => void
}

/**
 * Statling Room (Home). Care buttons only trigger a short visual reaction —
 * PHASE 1 does not compute or persist satiety/cleanliness/affection changes.
 */
export function RoomScreen({ statlingName, topStat, petProfile, onGrow }: RoomScreenProps) {
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
      <header className="flex items-center justify-between gap-3">
        <h1 className="flex items-baseline gap-1.5 font-display text-xl font-extrabold text-foreground">
          <span className="text-sm font-bold text-muted-foreground">우리 방 ·</span>
          {statlingName}
        </h1>
        <StatBadge stat={STATS[topStat]} size="sm" />
      </header>

      {/* room stage — the focal point of this screen */}
      <RoomStage preset={WARM_WOOD_PRESET} className="mt-4 toy-border toy-shadow-lg">
        <div className="relative">
          {petProfile ? (
            <AssetImage
              src={petProfile.imageSrc}
              alt={petProfile.name}
              size={180}
              className={mood === 'happy' ? 'animate-float' : 'animate-wobble'}
            />
          ) : (
            <CharacterImage
              type={topStat}
              size={180}
              className={mood === 'happy' ? 'animate-float' : 'animate-wobble'}
            />
          )}
          {feedbackId && (
            <span
              className="animate-pop-in absolute -right-2 -top-2 text-3xl"
              aria-hidden="true"
            >
              💗
            </span>
          )}
        </div>
      </RoomStage>

      {/* status HUD — compact rows (icon + label + number + bar), static display only, no decay/growth logic yet */}
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {ROOM_STATUS_META.map((meta) => {
          const value = INITIAL_ROOM_STATUS[meta.id]
          const Icon = meta.icon
          return (
            <div key={meta.id} className="flex items-center gap-2 rounded-xl bg-card px-3 py-2 toy-border">
              <Icon size={20} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[11px] font-bold text-muted-foreground">{meta.label}</span>
                  <span className="font-display text-sm font-extrabold tabular-nums text-foreground">{value}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* care actions — compact icon buttons, 3x2 on mobile / one row on desktop */}
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {CARE_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => handleCare(action)}
              className="relative flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl bg-card px-1 py-2.5 toy-border transition-transform active:translate-y-0.5"
            >
              <Icon size={22} />
              <span className="text-[11px] font-bold text-foreground">{action.shortLabel}</span>
              {comingSoonId === action.id && (
                <span
                  className={cn(
                    'animate-pop-in absolute -top-2 rounded-full bg-secondary px-2 py-0.5 text-[9px] font-bold text-secondary-foreground toy-border',
                  )}
                >
                  준비 중
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* grow CTA — the one action on this screen meant to stand out more than the compact HUD above */}
      <ToyButton className="mx-auto mt-4 w-full max-w-xs px-5 py-3" onClick={onGrow}>
        <Sparkles size={18} strokeWidth={2.6} />
        성장시키기
        <ArrowRight size={18} strokeWidth={2.8} />
      </ToyButton>
    </div>
  )
}
