'use client'

import { useEffect, useState } from 'react'
import { Palette, Trophy } from 'lucide-react'
import { LandingScreen } from '@/components/brain-bet/screens/landing-screen'
import { ReactionGame } from '@/components/brain-bet/games/reaction-game'
import { MemoryGame } from '@/components/brain-bet/games/memory-game'
import { FocusGame } from '@/components/brain-bet/games/focus-game'
import { JudgmentGame } from '@/components/brain-bet/games/judgment-game'
import { SpatialGame } from '@/components/brain-bet/games/spatial-game'
import { ReasoningGame } from '@/components/brain-bet/games/reasoning-game'
import { CompleteScreen } from '@/components/brain-bet/screens/complete-screen'
import { FreePlayResultScreen } from '@/components/brain-bet/screens/free-play-result-screen'
import { StatusScreen } from '@/components/brain-bet/screens/status-screen'
import { EggScreen } from '@/components/brain-bet/screens/egg-screen'
import { RevealScreen } from '@/components/brain-bet/screens/reveal-screen'
import { SaveScreen } from '@/components/brain-bet/screens/save-screen'
import { NamingScreen } from '@/components/brain-bet/screens/naming-screen'
import { RoomScreen } from '@/components/brain-bet/screens/room-screen'
import { GrowScreen } from '@/components/brain-bet/screens/grow-screen'
import { ComingSoonScreen } from '@/components/brain-bet/screens/coming-soon-screen'
import { MyPageScreen } from '@/components/brain-bet/screens/my-page-screen'
import { NavRail, type NavTab } from '@/components/brain-bet/nav-rail'
import { QaSkipMenu } from '@/components/brain-bet/qa-skip-menu'
import { PLAY_ORDER, TOTAL_GAMES, getSecondStat, getTopStat, type StatId } from '@/lib/brain-bet'
import { RECOMMENDED_STAT_PLACEHOLDER } from '@/lib/room'
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
import { generateMockFinals, type MockStatPreset } from '@/lib/game/mock-finals'
import { REACTION_GAME_VERSION } from '@/lib/config/reaction.config'
import { MEMORY_GAME_VERSION } from '@/lib/config/memory.config'
import { FOCUS_GAME_VERSION } from '@/lib/config/focus.config'
import { JUDGMENT_GAME_VERSION } from '@/lib/config/judgment.config'
import { SPATIAL_GAME_VERSION } from '@/lib/config/spatial.config'
import { REASONING_GAME_VERSION } from '@/lib/config/reasoning.config'
import { detectDevice } from '@/lib/game/device'
import { generateSessionId } from '@/lib/game/id'
import { applyGameResult, emptyStatStatusMap } from '@/lib/game/stat-status'
import type {
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
} from '@/lib/game/types'
import {
  evaluateReactionValidity,
  formatReactionRawRecord,
  isBetterReactionResult,
} from '@/lib/scoring/reaction'
import { formatMemoryRawRecord, isBetterMemoryResult } from '@/lib/scoring/memory'
import { formatFocusRawRecord, isBetterFocusResult } from '@/lib/scoring/focus'
import { formatJudgmentRawRecord, isBetterJudgmentResult } from '@/lib/scoring/judgment'
import { formatSpatialRawRecord, isBetterSpatialResult } from '@/lib/scoring/spatial'
import { formatReasoningRawRecord, isBetterReasoningResult } from '@/lib/scoring/reasoning'

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
  const [statStatus, setStatStatus] = useState<StatStatusMap>(emptyStatStatusMap())
  const [lastResult, setLastResult] = useState<GameResult | null>(null)
  /**
   * Mock 0-100 values for the Radar / MY STATUS chart only. Deliberately
   * decoupled from real game data — no fake Percentile/Final Stat is ever
   * derived from real Reaction results (GAME_SPEC §9, §128).
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

  const start = () => {
    setIndex(0)
    setActiveStatId(PLAY_ORDER[0])
    setFlowMode('first')
    setFinals(emptyFinals())
    setPhase('game')
  }

  const goNextFirst = () => {
    if (index < TOTAL_GAMES - 1) {
      const nextIndex = index + 1
      setIndex(nextIndex)
      setActiveStatId(PLAY_ORDER[nextIndex])
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
    // Safe: this app only ever stores a ReactionGameResult under the 'reaction' key.
    const prevBest = statStatus.reaction.current as ReactionGameResult | null
    const isPersonalBest =
      isValidAttempt &&
      isBetterReactionResult(
        { rawSummary },
        prevBest ? { rawSummary: prevBest.rawSummary } : null,
      )

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
    // Radar/MY STATUS still shows a decoupled mock value here — real
    // Reaction data is never converted into a fake Final Stat/Percentile.
    setFinals((f) => ({ ...f, reaction: Math.round(48 + Math.random() * 47) }))
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
    // Safe: this app only ever stores a MemoryGameResult under the 'memory' key.
    const prevBest = statStatus.memory.current as MemoryGameResult | null
    const isPersonalBest = isBetterMemoryResult(
      { rawSummary },
      prevBest ? { rawSummary: prevBest.rawSummary } : null,
    )

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
    // Radar/MY STATUS still shows a decoupled mock value — real Memory data
    // is never converted into a fake Final Stat/Percentile.
    setFinals((f) => ({ ...f, memory: Math.round(48 + Math.random() * 47) }))
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
    // Safe: this app only ever stores a FocusGameResult under the 'focus' key.
    const prevBest = statStatus.focus.current as FocusGameResult | null
    const isPersonalBest = isBetterFocusResult(
      { rawSummary },
      prevBest ? { rawSummary: prevBest.rawSummary } : null,
    )

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
    // Radar/MY STATUS still shows a decoupled mock value — real Focus data
    // is never converted into a fake Final Stat/Percentile.
    setFinals((f) => ({ ...f, focus: Math.round(48 + Math.random() * 47) }))
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
    // Safe: this app only ever stores a JudgmentGameResult under the 'judgment' key.
    const prevBest = statStatus.judgment.current as JudgmentGameResult | null
    const isPersonalBest = isBetterJudgmentResult(
      { rawSummary },
      prevBest ? { rawSummary: prevBest.rawSummary } : null,
    )

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
    // Radar/MY STATUS still shows a decoupled mock value — real Judgment data
    // is never converted into a fake Final Stat/Percentile.
    setFinals((f) => ({ ...f, judgment: Math.round(48 + Math.random() * 47) }))
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
    // Safe: this app only ever stores a SpatialGameResult under the 'spatial' key.
    const prevBest = statStatus.spatial.current as SpatialGameResult | null
    const isPersonalBest = isBetterSpatialResult(
      { rawSummary },
      prevBest ? { rawSummary: prevBest.rawSummary } : null,
    )

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
    // Radar/MY STATUS still shows a decoupled mock value — real Spatial data
    // is never converted into a fake Final Stat/Percentile.
    setFinals((f) => ({ ...f, spatial: Math.round(48 + Math.random() * 47) }))
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
    // Safe: this app only ever stores a ReasoningGameResult under the 'reasoning' key.
    const prevBest = statStatus.reasoning.current as ReasoningGameResult | null
    const isPersonalBest = isBetterReasoningResult(
      { rawSummary },
      prevBest ? { rawSummary: prevBest.rawSummary } : null,
    )

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
    // Radar/MY STATUS still shows a decoupled mock value — real Reasoning
    // data is never converted into a fake Final Stat/Percentile.
    setFinals((f) => ({ ...f, reasoning: Math.round(48 + Math.random() * 47) }))
    setPhase(flowMode === 'first' ? 'complete' : 'freeplay-complete')
  }

  const selectFreePlayGame = (statId: StatId) => {
    setActiveStatId(statId)
    setFlowMode('free')
    setPhase('game')
  }

  const returnToRoom = () => setPhase('room')

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

  // key forces a fresh mount per step so transitions/animations replay
  const stepKey = `${phase}-${activeStatId}-${flowMode}`

  return (
    <main className="min-h-dvh bg-background">
      <div key={stepKey} className="animate-in fade-in slide-in-from-bottom-3 duration-300">
        {phase === 'landing' && <LandingScreen onStart={start} />}

        {phase === 'game' && flowMode === 'first' && SHOW_QA_SKIP && (
          <QaSkipMenu onSkip={handleSkipGames} onReset={handleResetPetProfile} />
        )}

        {phase === 'game' &&
          (activeStatId === 'reaction' ? (
            <ReactionGame index={index} mode={flowMode} onComplete={onReactionComplete} />
          ) : activeStatId === 'memory' ? (
            <MemoryGame index={index} mode={flowMode} onComplete={onMemoryComplete} />
          ) : activeStatId === 'focus' ? (
            <FocusGame index={index} mode={flowMode} onComplete={onFocusComplete} />
          ) : activeStatId === 'judgment' ? (
            <JudgmentGame index={index} mode={flowMode} onComplete={onJudgmentComplete} />
          ) : activeStatId === 'spatial' ? (
            <SpatialGame index={index} mode={flowMode} onComplete={onSpatialComplete} />
          ) : (
            <ReasoningGame index={index} mode={flowMode} onComplete={onReasoningComplete} />
          ))}

        {phase === 'complete' && lastResult && (
          <CompleteScreen
            statId={activeStatId}
            index={index}
            raw={lastResult.raw}
            personalBestRaw={currentBestRaw}
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
            onMeetStatling={handleMeetStatling}
            onReplay={start}
          />
        )}

        {phase === 'egg' && <EggScreen petProfile={displayedPetProfile} onHatched={() => setPhase('reveal')} />}

        {phase === 'reveal' && petRecord && displayedPetProfile && (
          <RevealScreen
            petProfile={displayedPetProfile}
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
            petProfile={displayedPetProfile}
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
          <ComingSoonScreen
            icon={Palette}
            title="테마"
            message={'나만의 Room과 색상을\n곧 꾸밀 수 있어요.'}
          />
        )}

        {phase === 'grow' && (
          <GrowScreen
            statStatus={statStatus}
            recommendedStat={RECOMMENDED_STAT_PLACEHOLDER}
            onSelect={selectFreePlayGame}
            onBack={returnToRoom}
          />
        )}
      </div>

      {NAV_PHASES.includes(phase) && (
        <NavRail active={phase as NavTab} onSelect={(tab) => setPhase(tab)} />
      )}
    </main>
  )
}
