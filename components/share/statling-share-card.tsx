import { forwardRef } from 'react'
import { Egg } from 'lucide-react'
import type { PetProfile } from '@/lib/pets/pet-profile'

export interface StatlingShareCardProps {
  petProfile: PetProfile
  primaryStatName: string
  secondaryStatName: string
  /** Short line at the bottom of the card — the service URL or a brief invite, per spec section 4. */
  serviceLabel: string
}

/**
 * Off-screen capture target for html-to-image (see
 * lib/share/create-share-image.ts) — never meant to be visible. Rendered at
 * its literal target pixel size (1080x1350, a 4:5 ratio that works for both
 * an Instagram feed post and a mobile share-sheet preview) so no
 * pixelRatio/scaling math is needed at capture time.
 *
 * `opacity-0` (not `display:none`) on the OUTER wrapper is intentional:
 * html-to-image needs the card actually laid out to capture it. Critically,
 * the opacity/hiding lives on the outer wrapper, never on the node `ref`
 * points at — html-to-image captures a node's own computed style verbatim,
 * so putting `opacity-0` directly on the ref target produced a fully
 * transparent/blank PNG (caught via a real captured-image visual check).
 * `aria-hidden` + `inert` keep the wrapper out of the accessibility tree and
 * tab order; `pointer-events-none` plus fixed off-canvas positioning keep it
 * fully inert visually too.
 *
 * Reuses the app's existing Tailwind utility classes (toy-border, bg-card,
 * font-display, …) since it's rendered in the same document/stylesheet as
 * everything else — no separate style system to keep in sync.
 */
export const StatlingShareCard = forwardRef<HTMLDivElement, StatlingShareCardProps>(
  function StatlingShareCard({ petProfile, primaryStatName, secondaryStatName, serviceLabel }, ref) {
    return (
      <div
        aria-hidden="true"
        inert
        className="pointer-events-none fixed left-0 top-0 -z-50 opacity-0"
        style={{ width: 1080, height: 1350 }}
      >
        <div
          ref={ref}
          className="flex h-full w-full flex-col items-center justify-between bg-background px-20 py-24 text-center"
        >
          <div className="flex items-center gap-5">
            <span className="grid h-24 w-24 place-items-center rounded-[2rem] bg-primary text-primary-foreground toy-border toy-shadow-lg">
              <Egg size={52} strokeWidth={2.4} />
            </span>
            <span className="font-display text-6xl font-extrabold text-foreground">Statling</span>
          </div>

          <span className="rounded-full bg-accent px-9 py-4 font-display text-3xl font-bold text-accent-foreground toy-border toy-shadow-sm">
            나의 스탯링
          </span>

          <img
            src={petProfile.imageSrc}
            alt=""
            width={440}
            height={440}
            className="h-[440px] w-[440px] object-contain"
          />

          <div>
            <p className="font-display text-7xl font-extrabold text-foreground">{petProfile.name}</p>
            <p className="mx-auto mt-5 max-w-4xl text-3xl leading-relaxed text-muted-foreground">
              {petProfile.tagline}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <span className="rounded-2xl bg-card px-8 py-5 text-3xl font-bold text-foreground toy-border toy-shadow-sm">
              ⚡ 주 스탯 {primaryStatName}
            </span>
            <span className="rounded-2xl bg-card px-8 py-5 text-3xl font-bold text-foreground toy-border toy-shadow-sm">
              ⚖ 보조 스탯 {secondaryStatName}
            </span>
          </div>

          <p className="font-display text-2xl font-bold text-muted-foreground">{serviceLabel}</p>
        </div>
      </div>
    )
  },
)
