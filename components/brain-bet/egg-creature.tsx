import { cn } from '@/lib/utils'

interface EggCreatureProps {
  /** 0 (freshly laid, silent) through 6 (about to hatch). Clamped to that range. */
  stage: number
  size?: number
  className?: string
}

const EGG_PATH =
  'M70 10 C101 10 117 54 117 94 C117 130 97 150 70 150 C43 150 23 130 23 94 C23 54 39 10 70 10 Z'

/** Scattered (not grid-aligned) so the pattern reads as organic marking rather than a mechanical progress bar. */
const DIAMOND_SPOTS: { x: number; y: number; rotate: number }[] = [
  { x: 50, y: 55, rotate: 12 },
  { x: 90, y: 62, rotate: -10 },
  { x: 70, y: 88, rotate: 6 },
  { x: 46, y: 102, rotate: -8 },
  { x: 94, y: 106, rotate: 14 },
  { x: 70, y: 126, rotate: -4 },
]

/**
 * Cycles through all 6 Stat colors as a decorative "many abilities gathering
 * inside" motif — deliberately NOT a 1:1 progress tracker for any single
 * stat (GAME_SPEC's own growth-is-abstract framing), just a warm, varied
 * accent that gets richer as the egg gets closer to hatching.
 */
const DIAMOND_COLORS = [
  'var(--stat-reaction)',
  'var(--stat-memory)',
  'var(--stat-spatial)',
  'var(--stat-focus)',
  'var(--stat-judgment)',
  'var(--stat-reasoning)',
]

/**
 * The Egg, redrawn across 7 growth states (0-6, one per completed First Play
 * game) — plain and still at 0, gaining scattered shimmer marks, a warm
 * glow, and progressively stronger idle motion as it fills up, then a
 * hairline crack at 5-6 foreshadowing the Hatch sequence. Never shows a
 * cracked-open shell itself — that moment belongs to EggScreen's Hatch
 * animation, not this teaser.
 */
export function EggCreature({ stage, size = 160, className }: EggCreatureProps) {
  const clampedStage = Math.max(0, Math.min(6, stage))
  const glowOpacity = clampedStage === 0 ? 0 : Math.min(0.55, clampedStage * 0.09)
  const motionClass = clampedStage >= 5 ? 'animate-wobble' : clampedStage >= 3 ? 'animate-egg-jiggle' : 'animate-float'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 160"
      className={cn('overflow-visible', motionClass, className)}
      role="img"
      aria-label={`알 성장 ${clampedStage}/6 단계`}
    >
      {/* speckled nest */}
      <ellipse cx="70" cy="150" rx="52" ry="14" fill="oklch(0.5 0.05 55)" opacity="0.9" />
      <ellipse cx="70" cy="146" rx="46" ry="11" fill="oklch(0.42 0.045 50)" />
      {[
        [36, 144],
        [58, 150],
        [82, 150],
        [104, 144],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="4" ry="2.6" fill="oklch(0.34 0.04 45)" />
      ))}

      {/* warm glow, growing with stage */}
      {glowOpacity > 0 && (
        <ellipse cx="70" cy="90" rx="66" ry="76" fill="var(--accent)" opacity={glowOpacity} style={{ filter: 'blur(10px)' }} />
      )}

      {/* shell */}
      <path d={EGG_PATH} fill="var(--card)" stroke="var(--ink)" strokeWidth="3.5" strokeLinejoin="round" />

      {/* shimmer marks — one more revealed per completed game */}
      {DIAMOND_SPOTS.map((spot, i) =>
        i < clampedStage ? (
          <rect
            key={i}
            x={spot.x - 5}
            y={spot.y - 5}
            width="10"
            height="10"
            rx="2"
            fill={DIAMOND_COLORS[i]}
            opacity={clampedStage >= 6 ? 1 : 0.75}
            transform={`rotate(${45 + spot.rotate} ${spot.x} ${spot.y})`}
            className={i === clampedStage - 1 ? 'animate-pop-in' : undefined}
          />
        ) : null,
      )}

      {/* hairline crack — only in the last two stages, foreshadowing Hatch */}
      {clampedStage >= 5 && (
        <path
          d="M52 40 L60 56 L50 66 L64 82"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={clampedStage >= 6 ? 1 : 0.65}
        />
      )}
      {clampedStage >= 6 && (
        <ellipse cx="57" cy="60" rx="10" ry="14" fill="var(--accent)" opacity="0.5" style={{ filter: 'blur(4px)' }} />
      )}
    </svg>
  )
}
