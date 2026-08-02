import { STATLING_TYPES, type StatId } from '@/lib/brain-bet'
import {
  getDifferentRhythmBlurb,
  getGoodMatchBlurb,
  getStatTypeLabel,
} from '@/lib/pets/compatibility'
import { getRepresentativeCharacterForStat } from '@/lib/pets/pet-profile'

/**
 * Richer presentation copy for one compatibility card — pure composition
 * over lib/pets/compatibility.ts's existing calculation (getStatCompatibility)
 * and blurb tables. Never recomputes which stats are good matches/different
 * rhythms; only assembles the display fields (type name, label, trait,
 * reason, and a representative Statling's idle art) a card needs.
 */
export interface CompatibilityCardCopy {
  id: StatId
  /** e.g. "번쩍 타입" */
  typeName: string
  /** e.g. "순발형" */
  typeLabel: string
  /** Short trait line, reused from STATLING_TYPES so no new personality copy is invented. */
  trait: string
  /** One sentence on why this type is compatible/different, from the existing blurb tables. */
  reason: string
  /** This stat's representative Statling — see getRepresentativeCharacterForStat. */
  characterName: string
  characterImageSrc: string
}

function buildCard(id: StatId, reason: string): CompatibilityCardCopy {
  const character = getRepresentativeCharacterForStat(id)
  return {
    id,
    typeName: STATLING_TYPES[id].typeName,
    typeLabel: getStatTypeLabel(id),
    trait: STATLING_TYPES[id].personality,
    reason,
    characterName: character.name,
    characterImageSrc: character.imageSrc,
  }
}

export function buildGoodMatchCards(ids: StatId[]): CompatibilityCardCopy[] {
  return ids.map((id) => buildCard(id, getGoodMatchBlurb(id)))
}

export function buildDifferentRhythmCards(ids: StatId[]): CompatibilityCardCopy[] {
  return ids.map((id) => buildCard(id, getDifferentRhythmBlurb(id)))
}
