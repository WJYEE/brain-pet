import type { PetInteractionMode } from '@/lib/pet-care/types'

export interface InteractionModeFlags {
  hasLevelUp: boolean
  hasGameReaction: boolean
  hasUserAction: boolean
  hasSpeaking: boolean
  hasAutonomousMotion: boolean
}

/**
 * A pure, display-only derivation — NOT the thing that gates whether a hook
 * may start something new (that gating is done via each hook's own
 * `suppressed` prop, computed inline in room-screen.tsx from the priority
 * chain: care -> memory -> initiatedDialogue -> autonomy, so no circular
 * "mode feeds back into the hooks that produced it" dependency ever
 * exists). This function only answers "what should a debug/status
 * indicator show right now", per the priority order:
 * levelUp > gameReaction > userAction > speaking > autonomous > idle.
 */
export function computeInteractionMode(flags: InteractionModeFlags): PetInteractionMode {
  if (flags.hasLevelUp) return 'levelUp'
  if (flags.hasGameReaction) return 'gameReaction'
  if (flags.hasUserAction) return 'userAction'
  if (flags.hasSpeaking) return 'speaking'
  if (flags.hasAutonomousMotion) return 'autonomous'
  return 'idle'
}
