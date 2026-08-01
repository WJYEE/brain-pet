'use client'

import { TESTER_CHARACTER_FOLDERS } from '@/lib/character-state-assets'
import { MOCK_STAT_PRESETS, type MockStatPreset } from '@/lib/game/mock-finals'

/** 'random' -> '랜덤'; every other preset is a character id (e.g. '01_치즈털실냥이') already in the exact label form the QA menu should show. */
function presetLabel(preset: MockStatPreset): string {
  return preset === 'random' ? '랜덤' : preset
}

interface QaSkipMenuProps {
  onSkip: (preset: MockStatPreset) => void
  /** Dev-only "대표 펫 초기화" — wipes the stored representative-pet record (confirmed or not) so the next Skip/playthrough starts completely fresh. */
  onReset: () => void
  /** Dev-only "도감 30종 잠금해제" — marks all 30 characters as met in the local dex (see lib/pets/dex-storage.ts), so DexScreen's full grid can be previewed without hatching/sharing 30 times. */
  onUnlockDex: () => void
  /**
   * Dev/QA only — which TESTER_CHARACTER_FOLDERS entry (if any) is pinned as
   * the Room character right now, so every 24-state asset can be checked
   * against real interactions. See pet-mood-view.tsx.
   */
  testerFolderId: string | null
  onToggleTesterFolder: (folderId: string) => void
}

/**
 * Dev/QA only — lets a developer skip all 6 mini-games and jump straight to
 * Hatch/Reveal with an auto-generated stat result (see lib/game/mock-finals.ts).
 * The 31 buttons below are '랜덤' plus one per character (e.g.
 * '01_치즈털실냥이') — clicking a character button generates finals
 * engineered so that exact character hatches, letting a dev jump straight to
 * any of the 30 without hunting for the right stat combination. Rendered
 * only when NEXT_PUBLIC_ENABLE_TEST_SKIP is on (see game-flow.tsx) — never
 * shown in a normal production build. Native <details> for the dropdown so
 * no new UI/animation library is needed; runs immediately on click with no
 * confirmation dialog, since visibility is already gated to dev/QA builds
 * only. The list scrolls (max-h) since 31 hatch buttons + 30 tester-folder
 * buttons is too tall to fit on screen otherwise.
 */
export function QaSkipMenu({ onSkip, onReset, onUnlockDex, testerFolderId, onToggleTesterFolder }: QaSkipMenuProps) {
  return (
    <details className="fixed right-3 top-3 z-50 select-none">
      <summary
        className="cursor-pointer list-none rounded-full bg-card px-2.5 py-1 text-[10px] font-bold text-muted-foreground toy-border"
        title="개발용: 6개 미니게임을 건너뛰고 테스트 스탯을 생성합니다"
      >
        Skip · QA
      </summary>
      <div className="mt-1 flex max-h-[80vh] w-40 flex-col gap-0.5 overflow-y-auto rounded-xl bg-card p-1.5 toy-border toy-shadow">
        {MOCK_STAT_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onSkip(preset)}
            className="rounded-lg px-2 py-1 text-left text-[11px] font-semibold text-foreground hover:bg-secondary"
          >
            {presetLabel(preset)}
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
        <button
          type="button"
          onClick={onUnlockDex}
          title="localStorage 도감에 30종 전체를 '만나본 Statling'으로 기록합니다"
          className="rounded-lg px-2 py-1 text-left text-[11px] font-semibold text-foreground hover:bg-secondary"
        >
          도감 30종 잠금해제
        </button>

        {TESTER_CHARACTER_FOLDERS.length > 0 && (
          <>
            <div className="my-0.5 h-px bg-border" />
            <p className="px-2 pt-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
              테스터 · 우리 방에서만 동작
            </p>
            {TESTER_CHARACTER_FOLDERS.map((folder) => {
              const active = testerFolderId === folder.folderId
              return (
                <button
                  key={folder.folderId}
                  type="button"
                  onClick={() => onToggleTesterFolder(folder.folderId)}
                  title="우리 방 캐릭터를 이 폴더의 24개 에셋으로 고정합니다. 클릭하면 다시 해제됩니다."
                  className={
                    active
                      ? 'rounded-lg bg-primary px-2 py-1 text-left text-[11px] font-bold text-primary-foreground'
                      : 'rounded-lg px-2 py-1 text-left text-[11px] font-semibold text-foreground hover:bg-secondary'
                  }
                >
                  {active ? '✓ ' : ''}
                  {folder.displayName}
                </button>
              )
            })}
          </>
        )}
      </div>
    </details>
  )
}
