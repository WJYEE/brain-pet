import { ROOM_ATTENTION_THRESHOLD } from '@/lib/config/pet-care.config'

interface DustSpot {
  left: string
  top: string
  size: string
}

/** Fixed, deliberately non-random positions so the layout never jitters between renders. */
const DUST_SPOTS: DustSpot[] = [
  { left: '18%', top: '78%', size: 'text-lg' },
  { left: '78%', top: '82%', size: 'text-base' },
  { left: '46%', top: '86%', size: 'text-sm' },
]

interface RoomCleanOverlayProps {
  roomCleanliness: number
  /** True for the brief window right after a successful 청소 action — plays a one-shot sparkle sweep. */
  showSparkle: boolean
}

/**
 * Purely decorative floor-dust layer for the room, siblings `RoomCanvas`
 * (never modifies it). Sits at a low z-index — just above the background,
 * well under RoomCanvas's own furniture (40+) / shadow (48) / Statling (50)
 * — so dust never covers the character or placed items. Extensible: more
 * spots (or object clutter) can be added to DUST_SPOTS without touching the
 * rest of the room system.
 */
export function RoomCleanOverlay({ roomCleanliness, showSparkle }: RoomCleanOverlayProps) {
  const messy = roomCleanliness < ROOM_ATTENTION_THRESHOLD
  const dustCount = roomCleanliness < 15 ? 3 : roomCleanliness < ROOM_ATTENTION_THRESHOLD ? 2 : 0

  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex: 5 }} aria-hidden="true">
      {messy &&
        DUST_SPOTS.slice(0, dustCount).map((spot) => (
          <span
            key={spot.left}
            className={`absolute ${spot.size} opacity-70`}
            style={{ left: spot.left, top: spot.top }}
          >
            💨
          </span>
        ))}
      {showSparkle && (
        <span
          className="animate-sparkle-burst absolute text-2xl"
          style={{ left: '50%', top: '70%', transform: 'translateX(-50%)' }}
        >
          ✨
        </span>
      )}
    </div>
  )
}
