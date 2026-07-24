/**
 * Small hand-drawn "toy" icon set for the Room HUD — replaces the previous
 * mix of system emoji (🍎✨💗) and generic Lucide line icons, both of which
 * read as visually foreign next to Statling's flat-fill, chunky-outline
 * Pixel-RPG art direction. Every icon here is a flat shape + a `var(--line)`
 * outline at the same 1.5px weight `.toy-border` already uses elsewhere, so
 * they read as part of the same toy/sticker family as StatBadge and
 * ToyButton rather than a new, third icon language.
 *
 * No new PNG assets were created for these — "놀기" (play) instead reuses a
 * real decor PNG (a small ball) via AssetImage, per the room asset catalog.
 */

import { AssetImage } from '@/components/brain-bet/asset-image'
import { ROOM_ASSETS } from '@/lib/room-assets'

export interface RoomIconProps {
  size?: number
  className?: string
}

const OUTLINE = 'var(--line)'

/** 포만감 / 밥(주기) — a bowl with a small mound of food. */
export function BowlIcon({ size = 20, className }: RoomIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M4 12h16a1 1 0 0 1 1 1c0 4.4-4 7-9 7s-9-2.6-9-7a1 1 0 0 1 1-1Z"
        fill="var(--chart-4)"
        stroke={OUTLINE}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <ellipse cx="12" cy="7.5" rx="4.5" ry="3" fill="var(--accent)" stroke={OUTLINE} strokeWidth={1.5} />
    </svg>
  )
}

/** 청결도 / 씻기 — three overlapping soap bubbles. */
export function BubbleIcon({ size = 20, className }: RoomIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="9" cy="13" r="6" fill="var(--pastel-mint)" stroke={OUTLINE} strokeWidth={1.5} />
      <circle cx="16" cy="9" r="4" fill="var(--pastel-mint)" stroke={OUTLINE} strokeWidth={1.5} />
      <circle cx="17.5" cy="16.5" r="2.5" fill="var(--pastel-mint)" stroke={OUTLINE} strokeWidth={1.5} />
    </svg>
  )
}

/** 청소(하기) — a broom: handle + fan-shaped bristles. */
export function BroomIcon({ size = 20, className }: RoomIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M18 4 9 13" stroke={OUTLINE} strokeWidth={2} strokeLinecap="round" />
      <path
        d="M9 13 4 15.5 5 20l6-1.2L13 15l-4-2Z"
        fill="var(--secondary)"
        stroke={OUTLINE}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path d="M8.5 15.5 6 19M10.5 14.5 8.5 18.5" stroke={OUTLINE} strokeWidth={1} strokeLinecap="round" />
    </svg>
  )
}

/** 애정도 — a simple filled heart. */
export function HeartIcon({ size = 20, className }: RoomIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 20s-7.5-4.6-9.8-9.1C.6 7.6 2 4.3 5.2 3.6c2-.4 3.8.5 4.8 2.2C11 4.1 12.8 3.2 14.8 3.6c3.2.7 4.6 4 3 7.3C19.5 15.4 12 20 12 20Z"
        fill="var(--primary)"
        stroke={OUTLINE}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** 쓰다듬기 — a paw print (fits a creature Statling better than a human hand). */
export function PawIcon({ size = 20, className }: RoomIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <ellipse cx="12" cy="16" rx="6" ry="5" fill="var(--pastel-peach)" stroke={OUTLINE} strokeWidth={1.5} />
      <circle cx="5.5" cy="9" r="2.3" fill="var(--pastel-peach)" stroke={OUTLINE} strokeWidth={1.3} />
      <circle cx="11" cy="6.2" r="2.3" fill="var(--pastel-peach)" stroke={OUTLINE} strokeWidth={1.3} />
      <circle cx="16.7" cy="7.3" r="2.2" fill="var(--pastel-peach)" stroke={OUTLINE} strokeWidth={1.3} />
    </svg>
  )
}

/** 대화(하기) — a speech bubble with three dots. */
export function ChatIcon({ size = 20, className }: RoomIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H9l-4 3.5V16.5H4A1.5 1.5 0 0 1 2.5 15V7A1.5 1.5 0 0 1 4 5.5Z"
        fill="var(--pastel-mint)"
        stroke={OUTLINE}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <circle cx="8" cy="11" r="1.15" fill={OUTLINE} />
      <circle cx="12" cy="11" r="1.15" fill={OUTLINE} />
      <circle cx="16" cy="11" r="1.15" fill={OUTLINE} />
    </svg>
  )
}

/** 놀아주기 — reuses a real decor PNG (a small ball) instead of a drawn icon, per the room asset catalog; never a new image file. */
export function PlayIcon({ size = 20, className }: RoomIconProps) {
  return <AssetImage src={ROOM_ASSETS['ball-2'].src} alt="" size={size} className={className} />
}
