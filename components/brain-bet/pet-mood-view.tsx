import { useEffect, useRef, useState } from 'react'
import { AssetImage } from '@/components/brain-bet/asset-image'
import { CharacterImage } from '@/components/brain-bet/character-image'
import { PetSpeechBubble } from '@/components/brain-bet/pet-speech-bubble'
import type { StatId } from '@/lib/brain-bet'
import type { PetProfile } from '@/lib/pets/pet-profile'
import {
  CHARACTER_STATE_SEQUENCE,
  characterStateForInteraction,
  type CharacterStateFolder,
} from '@/lib/character-state-assets'
import type { Mood, PetAnimation } from '@/lib/pet-care/types'
import { cn } from '@/lib/utils'

/** How long a manual click-preview (see the tester click handler below) overrides the live interaction-driven state before reverting. */
const TESTER_PREVIEW_HOLD_MS = 1600

/** How often (and for how long) the tester art blinks while genuinely idle — see the blink effect below. */
const BLINK_INTERVAL_MS = 4000
const BLINK_DURATION_MS = 180

const ANIMATION_CLASS: Record<PetAnimation, string> = {
  idle: 'animate-float',
  jump: 'animate-pet-jump',
  eat: 'animate-pet-eat',
  wash: 'animate-pet-wash',
  shake: 'animate-pet-clean-react',
  play: 'animate-pet-play',
  pet: 'animate-pet-pet',
  talk: 'animate-pet-talk',
  sleep: 'animate-pet-sleep',
  sad: 'animate-pet-sad',
  lookLeft: 'animate-pet-look',
  lookRight: 'animate-pet-look',
  hop: 'animate-pet-hop',
  walk: 'animate-pet-walk',
  askFood: 'animate-pet-gesture',
  askPlay: 'animate-pet-gesture',
  askAttention: 'animate-pet-gesture',
  celebrate: 'animate-pet-celebrate',
  playAlone: 'animate-pet-play', // reuses the button-놀기 motion — same visual, only the trigger source differs
}

interface PetMoodViewProps {
  petProfile: PetProfile | null
  topStat: StatId
  mood: Mood
  animation: PetAnimation
  speech: string | null
  playVariantId?: string
  /** Horizontal zone offset (px) from the autonomous scheduler — see hooks/use-pet-autonomy.ts. 0 = centered. */
  positionOffsetPx?: number
  onDismissSpeech?: () => void
  /** Signed lean angle (degrees) while walking left/right — see hooks/use-pet-autonomy.ts's `walkTiltDeg`. 0 the rest of the time. */
  tiltDeg?: number
  /** Raw 0-100 cleanliness stat — only used (tester mode) to tell a freshly-dirty mood apart from a long-neglected one. See characterStateForInteraction. */
  cleanliness?: number
  /** True briefly after a petting streak — see hooks/use-pet-care.ts's `isOverPetted`. */
  isOverPetted?: boolean
  /**
   * Dev/QA only (see qa-skip-menu.tsx) — when set, the character is rendered
   * from this folder's 24-state art instead of the normal petProfile/type
   * image, driven live by `mood`/`animation` via characterStateForInteraction.
   * Clicking the character also cycles through all 24 states one at a time
   * (with a little pop + sparkle), so states with no real trigger yet
   * (angry, gift, evolve, ...) are still viewable — see
   * lib/character-state-assets.ts for which states each path covers.
   */
  testerFolder?: CharacterStateFolder | null
}

/**
 * The character itself + whatever's currently layered around it: the
 * action-driven motion class, a transient effect glyph for the action that
 * triggered it, an ambient glyph for moods that read best as always-on
 * (joyful sparkle / dirty dust), the autonomous left/right zone offset, and
 * the speech bubble. Passed as RoomCanvas's `statlingSlot`, so it owns no
 * positioning of its own beyond `relative` (RoomCanvas centers/z-indexes
 * it) — the zone offset is an *additional* translateX on top of that,
 * which composes correctly since nested transforms apply independently.
 */
export function PetMoodView({
  petProfile,
  topStat,
  mood,
  animation,
  speech,
  playVariantId,
  positionOffsetPx = 0,
  tiltDeg = 0,
  cleanliness,
  isOverPetted = false,
  onDismissSpeech,
  testerFolder,
}: PetMoodViewProps) {
  // Manual click-through preview (tester mode only) — null means "just show
  // whatever mood/animation would really display right now".
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [clickTick, setClickTick] = useState(0)
  const previewTimeoutRef = useRef<number | null>(null)
  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current != null) window.clearTimeout(previewTimeoutRef.current)
    }
  }, [])

  const handleTesterClick = () => {
    if (!testerFolder) return
    setPreviewIndex((i) => ((i ?? -1) + 1) % CHARACTER_STATE_SEQUENCE.length)
    setClickTick((t) => t + 1)
    if (previewTimeoutRef.current != null) window.clearTimeout(previewTimeoutRef.current)
    previewTimeoutRef.current = window.setTimeout(() => setPreviewIndex(null), TESTER_PREVIEW_HOLD_MS)
  }

  const liveStateKey = testerFolder
    ? characterStateForInteraction({ mood, animation, cleanliness, isOverPetted })
    : null

  // Periodic blink — only while the live (non-preview) state genuinely reads
  // as idle; stops the moment an action/mood pushes it to anything else.
  const [isBlinking, setIsBlinking] = useState(false)
  const blinkTimeoutRef = useRef<number | null>(null)
  useEffect(() => {
    if (liveStateKey !== 'idle') {
      setIsBlinking(false)
      return
    }
    const interval = window.setInterval(() => {
      setIsBlinking(true)
      blinkTimeoutRef.current = window.setTimeout(() => setIsBlinking(false), BLINK_DURATION_MS)
    }, BLINK_INTERVAL_MS)
    return () => {
      window.clearInterval(interval)
      if (blinkTimeoutRef.current != null) window.clearTimeout(blinkTimeoutRef.current)
    }
  }, [liveStateKey])

  const isPreviewing = testerFolder != null && previewIndex != null
  const displayedLiveKey = isBlinking ? 'blink' : liveStateKey
  // Falls back to the sequence's first entry ('idle') rather than ever being
  // undefined — testerFolder truthy must always resolve to *some* real
  // tester asset, never fall through to the real petProfile/CharacterImage
  // branch below (that branch showing up alongside the "실시간" caption was
  // exactly the "wrong pet, broken image" bug).
  const testerStateDef = isPreviewing
    ? CHARACTER_STATE_SEQUENCE[previewIndex]
    : (CHARACTER_STATE_SEQUENCE.find((d) => d.key === displayedLiveKey) ?? CHARACTER_STATE_SEQUENCE[0])

  return (
    <div
      className="pet-zone-transition relative flex flex-col items-center"
      style={{ transform: `translateX(${positionOffsetPx}px) rotate(${tiltDeg}deg)` }}
    >
      {speech && (
        <PetSpeechBubble key={speech} text={speech} onDismiss={onDismissSpeech} className="absolute -top-16 z-10" />
      )}

      <div className="relative">
        {testerFolder ? (
          <button
            type="button"
            onClick={handleTesterClick}
            className="block cursor-pointer rounded-full"
            title="클릭하면 다음 표정을 미리 볼 수 있어요"
          >
            <AssetImage
              key={`${testerStateDef.key}-${clickTick}`}
              src={testerFolder.assets[testerStateDef.key]}
              alt={`${testerFolder.displayName} — ${testerStateDef.label}`}
              size={180}
              className={cn(isPreviewing ? 'animate-pop-in' : ANIMATION_CLASS[animation])}
            />
          </button>
        ) : petProfile ? (
          <AssetImage src={petProfile.imageSrc} alt={petProfile.name} size={180} className={ANIMATION_CLASS[animation]} />
        ) : (
          <CharacterImage type={topStat} size={180} className={ANIMATION_CLASS[animation]} />
        )}

        {isPreviewing && (
          <>
            <span
              key={`spark-${clickTick}`}
              className="animate-sparkle-burst pointer-events-none absolute -right-2 -top-2 text-2xl"
              aria-hidden="true"
            >
              ✨
            </span>
            <span className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-card px-2 py-0.5 text-[10px] font-bold text-foreground toy-border">
              {testerStateDef?.number}. {testerStateDef?.label}
            </span>
          </>
        )}

        {testerFolder && !isPreviewing && (
          <span className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-secondary-foreground toy-border">
            실시간 · {testerStateDef?.label}
          </span>
        )}

        {!isPreviewing && animation === 'shake' && (
          <span className="animate-sparkle-burst absolute -right-2 -top-2 text-2xl" aria-hidden="true">
            ✨
          </span>
        )}
        {!isPreviewing && animation === 'jump' && (
          <span className="animate-sparkle-burst absolute -right-3 -top-3 text-3xl" aria-hidden="true">
            ✨
          </span>
        )}
        {!isPreviewing && animation === 'askFood' && (
          <span className="animate-pop-in absolute -right-2 -top-2 text-2xl" aria-hidden="true">
            🍽️
          </span>
        )}
        {!isPreviewing && animation === 'askPlay' && (
          <span className="animate-pop-in absolute -right-2 -top-2 text-2xl" aria-hidden="true">
            💭
          </span>
        )}
        {!isPreviewing && animation === 'celebrate' && (
          <span className="animate-sparkle-burst absolute -right-3 -top-3 text-2xl" aria-hidden="true">
            🎉
          </span>
        )}

        {!isPreviewing && animation === 'idle' && mood === 'joyful' && (
          <span
            className={cn('animate-egg-glow-pulse absolute -right-2 -top-2 text-xl')}
            aria-hidden="true"
          >
            ✨
          </span>
        )}
        {!isPreviewing && animation === 'idle' && mood === 'dirty' && (
          <span className="animate-egg-glow-pulse absolute -left-2 -top-1 text-xl" aria-hidden="true">
            💨
          </span>
        )}
      </div>
    </div>
  )
}
