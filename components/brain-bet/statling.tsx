import type { CSSProperties } from 'react'
import { STATS, type StatId } from '@/lib/brain-bet'
import { cn } from '@/lib/utils'

interface StatlingProps {
  /** Which stat type decides the creature's color + crown feature. */
  type: StatId
  /** Rendered pixel size (square). */
  size?: number
  mood?: 'happy' | 'excited' | 'sleepy'
  className?: string
}

const INK = 'var(--ink)'
const CHEEK = 'oklch(0.8 0.1 18)'

/**
 * The Statling — an original rounded fantasy pet (never human-like).
 * A soft egg-shaped body, big glossy eyes, blush, and a per-type crown
 * feature. Color is driven by the stat's CSS variable so the whole system
 * (games, stats, radar, Statling) stays visually consistent. Designed as a
 * base that later variations (pattern, ears, tail, eyes) can build on.
 */
export function Statling({ type, size = 200, mood = 'happy', className }: StatlingProps) {
  const color = `var(${STATS[type].colorVar})`
  const belly = `color-mix(in oklch, ${color} 30%, white)`
  const foot = `color-mix(in oklch, ${color} 78%, black 12%)`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 150"
      className={cn('overflow-visible', className)}
      role="img"
      aria-label={`${STATS[type].name} 타입 Statling`}
      style={{ '--sl-color': color } as CSSProperties}
    >
      {/* crown feature drawn behind the head where needed */}
      <CrownBack type={type} color={color} />

      {/* little feet */}
      <ellipse cx="54" cy="134" rx="12" ry="7" fill={foot} stroke={INK} strokeWidth="3" />
      <ellipse cx="86" cy="134" rx="12" ry="7" fill={foot} stroke={INK} strokeWidth="3" />

      {/* stubby arms tucked at the sides */}
      <ellipse cx="24" cy="100" rx="9" ry="12" fill={color} stroke={INK} strokeWidth="3" />
      <ellipse cx="116" cy="100" rx="9" ry="12" fill={color} stroke={INK} strokeWidth="3" />

      {/* body */}
      <path
        d="M70 24 C102 24 120 50 120 84 C120 118 98 136 70 136 C42 136 20 118 20 84 C20 50 38 24 70 24 Z"
        fill={color}
        stroke={INK}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* soft belly patch */}
      <ellipse cx="70" cy="94" rx="31" ry="29" fill={belly} />

      {/* crown feature drawn in front (on top of the head) */}
      <CrownFront type={type} color={color} />

      {/* cheeks */}
      <ellipse cx="45" cy="93" rx="6.5" ry="4" fill={CHEEK} opacity="0.75" />
      <ellipse cx="95" cy="93" rx="6.5" ry="4" fill={CHEEK} opacity="0.75" />

      {/* eyes + mouth */}
      <Face mood={mood} />
    </svg>
  )
}

function Face({ mood }: { mood: 'happy' | 'excited' | 'sleepy' }) {
  if (mood === 'sleepy') {
    return (
      <>
        <path d="M48 78 Q56 84 64 78" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <path d="M76 78 Q84 84 92 78" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <path d="M64 96 Q70 100 76 96" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      </>
    )
  }
  const eyeR = mood === 'excited' ? 12 : 11
  return (
    <>
      {/* eye whites */}
      <ellipse cx="56" cy="80" rx="8.5" ry={eyeR} fill="white" stroke={INK} strokeWidth="2.5" />
      <ellipse cx="84" cy="80" rx="8.5" ry={eyeR} fill="white" stroke={INK} strokeWidth="2.5" />
      {/* pupils */}
      <circle cx="57" cy="82" r="5" fill={INK} />
      <circle cx="85" cy="82" r="5" fill={INK} />
      {/* shine */}
      <circle cx="54.5" cy="79" r="1.9" fill="white" />
      <circle cx="82.5" cy="79" r="1.9" fill="white" />
      {/* mouth */}
      {mood === 'excited' ? (
        <path d="M62 97 Q70 108 78 97 Q70 101 62 97 Z" fill={INK} />
      ) : (
        <path d="M63 98 Q70 105 77 98" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      )}
    </>
  )
}

/** Features that sit BEHIND the head (ears, cube, etc.). */
function CrownBack({ type, color }: { type: StatId; color: string }) {
  switch (type) {
    case 'memory':
      // two soft layered ears peeking above the head
      return (
        <>
          <ellipse cx="50" cy="30" rx="11" ry="16" fill={color} stroke={INK} strokeWidth="3" />
          <ellipse cx="90" cy="30" rx="11" ry="16" fill={color} stroke={INK} strokeWidth="3" />
        </>
      )
    case 'spatial':
      return null
    default:
      return null
  }
}

/** Features drawn ON TOP of the head. */
function CrownFront({ type, color }: { type: StatId; color: string }) {
  switch (type) {
    case 'reaction':
      // lightning bolt sprout
      return (
        <path
          d="M74 2 L60 26 L70 26 L64 40 L84 18 L73 18 L80 2 Z"
          fill={`var(--stat-reaction)`}
          stroke={INK}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )
    case 'memory':
      // small inner-ear highlight on the layered ears
      return (
        <>
          <ellipse cx="50" cy="31" rx="4.5" ry="8" fill="color-mix(in oklch, white 55%, transparent)" />
          <ellipse cx="90" cy="31" rx="4.5" ry="8" fill="color-mix(in oklch, white 55%, transparent)" />
        </>
      )
    case 'focus':
      // single antenna with a target ring
      return (
        <>
          <line x1="70" y1="24" x2="70" y2="8" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <circle cx="70" cy="6" r="6" fill="white" stroke={INK} strokeWidth="2.5" />
          <circle cx="70" cy="6" r="2.4" fill={color} />
        </>
      )
    case 'judgment':
      // two small balanced horns
      return (
        <>
          <path d="M52 26 Q50 10 58 12 Q56 22 60 27 Z" fill={color} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M88 26 Q90 10 82 12 Q84 22 80 27 Z" fill={color} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        </>
      )
    case 'spatial':
      // a little floating cube above the head
      return (
        <g transform="translate(70 12)">
          <path d="M0 -8 L9 -3 L0 2 L-9 -3 Z" fill="color-mix(in oklch, white 40%, var(--stat-spatial))" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M-9 -3 L0 2 L0 12 L-9 7 Z" fill="color-mix(in oklch, black 12%, var(--stat-spatial))" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <path d="M9 -3 L0 2 L0 12 L9 7 Z" fill="var(--stat-spatial)" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        </g>
      )
    case 'reasoning':
      // a small glowing bulb sprout
      return (
        <>
          <line x1="70" y1="24" x2="70" y2="14" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <circle cx="70" cy="8" r="7" fill="var(--accent)" stroke={INK} strokeWidth="2.5" />
          <path d="M67 9 L71 4 L69 8 L72 8" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )
    default:
      return null
  }
}
