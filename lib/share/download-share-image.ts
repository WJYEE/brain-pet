/** Strips everything except letters (incl. Hangul), digits, `_` and `-`, so a pet name like "천사폭신이" survives while slashes/colons/etc. that are unsafe in filenames don't. */
export function buildShareImageFilename(petName: string): string {
  const safe = petName.replace(/[^\p{L}\p{N}_-]/gu, '').slice(0, 40)
  return `statling-${safe || 'result'}.png`
}

/** Triggers a browser download of the given blob via a throwaway <a download>. */
export function downloadShareImage(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
