import { SharePageClient } from './share-page-client'

interface SharePageProps {
  params: Promise<{ petId: string }>
}

export default async function SharePage({ params }: SharePageProps) {
  const { petId: rawPetId } = await params
  // Next.js hands the dynamic segment through un-decoded (verified empirically — a
  // Korean character id like "01_치즈털실냥이" arrives here still as
  // "01_%EC%B9%98..."), unlike e.g. Express's auto-decoded req.params. Every
  // catalog id is non-ASCII (see lib/pets/pet-profile.ts), so this decode is
  // required, not defensive.
  const petId = decodeURIComponent(rawPetId)
  return <SharePageClient petId={petId} />
}
