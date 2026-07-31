import { GamePanel } from '@/components/brain-bet/result/game-panel'
import { STAT_DISPLAY_ORDER, STATS, type StatId } from '@/lib/brain-bet'

interface StatDistributionProps {
  finals: Record<StatId, number>
}

/**
 * Relative-only descriptors — never a percentile claim like "상위 12%".
 * `finals` values are real per-stat gameScore (see game-flow.tsx), but
 * there's still no cross-user population baseline to compare against, so
 * ranking stays purely relative to this user's own other 5 stats. Kept to
 * single short words so each stat fits on one HP-bar-style row.
 */
function describeRank(rank: number, total: number): string {
  if (rank === 0) return '최고'
  if (rank === 1) return '강함'
  if (rank >= total - 2) return '보완'
  return '균형'
}

/**
 * RPG status-window stat bars — one compact row per stat (icon + name +
 * meter + score), styled like an HP/MP gauge (inset track, glossy fill)
 * rather than a flat web progress bar. Chosen over a radar chart per spec
 * (radar reads well as an overview but poorly for scanning individual
 * values at a glance on mobile).
 */
export function StatDistribution({ finals }: StatDistributionProps) {
  const ranked = [...STAT_DISPLAY_ORDER].sort((a, b) => (finals[b] ?? 0) - (finals[a] ?? 0))
  const rankOf = new Map(ranked.map((id, index) => [id, index]))

  return (
    <GamePanel icon={<span aria-hidden="true">📊</span>} label="나의 6가지 스탯">
      <ul className="space-y-2.5">
        {STAT_DISPLAY_ORDER.map((id) => {
          const stat = STATS[id]
          const Icon = stat.icon
          const value = Math.max(0, Math.min(100, finals[id] ?? 0))
          const rank = rankOf.get(id) ?? STAT_DISPLAY_ORDER.length - 1

          return (
            <li key={id} className="flex items-center gap-2">
              <span className="flex w-18 shrink-0 items-center gap-1 text-xs font-bold text-foreground">
                <Icon size={13} strokeWidth={2.6} aria-hidden="true" />
                {stat.name}
              </span>
              <div
                className="h-3 flex-1 overflow-hidden rounded-md border border-foreground/20 bg-foreground/10 shadow-inner"
                role="progressbar"
                aria-label={`${stat.name} 스탯`}
                aria-valuenow={value}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-sm bg-linear-to-b from-white/45 via-transparent to-black/10"
                  style={{ width: `${value}%`, backgroundColor: `var(${stat.colorVar})` }}
                />
              </div>
              <span className="w-14 shrink-0 text-right text-[11px] font-bold text-muted-foreground">
                {describeRank(rank, STAT_DISPLAY_ORDER.length)} · {value}
              </span>
            </li>
          )
        })}
      </ul>
    </GamePanel>
  )
}
