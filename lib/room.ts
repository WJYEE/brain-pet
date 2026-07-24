import type { ReactElement } from 'react'
import {
  BowlIcon,
  BroomIcon,
  BubbleIcon,
  ChatIcon,
  HeartIcon,
  PawIcon,
  PlayIcon,
  type RoomIconProps,
} from '@/components/brain-bet/room-icons'
import type { StatId } from '@/lib/brain-bet'

export type CareActionId = 'feed' | 'shower' | 'clean' | 'play' | 'pet' | 'talk'

/** A component shape both the hand-drawn SVG icons and the PNG-backed PlayIcon share, so CareActionDef/ROOM_STATUS_META can hold either uniformly. */
export type RoomIconComponent = (props: RoomIconProps) => ReactElement

export interface CareActionDef {
  id: CareActionId
  /** Full label — used for aria-label / anywhere a fuller description is useful. */
  label: string
  /** Short label shown on the compact Room HUD action button itself. */
  shortLabel: string
  icon: RoomIconComponent
  /** "active" gets a visual reaction on click. No numeric Care logic runs in PHASE 1. */
  status: 'active' | 'comingSoon'
}

export const CARE_ACTIONS: CareActionDef[] = [
  { id: 'feed', label: '밥 주기', shortLabel: '밥', icon: BowlIcon, status: 'active' },
  { id: 'shower', label: '샤워', shortLabel: '씻기', icon: BubbleIcon, status: 'comingSoon' },
  { id: 'clean', label: '청소하기', shortLabel: '청소', icon: BroomIcon, status: 'comingSoon' },
  { id: 'play', label: '놀아주기', shortLabel: '놀기', icon: PlayIcon, status: 'active' },
  { id: 'pet', label: '쓰다듬기', shortLabel: '쓰담', icon: PawIcon, status: 'active' },
  { id: 'talk', label: '대화하기', shortLabel: '대화', icon: ChatIcon, status: 'active' },
]

export type RoomStatusId = 'satiety' | 'cleanliness' | 'affection'

/** Static display values only — no decay/growth logic in PHASE 1. */
export const INITIAL_ROOM_STATUS: Record<RoomStatusId, number> = {
  satiety: 72,
  cleanliness: 81,
  affection: 65,
}

export const ROOM_STATUS_META: { id: RoomStatusId; label: string; icon: RoomIconComponent }[] = [
  { id: 'satiety', label: '포만감', icon: BowlIcon },
  { id: 'cleanliness', label: '청결도', icon: BubbleIcon },
  { id: 'affection', label: '애정도', icon: HeartIcon },
]

/**
 * PHASE 1 placeholder for "Statling wants to play X today". GAME_SPEC leaves
 * the actual recommendation rule (daily random / lowest stat / etc.) TBD, so
 * this is a fixed example used only to demonstrate the UI treatment.
 */
export const RECOMMENDED_STAT_PLACEHOLDER: StatId = 'memory'
