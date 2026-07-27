'use client'

import { useRef, useState } from 'react'
import { Toast } from '@base-ui/react/toast'
import { ArrowRight, Download, Loader2, Share2, Sparkles } from 'lucide-react'
import { AssetImage } from '@/components/brain-bet/asset-image'
import { Logo } from '@/components/brain-bet/logo'
import { ShareFallbackModal } from '@/components/brain-bet/share-fallback-modal'
import { StatBadge } from '@/components/brain-bet/stat-badge'
import { ToyButton } from '@/components/brain-bet/toy-button'
import { StatlingShareCard } from '@/components/share/statling-share-card'
import { STATLING_TYPES, STATS, type StatId } from '@/lib/brain-bet'
import {
  getDifferentRhythmBlurb,
  getGoodMatchBlurb,
  getStatCompatibility,
  getStatTypeLabel,
} from '@/lib/pets/compatibility'
import { buildCoreTraitSummary, buildSelectionReason } from '@/lib/pets/pet-analysis'
import type { PetProfile } from '@/lib/pets/pet-profile'
import { buildShareImageFilename, downloadShareImage } from '@/lib/share/download-share-image'
import { createShareImage } from '@/lib/share/create-share-image'
import { shareStatlingResult } from '@/lib/share/share-statling-result'
import type { ShareStatlingInput } from '@/lib/share/share-types'

interface RevealScreenProps {
  petProfile: PetProfile
  topStat: StatId
  secondaryStat: StatId
  finals: Record<StatId, number>
  isConfirmed: boolean
  canReroll: boolean
  rerollsRemaining: number
  onReroll: () => void
  onConfirm: () => void
}

export function RevealScreen({
  petProfile,
  topStat,
  secondaryStat,
  finals,
  isConfirmed,
  canReroll,
  rerollsRemaining,
  onReroll,
  onConfirm,
}: RevealScreenProps) {
  const stat = STATS[topStat]
  const secondary = STATS[secondaryStat]
  const type = STATLING_TYPES[topStat]

  const toastManager = Toast.useToastManager()
  const shareCardRef = useRef<HTMLDivElement>(null)
  // One shared lock (not two independent flags): both actions capture the
  // same hidden card DOM node via html-to-image, so they must never overlap.
  const [busyAction, setBusyAction] = useState<'share' | 'save' | null>(null)
  const [fallback, setFallback] = useState<{ title: string; text: string; url: string } | null>(null)

  const buildShareInput = (): ShareStatlingInput => ({
    petName: petProfile.name,
    petImage: petProfile.imageSrc,
    tagline: petProfile.tagline,
    primaryStat: stat.name,
    secondaryStat: secondary.name,
  })

  const handleShare = async () => {
    if (busyAction) return // prevent double-clicks while an action is in flight
    setBusyAction('share')
    try {
      const outcome = await shareStatlingResult(buildShareInput(), shareCardRef.current ?? undefined)

      switch (outcome.status) {
        case 'shared':
          toastManager.add({ title: '공유했어요!', type: 'success' })
          break
        case 'copied':
          toastManager.add({ title: '공유 내용이 복사되었어요.', type: 'success' })
          break
        case 'cancelled':
          break // user backed out of the share sheet — not an error
        case 'manual-copy':
          setFallback({ title: outcome.title, text: outcome.text, url: outcome.url })
          break
        case 'error':
          toastManager.add({ title: '공유하지 못했어요. 다시 시도해주세요.', type: 'error' })
          break
      }
    } finally {
      setBusyAction(null)
    }
  }

  const handleSaveImage = async () => {
    if (busyAction || !shareCardRef.current) return
    setBusyAction('save')
    try {
      const blob = await createShareImage(shareCardRef.current)
      if (!blob) {
        toastManager.add({ title: '이미지를 만들지 못했어요. 다시 시도해주세요.', type: 'error' })
        return
      }
      downloadShareImage(blob, buildShareImageFilename(petProfile.name))
      toastManager.add({ title: '이미지가 저장되었어요.', type: 'success' })
    } catch {
      toastManager.add({ title: '이미지를 만들지 못했어요. 다시 시도해주세요.', type: 'error' })
    } finally {
      setBusyAction(null)
    }
  }

  const selectionReason = buildSelectionReason(petProfile, topStat, secondaryStat)
  const coreTraitSummary = buildCoreTraitSummary(finals, topStat, secondaryStat)
  const compatibility = getStatCompatibility(petProfile)

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-5 py-10 text-center">
      <Logo size="sm" />

      <span className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground toy-border toy-shadow-sm">
        <Sparkles size={14} strokeWidth={2.6} />
        HATCH!
      </span>

      <h1 className="mt-4 text-balance font-display text-3xl font-extrabold text-foreground">
        나의 Statling이 태어났어요!
      </h1>

      {/* Keyed by pet id so rerolling remounts this subtree and replays the
          existing pop-in/sparkle CSS animations for the newly-shown pet —
          reusing the same animation classes used everywhere else, no new
          animation library. */}
      <div key={petProfile.id} className="relative mt-6">
        <div className="animate-pop-in">
          <AssetImage src={petProfile.imageSrc} alt={petProfile.name} size={180} />
        </div>
        {['-left-3 top-2', 'right-0 top-6', 'left-6 bottom-4'].map((pos, i) => (
          <span
            key={pos}
            className={`animate-sparkle-burst absolute text-2xl ${pos}`}
            style={{ animationDelay: `${300 + i * 130}ms` }}
            aria-hidden="true"
          >
            ✨
          </span>
        ))}
      </div>

      <p className="mt-2 font-display text-xl font-extrabold text-foreground">{petProfile.name}</p>
      <p className="mt-1 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
        {petProfile.tagline}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <StatBadge stat={stat} size="sm" />
          <span className="text-sm font-bold text-foreground">{stat.name}</span>
        </div>
        <span className="text-sm text-muted-foreground">+</span>
        <div className="flex items-center gap-1.5">
          <StatBadge stat={secondary} size="sm" />
          <span className="text-sm font-bold text-foreground">{secondary.name}</span>
        </div>
      </div>

      <p className="mt-4 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
        {selectionReason}
      </p>

      <div className="mt-5 w-full rounded-2xl bg-secondary px-4 py-3 text-left toy-border">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          나의 스탯 성향
        </p>
        <ul className="mt-1.5 space-y-0.5 text-xs text-secondary-foreground">
          <li>
            가장 강한 스탯: <span className="font-bold">{stat.name}</span>
          </li>
          <li>
            성향 타입: <span className="font-bold">{type.typeName}</span>
          </li>
        </ul>
      </div>

      <div className="mt-3 w-full rounded-2xl bg-card px-4 py-3 text-left toy-border">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          핵심 성향
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground">{coreTraitSummary}</p>
      </div>

      <div className="mt-5 w-full text-left">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          잘 맞는 Statling
        </p>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          {compatibility.goodMatches.map((id) => (
            <div key={id} className="rounded-xl bg-card px-2.5 py-2 toy-border">
              <div className="flex items-center gap-1.5">
                <StatBadge stat={STATS[id]} size="xs" />
                <span className="text-xs font-bold text-foreground">{getStatTypeLabel(id)}</span>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                {getGoodMatchBlurb(id)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 w-full text-left">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          조금 다른 리듬의 Statling
        </p>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          {compatibility.differentRhythms.map((id) => (
            <div key={id} className="rounded-xl bg-card px-2.5 py-2 toy-border">
              <div className="flex items-center gap-1.5">
                <StatBadge stat={STATS[id]} size="xs" />
                <span className="text-xs font-bold text-foreground">{getStatTypeLabel(id)}</span>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                {getDifferentRhythmBlurb(id)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex w-full flex-col gap-3">
        {!isConfirmed &&
          (canReroll ? (
            <ToyButton variant="secondary" className="w-full" onClick={onReroll}>
              다른 Statling 보기 · {rerollsRemaining}회 남음
            </ToyButton>
          ) : (
            <p className="text-xs font-semibold text-muted-foreground">
              마지막으로 만난 Statling이에요
            </p>
          ))}

        <ToyButton className="w-full" onClick={onConfirm}>
          {isConfirmed ? '저장하고 시작하기' : '이 Statling과 함께하기'}
          <ArrowRight size={20} strokeWidth={2.8} />
        </ToyButton>

        <ToyButton
          className="w-full"
          onClick={handleShare}
          disabled={busyAction !== null}
          aria-disabled={busyAction !== null}
          aria-label="대표 스탯링 결과 공유하기"
        >
          {busyAction === 'share' ? (
            <Loader2 size={18} strokeWidth={2.4} className="animate-spin" />
          ) : (
            <Share2 size={18} strokeWidth={2.4} />
          )}
          {busyAction === 'share' ? '공유 준비 중...' : '공유하기'}
        </ToyButton>

        <ToyButton
          variant="secondary"
          className="w-full"
          onClick={handleSaveImage}
          disabled={busyAction !== null}
          aria-disabled={busyAction !== null}
          aria-label="대표 스탯링 결과 이미지로 저장하기"
        >
          {busyAction === 'save' ? (
            <Loader2 size={18} strokeWidth={2.4} className="animate-spin" />
          ) : (
            <Download size={18} strokeWidth={2.4} />
          )}
          {busyAction === 'save' ? '이미지 만드는 중...' : '이미지로 저장'}
        </ToyButton>
      </div>

      {/* Hidden capture target for html-to-image — see StatlingShareCard's own doc comment for why opacity-0 (not display:none) plus aria-hidden/inert is the right combination here. */}
      <StatlingShareCard
        ref={shareCardRef}
        petProfile={petProfile}
        primaryStatName={stat.name}
        secondaryStatName={secondary.name}
        serviceLabel="6개의 두뇌 능력을 분석하는 Statling"
      />

      {fallback && (
        <ShareFallbackModal
          open={!!fallback}
          onOpenChange={(open) => {
            if (!open) setFallback(null)
          }}
          title={fallback.title}
          text={fallback.text}
          url={fallback.url}
        />
      )}
    </div>
  )
}
