import { AssetImage } from '@/components/brain-bet/asset-image'
import { GamePanel } from '@/components/brain-bet/result/game-panel'
import type { CompatibilityCardCopy } from '@/lib/stats/stat-compatibility-copy'

interface StatlingCompatibilityProps {
  goodMatches: CompatibilityCardCopy[]
  differentRhythms: CompatibilityCardCopy[]
}

/** One compact row: the representative Statling's idle art plus its name and the existing blurb — kept small (28px art) so two columns of these still read as one glanceable panel, not a second character-reveal screen. */
function CompatibilityColumn({ title, cards }: { title: string; cards: CompatibilityCardCopy[] }) {
  return (
    <div>
      <p className="text-xs font-extrabold text-foreground">{title}</p>
      <ul className="mt-1.5 space-y-2">
        {cards.map((card) => (
          <li key={card.id} className="flex items-center gap-1.5">
            <AssetImage src={card.characterImageSrc} alt={card.characterName} size={28} className="shrink-0" />
            <span className="min-w-0">
              <span className="block truncate text-xs font-bold text-foreground">{card.characterName}</span>
              <span className="block truncate text-[10px] leading-snug text-muted-foreground">{card.reason}</span>
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
 * from lib/pets/compatibility.ts's existing getStatCompatibility output;
 * this only adds each card's representative Statling idle art (see
 * getRepresentativeCharacterForStat) alongside the existing copy.
 */
export function StatlingCompatibility({ goodMatches, differentRhythms }: StatlingCompatibilityProps) {
  return (
    <GamePanel icon={<span aria-hidden="true">🤝</span>} label="궁합">
      <div className="grid grid-cols-2 gap-3">
        <CompatibilityColumn title="💕 잘 맞는 Statling" cards={goodMatches} />
        <CompatibilityColumn title="🎐 다른 스타일 Statling" cards={differentRhythms} />
      </div>
    </GamePanel>
  )
}
