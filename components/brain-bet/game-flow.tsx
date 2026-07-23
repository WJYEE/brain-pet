'use client'

import { useState } from 'react'
import { LandingScreen } from '@/components/brain-bet/screens/landing-screen'
import { GameScreen } from '@/components/brain-bet/screens/game-screen'
import { CompleteScreen } from '@/components/brain-bet/screens/complete-screen'
import { StatusScreen } from '@/components/brain-bet/screens/status-screen'
import { PLAY_ORDER, STATS, TOTAL_GAMES, type StatId } from '@/lib/brain-bet'

type Phase = 'landing' | 'game' | 'complete' | 'status'

/** Placeholder record generator so the prototype feels alive (no real logic). */
function rollRecord(statId: StatId) {
  const unit = STATS[statId].unit
  const radar = Math.round(48 + Math.random() * 47) // 48–95
  let display: number
  if (unit === 'ms') display = Math.round(190 + Math.random() * 150)
  else if (unit === 'lv') display = Math.round(5 + Math.random() * 8)
  else display = Math.round(620 + Math.random() * 360)
  return { radar, display }
}

const emptyValues = () =>
  Object.fromEntries(PLAY_ORDER.map((id) => [id, 0])) as Record<StatId, number>

export function GameFlow() {
  const [phase, setPhase] = useState<Phase>('landing')
  const [index, setIndex] = useState(0)
  const [radarValues, setRadarValues] = useState<Record<StatId, number>>(emptyValues)
  const [records, setRecords] = useState<Record<StatId, number>>(emptyValues)

  const currentStatId = PLAY_ORDER[index]

  const start = () => {
    setRadarValues(emptyValues())
    setRecords(emptyValues())
    setIndex(0)
    setPhase('game')
  }

  const finishRound = () => {
    const { radar, display } = rollRecord(currentStatId)
    setRadarValues((v) => ({ ...v, [currentStatId]: radar }))
    setRecords((r) => ({ ...r, [currentStatId]: display }))
    setPhase('complete')
  }

  const goNext = () => {
    if (index < TOTAL_GAMES - 1) {
      setIndex((i) => i + 1)
      setPhase('game')
    } else {
      setPhase('status')
    }
  }

  const replay = () => {
    setPhase('landing')
    setIndex(0)
  }

  // key forces a fresh mount per step so transitions replay
  const stepKey = `${phase}-${index}`

  return (
    <main className="min-h-dvh bg-background">
      <div
        key={stepKey}
        className="animate-in fade-in slide-in-from-bottom-3 duration-300"
      >
        {phase === 'landing' && <LandingScreen onStart={start} />}
        {phase === 'game' && (
          <GameScreen statId={currentStatId} index={index} onComplete={finishRound} />
        )}
        {phase === 'complete' && (
          <CompleteScreen
            statId={currentStatId}
            index={index}
            record={records[currentStatId]}
            onNext={goNext}
          />
        )}
        {phase === 'status' && <StatusScreen values={radarValues} onReplay={replay} />}
      </div>
    </main>
  )
}
