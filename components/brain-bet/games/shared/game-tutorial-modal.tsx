'use client'

import { useEffect } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { ToyButton } from '@/components/brain-bet/toy-button'
import { useSound } from '@/hooks/use-sound'

export interface TutorialContent {
  goal: string
  steps: string[]
  scoring: string
  example?: string
}

interface GameTutorialModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gameName: string
  tutorial: TutorialContent
  /** "시작하기" before the first play, "계속하기" once already mid-game. */
  continueLabel: string
}

/**
 * Opt-in "게임 방법" modal shared by every new mini-game (spec §3: never
 * forced on first entry, only shown via the HUD's "?" button). Built on
 * @base-ui/react's Dialog — same primitive as ConfirmDialog/ShareFallbackModal
 * elsewhere in this codebase, so focus trap / Escape-to-close / aria-modal
 * and focus-return-to-trigger all come for free instead of being
 * reimplemented per game. The caller is responsible for pausing its own
 * timer while `open` is true and resuming when it flips back to false.
 */
export function GameTutorialModal({ open, onOpenChange, gameName, tutorial, continueLabel }: GameTutorialModalProps) {
  const { play } = useSound()

  useEffect(() => {
    if (open) play('modal-open')
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire only on the open:false->true transition
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[110] bg-black/40 transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
        <Dialog.Popup
          aria-label={`${gameName} 게임 방법`}
          className="fixed left-1/2 top-1/2 z-[120] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-card p-5 text-left toy-border toy-shadow-lg transition-all duration-200 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0"
        >
          <div className="flex items-start justify-between gap-3">
            <Dialog.Title className="font-display text-lg font-extrabold text-foreground">
              {gameName} 게임 방법
            </Dialog.Title>
            <Dialog.Close
              aria-label="게임 방법 닫기"
              data-sfx-skip
              onClick={() => play('ui-back')}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground toy-border"
            >
              <X size={16} strokeWidth={2.6} />
            </Dialog.Close>
          </div>

          <div className="mt-3 space-y-3 text-sm text-foreground">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">목표</p>
              <p className="mt-0.5 leading-relaxed">{tutorial.goal}</p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">조작 방법</p>
              <ul className="mt-0.5 list-inside list-disc space-y-0.5 leading-relaxed">
                {tutorial.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">점수 기준</p>
              <p className="mt-0.5 leading-relaxed">{tutorial.scoring}</p>
            </div>

            {tutorial.example && (
              <div className="rounded-2xl bg-secondary px-3 py-2.5">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">예시</p>
                <p className="mt-0.5 leading-relaxed text-secondary-foreground">{tutorial.example}</p>
              </div>
            )}
          </div>

          <ToyButton className="mt-4 w-full" onClick={() => onOpenChange(false)}>
            {continueLabel}
          </ToyButton>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
