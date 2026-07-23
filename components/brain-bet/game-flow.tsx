'use client'

import { useState } from 'react'
import { Palette, Trophy } from 'lucide-react'
import { LandingScreen } from '@/components/brain-bet/screens/landing-screen'
import { GameScreen } from '@/components/brain-bet/screens/game-screen'
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
import {
  PLAY_ORDER,
  TOTAL_GAMES,
  emptyResults,
  generateResult,
  getTopStat,
  type StatId,
  type StatResult,
} from '@/lib/brain-bet'
import { RECOMMENDED_STAT_PLACEHOLDER } from '@/lib/room'

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

export function GameFlow() {
  const [phase, setPhase] = useState<Phase>('landing')
  const [flowMode, setFlowMode] = useState<'first' | 'free'>('first')
  const [index, setIndex] = useState(0)
  const [activeStatId, setActiveStatId] = useState<StatId>(PLAY_ORDER[0])
  const [results, setResults] = useState<Record<StatId, StatResult | null>>(emptyResults())
  const [statlingName, setStatlingName] = useState('')

  const finals = Object.fromEntries(
    PLAY_ORDER.map((id) => [id, results[id]?.final ?? 0]),
  ) as Record<StatId, number>
  const topStat = getTopStat(finals)

  const start = () => {
    setResults(emptyResults())
    setIndex(0)
    setActiveStatId(PLAY_ORDER[0])
    setFlowMode('first')
    setPhase('game')
  }

  const finishRound = () => {
    const result = generateResult(activeStatId)
    setResults((r) => ({ ...r, [activeStatId]: result }))
    setPhase(flowMode === 'first' ? 'complete' : 'freeplay-complete')
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

  const selectFreePlayGame = (statId: StatId) => {
    setActiveStatId(statId)
    setFlowMode('free')
    setPhase('game')
  }

  const returnToRoom = () => setPhase('room')

  // key forces a fresh mount per step so transitions replay
  const stepKey = `${phase}-${activeStatId}-${flowMode}`

  return (
    <main className="min-h-dvh bg-background">
      <div key={stepKey} className="animate-in fade-in slide-in-from-bottom-3 duration-300">
        {phase === 'landing' && <LandingScreen onStart={start} />}

        {phase === 'game' && (
          <GameScreen
            statId={activeStatId}
            index={index}
            mode={flowMode}
            onComplete={finishRound}
          />
        )}

        {phase === 'complete' && (
          <CompleteScreen
            statId={activeStatId}
            index={index}
            result={results[activeStatId]!}
            onNext={goNextFirst}
          />
        )}

        {phase === 'freeplay-complete' && (
          <FreePlayResultScreen
            statId={activeStatId}
            result={results[activeStatId]!}
            isRecommended={activeStatId === RECOMMENDED_STAT_PLACEHOLDER}
            onReturnToRoom={returnToRoom}
          />
        )}

        {phase === 'status' && (
          <StatusScreen
            context="first-complete"
            values={finals}
            onMeetStatling={() => setPhase('egg')}
            onReplay={start}
          />
        )}

        {phase === 'egg' && <EggScreen onHatched={() => setPhase('reveal')} />}

        {phase === 'reveal' && (
          <RevealScreen topStat={topStat} onContinue={() => setPhase('save')} />
        )}

        {phase === 'save' && (
          <SaveScreen onContinue={() => setPhase('naming')} onSkip={() => setPhase('naming')} />
        )}

        {phase === 'naming' && (
          <NamingScreen
            topStat={topStat}
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
            results={results}
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
