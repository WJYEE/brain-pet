import { AUTONOMOUS_ACTION_HOLD_MS } from '@/lib/config/pet-autonomy.config'
import { animationForAutonomousAction, zoneAfter } from '@/lib/pet-care/autonomous-action-selector'
import type { InitiatedDialogueCategory } from '@/lib/pet-care/initiated-dialogue'
import type { AutonomousActionId, PetAnimation, PetZone } from '@/lib/pet-care/types'

const REQUEST_DIALOGUE_BY_ACTION: Partial<Record<AutonomousActionId, InitiatedDialogueCategory>> = {
  askFood: 'hungryRequest',
  askPlay: 'playRequest',
  askAttention: 'attentionRequest',
}

export interface AutonomousActionOutcome {
  animation: PetAnimation
  zone: PetZone
  holdMs: number
  /** Only set for askFood/askPlay/askAttention — the caller (hooks/use-pet-autonomy.ts) forwards this to usePetInitiatedDialogue.trigger instead of speaking directly, so the "request" intent is never voiced twice. */
  requestDialogueCategory?: InitiatedDialogueCategory
  /** Only set for sleep/playAlone — the tiny stat bonus those two autonomous actions can grant (capped daily, see PetMemory.autonomyBonusToday). */
  bonusKind?: 'sleep' | 'playAlone'
}

export function resolveAutonomousOutcome(action: AutonomousActionId, currentZone: PetZone): AutonomousActionOutcome {
  return {
    animation: animationForAutonomousAction(action),
    zone: zoneAfter(currentZone, action),
    holdMs: AUTONOMOUS_ACTION_HOLD_MS[action],
    requestDialogueCategory: REQUEST_DIALOGUE_BY_ACTION[action],
    bonusKind: action === 'sleep' ? 'sleep' : action === 'playAlone' ? 'playAlone' : undefined,
  }
}
