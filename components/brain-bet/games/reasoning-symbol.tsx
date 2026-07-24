import type { ReasoningShape, ReasoningSymbolSpec } from '@/lib/game/reasoning-templates'

interface ShapeGlyphProps {
  shape: ReasoningShape
  cx: number
  cy: number
  r: number
  color: string
  rotationDeg: number
}

/** One filled glyph at a given point — rotation only visibly matters for non-circular shapes, which is why every rotation Template in reasoning-templates.ts fixes shape to 'triangle'. */
function ShapeGlyph({ shape, cx, cy, r, color, rotationDeg }: ShapeGlyphProps) {
  const transform = rotationDeg !== 0 ? `rotate(${rotationDeg} ${cx} ${cy})` : undefined
  const common = { fill: color, stroke: 'var(--ink)', strokeWidth: 2 }
  if (shape === 'circle') return <circle cx={cx} cy={cy} r={r} {...common} />
  if (shape === 'square') {
    return <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} rx={r * 0.2} transform={transform} {...common} />
  }
  if (shape === 'triangle') {
    return <polygon points={`${cx},${cy - r} ${cx + r},${cy + r} ${cx - r},${cy + r}`} transform={transform} {...common} />
  }
  return <polygon points={`${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`} transform={transform} {...common} />
}

/** Fixed quadrant anchors used by Position-attribute symbols, within a 64x64 viewBox. */
const QUADRANT_COORDS: [number, number][] = [
  [18, 18],
  [46, 18],
  [18, 46],
  [46, 46],
]

interface ReasoningSymbolViewProps {
  symbol: ReasoningSymbolSpec
  color: string
  size?: number
}

/**
 * CSS/SVG-only Sequence-cell renderer. Two modes:
 * - Position mode (symbol.position !== null): a single glyph sits at one of
 *   4 fixed quadrant anchors, with the other 3 shown as faint dashed
 *   reference circles so the movement across cells reads clearly.
 * - Count mode (symbol.position === null, the common case): `count` copies
 *   of the shape are laid out in a small procedural grid (up to 4 per row,
 *   wrapping), so count can grow beyond 4 without a hand-authored position
 *   table per count.
 */
export function ReasoningSymbolView({ symbol, color, size = 64 }: ReasoningSymbolViewProps) {
  if (symbol.position !== null) {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        {QUADRANT_COORDS.map(([cx, cy], i) =>
          i === symbol.position ? null : (
            <circle key={i} cx={cx} cy={cy} r={5} fill="none" stroke="var(--border)" strokeWidth={1.5} strokeDasharray="2 2" />
          ),
        )}
        <ShapeGlyph
          shape={symbol.shape}
          cx={QUADRANT_COORDS[symbol.position][0]}
          cy={QUADRANT_COORDS[symbol.position][1]}
          r={9}
          color={color}
          rotationDeg={symbol.rotationDeg}
        />
      </svg>
    )
  }

  const cols = Math.min(symbol.count, 4)
  const rows = Math.ceil(symbol.count / cols)
  const cellW = 64 / (cols + 1)
  const cellH = 64 / (rows + 1)
  const r = Math.min(cellW, cellH) * 0.38
  const positions: [number, number][] = Array.from({ length: symbol.count }, (_, i) => {
    const row = Math.floor(i / cols)
    const col = i % cols
    return [(col + 1) * cellW, (row + 1) * cellH]
  })

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      {positions.map(([cx, cy], i) => (
        <ShapeGlyph key={i} shape={symbol.shape} cx={cx} cy={cy} r={r} color={color} rotationDeg={symbol.rotationDeg} />
      ))}
    </svg>
  )
}
