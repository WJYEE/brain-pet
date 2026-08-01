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
import { PLAY_ORDER, type StatId } from '@/lib/brain-bet'

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
 * "Statling wants to play X today" — GAME_SPEC left the exact rule (daily
 * random / lowest stat / etc.) TBD; this picks the user's current
 * lowest-scoring stat, so the ×1.5 Free Play EXP bonus it drives
 * (free-play-result-screen.tsx) actually nudges the player toward their
 * weakest area instead of always favoring the same stat. Ties (including
 * "no games played yet", where every final is 0) fall back to PLAY_ORDER for
 * a deterministic result.
 */
export function getRecommendedStat(finals: Record<StatId, number>): StatId {
  return PLAY_ORDER.reduce((lowest, id) => ((finals[id] ?? 0) < (finals[lowest] ?? 0) ? id : lowest))
}
