import { ImageResponse } from 'next/og'

/**
 * Common/static Open Graph image for the whole service (see spec: no
 * per-user dynamic result page/URL exists yet, so every share/link-preview
 * uses this same brand card rather than assuming a user's pet image will
 * show up automatically). Uses Next.js's built-in opengraph-image file
 * convention — Next detects this file and wires the og:image tag itself,
 * so app/layout.tsx's metadata doesn't need to reference it manually.
 * Kept to plain hex colors and system fonts (no oklch(), no custom
 * webfonts) since the Satori renderer behind ImageResponse has narrower
 * CSS support than a real browser.
 */
export const alt = 'Statling — 나의 숨겨진 스탯을 발견해보세요'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: '#f7f0e0',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
          }}
        >
          {/* Plain shapes only (no emoji/icon font) — Satori's font support
              for emoji glyphs is unreliable without an extra network fetch,
              so an abstract egg silhouette built from divs is the safer bet
              for a server-rendered image. */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 120,
              height: 120,
              borderRadius: 36,
              background: '#e07a3f',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: 56,
                height: 68,
                borderRadius: '50% 50% 46% 46% / 55% 55% 45% 45%',
                background: '#fdf6ea',
              }}
            />
          </div>
          <div style={{ display: 'flex', fontSize: 96, fontWeight: 800, color: '#4a3a28' }}>
            Statling
          </div>
        </div>
        <div style={{ display: 'flex', marginTop: 40, fontSize: 40, color: '#6b5a45' }}>
          나의 숨겨진 스탯을 발견해보세요
        </div>
      </div>
    ),
    { ...size },
  )
}
