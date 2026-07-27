/**
 * Builds an `sms:` deep link that opens the device's messaging app with the
 * share text pre-filled. Not wired to a button in this pass — the `sms:`
 * URL body-parameter format actually differs across OSes (iOS wants
 * `sms:&body=`, most Android build variants want `sms:?body=`) and there's
 * no reliable way to feature-detect which one a given browser needs, so
 * this stays a secondary/optional utility (per spec) rather than the
 * default share path. The default share button should keep using the Web
 * Share API, which already surfaces Messages as one of the share-sheet
 * options on both platforms.
 */
export function buildSmsShareUrl(text: string): string {
  return `sms:?body=${encodeURIComponent(text)}`
}
