'use client'

import { useState } from 'react'
import { ArrowLeft, CalendarCheck, Trophy, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type MissionTab = 'daily' | 'achievement'

const MISSION_TABS: { id: MissionTab; label: string }[] = [
  { id: 'daily', label: '일일 미션' },
  { id: 'achievement', label: '업적' },
]

interface MissionScreenProps {
  onBack: () => void
}

/** Home's 🎯 button destination — tabbed shell for 일일 미션 / 업적. Neither has real mission/achievement data yet, so each tab shows a placeholder (same "Coming Soon" language as ComingSoonScreen) until that system exists. */
export function MissionScreen({ onBack }: MissionScreenProps) {
  const [activeTab, setActiveTab] = useState<MissionTab>('daily')

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-5 pb-24 pt-8 sm:pb-10">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-card toy-border"
          aria-label="뒤로 가기"
        >
          <ArrowLeft size={18} strokeWidth={2.4} />
        </button>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">미션</p>
          <h1 className="font-display text-xl font-extrabold text-foreground">오늘의 미션을 확인해보세요</h1>
        </div>
      </header>

      <div role="tablist" aria-label="미션 카테고리" className="mt-6 flex gap-2">
        {MISSION_TABS.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 rounded-2xl px-4 py-2.5 text-sm font-bold toy-border transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div role="tabpanel" className="mt-6">
        {activeTab === 'daily' ? (
          <MissionEmptyState
            icon={CalendarCheck}
            title="일일 미션을 준비하고 있어요"
            message={'매일 새로운 미션이\n곧 찾아올 예정이에요.'}
          />
        ) : (
          <MissionEmptyState
            icon={Trophy}
            title="업적을 준비하고 있어요"
            message={'Statling과 함께한 발자취가\n업적으로 남을 예정이에요.'}
          />
        )}
      </div>
    </div>
  )
}

function MissionEmptyState({ icon: Icon, title, message }: { icon: LucideIcon; title: string; message: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-card px-6 py-12 text-center toy-border toy-shadow-sm">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-secondary-foreground toy-border">
        <Icon size={26} strokeWidth={2.2} />
      </span>
      <h2 className="mt-4 font-display text-base font-extrabold text-foreground">{title}</h2>
      <p className="mt-1.5 whitespace-pre-line text-pretty text-xs text-muted-foreground">{message}</p>
      <span className="mt-5 inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground toy-border">
        Coming Soon
      </span>
    </div>
  )
}
