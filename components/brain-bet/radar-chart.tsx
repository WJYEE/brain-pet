import type { CSSProperties } from 'react'
import { STATS, STAT_DISPLAY_ORDER, type StatId } from '@/lib/brain-bet'

interface RadarChartProps {
  /** Stat values 0–100 keyed by stat id. */
  values: Record<StatId, number>
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
export function RadarChart({ values, className }: RadarChartProps) {
  const stats = STAT_DISPLAY_ORDER
  const n = stats.length

  const outer = stats.map((_, i) => pointAt(CHART_R, angleFor(i, n)))
  const dataPts = stats.map((id, i) => {
    const v = Math.max(0, Math.min(100, values[id] ?? 0))
    return pointAt((v / 100) * CHART_R, angleFor(i, n))
  })

  const toPoly = (pts: { x: number; y: number }[]) =>
    pts.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className={className}>
      <div className="relative mx-auto aspect-square w-full max-w-[440px]">
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
          {/* data vertices */}
          {dataPts.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={1.8}
              fill="var(--card)"
              stroke={`var(${STATS[stats[i]].colorVar})`}
              strokeWidth={1.6}
            />
          ))}
        </svg>

        {/* labels positioned around the chart */}
        {stats.map((id, i) => {
          const p = pointAt(LABEL_R, angleFor(i, n))
          const stat = STATS[id]
          const Icon = stat.icon
          return (
            <div
              key={id}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <span
                className="grid h-8 w-8 place-items-center rounded-xl toy-border text-[color:var(--ink)]"
                style={{ backgroundColor: `var(${stat.colorVar})` } as CSSProperties}
              >
                <Icon size={16} strokeWidth={2.4} />
              </span>
              <span className="font-display text-sm font-extrabold leading-none text-foreground">
                {Math.round(values[id] ?? 0)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
