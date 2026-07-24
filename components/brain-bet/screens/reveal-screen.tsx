'use client'

import { ArrowRight, Share2, Sparkles } from 'lucide-react'
import { CharacterImage } from '@/components/brain-bet/character-image'
import { Logo } from '@/components/brain-bet/logo'
import { ToyButton } from '@/components/brain-bet/toy-button'
import { STATLING_TYPES, STATS, type StatId } from '@/lib/brain-bet'

interface RevealScreenProps {
  topStat: StatId
  onContinue: () => void
}

export function RevealScreen({ topStat, onContinue }: RevealScreenProps) {
  const stat = STATS[topStat]
  const type = STATLING_TYPES[topStat]

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-5 py-10 text-center">
      <Logo size="sm" />

      <span className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground toy-border toy-shadow-sm">
        <Sparkles size={14} strokeWidth={2.6} />
        HATCH!
      </span>

      <h1 className="mt-4 text-balance font-display text-3xl font-extrabold text-foreground">
        나의 Statling이 태어났어요!
      </h1>

      <div className="relative mt-6">
        <div className="animate-pop-in">
          <CharacterImage type={topStat} size={180} />
        </div>
        {['-left-3 top-2', 'right-0 top-6', 'left-6 bottom-4'].map((pos, i) => (
          <span
            key={pos}
            className={`animate-sparkle-burst absolute text-2xl ${pos}`}
            style={{ animationDelay: `${300 + i * 130}ms` }}
            aria-hidden="true"
          >
            ✨
          </span>
        ))}
      </div>

      <p className="mt-2 font-display text-xl font-extrabold text-foreground">{type.typeName}</p>
      <p className="mt-2 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
        당신의 가장 강한 스탯은 <span className="font-bold text-foreground">{stat.name}</span>
        이에요.
        <br />
        {type.personality}
      </p>

      <div className="mt-8 flex w-full flex-col gap-3">
        <ToyButton className="w-full" onClick={onContinue}>
          저장하기
          <ArrowRight size={20} strokeWidth={2.8} />
        </ToyButton>
        <ToyButton
          variant="secondary"
          disabled
          title="공유 기능은 곧 추가돼요"
          className="w-full"
        >
          <Share2 size={18} strokeWidth={2.4} />
          공유하기 (준비 중)
        </ToyButton>
      </div>
    </div>
  )
}
