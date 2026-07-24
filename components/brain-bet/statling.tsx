import type { CSSProperties } from 'react'
import { STATS, type StatId } from '@/lib/brain-bet'
import { cn } from '@/lib/utils'

interface StatlingProps {
  /** Which stat type decides the creature's color + silhouette. */
  type: StatId
  /** Rendered pixel size (square). */
  size?: number
  mood?: 'happy' | 'excited' | 'sleepy'
  className?: string
}

const INK = 'var(--ink)'
const CHEEK = 'oklch(0.8 0.1 18)'

/**
 * Body proportion per type — applied as a <g> transform around the shared
 * body path's center (70, 84), so every type keeps the same proven silhouette
 * math but reads as a genuinely different build (slender/sleek vs plump vs
 * wide-headed). 'spatial' is null because it uses its own hand-authored
 * angular polygon body instead of the shared curved path — no scale
 * transform can turn a smooth curve into flat facets.
 */
const BODY_SCALE: Partial<Record<StatId, { x: number; y: number }>> = {
  reaction: { x: 0.86, y: 1.06 }, // slim, slightly taller — sleek and quick
  memory: { x: 1.07, y: 1.1 }, // plush and round
  focus: { x: 1.08, y: 0.94 }, // wide, flatter head — owlish
  judgment: { x: 1, y: 1 }, // reference proportions — the "balanced" build
  reasoning: { x: 0.94, y: 1 }, // slightly slender, alert
}

const SHARED_BODY_PATH =
  'M70 24 C102 24 120 50 120 84 C120 118 98 136 70 136 C42 136 20 118 20 84 C20 50 38 24 70 24 Z'

/**
 * The Statling — an original rounded fantasy pet (never human-like, never a
 * literal classroom-prop mascot). Each of the 6 Stat types gets its own body
 * proportion, ears, tail, and one small signature feature, so silhouettes
 * read as genuinely different creatures at a glance — never just a shared
 * blob recolored with a single accessory swapped in. Color is driven by the
 * stat's CSS variable (unchanged from the existing 5-game color system).
 */
export function Statling({ type, size = 200, mood = 'happy', className }: StatlingProps) {
  const color = `var(${STATS[type].colorVar})`
  const belly = `color-mix(in oklch, ${color} 30%, white)`
  const foot = `color-mix(in oklch, ${color} 78%, black 12%)`
  const scale = BODY_SCALE[type]
  const bodyTransform = scale ? `translate(70 84) scale(${scale.x} ${scale.y}) translate(-70 -84)` : undefined

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
      <TailBack type={type} color={color} />

      {/* little feet */}
      <ellipse cx="54" cy="134" rx="12" ry="7" fill={foot} stroke={INK} strokeWidth="3" />
      <ellipse cx="86" cy="134" rx="12" ry="7" fill={foot} stroke={INK} strokeWidth="3" />

      {/* stubby arms tucked at the sides */}
      <ellipse cx="24" cy="100" rx="9" ry="12" fill={color} stroke={INK} strokeWidth="3" />
      <ellipse cx="116" cy="100" rx="9" ry="12" fill={color} stroke={INK} strokeWidth="3" />

      <EarsBack type={type} color={color} />

      {/* body — either the shared curved silhouette (scaled per type) or Spatial's own angular polygon */}
      {type === 'spatial' ? (
        <SpatialBody color={color} belly={belly} />
      ) : (
        <g transform={bodyTransform}>
          <path d={SHARED_BODY_PATH} fill={color} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <ellipse cx="70" cy="94" rx="31" ry="29" fill={belly} />
        </g>
      )}

      <SignatureMark type={type} color={color} />

      {/* cheeks */}
      <ellipse cx="45" cy="93" rx="6.5" ry="4" fill={CHEEK} opacity="0.75" />
      <ellipse cx="95" cy="93" rx="6.5" ry="4" fill={CHEEK} opacity="0.75" />

      <FaceAccent type={type} color={color} />
      <Face mood={mood} type={type} />
    </svg>
  )
}

function Face({ mood, type }: { mood: 'happy' | 'excited' | 'sleepy'; type: StatId }) {
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
  // Reasoning's "curious, always noticing something" look — one eye a touch
  // wider than the other, a quirk rather than a held prop.
  const rightEyeR = type === 'reasoning' ? eyeR + 2 : eyeR
  return (
    <>
      {/* eye whites */}
      <ellipse cx="56" cy="80" rx="8.5" ry={eyeR} fill="white" stroke={INK} strokeWidth="2.5" />
      <ellipse cx="84" cy="80" rx="8.5" ry={rightEyeR} fill="white" stroke={INK} strokeWidth="2.5" />
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

/** Ears/antennae — drawn behind the head, the single biggest silhouette differentiator between types. */
function EarsBack({ type, color }: { type: StatId; color: string }) {
  switch (type) {
    case 'reaction':
      // sharp, swept-back — built for speed, not for listening around a room
      return (
        <>
          <path d="M46 30 L34 6 L56 24 Z" fill={color} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path d="M94 30 L106 6 L84 24 Z" fill={color} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        </>
      )
    case 'memory':
      // long, soft, drooping — an ear shape built to hold onto things
      return (
        <>
          <path
            d="M48 30 C36 14 38 -8 51 -6 C58 4 57 20 53 32 Z"
            fill={color}
            stroke={INK}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M92 30 C104 14 102 -8 89 -6 C82 4 83 20 87 32 Z"
            fill={color}
            stroke={INK}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M49 30 C41 18 42 0 51 0" fill="none" stroke="color-mix(in oklch, white 45%, transparent)" strokeWidth="4" strokeLinecap="round" />
          <path d="M91 30 C99 18 98 0 89 0" fill="none" stroke="color-mix(in oklch, white 45%, transparent)" strokeWidth="4" strokeLinecap="round" />
        </>
      )
    case 'focus':
      // small, round, close to the head — all the presence goes to the eyes instead
      return (
        <>
          <path d="M53 28 Q48 14 58 16 Q57 24 61 29 Z" fill={color} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M87 28 Q92 14 82 16 Q83 24 79 29 Z" fill={color} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        </>
      )
    case 'judgment':
      // plain, perfectly mirrored circles — the symmetry itself is the signature
      return (
        <>
          <ellipse cx="50" cy="26" rx="9" ry="11" fill={color} stroke={INK} strokeWidth="3" />
          <ellipse cx="90" cy="26" rx="9" ry="11" fill={color} stroke={INK} strokeWidth="3" />
        </>
      )
    case 'reasoning':
      // one straight ear, one gently folded — a small asymmetric quirk, never quite settled
      return (
        <>
          <path d="M48 28 L38 4 L58 24 Z" fill={color} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <path
            d="M92 28 Q102 16 97 8 Q89 12 86 24 Z"
            fill={color}
            stroke={INK}
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </>
      )
    default:
      return null
  }
}

/** Tails — drawn behind the body so the base is hidden, giving every type (but Judgment) a distinct silhouette flourish out back. */
function TailBack({ type, color }: { type: StatId; color: string }) {
  switch (type) {
    case 'reaction':
      // a jagged lightning-bolt tail
      return (
        <path
          d="M104 112 L122 98 L112 99 L128 80 L116 100 L124 100 Z"
          fill={color}
          stroke={INK}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )
    case 'memory':
      // a small round, fluffy tail
      return <circle cx="110" cy="120" r="12" fill={color} stroke={INK} strokeWidth="3" />
    case 'focus':
      // short and stubby — nothing to distract from the stare
      return <ellipse cx="108" cy="118" rx="8" ry="10" fill={color} stroke={INK} strokeWidth="2.5" />
    case 'spatial':
      // a small geometric block, on-theme with the faceted body
      return (
        <rect
          x="104"
          y="106"
          width="16"
          height="16"
          rx="3"
          fill={color}
          stroke={INK}
          strokeWidth="2.5"
          transform="rotate(18 112 114)"
        />
      )
    case 'reasoning':
      // long, curling at the tip — always poking at one more question
      return (
        <>
          <path
            d="M100 118 Q124 120 126 98 Q128 80 110 80"
            fill="none"
            stroke={INK}
            strokeWidth="13"
            strokeLinecap="round"
          />
          <path
            d="M100 118 Q124 120 126 98 Q128 80 110 80"
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
          />
        </>
      )
    case 'judgment':
    default:
      // no tail — Judgment's signature is bilateral symmetry, not a single asymmetric flourish
      return null
  }
}

/** Spatial's own body — the only type built from flat angular facets instead of the shared curved silhouette. */
function SpatialBody({ color, belly }: { color: string; belly: string }) {
  const facet = 'color-mix(in oklch, black 10%, ' + color + ')'
  return (
    <>
      <path
        d="M70 24 L106 42 L120 84 L102 126 L70 136 L38 126 L20 84 L34 42 Z"
        fill={color}
        stroke={INK}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* facet seams — the small geometric detail that reads as "cut like a gem", not just a rounded body */}
      <path d="M70 24 L70 136" stroke={facet} strokeWidth="2" opacity="0.5" />
      <path d="M34 42 L102 126" stroke={facet} strokeWidth="2" opacity="0.35" />
      <ellipse cx="70" cy="94" rx="28" ry="27" fill={belly} />
    </>
  )
}

/** One small extra feature beyond ears/tail, only where it adds real signal. */
function SignatureMark({ type, color }: { type: StatId; color: string }) {
  if (type === 'judgment') {
    // two mirrored marks on the belly — balance expressed as literal left-right symmetry
    return (
      <>
        <path d="M52 90 L56 96 L52 102 L48 96 Z" fill={color} opacity="0.55" />
        <path d="M88 90 L92 96 L88 102 L84 96 Z" fill={color} opacity="0.55" />
      </>
    )
  }
  return null
}

/** Drawn just before the eyes, behind the face — currently only Focus's owl-like facial disc. */
function FaceAccent({ type, color }: { type: StatId; color: string }) {
  if (type === 'focus') {
    return (
      <>
        <circle cx="56" cy="80" r="14.5" fill="none" stroke={color} strokeWidth="3" opacity="0.55" />
        <circle cx="84" cy="80" r="14.5" fill="none" stroke={color} strokeWidth="3" opacity="0.55" />
      </>
    )
  }
  return null
}
