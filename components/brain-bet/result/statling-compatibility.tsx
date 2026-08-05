import { AssetImage } from '@/components/brain-bet/asset-image'
import { GamePanel } from '@/components/brain-bet/result/game-panel'
import type { CompatibilityCardCopy } from '@/lib/stats/stat-compatibility-copy'

interface StatlingCompatibilityProps {
  goodMatches: CompatibilityCardCopy[]
  differentRhythms: CompatibilityCardCopy[]
}

/**
 * One card per Statling: art on top, name, then the full blurb wrapping onto
 * as many lines as it needs. Stacked full-width in a single column (not a
 * side-by-side 2-column grid) so a 2-3 line blurb always has room to wrap
 * instead of getting clipped on a narrow mobile screen.
 */
function CompatibilityGroup({ title, cards }: { title: string; cards: CompatibilityCardCopy[] }) {
  return (
    <div>
      <p className="text-xs font-extrabold text-foreground">{title}</p>
      <ul className="mt-1.5 space-y-2">
        {cards.map((card) => (
          <li key={card.id} className="flex items-start gap-2 rounded-xl bg-secondary/50 p-2">
            <AssetImage src={card.characterImageSrc} alt={card.characterName} size={36} className="shrink-0" />
            <span className="min-w-0">
              <span className="block text-xs font-bold text-foreground">{card.characterName}</span>
              <span className="text-pretty block text-[11px] leading-snug text-muted-foreground">{card.reason}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * "궁합" — good matches and different-rhythm types merged into one panel,
 * each as its own full-width stacked group (not a side-by-side 2-column
 * grid — see CompatibilityGroup for why). Calculation is untouched: cards
 * are pre-built by lib/stats/stat-compatibility-copy.ts from
 * lib/pets/compatibility.ts's existing getStatCompatibility output; this
 * only adds each card's representative Statling idle art (see
 * getRepresentativeCharacterForStat) alongside the existing copy.
 */
export function StatlingCompatibility({ goodMatches, differentRhythms }: StatlingCompatibilityProps) {
  return (
    <GamePanel icon={<span aria-hidden="true">🤝</span>} label="궁합">
      <div className="flex flex-col gap-3">
        <CompatibilityGroup title="💕 잘 맞는 Statling" cards={goodMatches} />
        <CompatibilityGroup title="🎐 잘 안 맞는 Statling" cards={differentRhythms} />
      </div>
    </GamePanel>
  )
}
