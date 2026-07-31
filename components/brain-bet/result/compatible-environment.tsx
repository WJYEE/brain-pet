import { GamePanel } from '@/components/brain-bet/result/game-panel'
import type { StatInsight } from '@/lib/stats/stat-insights'

interface CompatibleEnvironmentProps {
  insight: StatInsight
}

/**
 * "잘 맞는 환경" — learningStyle + workStyle merged into one compact list
 * (was two separate 2-column panels). Only the first 2 of each are shown,
 * same display-only trim rationale as CharacterTraits.
 */
export function CompatibleEnvironment({ insight }: CompatibleEnvironmentProps) {
  const items = [...insight.learningStyle.slice(0, 2), ...insight.workStyle.slice(0, 1)]

  return (
    <GamePanel icon={<span aria-hidden="true">📚</span>} label="잘 맞는 환경">
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-1.5 text-[13px] leading-snug text-secondary-foreground">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </GamePanel>
  )
}
