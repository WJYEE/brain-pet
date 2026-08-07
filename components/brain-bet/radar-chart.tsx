import type { CSSProperties, ReactNode } from 'react'
import { STATS, STAT_DISPLAY_ORDER, type StatId } from '@/lib/brain-bet'
import { cn } from '@/lib/utils'

interface RadarChartProps {
  /** Stat values 0–100 keyed by stat id. Missing/undefined — the whole object or individual keys — renders as 0 rather than throwing. */
  values: Record<StatId, number> | null | undefined
  /**
   * Which axes count as "discovered" yet — used by the per-game result
   * screen (CompleteScreen) to build up the chart one axis at a time as the
   * First Play run progresses. Omit entirely (MY STATUS, my-stats) to reveal
   * every axis as before.
   */
  revealedStats?: StatId[]
  /** The axis that was just revealed this render — gets a small pop-in highlight plus a brief center-to-point reveal trace, instead of appearing instantly. */
  newlyRevealedStat?: StatId
  /** Smaller badge/label sizing for tight layouts (e.g. CompleteScreen). */
  compact?: boolean
  /** Small decoration rendered dead-center of the chart (e.g. the growing egg on CompleteScreen). Purely presentational — never intercepts pointer events. */
  centerSlot?: ReactNode
  className?: string
}

const CENTER = 50
const CHART_R = 33
const LABEL_R = 46
const RINGS = [0.25, 0.5, 0.75, 1]

/** angle for axis i, starting at the top and going clockwise */
function angleFor(i: number, total: number) {
  return (-90 + (360 / total) * i) * (Math.PI / 180)
}

function pointAt(radius: number, angle: number) {
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  }
}

/** Six-axis radar / status chart built from computed geometry. */
export function RadarChart({
  values,
  revealedStats,
  newlyRevealedStat,
  compact,
  centerSlot,
  className,
}: RadarChartProps) {
  const stats = STAT_DISPLAY_ORDER
  const n = stats.length
  // undefined revealedStats means "reveal everything" — the original MY STATUS / my-stats behavior.
  const revealedSet = revealedStats ? new Set(revealedStats) : null
  const isRevealed = (id: StatId) => !revealedSet || revealedSet.has(id)
  // `values` itself missing (not just a missing key) shouldn't crash the chart — render every axis as 0 instead.
  const safeValues: Partial<Record<StatId, number>> = values ?? {}
  const valueFor = (id: StatId) => safeValues[id] ?? 0

  const outer = stats.map((_, i) => pointAt(CHART_R, angleFor(i, n)))
  const dataPts = stats.map((id, i) => {
    // Axes not yet discovered stay collapsed at the center, regardless of
    // whatever value happens to be sitting in `values[id]`.
    const v = isRevealed(id) ? Math.max(0, Math.min(100, valueFor(id))) : 0
    return pointAt((v / 100) * CHART_R, angleFor(i, n))
  })

  const toPoly = (pts: { x: number; y: number }[]) =>
    pts.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className={className}>
      <div
        className={cn(
          'relative mx-auto aspect-square w-full',
          compact ? 'max-w-[300px] sm:max-w-[340px]' : 'max-w-[440px]',
        )}
      >
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full overflow-visible"
          role="img"
          aria-label="Six-axis status radar chart"
        >
          {/* grid rings */}
          {RINGS.map((ring) => (
            <polygon
              key={ring}
              points={toPoly(stats.map((_, i) => pointAt(CHART_R * ring, angleFor(i, n))))}
              fill="none"
              stroke="var(--border)"
              strokeWidth={0.5}
            />
          ))}
          {/* axes */}
          {outer.map((p, i) => (
            <line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={p.x}
              y2={p.y}
              stroke="var(--border)"
              strokeWidth={0.5}
            />
          ))}
          {/* data area */}
          <polygon
            points={toPoly(dataPts)}
            fill="var(--primary)"
            fillOpacity={0.22}
            stroke="var(--primary)"
            strokeWidth={1.4}
            strokeLinejoin="round"
          />
          {/* newly revealed axis — a brief center-to-point trace so that stat
              visibly "fills in" instead of just appearing. Purely a reveal
              flourish drawn on top of the already-final polygon above, so it
              never needs to stay in sync with anything after it fades out. */}
          {(() => {
            if (!newlyRevealedStat) return null
            const idx = stats.indexOf(newlyRevealedStat)
            if (idx === -1 || !isRevealed(newlyRevealedStat)) return null
            const p = dataPts[idx]
            const dist = Math.hypot(p.x - CENTER, p.y - CENTER)
            if (dist <= 0.01) return null // stat measured at 0 — nothing to trace
            return (
              <line
                x1={CENTER}
                y1={CENTER}
                x2={p.x}
                y2={p.y}
                stroke={`var(${STATS[newlyRevealedStat].colorVar})`}
                strokeWidth={1.6}
                strokeLinecap="round"
                className="animate-radar-axis-fill"
                style={
                  {
                    strokeDasharray: dist,
                    strokeDashoffset: dist,
                    '--radar-axis-len': dist,
                  } as CSSProperties
                }
              />
            )
          })()}
          {/* data vertices — axes not yet discovered have no marker sitting at the collapsed center */}
          {dataPts.map((p, i) => {
            const id = stats[i]
            if (!isRevealed(id)) return null
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={1.8}
                fill="var(--card)"
                stroke={`var(${STATS[id].colorVar})`}
                strokeWidth={1.6}
                className={id === newlyRevealedStat ? 'animate-record-pop' : undefined}
              />
            )
          })}
        </svg>

        {/* labels positioned around the chart */}
        {stats.map((id, i) => {
          const p = pointAt(LABEL_R, angleFor(i, n))
          const stat = STATS[id]
          const Icon = stat.icon
          const revealed = isRevealed(id)
          return (
            <div
              key={id}
              className={cn(
                'absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 transition-opacity duration-300',
                !revealed && 'opacity-25',
                id === newlyRevealedStat && 'animate-record-pop',
              )}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <span
                className={cn(
                  'grid place-items-center rounded-xl toy-border text-[color:var(--ink)]',
                  compact ? 'h-6 w-6' : 'h-8 w-8',
                )}
                style={{ backgroundColor: revealed ? `var(${stat.colorVar})` : 'var(--muted)' } as CSSProperties}
              >
                <Icon size={compact ? 12 : 16} strokeWidth={2.4} />
              </span>
              <span
                className={cn(
                  'font-display font-extrabold leading-none text-foreground',
                  compact ? 'text-xs' : 'text-sm',
                )}
              >
                {revealed ? Math.round(valueFor(id)) : '?'}
              </span>
            </div>
          )
        })}

        {centerSlot && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            {centerSlot}
          </div>
        )}
      </div>
    </div>
  )
}
