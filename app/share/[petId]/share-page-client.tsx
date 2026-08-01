'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { AssetImage } from '@/components/brain-bet/asset-image'
import { Logo } from '@/components/brain-bet/logo'
import { ToyButton } from '@/components/brain-bet/toy-button'
import { getPetProfileById } from '@/lib/pets/pet-profile'
import { addMetPet, hasMetPet } from '@/lib/pets/dex-storage'

interface SharePageClientProps {
  petId: string
}

/**
 * Public landing page for a friend's share link (see MyPageScreen's "공유
 * 링크" button — the URL is just `${origin}/share/{myPetId}`, no account or
 * server lookup involved: the character is fully determined by the id in
 * the URL itself). Clicking "내 도감에 기록하기" writes straight to the
 * *viewer's own* browser localStorage (lib/pets/dex-storage.ts) — this is
 * intentionally one-way and local-only; it does not notify or update the
 * sender's dex in any way (that would need a real backend — see the
 * discussion this feature was scoped from).
 */
export function SharePageClient({ petId }: SharePageClientProps) {
  const pet = getPetProfileById(petId)
  const [recorded, setRecorded] = useState(() => hasMetPet(petId))

  function handleRecord() {
    addMetPet(petId)
    setRecorded(true)
  }

  return (
    <div className="dot-grid-bg mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-5 py-8">
      <Logo size="sm" />

      {!pet ? (
        <p className="mt-16 text-center text-sm font-bold text-muted-foreground">
          존재하지 않는 Statling 링크예요.
        </p>
      ) : (
        <>
          <p className="mt-8 text-center text-sm font-bold text-muted-foreground">
            친구가 자신의 대표 Statling을 보여줬어요!
          </p>

          <div className="mt-4 flex w-full flex-col items-center rounded-3xl bg-card px-6 py-8 toy-border toy-shadow-lg">
            <AssetImage src={pet.imageSrc} alt={pet.name} size={200} />
            <h1 className="mt-3 font-display text-2xl font-extrabold text-foreground">{pet.name}</h1>
            <p className="mt-2 text-center text-xs font-bold leading-relaxed text-muted-foreground">{pet.tagline}</p>
          </div>

          <div className="mt-6 w-full">
            {recorded ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-secondary px-4 py-4 text-sm font-bold text-secondary-foreground toy-border">
                <Check size={18} strokeWidth={2.6} />
                내 도감에 기록했어요!
              </div>
            ) : (
              <ToyButton className="w-full" onClick={handleRecord}>
                내 도감에 기록하기
              </ToyButton>
            )}
          </div>

          <Link
            href="/"
            className="mt-4 flex items-center gap-1 text-xs font-bold text-muted-foreground underline-offset-2 hover:underline"
          >
            나도 Statling 시작하기
            <ArrowRight size={14} strokeWidth={2.6} />
          </Link>
        </>
      )}
    </div>
  )
}
