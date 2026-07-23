import {
  Gamepad2,
  Hand,
  MessageCircle,
  ShowerHead,
  Sparkles,
  Utensils,
  type LucideIcon,
} from 'lucide-react'
import type { StatId } from '@/lib/brain-bet'

export type CareActionId = 'feed' | 'shower' | 'clean' | 'play' | 'pet' | 'talk'

export interface CareActionDef {
  id: CareActionId
  label: string
  icon: LucideIcon
  /** "active" gets a visual reaction on click. No numeric Care logic runs in PHASE 1. */
  status: 'active' | 'comingSoon'
}

export const CARE_ACTIONS: CareActionDef[] = [
  { id: 'feed', label: '밥 주기', icon: Utensils, status: 'active' },
  { id: 'shower', label: '샤워', icon: ShowerHead, status: 'comingSoon' },
  { id: 'clean', label: '청소하기', icon: Sparkles, status: 'comingSoon' },
  { id: 'play', label: '놀아주기', icon: Gamepad2, status: 'active' },
  { id: 'pet', label: '쓰다듬기', icon: Hand, status: 'active' },
  { id: 'talk', label: '대화하기', icon: MessageCircle, status: 'active' },
]

export type RoomStatusId = 'satiety' | 'cleanliness' | 'affection'

/** Static display values only — no decay/growth logic in PHASE 1. */
export const INITIAL_ROOM_STATUS: Record<RoomStatusId, number> = {
  satiety: 72,
  cleanliness: 81,
  affection: 65,
}

export const ROOM_STATUS_META: { id: RoomStatusId; label: string; emoji: string }[] = [
  { id: 'satiety', label: '포만감', emoji: '🍎' },
  { id: 'cleanliness', label: '청결도', emoji: '✨' },
  { id: 'affection', label: '애정도', emoji: '💗' },
]

/**
 * PHASE 1 placeholder for "Statling wants to play X today". GAME_SPEC leaves
 * the actual recommendation rule (daily random / lowest stat / etc.) TBD, so
 * this is a fixed example used only to demonstrate the UI treatment.
 */
export const RECOMMENDED_STAT_PLACEHOLDER: StatId = 'memory'
