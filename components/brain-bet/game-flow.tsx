'use client'

import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { ConfirmDialog } from '@/components/brain-bet/confirm-dialog'
import { LandingScreen } from '@/components/brain-bet/screens/landing-screen'
import { ReactionGame } from '@/components/brain-bet/games/reaction-game'
import { MemoryGame } from '@/components/brain-bet/games/memory-game'
import { FocusGame } from '@/components/brain-bet/games/focus-game'
import { JudgmentGame } from '@/components/brain-bet/games/judgment-game'
import { SpatialGame } from '@/components/brain-bet/games/spatial-game'
import { ReasoningGame } from '@/components/brain-bet/games/reasoning-game'
import { StoryMemoryGame } from '@/components/brain-bet/games/story-memory-game'
import { ColorTargetGame } from '@/components/brain-bet/games/color-target-game'
import { DodgeObstacleGame } from '@/components/brain-bet/games/dodge-obstacle-game'
import { BestChoiceGame } from '@/components/brain-bet/games/best-choice-game'
import { FitPuzzleGame } from '@/components/brain-bet/games/fit-puzzle-game'
import { NumberPatternGame } from '@/components/brain-bet/games/number-pattern-game'
import { CompleteScreen } from '@/components/brain-bet/screens/complete-screen'
import { FreePlayResultScreen } from '@/components/brain-bet/screens/free-play-result-screen'
import { StatusScreen } from '@/components/brain-bet/screens/status-screen'
import { EggScreen } from '@/components/brain-bet/screens/egg-screen'
import { RevealScreen } from '@/components/brain-bet/screens/reveal-screen'
import { SaveScreen } from '@/components/brain-bet/screens/save-screen'
import { NamingScreen } from '@/components/brain-bet/screens/naming-screen'
import { RoomScreen } from '@/components/brain-bet/screens/room-screen'
import { GrowScreen } from '@/components/brain-bet/screens/grow-screen'
import { GrowGameScreen } from '@/components/brain-bet/screens/grow-game-screen'
import { ComingSoonScreen } from '@/components/brain-bet/screens/coming-soon-screen'
import { ThemeScreen } from '@/components/brain-bet/screens/theme-screen'
import { MyPageScreen } from '@/components/brain-bet/screens/my-page-screen'
import { NavRail, type NavTab } from '@/components/brain-bet/nav-rail'
import { QaSkipMenu } from '@/components/brain-bet/qa-skip-menu'
import { PLAY_ORDER, TOTAL_GAMES, getSecondStat, getTopStat, type StatId } from '@/lib/brain-bet'
import { RECOMMENDED_STAT_PLACEHOLDER } from '@/lib/room'
import { recordGameCompletion } from '@/lib/pet-care/pet-memory'
import { loadPetMemory, savePetMemory } from '@/lib/pet-care/pet-memory-storage'
import {
  beginPetAssignment,
  confirmPet,
  refreshGrowthData,
  rerollPet,
  resolveCurrentPetProfile,
} from '@/lib/pets/pet-flow'
import {
  clearStoredPetProfile,
  loadStoredPetProfile,
  saveStoredPetProfile,
  type StoredPetProfile,
} from '@/lib/pets/pet-storage'
import { TESTER_CHARACTER_FOLDERS } from '@/lib/character-state-assets'
import type { PetProfile } from '@/lib/pets/pet-profile'
import { generateMockFinals, type MockStatPreset } from '@/lib/game/mock-finals'
import { REACTION_GAME_VERSION } from '@/lib/config/reaction.config'
import { MEMORY_GAME_VERSION } from '@/lib/config/memory.config'
import { FOCUS_GAME_VERSION } from '@/lib/config/focus.config'
import { JUDGMENT_GAME_VERSION } from '@/lib/config/judgment.config'
import { SPATIAL_GAME_VERSION } from '@/lib/config/spatial.config'
import { REASONING_GAME_VERSION } from '@/lib/config/reasoning.config'
import { STORY_MEMORY_GAME_VERSION } from '@/lib/config/story-memory.config'
import { COLOR_TARGET_GAME_VERSION } from '@/lib/config/color-target.config'
import { DODGE_OBSTACLE_GAME_VERSION } from '@/lib/config/dodge-obstacle.config'
import { BEST_CHOICE_GAME_VERSION } from '@/lib/config/best-choice.config'
import { FIT_PUZZLE_GAME_VERSION } from '@/lib/config/fit-puzzle.config'
import { NUMBER_PATTERN_GAME_VERSION } from '@/lib/config/number-pattern.config'
import { detectDevice } from '@/lib/game/device'
import { generateSessionId } from '@/lib/game/id'
import { applyGameResult, emptyStatStatusMap } from '@/lib/game/stat-status'
import { getClassicGameKey } from '@/lib/game/game-registry'
import type {
  BestChoiceAnswer,
  BestChoiceGameResult,
  BestChoiceRawSummary,
  ColorTargetClickEvent,
  ColorTargetGameResult,
  ColorTargetRawSummary,
  DodgeObstacleEvent,
  DodgeObstacleGameResult,
  DodgeObstacleRawSummary,
  FitPuzzleGameResult,
  FitPuzzleRawSummary,
  FitPuzzleRoundResult,
  FocusGameResult,
  FocusRawSummary,
  FocusRoundTrial,
  GameResult,
  JudgmentGameResult,
  JudgmentRawSummary,
  JudgmentTrial,
  MemoryGameResult,
  MemoryRawSummary,
  MemoryRoundTrial,
  NumberPatternAnswer,
  NumberPatternGameResult,
  NumberPatternRawSummary,
  ReactionGameResult,
  ReactionRawSummary,
  ReactionTrial,
  ReasoningGameResult,
  ReasoningRawSummary,
  ReasoningTrial,
  SpatialGameResult,
  SpatialRawSummary,
  SpatialTrial,
  StatStatusMap,
  StoryMemoryAnswer,
  StoryMemoryGameResult,
  StoryMemoryRawSummary,
} from '@/lib/game/types'
import { evaluateReactionValidity, formatReactionRawRecord } from '@/lib/scoring/reaction'
import { formatMemoryRawRecord } from '@/lib/scoring/memory'
import { formatFocusRawRecord } from '@/lib/scoring/focus'
import { formatJudgmentRawRecord } from '@/lib/scoring/judgment'
import { formatSpatialRawRecord } from '@/lib/scoring/spatial'
import { formatReasoningRawRecord } from '@/lib/scoring/reasoning'
import { isBetterByGameScore } from '@/lib/scoring/shared'
import { formatStoryMemoryRawRecord } from '@/lib/scoring/story-memory'
import { formatColorTargetRawRecord } from '@/lib/scoring/color-target'
import { formatDodgeObstacleRawRecord } from '@/lib/scoring/dodge-obstacle'
import { formatBestChoiceRawRecord } from '@/lib/scoring/best-choice'
import { formatFitPuzzleRawRecord } from '@/lib/scoring/fit-puzzle'
import { formatNumberPatternRawRecord } from '@/lib/scoring/number-pattern'

type Phase =
  | 'landing'
  | 'game'
  | 'complete'
  | 'freeplay-complete'
  | 'status'
  | 'egg'
  | 'reveal'
  | 'save'
  | 'naming'
  | 'room'
  | 'mystats'
  | 'ranking'
  | 'mypage'
  | 'theme'
  | 'grow'
  | 'grow-game'

/** Phases that show the post-hatch bottom navigation. */
const NAV_PHASES: Phase[] = ['room', 'mystats', 'ranking', 'mypage', 'theme']

/**
 * Dev/QA "skip the 6 mini-games" control — visible in local dev by default,
 * or in any build where NEXT_PUBLIC_ENABLE_TEST_SKIP is explicitly turned
 * on. Never shown in a normal production build. Reading an unset env var is
 * always just `undefined` here, so this never throws when the variable is
 * absent.
 */
const SHOW_QA_SKIP =
  process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_TEST_SKIP === 'true'

const emptyFinals = () =>
  Object.fromEntries(PLAY_ORDER.map((id) => [id, 0])) as Record<StatId, number>

export function GameFlow() {
  const [phase, setPhase] = useState<Phase>('landing')
  const [flowMode, setFlowMode] = useState<'first' | 'free'>('first')
  const [index, setIndex] = useState(0)
  const [activeStatId, setActiveStatId] = useState<StatId>(PLAY_ORDER[0])
  /** Which registered game (see lib/game/game-registry.ts) is currently showing for activeStatId — e.g. 'reaction-classic' vs 'reaction-dodge-run'. */
  const [activeGameKey, setActiveGameKey] = useState<string>(getClassicGameKey(PLAY_ORDER[0]))
  const [statStatus, setStatStatus] = useState<StatStatusMap>(emptyStatStatusMap())
  const [lastResult, setLastResult] = useState<GameResult | null>(null)
  /**
   * The 0-100 value per stat shown on the Radar / MY STATUS chart, used for
   * representative-pet matching (getTopStat/getSecondStat, beginPetAssignment)
   * and the share card. Set directly from each stat's personal-best gameScore
   * (see the on*Complete handlers below: `isPersonalBest ? gameScore :
   * prevBest.gameScore`) — never recomputed separately, never random. A
   * stat's two registered games (see lib/game/game-registry.ts) share one
   * gameScore scale, so replaying with either game updates the same value.
   */
  const [finals, setFinals] = useState<Record<StatId, number>>(emptyFinals())
  const [statlingName, setStatlingName] = useState('')
  /**
   * The user's representative-pet record — candidate pool + reroll progress
   * before confirmation, locked-in petId after. Persisted to localStorage
   * (see lib/pets/pet-storage.ts); `seed`/`petId`/`candidatePetIds` never
   * change once `confirmed` is true — replaying the tests only refreshes the
   * stored growth data.
   */
  const [petRecord, setPetRecord] = useState<StoredPetProfile | null>(null)
  /**
   * Whether the 테마 tab currently has unsaved room edits — lifted here (not
   * kept purely local to ThemeScreen) so the bottom NavRail, which lives
   * outside ThemeScreen, can intercept a tab switch away from 테마 and warn
   * before discarding those edits (see handleNavSelect below).
   */
  const [themeDirty, setThemeDirty] = useState(false)
  const [pendingNavTab, setPendingNavTab] = useState<NavTab | null>(null)
  /** Dev/QA only — pins the Room character to one TESTER_CHARACTER_FOLDERS entry's 24-state art. See qa-skip-menu.tsx / pet-mood-view.tsx. */
  const [testerFolderId, setTesterFolderId] = useState<string | null>(null)

  const topStat = getTopStat(finals)
  /**
   * Single source of truth for "which pet is currently shown" — every
   * post-hatch screen (Egg, Reveal, Naming, Room, ...) reads this same value
   * instead of recomputing anything from getTopStat/CharacterImage. Resolves
   * to the current unconfirmed candidate or the locked-in confirmed pet (see
   * lib/pets/pet-flow.ts#resolveCurrentPetProfile); null only when no pet
   * has been assigned yet at all.
   */
  const displayedPetProfile = petRecord ? resolveCurrentPetProfile(petRecord) : null

  /** Dev/QA only — the currently-active tester folder, if any (see qa-skip-menu.tsx). */
  const activeTesterFolder = TESTER_CHARACTER_FOLDERS.find((f) => f.folderId === testerFolderId) ?? null
  /**
   * Dev/QA only — swaps in a synthetic profile for `real` whenever a tester
   * folder is active, so Egg/Reveal/Naming show the tested character's own
   * name and art instead of whichever real catalog pet the mock finals
   * happened to match (wrong name, and sometimes a broken image for a
   * catalog pet whose real PNG isn't wired up yet). Room itself doesn't need
   * this: it already shows the tester's full 24-state art via PetMoodView's
   * own `testerFolder` prop, keyed off live mood/animation rather than one
   * static image.
   */
  const applyTesterOverride = (real: PetProfile): PetProfile =>
    activeTesterFolder
      ? {
          id: `tester-${activeTesterFolder.folderId}`,
          name: activeTesterFolder.displayName,
          imageSrc: activeTesterFolder.assets.idle,
          vector: Object.fromEntries(PLAY_ORDER.map((id) => [id, 0.5])) as Record<StatId, number>,
          tagline: '테스터용 캐릭터예요.',
        }
      : real

  // Resume an in-progress (not yet confirmed) reveal straight to the Reveal
  // screen on mount — e.g. after a refresh mid-reroll. A CONFIRMED pet never
  // auto-navigates anywhere; only this one bounce-back case is handled, since
  // no other phase is persisted (GAME_SPEC: keep existing navigation as-is
  // otherwise).
  useEffect(() => {
    const stored = loadStoredPetProfile()
    if (stored && !stored.confirmed) {
      setFinals(stored.latestFinals)
      setPetRecord(stored)
      setPhase('reveal')
    }
  }, [])

  /** First Play only — always stages the stat's classic game (see getClassicGameKey). Free Play picks a specific game explicitly instead (see selectFreePlayGame/confirmFreePlayGame below). */
  const enterStatGame = (statId: StatId) => {
    setActiveStatId(statId)
    setActiveGameKey(getClassicGameKey(statId))
  }

  const start = () => {
    setIndex(0)
    enterStatGame(PLAY_ORDER[0])
    setFlowMode('first')
    setFinals(emptyFinals())
    setPhase('game')
  }

  const goNextFirst = () => {
    if (index < TOTAL_GAMES - 1) {
      const nextIndex = index + 1
      setIndex(nextIndex)
      enterStatGame(PLAY_ORDER[nextIndex])
      setPhase('game')
    } else {
      setPhase('status')
    }
  }

  /** Completion path for the real Reaction game. */
  const onReactionComplete = ({
    trials,
    rawSummary,
    gameScore,
  }: {
    trials: ReactionTrial[]
    rawSummary: ReactionRawSummary
    gameScore: number
  }) => {
    const { isValidAttempt, invalidReason } = evaluateReactionValidity(trials)
    // gameScore is on BaseGameResult, so this is safe regardless of which of
    // the stat's two games (신호 반응 vs 장애물 피하기) set the current best —
    // unlike a rawSummary-shaped comparator, which would assume the wrong
    // shape whenever the sibling game set the record.
    const prevBest = statStatus.reaction.current
    const isPersonalBest = isValidAttempt && isBetterByGameScore(gameScore, prevBest?.gameScore ?? null)

    const result: ReactionGameResult = {
      sessionId: generateSessionId(),
      gameId: 'reaction',
      gameVersion: REACTION_GAME_VERSION,
      mode: flowMode,
      playedAt: new Date().toISOString(),
      device: detectDevice(),
      gameScore,
      raw: formatReactionRawRecord(rawSummary),
      final: undefined,
      isPersonalBest,
      isValidAttempt,
      invalidReason,
      trials,
      rawSummary,
    }

    setStatStatus((map) => applyGameResult('reaction', map, result))
    setLastResult(result)
    if (result.isValidAttempt) savePetMemory(recordGameCompletion(loadPetMemory(), result, new Date()))
    setFinals((f) => ({ ...f, reaction: isPersonalBest ? gameScore : (prevBest?.gameScore ?? 0) }))
    setPhase(flowMode === 'first' ? 'complete' : 'freeplay-complete')
  }

  /** Completion path for the real Memory game. */
  const onMemoryComplete = ({
    rounds,
    rawSummary,
    gameScore,
  }: {
    rounds: MemoryRoundTrial[]
    rawSummary: MemoryRawSummary
    gameScore: number
  }) => {
    // gameScore is on BaseGameResult, safe regardless of which of the stat's
    // two games (패턴 기억 vs 이야기 기억) set the current best.
    const prevBest = statStatus.memory.current
    const isPersonalBest = isBetterByGameScore(gameScore, prevBest?.gameScore ?? null)

    const result: MemoryGameResult = {
      sessionId: generateSessionId(),
      gameId: 'memory',
      gameVersion: MEMORY_GAME_VERSION,
      mode: flowMode,
      playedAt: new Date().toISOString(),
      device: detectDevice(),
      gameScore,
      raw: formatMemoryRawRecord(rawSummary),
      final: undefined,
      isPersonalBest,
      // Memory-specific anti-cheat isn't defined yet (GAME_SPEC has no Memory
      // cheat criteria) — every completed attempt is valid for now.
      isValidAttempt: true,
      invalidReason: null,
      rounds,
      rawSummary,
    }

    setStatStatus((map) => applyGameResult('memory', map, result))
    setLastResult(result)
    if (result.isValidAttempt) savePetMemory(recordGameCompletion(loadPetMemory(), result, new Date()))
    setFinals((f) => ({ ...f, memory: isPersonalBest ? gameScore : (prevBest?.gameScore ?? 0) }))
    setPhase(flowMode === 'first' ? 'complete' : 'freeplay-complete')
  }

  /** Completion path for the real Focus game. */
  const onFocusComplete = ({
    rounds,
    rawSummary,
    gameScore,
  }: {
    rounds: FocusRoundTrial[]
    rawSummary: FocusRawSummary
    gameScore: number
  }) => {
    // gameScore is on BaseGameResult, safe regardless of which of the stat's
    // two games (표적 찾기 vs 특정 색만 클릭) set the current best.
    const prevBest = statStatus.focus.current
    const isPersonalBest = isBetterByGameScore(gameScore, prevBest?.gameScore ?? null)

    const result: FocusGameResult = {
      sessionId: generateSessionId(),
      gameId: 'focus',
      gameVersion: FOCUS_GAME_VERSION,
      mode: flowMode,
      playedAt: new Date().toISOString(),
      device: detectDevice(),
      gameScore,
      raw: formatFocusRawRecord(rawSummary),
      final: undefined,
      isPersonalBest,
      // Focus-specific anti-cheat isn't defined yet (GAME_SPEC has no Focus
      // cheat criteria) — every completed attempt is valid for now.
      isValidAttempt: true,
      invalidReason: null,
      rounds,
      rawSummary,
    }

    setStatStatus((map) => applyGameResult('focus', map, result))
    setLastResult(result)
    if (result.isValidAttempt) savePetMemory(recordGameCompletion(loadPetMemory(), result, new Date()))
    setFinals((f) => ({ ...f, focus: isPersonalBest ? gameScore : (prevBest?.gameScore ?? 0) }))
    setPhase(flowMode === 'first' ? 'complete' : 'freeplay-complete')
  }

  /** Completion path for the real Judgment game. */
  const onJudgmentComplete = ({
    trials,
    rawSummary,
    gameScore,
  }: {
    trials: JudgmentTrial[]
    rawSummary: JudgmentRawSummary
    gameScore: number
  }) => {
    // gameScore is on BaseGameResult, safe regardless of which of the stat's
    // two games (규칙 전환 vs 무엇을 선택할까) set the current best.
    const prevBest = statStatus.judgment.current
    const isPersonalBest = isBetterByGameScore(gameScore, prevBest?.gameScore ?? null)

    const result: JudgmentGameResult = {
      sessionId: generateSessionId(),
      gameId: 'judgment',
      gameVersion: JUDGMENT_GAME_VERSION,
      mode: flowMode,
      playedAt: new Date().toISOString(),
      device: detectDevice(),
      gameScore,
      raw: formatJudgmentRawRecord(rawSummary),
      final: undefined,
      isPersonalBest,
      // Judgment-specific anti-cheat isn't defined yet (GAME_SPEC has no
      // Judgment cheat criteria) — every completed attempt is valid for now.
      isValidAttempt: true,
      invalidReason: null,
      trials,
      rawSummary,
    }

    setStatStatus((map) => applyGameResult('judgment', map, result))
    setLastResult(result)
    if (result.isValidAttempt) savePetMemory(recordGameCompletion(loadPetMemory(), result, new Date()))
    setFinals((f) => ({ ...f, judgment: isPersonalBest ? gameScore : (prevBest?.gameScore ?? 0) }))
    setPhase(flowMode === 'first' ? 'complete' : 'freeplay-complete')
  }

  /** Completion path for the real Spatial game. */
  const onSpatialComplete = ({
    trials,
    rawSummary,
    gameScore,
  }: {
    trials: SpatialTrial[]
    rawSummary: SpatialRawSummary
    gameScore: number
  }) => {
    // gameScore is on BaseGameResult, safe regardless of which of the stat's
    // two games (회전 도형 찾기 vs 퍼즐 끼우기) set the current best.
    const prevBest = statStatus.spatial.current
    const isPersonalBest = isBetterByGameScore(gameScore, prevBest?.gameScore ?? null)

    const result: SpatialGameResult = {
      sessionId: generateSessionId(),
      gameId: 'spatial',
      gameVersion: SPATIAL_GAME_VERSION,
      mode: flowMode,
      playedAt: new Date().toISOString(),
      device: detectDevice(),
      gameScore,
      raw: formatSpatialRawRecord(rawSummary),
      final: undefined,
      isPersonalBest,
      // Spatial-specific anti-cheat isn't defined yet (GAME_SPEC has no
      // Spatial cheat criteria) — every completed attempt is valid for now.
      isValidAttempt: true,
      invalidReason: null,
      trials,
      rawSummary,
    }

    setStatStatus((map) => applyGameResult('spatial', map, result))
    setLastResult(result)
    if (result.isValidAttempt) savePetMemory(recordGameCompletion(loadPetMemory(), result, new Date()))
    setFinals((f) => ({ ...f, spatial: isPersonalBest ? gameScore : (prevBest?.gameScore ?? 0) }))
    setPhase(flowMode === 'first' ? 'complete' : 'freeplay-complete')
  }

  /** Completion path for the real Reasoning game — the last stat to get a real implementation; every stat now has one. */
  const onReasoningComplete = ({
    trials,
    rawSummary,
    gameScore,
  }: {
    trials: ReasoningTrial[]
    rawSummary: ReasoningRawSummary
    gameScore: number
  }) => {
    // gameScore is on BaseGameResult, safe regardless of which of the stat's
    // two games (규칙 찾기 vs 숫자 규칙) set the current best.
    const prevBest = statStatus.reasoning.current
    const isPersonalBest = isBetterByGameScore(gameScore, prevBest?.gameScore ?? null)

    const result: ReasoningGameResult = {
      sessionId: generateSessionId(),
      gameId: 'reasoning',
      gameVersion: REASONING_GAME_VERSION,
      mode: flowMode,
      playedAt: new Date().toISOString(),
      device: detectDevice(),
      gameScore,
      raw: formatReasoningRawRecord(rawSummary),
      final: undefined,
      isPersonalBest,
      // Reasoning-specific anti-cheat isn't defined yet (GAME_SPEC has no
      // Reasoning cheat criteria) — every completed attempt is valid for now.
      isValidAttempt: true,
      invalidReason: null,
      trials,
      rawSummary,
    }

    setStatStatus((map) => applyGameResult('reasoning', map, result))
    setLastResult(result)
    if (result.isValidAttempt) savePetMemory(recordGameCompletion(loadPetMemory(), result, new Date()))
    setFinals((f) => ({ ...f, reasoning: isPersonalBest ? gameScore : (prevBest?.gameScore ?? 0) }))
    setPhase(flowMode === 'first' ? 'complete' : 'freeplay-complete')
  }

  // ---------------------------------------------------------------------
  // Completion paths for the 6 new games (one extra per stat, see
  // lib/game/game-registry.ts). Same shape as the 6 handlers above: build a
  // GameResult, hand it to the untouched applyGameResult/StatStatus
  // machinery, then set `finals` to this stat's personal-best gameScore —
  // the exact same rule every other stat uses, so a story-recall result and
  // a grid-recall result under the same stat feed the same `finals[stat]`.
  // isPersonalBest compares gameScore directly (see isBetterByGameScore)
  // rather than the classic game's own rawSummary-shaped comparator, since
  // a story-recall result and a grid-recall result aren't structurally
  // comparable field-by-field.
  // ---------------------------------------------------------------------

  const onStoryMemoryComplete = ({
    answers,
    rawSummary,
    gameScore,
  }: {
    answers: StoryMemoryAnswer[]
    rawSummary: StoryMemoryRawSummary
    gameScore: number
  }) => {
    const prevBest = statStatus.memory.current
    const isPersonalBest = isBetterByGameScore(gameScore, prevBest?.gameScore ?? null)

    const result: StoryMemoryGameResult = {
      sessionId: generateSessionId(),
      gameId: 'memory',
      variant: 'story-recall',
      gameVersion: STORY_MEMORY_GAME_VERSION,
      mode: flowMode,
      playedAt: new Date().toISOString(),
      device: detectDevice(),
      gameScore,
      raw: formatStoryMemoryRawRecord(rawSummary),
      final: undefined,
      isPersonalBest,
      isValidAttempt: true,
      invalidReason: null,
      answers,
      rawSummary,
    }

    setStatStatus((map) => applyGameResult('memory', map, result))
    setLastResult(result)
    if (result.isValidAttempt) savePetMemory(recordGameCompletion(loadPetMemory(), result, new Date()))
    setFinals((f) => ({ ...f, memory: isPersonalBest ? gameScore : (prevBest?.gameScore ?? 0) }))
    setPhase(flowMode === 'first' ? 'complete' : 'freeplay-complete')
  }

  const onColorTargetComplete = ({
    events,
    rawSummary,
    gameScore,
  }: {
    events: ColorTargetClickEvent[]
    rawSummary: ColorTargetRawSummary
    gameScore: number
  }) => {
    const prevBest = statStatus.focus.current
    const isPersonalBest = isBetterByGameScore(gameScore, prevBest?.gameScore ?? null)

    const result: ColorTargetGameResult = {
      sessionId: generateSessionId(),
      gameId: 'focus',
      variant: 'color-target',
      gameVersion: COLOR_TARGET_GAME_VERSION,
      mode: flowMode,
      playedAt: new Date().toISOString(),
      device: detectDevice(),
      gameScore,
      raw: formatColorTargetRawRecord(rawSummary),
      final: undefined,
      isPersonalBest,
      isValidAttempt: true,
      invalidReason: null,
      events,
      rawSummary,
    }

    setStatStatus((map) => applyGameResult('focus', map, result))
    setLastResult(result)
    if (result.isValidAttempt) savePetMemory(recordGameCompletion(loadPetMemory(), result, new Date()))
    setFinals((f) => ({ ...f, focus: isPersonalBest ? gameScore : (prevBest?.gameScore ?? 0) }))
    setPhase(flowMode === 'first' ? 'complete' : 'freeplay-complete')
  }

  const onDodgeObstacleComplete = ({
    events,
    rawSummary,
    gameScore,
  }: {
    events: DodgeObstacleEvent[]
    rawSummary: DodgeObstacleRawSummary
    gameScore: number
  }) => {
    const prevBest = statStatus.reaction.current
    const isPersonalBest = isBetterByGameScore(gameScore, prevBest?.gameScore ?? null)

    const result: DodgeObstacleGameResult = {
      sessionId: generateSessionId(),
      gameId: 'reaction',
      variant: 'dodge-run',
      gameVersion: DODGE_OBSTACLE_GAME_VERSION,
      mode: flowMode,
      playedAt: new Date().toISOString(),
      device: detectDevice(),
      gameScore,
      raw: formatDodgeObstacleRawRecord(rawSummary),
      final: undefined,
      isPersonalBest,
      isValidAttempt: true,
      invalidReason: null,
      events,
      rawSummary,
    }

    setStatStatus((map) => applyGameResult('reaction', map, result))
    setLastResult(result)
    if (result.isValidAttempt) savePetMemory(recordGameCompletion(loadPetMemory(), result, new Date()))
    setFinals((f) => ({ ...f, reaction: isPersonalBest ? gameScore : (prevBest?.gameScore ?? 0) }))
    setPhase(flowMode === 'first' ? 'complete' : 'freeplay-complete')
  }

  const onBestChoiceComplete = ({
    answers,
    rawSummary,
    gameScore,
  }: {
    answers: BestChoiceAnswer[]
    rawSummary: BestChoiceRawSummary
    gameScore: number
  }) => {
    const prevBest = statStatus.judgment.current
    const isPersonalBest = isBetterByGameScore(gameScore, prevBest?.gameScore ?? null)

    const result: BestChoiceGameResult = {
      sessionId: generateSessionId(),
      gameId: 'judgment',
      variant: 'best-choice',
      gameVersion: BEST_CHOICE_GAME_VERSION,
      mode: flowMode,
      playedAt: new Date().toISOString(),
      device: detectDevice(),
      gameScore,
      raw: formatBestChoiceRawRecord(rawSummary),
      final: undefined,
      isPersonalBest,
      isValidAttempt: true,
      invalidReason: null,
      answers,
      rawSummary,
    }

    setStatStatus((map) => applyGameResult('judgment', map, result))
    setLastResult(result)
    if (result.isValidAttempt) savePetMemory(recordGameCompletion(loadPetMemory(), result, new Date()))
    setFinals((f) => ({ ...f, judgment: isPersonalBest ? gameScore : (prevBest?.gameScore ?? 0) }))
    setPhase(flowMode === 'first' ? 'complete' : 'freeplay-complete')
  }

  const onFitPuzzleComplete = ({
    rounds,
    rawSummary,
    gameScore,
  }: {
    rounds: FitPuzzleRoundResult[]
    rawSummary: FitPuzzleRawSummary
    gameScore: number
  }) => {
    const prevBest = statStatus.spatial.current
    const isPersonalBest = isBetterByGameScore(gameScore, prevBest?.gameScore ?? null)

    const result: FitPuzzleGameResult = {
      sessionId: generateSessionId(),
      gameId: 'spatial',
      variant: 'fit-puzzle',
      gameVersion: FIT_PUZZLE_GAME_VERSION,
      mode: flowMode,
      playedAt: new Date().toISOString(),
      device: detectDevice(),
      gameScore,
      raw: formatFitPuzzleRawRecord(rawSummary),
      final: undefined,
      isPersonalBest,
      isValidAttempt: true,
      invalidReason: null,
      rounds,
      rawSummary,
    }

    setStatStatus((map) => applyGameResult('spatial', map, result))
    setLastResult(result)
    if (result.isValidAttempt) savePetMemory(recordGameCompletion(loadPetMemory(), result, new Date()))
    setFinals((f) => ({ ...f, spatial: isPersonalBest ? gameScore : (prevBest?.gameScore ?? 0) }))
    setPhase(flowMode === 'first' ? 'complete' : 'freeplay-complete')
  }

  const onNumberPatternComplete = ({
    answers,
    rawSummary,
    gameScore,
  }: {
    answers: NumberPatternAnswer[]
    rawSummary: NumberPatternRawSummary
    gameScore: number
  }) => {
    const prevBest = statStatus.reasoning.current
    const isPersonalBest = isBetterByGameScore(gameScore, prevBest?.gameScore ?? null)

    const result: NumberPatternGameResult = {
      sessionId: generateSessionId(),
      gameId: 'reasoning',
      variant: 'number-pattern',
      gameVersion: NUMBER_PATTERN_GAME_VERSION,
      mode: flowMode,
      playedAt: new Date().toISOString(),
      device: detectDevice(),
      gameScore,
      raw: formatNumberPatternRawRecord(rawSummary),
      final: undefined,
      isPersonalBest,
      isValidAttempt: true,
      invalidReason: null,
      answers,
      rawSummary,
    }

    setStatStatus((map) => applyGameResult('reasoning', map, result))
    setLastResult(result)
    if (result.isValidAttempt) savePetMemory(recordGameCompletion(loadPetMemory(), result, new Date()))
    setFinals((f) => ({ ...f, reasoning: isPersonalBest ? gameScore : (prevBest?.gameScore ?? 0) }))
    setPhase(flowMode === 'first' ? 'complete' : 'freeplay-complete')
  }

  /** Free Play step 1 — stat chosen in GrowScreen, now show that stat's game pool so the player can pick which one to play. */
  const selectFreePlayGame = (statId: StatId) => {
    setActiveStatId(statId)
    setFlowMode('free')
    setPhase('grow-game')
  }

  /** Free Play step 2 — a specific game was chosen in GrowGameScreen, start it. */
  const confirmFreePlayGame = (gameKey: string) => {
    setActiveGameKey(gameKey)
    setPhase('game')
  }

  const returnToRoom = () => setPhase('room')

  /**
   * Guards NavRail tab switches: leaving 테마 while it has unsaved room
   * edits opens a confirm dialog instead of switching immediately (see
   * pendingNavTab render below). Any other switch goes through untouched.
   */
  const handleNavSelect = (tab: NavTab) => {
    if (phase === 'theme' && themeDirty && tab !== 'theme') {
      setPendingNavTab(tab)
      return
    }
    setPhase(tab)
  }

  const handleDiscardThemeEdits = () => {
    if (pendingNavTab) setPhase(pendingNavTab)
    setPendingNavTab(null)
    setThemeDirty(false)
  }

  /**
   * Runs once the full 6-stat test is complete (status -> egg transition).
   * Already confirmed (replaying after locking in a pet): only refreshes
   * latestFinals, the pet itself never changes. Otherwise (first-ever run,
   * or a redo before ever confirming): computes a fresh candidate pool —
   * reusing the existing seed if one exists, so the same seed keeps
   * producing the same deterministic order — and starts back at candidate 0,
   * unconfirmed. Reveal itself decides the pet via reroll/confirm.
   *
   * Also the QA Skip path's completion function (see handleSkipGames below)
   * — `overrideFinals` lets Skip hand in a freshly-generated mock result
   * without waiting a render cycle for `finals` state to update first, but
   * every other step (candidate matching, storage, confirmed-pet growth
   * refresh) is the exact same code a real playthrough goes through.
   */
  const handleMeetStatling = (overrideFinals?: Record<StatId, number>) => {
    const effectiveFinals = overrideFinals ?? finals
    if (overrideFinals) setFinals(overrideFinals)

    const stored = loadStoredPetProfile()
    const next = stored?.confirmed
      ? refreshGrowthData(stored, effectiveFinals)
      : beginPetAssignment(effectiveFinals, stored?.seed)

    saveStoredPetProfile(next)
    setPetRecord(next)
    setPhase('egg')
  }

  /**
   * Dev/QA only (see SHOW_QA_SKIP) — generates a full 6-stat result instead
   * of playing the mini-games, then hands it to the exact same
   * handleMeetStatling completion path a real playthrough uses. Does not
   * touch statStatus/lastResult/any per-game scoring — those stay whatever
   * they were, since Skip never runs the real games at all.
   *
   * Clears any leftover *unconfirmed* record first: handleMeetStatling
   * normally reuses an existing unconfirmed record's seed (correct for a
   * real user resuming a reveal after a refresh), but for repeated Skip
   * clicks during QA that meant every run kept the same seed — same
   * seed -> same sort key for whichever pet happens to always be in the
   * candidate pool -> the same pet ("천사폭신이") every time. A CONFIRMED
   * record is left untouched (Skip must never reassign an already-locked-in
   * pet, only refresh its growth data — same as real replays).
   */
  const handleSkipGames = (preset: MockStatPreset) => {
    const stored = loadStoredPetProfile()
    if (stored && !stored.confirmed) {
      clearStoredPetProfile()
      setPetRecord(null)
    }
    handleMeetStatling(generateMockFinals(preset))
  }

  /** Dev/QA only — "대표 펫 초기화": wipes the representative-pet record entirely (confirmed or not) so the next Skip/playthrough starts completely fresh. */
  const handleResetPetProfile = () => {
    clearStoredPetProfile()
    setPetRecord(null)
  }

  /**
   * Toggling the same folder again turns the tester override back off. If
   * we're not already on the Room screen (e.g. clicked from Landing or
   * mid-game), turning it on also runs the same Skip flow the preset
   * buttons use — otherwise the click would just flip a flag with nothing
   * visibly different, since Room (the only screen that reads
   * testerFolderId) isn't even on screen yet. That flow is exactly what
   * shows the Egg hatching motion en route to Room.
   */
  const handleToggleTesterFolder = (folderId: string) => {
    const turningOn = testerFolderId !== folderId
    setTesterFolderId(turningOn ? folderId : null)
    if (turningOn && phase !== 'room') {
      handleSkipGames('balanced')
    }
  }

  /** "다른 Statling 보기" — advances to the next unseen top-5 candidate. No-op once confirmed or out of rerolls. */
  const handleRerollPet = () => {
    if (!petRecord) return
    const updated = rerollPet(petRecord)
    if (updated !== petRecord) {
      saveStoredPetProfile(updated)
      setPetRecord(updated)
    }
  }

  /** "이 Statling과 함께하기" — locks in whichever pet is currently on screen, then always continues forward. */
  const handleConfirmPet = () => {
    if (petRecord && !petRecord.confirmed) {
      const updated = confirmPet(petRecord)
      saveStoredPetProfile(updated)
      setPetRecord(updated)
    }
    setPhase('save')
  }

  const currentBestRaw = statStatus[activeStatId].current?.raw ?? null
  const currentBestScore = statStatus[activeStatId].current?.gameScore ?? null

  // key forces a fresh mount per step so transitions/animations replay
  const stepKey = `${phase}-${activeStatId}-${flowMode}-${activeGameKey}`

  return (
    <main className="min-h-dvh bg-background">
      <div key={stepKey} className="animate-in fade-in slide-in-from-bottom-3 duration-300">
        {phase === 'landing' && <LandingScreen onStart={start} />}

        {SHOW_QA_SKIP && (phase === 'room' || (phase === 'game' && flowMode === 'first')) && (
          <QaSkipMenu
            onSkip={handleSkipGames}
            onReset={handleResetPetProfile}
            testerFolderId={testerFolderId}
            onToggleTesterFolder={handleToggleTesterFolder}
          />
        )}

        {phase === 'game' &&
          (activeStatId === 'reaction' ? (
            activeGameKey === 'reaction-dodge-run' ? (
              <DodgeObstacleGame index={index} mode={flowMode} onComplete={onDodgeObstacleComplete} />
            ) : (
              <ReactionGame index={index} mode={flowMode} onComplete={onReactionComplete} />
            )
          ) : activeStatId === 'memory' ? (
            activeGameKey === 'memory-story-recall' ? (
              <StoryMemoryGame index={index} mode={flowMode} onComplete={onStoryMemoryComplete} />
            ) : (
              <MemoryGame index={index} mode={flowMode} onComplete={onMemoryComplete} />
            )
          ) : activeStatId === 'focus' ? (
            activeGameKey === 'focus-color-target' ? (
              <ColorTargetGame index={index} mode={flowMode} onComplete={onColorTargetComplete} />
            ) : (
              <FocusGame index={index} mode={flowMode} onComplete={onFocusComplete} />
            )
          ) : activeStatId === 'judgment' ? (
            activeGameKey === 'decision-best-choice' ? (
              <BestChoiceGame index={index} mode={flowMode} onComplete={onBestChoiceComplete} />
            ) : (
              <JudgmentGame index={index} mode={flowMode} onComplete={onJudgmentComplete} />
            )
          ) : activeStatId === 'spatial' ? (
            activeGameKey === 'spatial-fit-puzzle' ? (
              <FitPuzzleGame index={index} mode={flowMode} onComplete={onFitPuzzleComplete} />
            ) : (
              <SpatialGame index={index} mode={flowMode} onComplete={onSpatialComplete} />
            )
          ) : activeGameKey === 'reasoning-number-pattern' ? (
            <NumberPatternGame index={index} mode={flowMode} onComplete={onNumberPatternComplete} />
          ) : (
            <ReasoningGame index={index} mode={flowMode} onComplete={onReasoningComplete} />
          ))}

        {phase === 'complete' && lastResult && (
          <CompleteScreen
            statId={activeStatId}
            index={index}
            gameScore={lastResult.gameScore}
            raw={lastResult.raw}
            personalBestScore={currentBestScore}
            isNewRecord={lastResult.isPersonalBest}
            onNext={goNextFirst}
          />
        )}

        {phase === 'freeplay-complete' && lastResult && (
          <FreePlayResultScreen
            statId={activeStatId}
            raw={lastResult.raw}
            personalBestRaw={currentBestRaw}
            isNewRecord={lastResult.isPersonalBest}
            isRecommended={activeStatId === RECOMMENDED_STAT_PLACEHOLDER}
            onReturnToRoom={returnToRoom}
          />
        )}

        {phase === 'status' && (
          <StatusScreen
            context="first-complete"
            values={finals}
            onMeetStatling={() => handleMeetStatling()}
            onReplay={start}
          />
        )}

        {phase === 'egg' && (
          <EggScreen
            petProfile={displayedPetProfile ? applyTesterOverride(displayedPetProfile) : null}
            onHatched={() => setPhase('reveal')}
          />
        )}

        {phase === 'reveal' && petRecord && displayedPetProfile && (
          <RevealScreen
            petProfile={applyTesterOverride(displayedPetProfile)}
            topStat={topStat}
            secondaryStat={getSecondStat(finals)}
            finals={finals}
            isConfirmed={petRecord.confirmed}
            canReroll={!petRecord.confirmed && petRecord.rerollCount < petRecord.maxRerolls}
            rerollsRemaining={petRecord.maxRerolls - petRecord.rerollCount}
            onReroll={handleRerollPet}
            onConfirm={handleConfirmPet}
          />
        )}

        {phase === 'save' && (
          <SaveScreen onContinue={() => setPhase('naming')} onSkip={() => setPhase('naming')} />
        )}

        {phase === 'naming' && displayedPetProfile && (
          <NamingScreen
            petProfile={applyTesterOverride(displayedPetProfile)}
            onConfirm={(name) => {
              setStatlingName(name)
              setPhase('room')
            }}
          />
        )}

        {phase === 'room' && (
          <RoomScreen
            statlingName={statlingName}
            topStat={topStat}
            petProfile={displayedPetProfile}
            onGrow={() => setPhase('grow')}
            testerFolder={activeTesterFolder}
          />
        )}

        {phase === 'mystats' && <StatusScreen context="my-stats" values={finals} />}

        {phase === 'ranking' && (
          <ComingSoonScreen
            icon={Trophy}
            title="랭킹"
            message={'더 많은 Statling이 모이면\n새로운 경쟁이 시작돼요.'}
          />
        )}

        {phase === 'mypage' && <MyPageScreen statlingName={statlingName} topStat={topStat} />}

        {phase === 'theme' && (
          <ThemeScreen topStat={topStat} petProfile={displayedPetProfile} onDirtyChange={setThemeDirty} />
        )}

        {phase === 'grow' && (
          <GrowScreen
            statStatus={statStatus}
            recommendedStat={RECOMMENDED_STAT_PLACEHOLDER}
            onSelect={selectFreePlayGame}
            onBack={returnToRoom}
          />
        )}

        {phase === 'grow-game' && (
          <GrowGameScreen
            statId={activeStatId}
            onSelect={confirmFreePlayGame}
            onBack={() => setPhase('grow')}
          />
        )}
      </div>

      {NAV_PHASES.includes(phase) && <NavRail active={phase as NavTab} onSelect={handleNavSelect} />}

      <ConfirmDialog
        open={pendingNavTab !== null}
        onOpenChange={(open) => {
          if (!open) setPendingNavTab(null)
        }}
        title="저장하지 않은 변경사항이 있어요."
        description={'지금 나가면 방 편집 내용이 사라져요.\n계속 편집할까요, 변경사항을 버릴까요?'}
        confirmLabel="변경사항 버리기"
        cancelLabel="계속 편집"
        onConfirm={handleDiscardThemeEdits}
      />
    </main>
  )
}
