'use client'

import { useState } from 'react'
import { HelpCircle, Link2, LogOut, Mail, RotateCcw, User, Volume2, VolumeX } from 'lucide-react'
import { Toast } from '@base-ui/react/toast'
import { StatBadge } from '@/components/brain-bet/stat-badge'
import { AuthForm } from '@/components/brain-bet/auth/auth-form'
import { ConfirmDialog } from '@/components/brain-bet/confirm-dialog'
import { FeedbackSection } from '@/components/brain-bet/feedback-section'
import { STATLING_TYPES, STATS, type StatId } from '@/lib/brain-bet'
import { audioManager } from '@/lib/audio/audio-manager'
import { loadSfxEnabled, saveSfxEnabled } from '@/lib/audio/audio-settings-storage'
import { useAuth } from '@/lib/auth/auth-provider'
import type { PetProfile } from '@/lib/pets/pet-profile'

interface MyPageScreenProps {
  statlingName: string
  topStat: StatId
  petProfile: PetProfile | null
  /** Wipes the pet profile + care state + memory and returns to Landing. See resetAllPetData in game-flow.tsx. */
  onResetPet: () => void
  /** Reopens the first-visit onboarding card on demand — see components/brain-bet/onboarding-modal.tsx. */
  onShowOnboarding: () => void
}

export function MyPageScreen({ statlingName, topStat, petProfile, onResetPet, onShowOnboarding }: MyPageScreenProps) {
  const [sfxEnabled, setSfxEnabled] = useState(() => loadSfxEnabled())
  const { user, loading, isConfigured, signOut } = useAuth()
  const toastManager = Toast.useToastManager()
  const [showLogin, setShowLogin] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)

  async function handleCopyShareLink() {
    if (!petProfile) return
    // encodeURIComponent is required, not defensive — every catalog id is
    // Korean (see lib/pets/pet-profile.ts), and app/share/[petId]/page.tsx
    // expects (and explicitly decodes) a properly percent-encoded segment.
    const url = `${window.location.origin}/share/${encodeURIComponent(petProfile.id)}`
    try {
      await navigator.clipboard.writeText(url)
      toastManager.add({ title: '공유 링크를 복사했어요.', type: 'success' })
    } catch {
      toastManager.add({ title: url, description: '링크를 직접 복사해주세요.', type: 'error' })
    }
  }

  function toggleSfx() {
    const next = !sfxEnabled
    setSfxEnabled(next)
    saveSfxEnabled(next)
    audioManager.setMuted(!next)
  }

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    setSigningOut(false)
    toastManager.add({ title: '로그아웃했어요.', type: 'success' })
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-5 pb-28 pt-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          마이페이지
        </p>
        <h1 className="font-display text-2xl font-extrabold text-foreground">내 정보</h1>
      </header>

      <div className="mt-6 rounded-2xl bg-card px-4 py-4 toy-border">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground toy-border">
            {user ? <Mail size={20} strokeWidth={2.2} /> : <User size={20} strokeWidth={2.2} />}
          </span>
          <div className="min-w-0 flex-1">
            {user ? (
              <>
                <p className="truncate font-display text-base font-extrabold text-foreground">
                  {user.email}
                </p>
                <p className="text-xs text-muted-foreground">로그인된 계정이에요.</p>
              </>
            ) : (
              <>
                <p className="font-display text-base font-extrabold text-foreground">게스트</p>
                <p className="text-xs text-muted-foreground">
                  {loading
                    ? '불러오는 중...'
                    : isConfigured
                      ? '펫 데이터는 아직 이 기기에만 저장돼요. 로그인하면 계정에 연결할 수 있어요.'
                      : '로그인 기능은 아직 준비 중이에요.'}
                </p>
              </>
            )}
          </div>
          {user ? (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-muted px-3 py-2 text-xs font-bold text-foreground transition-opacity disabled:opacity-60"
            >
              <LogOut size={14} strokeWidth={2.4} />
              {signingOut ? '처리 중...' : '로그아웃'}
            </button>
          ) : (
            isConfigured &&
            !loading && (
              <button
                type="button"
                onClick={() => setShowLogin((v) => !v)}
                className="shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
              >
                {showLogin ? '닫기' : '로그인'}
              </button>
            )
          )}
        </div>

        {!user && showLogin && (
          <AuthForm className="mt-4" defaultMode="signin" onAuthenticated={() => setShowLogin(false)} />
        )}
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-card px-4 py-4 toy-border">
        <StatBadge stat={STATS[topStat]} size="sm" />
        <div>
          <p className="font-display text-sm font-extrabold text-foreground">{statlingName}</p>
          <p className="text-xs text-muted-foreground">{STATLING_TYPES[topStat].typeName}</p>
        </div>
      </div>

      {petProfile && (
        <button
          type="button"
          onClick={handleCopyShareLink}
          className="mt-3 flex items-center gap-3 rounded-2xl bg-card px-4 py-4 text-left toy-border"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground toy-border">
            <Link2 size={20} strokeWidth={2.2} />
          </span>
          <div className="flex-1">
            <p className="font-display text-sm font-extrabold text-foreground">내 Statling 공유 링크</p>
            <p className="text-xs text-muted-foreground">친구가 링크를 열고 기록하면 친구 도감에 {petProfile.name}이 등록돼요.</p>
          </div>
        </button>
      )}

      <FeedbackSection petProfile={petProfile} />

      <p className="mt-6 text-xs font-bold uppercase tracking-wide text-muted-foreground">설정</p>
      <button
        type="button"
        onClick={onShowOnboarding}
        className="mt-2 flex items-center gap-3 rounded-2xl bg-card px-4 py-4 text-left toy-border"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground toy-border">
          <HelpCircle size={20} strokeWidth={2.2} />
        </span>
        <div className="flex-1">
          <p className="font-display text-sm font-extrabold text-foreground">온보딩 다시 보기</p>
          <p className="text-xs text-muted-foreground">앱 사용법을 다시 확인해요.</p>
        </div>
      </button>
      <button
        type="button"
        data-sfx-skip
        onClick={toggleSfx}
        className="mt-2 flex items-center gap-3 rounded-2xl bg-card px-4 py-4 text-left toy-border"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground toy-border">
          {sfxEnabled ? <Volume2 size={20} strokeWidth={2.2} /> : <VolumeX size={20} strokeWidth={2.2} />}
        </span>
        <div className="flex-1">
          <p className="font-display text-sm font-extrabold text-foreground">효과음 (SFX)</p>
          <p className="text-xs text-muted-foreground">버튼음, 게임 효과음 등을 켜고 꺼요.</p>
        </div>
        <span
          aria-hidden="true"
          className={`grid h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors ${sfxEnabled ? 'justify-end bg-primary' : 'justify-start bg-muted'}`}
        >
          <span className="h-5 w-5 rounded-full bg-white shadow" />
        </span>
      </button>

      <button
        type="button"
        onClick={() => setConfirmingReset(true)}
        className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-card px-4 py-3 text-sm font-bold text-destructive toy-border"
      >
        <RotateCcw size={16} strokeWidth={2.4} />
        펫 초기화
      </button>

      <ConfirmDialog
        open={confirmingReset}
        onOpenChange={setConfirmingReset}
        title="펫을 초기화할까요?"
        description={`${statlingName}과의 기록이 모두 사라져요.\n친밀도, 대화 기록을 포함해 되돌릴 수 없어요.`}
        confirmLabel="초기화"
        cancelLabel="취소"
        onConfirm={onResetPet}
      />
    </div>
  )
}
