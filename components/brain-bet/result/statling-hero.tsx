import { Sparkles } from 'lucide-react'
import { AssetImage } from '@/components/brain-bet/asset-image'
import { StatBadge } from '@/components/brain-bet/stat-badge'
import type { StatDef } from '@/lib/brain-bet'
import { getDexNumber, getPetRarity, RARITY_LABEL } from '@/lib/pets/pet-rarity'
import type { PetProfile } from '@/lib/pets/pet-profile'

interface StatlingHeroProps {
  petProfile: PetProfile
  topStat: StatDef
  secondaryStat: StatDef
  typeName: string
  /** One-sentence core trait line (buildCoreTraitSummary output). */
  coreTrait: string
}

/**
 * The "character get" panel — a Pokédex-style status frame, not a SaaS hero
 * banner. The pet portrait is the single largest thing on the page by
 * design (spec: the pet, not the text, must be what a user sees first).
 * Dex number + rarity chip are purely cosmetic (see lib/pets/pet-rarity.ts)
 * and never feed into matching/selection.
 */
export function StatlingHero({ petProfile, topStat, secondaryStat, typeName, coreTrait }: StatlingHeroProps) {
  const dexNumber = getDexNumber(petProfile)
  const rarity = getPetRarity(petProfile)

  return (
    <div className="flex w-full flex-col items-center">
      <span className="inline-flex items-center gap-1 font-display text-xs font-bold text-muted-foreground">
        <Sparkles size={13} strokeWidth={2.8} aria-hidden="true" />
        새로운 Statling 획득!
      </span>

      <div className="relative mt-2 flex w-full flex-col items-center rounded-3xl border-2 border-foreground/20 bg-card px-5 pb-6 pt-4 text-center toy-shadow-sm">
        <div className="flex w-full items-center justify-between">
          <span className="rounded-md bg-secondary px-2 py-0.5 font-display text-xs font-extrabold tracking-wide text-secondary-foreground">
            {dexNumber}
          </span>
          <span className="rounded-md bg-accent px-2 py-0.5 font-display text-xs font-extrabold text-accent-foreground toy-border">
            {RARITY_LABEL[rarity]}
          </span>
        </div>

        {/* Keyed by pet id so rerolling remounts this subtree and replays
            the pop-in/sparkle entrance for the newly-shown pet. */}
        <div key={petProfile.id} className="relative mt-1">
          <div className="animate-pop-in">
            <div className="animate-float">
              <AssetImage src={petProfile.imageSrc} alt={petProfile.name} size={220} />
            </div>
          </div>
          {['-left-4 top-4', 'right-0 top-8', 'left-8 bottom-6'].map((pos, i) => (
            <span
              key={pos}
              className={`animate-sparkle-burst absolute text-2xl ${pos}`}
              style={{ animationDelay: `${300 + i * 130}ms` }}
              aria-hidden="true"
            >
              ✨
            </span>
          ))}
        </div>

        <h1 className="mt-1 font-display text-2xl font-extrabold text-foreground">{petProfile.name}</h1>
        <p className="text-sm font-bold text-primary">{typeName}</p>

        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1">
            <StatBadge stat={topStat} size="xs" />
            <span className="text-xs font-bold text-secondary-foreground">{topStat.name}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1">
            <StatBadge stat={secondaryStat} size="xs" />
            <span className="text-xs font-bold text-secondary-foreground">{secondaryStat.name}</span>
          </span>
        </div>

        <p className="mt-4 max-w-xs text-pretty text-balance font-display text-lg font-bold leading-snug text-foreground">
          &ldquo;{coreTrait}&rdquo;
        </p>
      </div>
    </div>
  )
}
