import { AlertTriangle, ThumbsUp } from 'lucide-react'
import { GamePanel } from '@/components/brain-bet/result/game-panel'
import type { StatInsight } from '@/lib/stats/stat-insights'

interface CharacterTraitsProps {
  insight: StatInsight
}

/**
 * "특징" — strengths and cautions merged into one panel (dashed divider,
 * not two separately-backed boxes) so it reads as one stat-sheet entry
 * instead of two stacked cards. Only the first 2 of each list are shown
 * (buildStatInsight itself is untouched and still returns up to 3/2 — this
 * is a display-only trim for the shorter RPG panel).
 */
export function CharacterTraits({ insight }: CharacterTraitsProps) {
  const strengths = insight.strengths.slice(0, 2)
  const cautions = insight.cautions.slice(0, 2)

  return (
    <GamePanel icon={<span aria-hidden="true">✨</span>} label="특징">
      <div className="flex items-center gap-1.5">
        <ThumbsUp size={15} strokeWidth={2.6} className="text-foreground" aria-hidden="true" />
        <span className="text-sm font-extrabold text-foreground">강점</span>
      </div>
      <ul className="mt-1.5 space-y-1">
        {strengths.map((item) => (
          <li key={item} className="text-[13px] leading-snug text-secondary-foreground">
            {item}
          </li>
        ))}
      </ul>

      <div className="my-3 border-t border-dashed border-foreground/20" />

      <div className="flex items-center gap-1.5">
        <AlertTriangle size={15} strokeWidth={2.6} className="text-foreground" aria-hidden="true" />
        <span className="text-sm font-extrabold text-foreground">주의</span>
      </div>
      <ul className="mt-1.5 space-y-1">
        {cautions.map((item) => (
          <li key={item} className="text-[13px] leading-snug text-muted-foreground">
            {item}
          </li>
        ))}
      </ul>
    </GamePanel>
  )
}
