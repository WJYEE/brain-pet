'use client'

import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { Check, Copy, X } from 'lucide-react'
import { ToyButton } from '@/components/brain-bet/toy-button'

interface ShareFallbackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  text: string
  url: string
}

/**
 * Last-resort share UI, shown whenever every automated tier in
 * lib/share/share-statling-result.ts's fallback chain (file share -> text
 * share -> clipboard) comes up short — the 'manual-copy' outcome. Shows
 * the share text so the user can select and copy it themselves. Built on
 * @base-ui/react's Dialog (already a project dependency), styled to match
 * the existing "toy" design system.
 */
export function ShareFallbackModal({ open, onOpenChange, title, text, url }: ShareFallbackModalProps) {
  const [copied, setCopied] = useState(false)
  const fullText = `${text}\n\n${url}`

  const handleCopyAttempt = async () => {
    try {
      await navigator.clipboard.writeText(fullText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard still unavailable — the selectable textarea below is the real fallback
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[110] bg-black/40 transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-[120] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-card p-5 text-left toy-border toy-shadow-lg transition-all duration-200 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0">
          <div className="flex items-start justify-between gap-3">
            <Dialog.Title className="font-display text-base font-extrabold text-foreground">
              {title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="닫기"
              className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-foreground"
            >
              <X size={18} strokeWidth={2.4} />
            </Dialog.Close>
          </div>

          <Dialog.Description className="mt-1 text-xs text-muted-foreground">
            아래 내용을 직접 선택해 복사할 수 있어요.
          </Dialog.Description>

          <textarea
            readOnly
            value={fullText}
            onFocus={(e) => e.currentTarget.select()}
            rows={6}
            className="mt-3 w-full resize-none rounded-2xl bg-secondary px-3 py-2.5 text-xs leading-relaxed text-secondary-foreground toy-border outline-none"
          />

          <ToyButton className="mt-4 w-full" onClick={handleCopyAttempt}>
            {copied ? (
              <>
                <Check size={18} strokeWidth={2.8} />
                복사됨
              </>
            ) : (
              <>
                <Copy size={18} strokeWidth={2.4} />
                복사하기
              </>
            )}
          </ToyButton>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
