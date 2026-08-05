/**
 * Catalog of every PNG under public/assets/statling/characters/deco/1supported —
 * generated from a one-off filesystem + dimension probe (same convention as
 * lib/room-assets.ts / lib/character-assets.ts), never guessed. The user curates
 * 1supported/2unsupported by hand; this file is just a snapshot of whatever is
 * currently in 1supported at generation time — re-run the generator script if
 * more items are moved in later (see scratchpad/gen_supported_deco.py in this
 * session, or regenerate an equivalent script). Deliberately NOT slot-classified —
 * see the Deco placement feature's scope notes (character-deco-assets.ts's
 * DecoSlot system is a separate, unrelated catalog, not used here).
 */

export interface SupportedDecoAsset {
  id: string
  name: string
  src: string
  /** Real pixel dimensions of the source PNG, measured directly — used to preserve aspect ratio (object-fit: contain) without ever stretching/cropping the file itself. */
  naturalWidth: number
  naturalHeight: number
}

const DECO_SUPPORTED_BASE = '/assets/statling/characters/deco/1supported'

export const SUPPORTED_DECO_ASSETS: SupportedDecoAsset[] = [
  { id: '검정리본', name: '검정리본', src: `${DECO_SUPPORTED_BASE}/검정리본.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '고글', name: '고글', src: `${DECO_SUPPORTED_BASE}/고글.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '고글모자', name: '고글모자', src: `${DECO_SUPPORTED_BASE}/고글모자.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '날개', name: '날개', src: `${DECO_SUPPORTED_BASE}/날개.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '노랑떙땡이리본', name: '노랑떙땡이리본', src: `${DECO_SUPPORTED_BASE}/노랑떙땡이리본.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '단안경', name: '단안경', src: `${DECO_SUPPORTED_BASE}/단안경.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '도토리', name: '도토리', src: `${DECO_SUPPORTED_BASE}/도토리.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '마법사모자', name: '마법사모자', src: `${DECO_SUPPORTED_BASE}/마법사모자.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '마법지팡이', name: '마법지팡이', src: `${DECO_SUPPORTED_BASE}/마법지팡이.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '마술모자', name: '마술모자', src: `${DECO_SUPPORTED_BASE}/마술모자.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '방울빨간리본', name: '방울빨간리본', src: `${DECO_SUPPORTED_BASE}/방울빨간리본.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '버섯모자', name: '버섯모자', src: `${DECO_SUPPORTED_BASE}/버섯모자.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '별지팡이', name: '별지팡이', src: `${DECO_SUPPORTED_BASE}/별지팡이.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '사슴머리띠', name: '사슴머리띠', src: `${DECO_SUPPORTED_BASE}/사슴머리띠.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '세일러모자', name: '세일러모자', src: `${DECO_SUPPORTED_BASE}/세일러모자.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '수영고글', name: '수영고글', src: `${DECO_SUPPORTED_BASE}/수영고글.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '안경', name: '안경', src: `${DECO_SUPPORTED_BASE}/안경.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '여우가면', name: '여우가면', src: `${DECO_SUPPORTED_BASE}/여우가면.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '왕관', name: '왕관', src: `${DECO_SUPPORTED_BASE}/왕관.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '요리사모자', name: '요리사모자', src: `${DECO_SUPPORTED_BASE}/요리사모자.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '우유', name: '우유', src: `${DECO_SUPPORTED_BASE}/우유.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '종이학', name: '종이학', src: `${DECO_SUPPORTED_BASE}/종이학.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '천사링과날개', name: '천사링과날개', src: `${DECO_SUPPORTED_BASE}/천사링과날개.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '체크빨강리본', name: '체크빨강리본', src: `${DECO_SUPPORTED_BASE}/체크빨강리본.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '초록체크리본', name: '초록체크리본', src: `${DECO_SUPPORTED_BASE}/초록체크리본.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '탐험가모자1', name: '탐험가모자1', src: `${DECO_SUPPORTED_BASE}/탐험가모자1.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '파랑귀족리본', name: '파랑귀족리본', src: `${DECO_SUPPORTED_BASE}/파랑귀족리본.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '파랑리본피크닉모자', name: '파랑리본피크닉모자', src: `${DECO_SUPPORTED_BASE}/파랑리본피크닉모자.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '파랑우산', name: '파랑우산', src: `${DECO_SUPPORTED_BASE}/파랑우산.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '파티모자', name: '파티모자', src: `${DECO_SUPPORTED_BASE}/파티모자.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '푸른리본', name: '푸른리본', src: `${DECO_SUPPORTED_BASE}/푸른리본.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '피크닉모자', name: '피크닉모자', src: `${DECO_SUPPORTED_BASE}/피크닉모자.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '해적안대', name: '해적안대', src: `${DECO_SUPPORTED_BASE}/해적안대.png`, naturalWidth: 197, naturalHeight: 198 },
  { id: '화관', name: '화관', src: `${DECO_SUPPORTED_BASE}/화관.png`, naturalWidth: 197, naturalHeight: 198 },
]

export function getSupportedDecoAssetById(id: string): SupportedDecoAsset | undefined {
  return SUPPORTED_DECO_ASSETS.find((asset) => asset.id === id)
}
