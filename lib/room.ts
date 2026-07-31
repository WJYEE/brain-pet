import type { ReactElement } from 'react'
import {
  BowlIcon,
  BroomIcon,
  BubbleIcon,
  ChatIcon,
  PawIcon,
  PlayIcon,
  type RoomIconProps,
} from '@/components/brain-bet/room-icons'
import type { StatId } from '@/lib/brain-bet'

export type CareActionId = 'feed' | 'shower' | 'clean' | 'play' | 'pet' | 'talk'

/** A component shape both the hand-drawn SVG icons and the PNG-backed PlayIcon share, so CareActionDef can hold either uniformly. */
export type RoomIconComponent = (props: RoomIconProps) => ReactElement

export interface CareActionDef {
  id: CareActionId
  /** Full label — used for aria-label / anywhere a fuller description is useful. */
  label: string
  /** Short label shown on the compact Room HUD action button itself. */
  shortLabel: string
  icon: RoomIconComponent
}

export const CARE_ACTIONS: CareActionDef[] = [
  { id: 'feed', label: '밥 주기', shortLabel: '밥', icon: BowlIcon },
  { id: 'shower', label: '샤워', shortLabel: '씻기', icon: BubbleIcon },
  { id: 'clean', label: '청소하기', shortLabel: '청소', icon: BroomIcon },
  { id: 'play', label: '놀아주기', shortLabel: '놀기', icon: PlayIcon },
  { id: 'pet', label: '쓰다듬기', shortLabel: '쓰담', icon: PawIcon },
  { id: 'talk', label: '대화하기', shortLabel: '대화', icon: ChatIcon },
]

/**
 * PHASE 1 placeholder for "Statling wants to play X today". GAME_SPEC leaves
 * the actual recommendation rule (daily random / lowest stat / etc.) TBD, so
 * this is a fixed example used only to demonstrate the UI treatment.
 */
export const RECOMMENDED_STAT_PLACEHOLDER: StatId = 'memory'
