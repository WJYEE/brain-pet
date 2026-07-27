import { toBlob } from 'html-to-image'

/**
 * Rasterizes a DOM node (the hidden StatlingShareCard) into a PNG Blob using
 * html-to-image — chosen over html2canvas/dom-to-image because it's ~10KB
 * with zero dependencies and has noticeably fewer bugs with modern CSS
 * (oklch colors, container queries) that this project's design system uses.
 *
 * Never throws: image generation is a "nice to have" in the share flow (see
 * share-statling-result.ts's fallback chain), so any failure here — a
 * pet image that fails to load, an unsupported CSS feature, whatever —
 * just resolves to `null` and the caller falls back to a text/link share.
 */
export async function createShareImage(node: HTMLElement): Promise<Blob | null> {
  try {
    // pixelRatio: 1 — the card is already built at its literal target pixel
    // size (see StatlingShareCard), so no additional scaling is needed.
    const blob = await toBlob(node, { pixelRatio: 1, cacheBust: true })
    return blob
  } catch {
    return null
  }
}
