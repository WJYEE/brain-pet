import type { Mood, PetAnimation } from '@/lib/pet-care/types'

/**
 * The 24-state expression set a fully-illustrated character folder provides
 * (see public/assets/statling/characters/01_치즈털실냥이/ for the first
 * complete set). Distinct from `lib/character-assets.ts`'s older `pet_NNN`
 * catalog (idle-only, used for similarity matching) — this is the newer,
 * richer per-character art pass, still being rolled out folder by folder.
 */
export type CharacterStateKey =
  | 'idle'
  | 'blink'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'surprised'
  | 'eat'
  | 'wash'
  | 'play'
  | 'pet'
  | 'talk'
  | 'sleep'
  | 'hungry'
  | 'dirty'
  | 'tired'
  | 'sick'
  | 'cry'
  | 'thinking'
  | 'love'
  | 'excited'
  | 'embarrassed'
  | 'gift'
  | 'levelUp'
  | 'evolve'

interface CharacterStateDef {
  /** The 01-24 position in the filename — see buildCharacterStateFolder. */
  number: number
  key: CharacterStateKey
  /** The exact token used in the source filename — kept separate from `key` only where the file itself has a typo (embarrased) or a dash (level-up), so `key` can stay clean in code. */
  fileToken: string
  /** Short Korean label for QA UI (tester preview caption). */
  label: string
}

/**
 * Fixed 01-24 order — every character folder that follows this convention
 * (see buildCharacterStateFolder) is expected to provide exactly these 24
 * files, in this order, numbered 01-24.
 */
export const CHARACTER_STATE_SEQUENCE: CharacterStateDef[] = [
  { number: 1, key: 'idle', fileToken: 'idle', label: '기본' },
  { number: 2, key: 'blink', fileToken: 'blink', label: '눈 깜빡임' },
  { number: 3, key: 'happy', fileToken: 'happy', label: '행복' },
  { number: 4, key: 'sad', fileToken: 'sad', label: '슬픔' },
  { number: 5, key: 'angry', fileToken: 'angry', label: '화남' },
  { number: 6, key: 'surprised', fileToken: 'surprised', label: '놀람' },
  { number: 7, key: 'eat', fileToken: 'eat', label: '먹기' },
  { number: 8, key: 'wash', fileToken: 'wash', label: '씻기' },
  { number: 9, key: 'play', fileToken: 'play', label: '놀기' },
  { number: 10, key: 'pet', fileToken: 'pet', label: '쓰다듬기' },
  { number: 11, key: 'talk', fileToken: 'talk', label: '대화' },
  { number: 12, key: 'sleep', fileToken: 'sleep', label: '잠' },
  { number: 13, key: 'hungry', fileToken: 'hungry', label: '배고픔' },
  { number: 14, key: 'dirty', fileToken: 'dirty', label: '더러움' },
  { number: 15, key: 'tired', fileToken: 'tired', label: '피곤' },
  { number: 16, key: 'sick', fileToken: 'sick', label: '아픔' },
  { number: 17, key: 'cry', fileToken: 'cry', label: '울음' },
  { number: 18, key: 'thinking', fileToken: 'thinking', label: '생각' },
  { number: 19, key: 'love', fileToken: 'love', label: '애정' },
  { number: 20, key: 'excited', fileToken: 'excited', label: '신남' },
  // Source filename is spelled "embarrased" (one s) — fileToken matches the
  // real file on disk; `key` keeps the correct spelling in code.
  { number: 21, key: 'embarrassed', fileToken: 'embarrased', label: '민망' },
  { number: 22, key: 'gift', fileToken: 'gift', label: '선물' },
  { number: 23, key: 'levelUp', fileToken: 'level-up', label: '레벨업' },
  { number: 24, key: 'evolve', fileToken: 'evolve', label: '진화' },
]

const CHARACTERS_BASE = '/assets/statling/characters'

export interface CharacterStateFolder {
  /** Real directory name under public/assets/statling/characters, e.g. '01_치즈털실냥이'. */
  folderId: string
  /** Character name without the numeric prefix, e.g. '치즈털실냥이'. */
  displayName: string
  assets: Record<CharacterStateKey, string>
}

/**
 * Builds every state's asset path for a folder that follows the
 * `{folderId}/{folderId}_{NN}_{fileToken}.png` naming convention. This is
 * the one place that convention is encoded — wiring up a new character once
 * its 24 files land (e.g. 02_로봇, 03_양, ...) is just calling this with that
 * folder's name, never re-deriving the path pattern by hand.
 */
export function buildCharacterStateFolder(folderId: string, displayName: string): CharacterStateFolder {
  const assets = Object.fromEntries(
    CHARACTER_STATE_SEQUENCE.map(({ number, key, fileToken }) => [
      key,
      `${CHARACTERS_BASE}/${folderId}/${folderId}_${String(number).padStart(2, '0')}_${fileToken}.png`,
    ]),
  ) as Record<CharacterStateKey, string>
  return { folderId, displayName, assets }
}

/**
 * folderId/displayName pairs for the full 30-character roster (see
 * public/assets/statling/characters/00_match/00_match.md) — every folder
 * has a complete 24-file set. Single source of truth for
 * TESTER_CHARACTER_FOLDERS below; kept as plain data (not re-derived from
 * lib/pets/pet-profile.ts) so this module never needs to import the
 * stat/catalog system just to know which folders exist.
 */
const CHARACTER_ROSTER: Array<[folderId: string, displayName: string]> = [
  ['01_치즈털실냥이', '치즈털실냥이'],
  ['02_로봇', '로봇'],
  ['03_양', '양'],
  ['04_상처도치', '상처도치'],
  ['05_노란병아리', '노란병아리'],
  ['06_초록스카프수달', '초록스카프수달'],
  ['07_별사막여우', '별사막여우'],
  ['08_고래', '고래'],
  ['09_귀신', '귀신'],
  ['10_벌', '벌'],
  ['11_하트덕', '하트덕'],
  ['12_홍학', '홍학'],
  ['13_나뭇잎여우', '나뭇잎여우'],
  ['14_코알라', '코알라'],
  ['15_개미햝기', '개미햝기'],
  ['16_균형다람쥐', '균형다람쥐'],
  ['17_보라곰', '보라곰'],
  ['18_지식토끼', '지식토끼'],
  ['19_까망외계인', '까망외계인'],
  ['20_찐강쥐', '찐강쥐'],
  ['21_거북이', '거북이'],
  ['22_아홀로틀', '아홀로틀'],
  ['23_잎라쿤', '잎라쿤'],
  ['24_꽃사막여우', '꽃사막여우'],
  ['25_치즈생쥐', '치즈생쥐'],
  ['26_푸른늑대', '푸른늑대'],
  ['27_겨울펭귄', '겨울펭귄'],
  ['28_카피바라', '카피바라'],
  ['29_무지개유니콘', '무지개유니콘'],
  ['30_꽃다발공룡', '꽃다발공룡'],
]

/**
 * Every character folder with a complete 24-file set, ready for the QA
 * tester toggle (see qa-skip-menu.tsx). Add an entry to CHARACTER_ROSTER
 * above — nothing else — once a new folder's 24 PNGs are finished; the
 * tester menu lists whatever is registered here.
 */
export const TESTER_CHARACTER_FOLDERS: CharacterStateFolder[] = CHARACTER_ROSTER.map(([folderId, displayName]) =>
  buildCharacterStateFolder(folderId, displayName),
)

/**
 * Maps the app's real Mood/PetAnimation state (lib/pet-care/types.ts) onto
 * the closest of the 24 character states, so the QA tester view can show
 * the actual matching art for actual interactions (feed/wash/play/pet/talk,
 * mood shifts) rather than a manual-only preview.
 *
 * `animation` wins over `mood` whenever it's not the idle fallback — an
 * action (eating, being petted, ...) briefly overrides whatever the mood
 * would otherwise show, same priority `lib/pet-care` already uses for the
 * CSS motion class.
 *
 * Not every one of the 24 states has a real trigger yet — embarrassed, love
 * (planned for the future dialogue/talk feature), gift (planned for a future
 * level-reward claim popup), and evolve (no evolution feature exists yet)
 * are only reachable via the tester's manual click-through preview, not this
 * function.
 */
export interface InteractionStateContext {
  mood: Mood
  animation: PetAnimation
  /** Raw 0-100 cleanliness stat. A 'dirty' mood only escalates to the 'sick' art once this drops below SICK_CLEANLINESS_THRESHOLD — i.e. neglected for a while, not just freshly dirty. Defaults to 100 (never sick) when omitted. */
  cleanliness?: number
  /** True for a few seconds right after a petting streak crosses OVERPET_COUNT_THRESHOLD (see hooks/use-pet-care.ts) — swaps the 'pet' animation's art to 'angry' for that window. Defaults to false. */
  isOverPetted?: boolean
}

/** Below this cleanliness, a 'dirty' mood reads as neglected-long-enough-to-be-sick rather than just freshly dirty. */
export const SICK_CLEANLINESS_THRESHOLD = 10

export function characterStateForInteraction({
  mood,
  animation,
  cleanliness = 100,
  isOverPetted = false,
}: InteractionStateContext): CharacterStateKey {
  switch (animation) {
    case 'eat':
      return 'eat'
    case 'wash':
      return 'wash'
    case 'play':
    case 'playAlone':
      return 'play'
    case 'pet':
      return isOverPetted ? 'angry' : 'pet'
    case 'talk':
      return 'talk'
    case 'sleep':
      return 'sleep'
    case 'sad':
      return 'sad'
    // 'jump' is only ever set on a real level-up (see use-pet-care.ts) — never
    // reused for anything else, so it maps 1:1 to the levelUp art.
    case 'jump':
      return 'levelUp'
    case 'celebrate':
      return 'excited'
    // 청소하기(room clean) — reads as "어, 방이 반짝여졌네?" surprise rather than a generic smile.
    case 'shake':
      return 'surprised'
    case 'askFood':
      return 'hungry'
    case 'askPlay':
      return 'thinking'
    case 'askAttention':
      return 'surprised'
    case 'lookLeft':
    case 'lookRight':
    case 'hop':
    case 'walk':
    case 'idle':
      break
  }

  switch (mood) {
    case 'hungry':
      return 'hungry'
    case 'dirty':
      return cleanliness <= SICK_CLEANLINESS_THRESHOLD ? 'sick' : 'dirty'
    case 'lonely':
      return 'cry'
    case 'sleepy':
      return 'tired'
    case 'sad':
      return 'sad'
    case 'joyful':
    case 'happy':
      return 'happy'
    case 'calm':
      return 'idle'
  }
}
