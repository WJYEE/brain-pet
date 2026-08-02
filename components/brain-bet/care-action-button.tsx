import type { CareActionDef } from '@/lib/room'
import type { CooldownStatus } from '@/lib/pet-care/actions'
import { cn } from '@/lib/utils'

interface CareActionButtonProps {
  action: CareActionDef
  cooldown: CooldownStatus
  showAttentionDot: boolean
  onClick: () => void
  /** Extra disable condition beyond the action's own cooldown — e.g. briefly locked during a minigame-result reaction. No countdown badge shown for this (it's not a cooldown, just a short freeze). */
  disabled?: boolean
}

export function CareActionButton({ action, cooldown, showAttentionDot, onClick, disabled = false }: CareActionButtonProps) {
  const Icon = action.icon
  const remainingSeconds = Math.ceil(cooldown.remainingMs / 1000)
  const isDisabled = cooldown.onCooldown || disabled

  return (
    <button
      type="button"
      data-sfx-skip
      onClick={onClick}
      disabled={isDisabled}
      aria-label={cooldown.onCooldown ? `${action.label} (${remainingSeconds}초 후 가능)` : action.label}
      className={cn(
        'relative flex min-h-13 flex-col items-center justify-center gap-0.5 rounded-2xl bg-card px-1 py-1.5 toy-border transition-transform sm:min-h-16 sm:gap-1 sm:py-2.5',
        isDisabled ? 'cursor-not-allowed opacity-50' : 'active:translate-y-0.5',
      )}
    >
      <Icon size={22} />
      <span className="text-[11px] font-bold text-foreground">{action.shortLabel}</span>

      {cooldown.onCooldown ? (
        <span className="absolute -top-2 rounded-full bg-secondary px-2 py-0.5 text-[9px] font-bold text-secondary-foreground toy-border">
          {remainingSeconds}s
        </span>
      ) : (
        showAttentionDot && (
          <span
            aria-hidden="true"
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive"
          />
        )
      )}
    </button>
  )
}
