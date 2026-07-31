import type { PetProfile } from '@/lib/pets/pet-profile'

/**
 * Dex-style rarity tier, purely a presentation label — never affects
 * matching/selection. Only 'common' is assigned today; the union already
 * has room for future tiers so a later rarity rule can be dropped into
 * getPetRarity without touching any display code that reads it.
 */
export type PetRarity = 'common' | 'rare' | 'epic' | 'legendary'

export const RARITY_LABEL: Record<PetRarity, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legend',
}

/** Every pet is Common for now — see the PetRarity doc comment. */
export function getPetRarity(_pet: PetProfile): PetRarity {
  return 'common'
}

/** e.g. "pet_013" -> "No.013". Falls back to the raw id if it has no digits. */
export function getDexNumber(pet: PetProfile): string {
  const digits = pet.id.match(/\d+/)?.[0]
  return digits ? `No.${digits.padStart(3, '0')}` : pet.id
}
