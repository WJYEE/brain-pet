'use client'

import { useState } from 'react'
import { Lock, Mail } from 'lucide-react'
import { Logo } from '@/components/brain-bet/logo'
import { ToyButton } from '@/components/brain-bet/toy-button'

interface SaveScreenProps {
  onContinue: () => void
  onSkip: () => void
}

/**
 * Post-hatch save/login placeholder. No real auth is wired up yet — every
 * action here (Google, email, or skip) advances the flow the same way.
 */
export function SaveScreen({ onContinue, onSkip }: SaveScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-5 py-10 text-center">
      <Logo size="sm" />
      <h1 className="mt-8 text-balance font-display text-2xl font-extrabold leading-snug text-foreground">
        이 친구를 잃어버리지 않도록
        <br />
        저장해둘까요?
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        로그인하면 어디서든 Statling을 이어서 만날 수 있어요.
      </p>

      <div className="mt-8 w-full space-y-3">
        <ToyButton className="w-full" onClick={onContinue}>
          Google로 저장하기
        </ToyButton>

        <div className="flex items-center gap-3 py-1 text-xs font-semibold text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          또는
          <span className="h-px flex-1 bg-border" />
        </div>

        <label className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3 toy-border">
          <Mail size={18} strokeWidth={2.2} className="shrink-0 text-muted-foreground" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
        <label className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3 toy-border">
          <Lock size={18} strokeWidth={2.2} className="shrink-0 text-muted-foreground" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
        <ToyButton variant="secondary" className="w-full" onClick={onContinue}>
          이메일로 계속하기
        </ToyButton>
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="mt-6 text-sm font-bold text-muted-foreground underline-offset-4 hover:underline"
      >
        나중에 하기
      </button>
    </div>
  )
}
