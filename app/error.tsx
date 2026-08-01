'use client'

import { useEffect } from 'react'
import { RotateCcw } from 'lucide-react'
import { Logo } from '@/components/brain-bet/logo'
import { ToyButton } from '@/components/brain-bet/toy-button'

/**
 * Next.js App Router error boundary (file-convention: app/error.tsx) —
 * catches any render/runtime error thrown below the root layout (e.g. a
 * corrupted localStorage value slipping past a storage module's own guards)
 * and shows this instead of a blank white screen. `reset()` re-renders the
 * segment; since GameFlow's own phase state lives in memory, a real recovery
 * for a bad persisted value also needs the reload below.
 */
export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-5 py-10 text-center">
      <Logo size="sm" />
      <h1 className="mt-8 text-balance font-display text-2xl font-extrabold leading-snug text-foreground">
        문제가 생겼어요.
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        예상치 못한 오류가 발생했어요. 다시 시도해도 계속되면 새로고침해주세요.
      </p>

      <div className="mt-8 flex w-full flex-col gap-3">
        <ToyButton className="w-full" onClick={reset}>
          <RotateCcw size={18} strokeWidth={2.6} />
          다시 시도하기
        </ToyButton>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-sm font-bold text-muted-foreground underline-offset-4 hover:underline"
        >
          새로고침
        </button>
      </div>
    </div>
  )
}
