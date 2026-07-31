import { GamePanel } from '@/components/brain-bet/result/game-panel'
import type { CompatibilityCardCopy } from '@/lib/stats/stat-compatibility-copy'

interface StatlingCompatibilityProps {
  goodMatches: CompatibilityCardCopy[]
  differentRhythms: CompatibilityCardCopy[]
}

function CompatibilityColumn({ title, cards, dotClassName }: { title: string; cards: CompatibilityCardCopy[]; dotClassName: string }) {
  return (
    <div>
      <p className="text-xs font-extrabold text-foreground">{title}</p>
      <ul className="mt-1.5 space-y-2">
        {cards.map((card) => (
          <li key={card.id} className="flex items-start gap-1.5">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dotClassName}`} aria-hidden="true" />
            <span className="min-w-0">
              <span className="block text-xs font-bold text-foreground">{card.typeLabel}</span>
              <span className="block truncate text-[11px] leading-snug text-muted-foreground">{card.reason}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * "궁합" — good matches and different-rhythm types merged into one panel
 * (two compact columns instead of two separate card grids). Calculation is
 * untouched: cards are pre-built by lib/stats/stat-compatibility-copy.ts
 * from lib/pets/compatibility.ts's existing getStatCompatibility output.
 */
export function StatlingCompatibility({ goodMatches, differentRhythms }: StatlingCompatibilityProps) {
  return (
    <GamePanel icon={<span aria-hidden="true">🤝</span>} label="궁합">
      <div className="grid grid-cols-2 gap-3">
        <CompatibilityColumn title="잘 맞는 유형" cards={goodMatches} dotClassName="bg-primary" />
        <CompatibilityColumn title="다른 스타일" cards={differentRhythms} dotClassName="bg-muted-foreground" />
      </div>
    </GamePanel>
  )
}
