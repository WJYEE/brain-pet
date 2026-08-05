'use client'

import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { Check } from 'lucide-react'
import { ToyButton } from '@/components/brain-bet/toy-button'
import { markOnboardingSeen } from '@/lib/onboarding-storage'
import { cn } from '@/lib/utils'

interface OnboardingModalProps {
  open: boolean
  onClose: () => void
}

const TABS = [
  { emoji: '🎮', title: '미니게임', desc: '홈 탭 "성장하기"로 플레이해보세요' },
  { emoji: '📊', title: '내 스탯', desc: '현재 나의 6가지 능력을 확인할 수 있어요.' },
  { emoji: '🐾', title: 'Statling', desc: '내 펫을 꾸미고 성장시켜보세요.' },
  { emoji: '🏠', title: 'Room', desc: '돌보고, 꾸미고, 함께 시간을 보내세요.' },
  { emoji: '🏆', title: '랭킹', desc: '다른 사람들과 기록을 비교해보세요.' },
  { emoji: '⚙️', title: '마이페이지', desc: '설정과 피드백을 남길 수 있어요.' },
]

/**
 * One-card first-visit walkthrough — a single modal, no multi-page
 * tutorial, meant to be readable in ~10 seconds. Shown once (see
 * lib/onboarding-storage.ts + the trigger in game-flow.tsx) unless
 * "다시 보지 않기" is unchecked, and reachable again anytime from
 * MyPageScreen's "온보딩 다시 보기" row.
 */
export function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(true)

  function handleClose() {
    if (dontShowAgain) markOnboardingSeen()
    onClose()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && handleClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[110] bg-black/40 transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-[120] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-card p-5 text-left toy-border toy-shadow-lg transition-all duration-200 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0">
          <Dialog.Title className="font-display text-lg font-extrabold text-foreground">
            Statling에 오신 것을 환영해요!
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-xs text-muted-foreground">
            나의 성장을 함께할 작은 친구가 기다리고 있어요.
          </Dialog.Description>

          <ul className="mt-3 flex flex-col gap-1.5">
            {TABS.map((tab) => (
              <li key={tab.title} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-0.5 text-base leading-none">
                  {tab.emoji}
                </span>
                <p className="text-xs leading-snug">
                  <span className="font-bold text-foreground">{tab.title}</span>{' '}
                  <span className="text-muted-foreground">{tab.desc}</span>
                </p>
              </li>
            ))}
          </ul>

          <p className="mt-3 text-[11px] font-semibold text-muted-foreground">
            처음에는 Intro를 통해 나만의 Statling이 태어나요.
          </p>

          <ToyButton className="mt-4 w-full justify-center px-4 py-3 text-sm" data-sfx-skip onClick={handleClose}>
            좋아요, 시작할게요
          </ToyButton>

          <label className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <button
              type="button"
              role="checkbox"
              aria-checked={dontShowAgain}
              onClick={() => setDontShowAgain((v) => !v)}
              className={cn(
                'grid h-4 w-4 shrink-0 place-items-center rounded border-2',
                dontShowAgain ? 'border-primary bg-primary text-primary-foreground' : 'border-[color:var(--ink)]',
              )}
            >
              {dontShowAgain && <Check size={11} strokeWidth={3} />}
            </button>
            다시 보지 않기
          </label>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
