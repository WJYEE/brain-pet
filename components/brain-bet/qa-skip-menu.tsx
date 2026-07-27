'use client'

import { MOCK_STAT_PRESETS, type MockStatPreset } from '@/lib/game/mock-finals'

const PRESET_LABEL: Record<MockStatPreset, string> = {
  random: '랜덤',
  balanced: '균형형',
  focus: '집중형',
  reaction: '순발형',
  memory: '기억형',
  judgment: '판단형',
  spatial: '공간형',
  reasoning: '추리형',
}

interface QaSkipMenuProps {
  onSkip: (preset: MockStatPreset) => void
  /** Dev-only "대표 펫 초기화" — wipes the stored representative-pet record (confirmed or not) so the next Skip/playthrough starts completely fresh. */
  onReset: () => void
}

/**
 * Dev/QA only — lets a developer skip all 6 mini-games and jump straight to
 * Hatch/Reveal with an auto-generated stat result (see lib/game/mock-finals.ts).
 * Rendered only when NEXT_PUBLIC_ENABLE_TEST_SKIP is on (see game-flow.tsx) —
 * never shown in a normal production build. Native <details> for the
 * dropdown so no new UI/animation library is needed; runs immediately on
 * click with no confirmation dialog, since visibility is already gated to
 * dev/QA builds only.
 */
export function QaSkipMenu({ onSkip, onReset }: QaSkipMenuProps) {
  return (
    <details className="fixed right-3 top-3 z-50 select-none">
      <summary
        className="cursor-pointer list-none rounded-full bg-card px-2.5 py-1 text-[10px] font-bold text-muted-foreground toy-border"
        title="개발용: 6개 미니게임을 건너뛰고 테스트 스탯을 생성합니다"
      >
        Skip · QA
      </summary>
      <div className="mt-1 flex w-28 flex-col gap-0.5 rounded-xl bg-card p-1.5 toy-border toy-shadow">
        {MOCK_STAT_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onSkip(preset)}
            className="rounded-lg px-2 py-1 text-left text-[11px] font-semibold text-foreground hover:bg-secondary"
          >
            {PRESET_LABEL[preset]}
          </button>
        ))}
        <div className="my-0.5 h-px bg-border" />
        <button
          type="button"
          onClick={onReset}
          title="localStorage에 저장된 대표 펫(확정 여부 무관)을 완전히 초기화합니다"
          className="rounded-lg px-2 py-1 text-left text-[11px] font-semibold text-destructive hover:bg-secondary"
        >
          대표 펫 초기화
        </button>
      </div>
    </details>
  )
}
