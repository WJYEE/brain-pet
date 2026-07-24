'use client'

import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Logo } from '@/components/brain-bet/logo'
import { ProgressTrack } from '@/components/brain-bet/progress-track'
import { StatBadge } from '@/components/brain-bet/stat-badge'
import { FocusSymbolView } from '@/components/brain-bet/games/focus-symbol'
import { STATS } from '@/lib/brain-bet'
import {
  FOCUS_DIFFICULTY_SEQUENCE,
  FOCUS_NO_TARGET_ROUND_COUNT,
  FOCUS_REAL_GRID_SIZE,
  FOCUS_REAL_ROUNDS,
  FOCUS_ROUND_FEEDBACK_MS,
  FOCUS_ROUND_TIME_LIMIT_MS,
  FOCUS_TUTORIAL_DIFFICULTY,
  FOCUS_TUTORIAL_GRID_SIZE,
  FOCUS_TUTORIAL_ROUNDS,
  FOCUS_TUTORIAL_TRANSITION_MS,
} from '@/lib/config/focus.config'
import { generateFocusLayout, type FocusLayout } from '@/lib/game/focus-grid'
import { selectNoTargetRoundIndices } from '@/lib/game/focus-rounds'
import { FOCUS_TARGET_SYMBOL, generateDistractorSymbol, type FocusSymbolSpec } from '@/lib/game/focus-symbol'
import type { FocusRawSummary, FocusRoundTrial } from '@/lib/game/types'
import { calculateFocusScore, summarizeFocusRounds } from '@/lib/scoring/focus'
import { cn } from '@/lib/utils'

type Stage = 'intro' | 'playing' | 'feedback'
type Round = 'tutorial-target' | 'tutorial-none' | 'real'

interface FocusGameProps {
  index: number
  mode: 'first' | 'free'
  onComplete: (payload: {
    rounds: FocusRoundTrial[]
    rawSummary: FocusRawSummary
    gameScore: number
  }) => void
}

interface LastOutcome {
  selectedCellId: string | null
  selectedCorrectly: boolean
  timedOut: boolean
}

/**
 * Feedback copy branches strictly on targetPresent first, so a no-target
 * round never implies (or reveals) a target that was never there.
 */
export function computeFocusFeedbackMessage(
  targetPresent: boolean,
  selectedCorrectly: boolean,
  timedOut: boolean,
): string {
  if (targetPresent) {
    if (selectedCorrectly) return '찾았어요!'
    if (timedOut) return '시간 초과! 여기 있었어요.'
    return '아쉬워요, 여기 있었어요!'
  }
  if (selectedCorrectly) return '맞아요, 이번엔 없었어요!'
  if (timedOut) return '시간 초과! 이번엔 Target이 없었어요.'
  return '이번엔 Target이 없었어요.'
}

/**
 * Real, interactive Focus ("Target Hunt") game — GAME_SPEC §45-54. A single
 * fixed target symbol is defined once for the whole session (no Rule
 * Switching — that's Judgment's job); each round shows a static grid with
 * distractors (and, most rounds, the target) and the user makes exactly one
 * decisive action: click the target cell, or press "없음". Tutorial uses a
 * small, easy grid (FOCUS_TUTORIAL_GRID_SIZE); Real rounds use a much larger
 * one (FOCUS_REAL_GRID_SIZE) so the target isn't visible at a glance. A soft
 * time limit on real rounds keeps searching from being unboundedly easy.
 * Tutorial (2, discarded — one target-present, one no-target) then
 * FOCUS_REAL_ROUNDS fixed-difficulty rounds.
 */
export function FocusGame({ index, mode, onComplete }: FocusGameProps) {
  const stat = STATS.focus

  const [stage, setStage] = useState<Stage>('intro')
  const [round, setRound] = useState<Round>('tutorial-target')
  const [realRoundIndex, setRealRoundIndex] = useState(0)
  const [noTargetRoundIndices, setNoTargetRoundIndices] = useState<Set<number>>(new Set())
  const [gridSize, setGridSize] = useState(FOCUS_TUTORIAL_GRID_SIZE)
  const [targetPresent, setTargetPresent] = useState(true)
  const [layout, setLayout] = useState<FocusLayout>({ occupiedCells: [], targetCellId: null })
  const [symbols, setSymbols] = useState<Record<string, FocusSymbolSpec>>({})
  const [message, setMessage] = useState('')
  const [rounds, setRounds] = useState<FocusRoundTrial[]>([])
  const [timeLimitMs, setTimeLimitMs] = useState<number | null>(null)
  const [remainingMs, setRemainingMs] = useState(0)
  const [roundStartedAt, setRoundStartedAt] = useState(0)
  const [lastOutcome, setLastOutcome] = useState<LastOutcome | null>(null)

  const timeoutsRef = useRef<number[]>([])
  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    timeoutsRef.current.push(id)
    return id
  }
  const clearScheduled = () => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id))
    timeoutsRef.current = []
  }
  useEffect(() => clearScheduled, [])

  // Countdown gauge tick — real rounds only; Tutorial has no time limit.
  useEffect(() => {
    if (stage !== 'playing' || timeLimitMs == null) return
    const interval = window.setInterval(() => {
      setRemainingMs(Math.max(0, timeLimitMs - (performance.now() - roundStartedAt)))
    }, 100)
    return () => window.clearInterval(interval)
  }, [stage, timeLimitMs, roundStartedAt])

  const finishRound = (selectedCellId: string | null, selectedNone: boolean, timedOut: boolean) => {
    clearScheduled()
    const responseTimeMs = timedOut ? (timeLimitMs ?? 0) : Math.round(performance.now() - roundStartedAt)

    let selectedCorrectly = false
    let falseClick = false
    let missedTarget = false

    if (targetPresent) {
      if (!timedOut && selectedCellId === layout.targetCellId) {
        selectedCorrectly = true
      } else if (!timedOut && selectedCellId != null) {
        falseClick = true
      } else {
        missedTarget = true // said "없음", or timed out with no action
      }
    } else if (!timedOut && selectedNone) {
      selectedCorrectly = true
    } else if (!timedOut && selectedCellId != null) {
      falseClick = true
    }
    // else: timed out with no target present — selectedCorrectly stays false,
    // but this is neither a falseClick nor a missedTarget (there was nothing
    // to click and nothing to miss — it's its own "no action taken" case).

    setStage('feedback')
    setLastOutcome({ selectedCellId, selectedCorrectly, timedOut })
    setMessage(computeFocusFeedbackMessage(targetPresent, selectedCorrectly, timedOut))

    if (round === 'tutorial-target') {
      schedule(() => {
        setMessage('이번엔 Target이 없는 경우도 연습해볼게요.')
        schedule(() => {
          setRound('tutorial-none')
          beginRound('tutorial-none', 0)
        }, FOCUS_TUTORIAL_TRANSITION_MS)
      }, FOCUS_ROUND_FEEDBACK_MS)
      return
    }

    if (round === 'tutorial-none') {
      schedule(() => {
        setMessage('튜토리얼 완료! 이제 실전을 시작할게요.')
        schedule(() => {
          setRound('real')
          beginRound('real', 0)
        }, FOCUS_TUTORIAL_TRANSITION_MS)
      }, FOCUS_ROUND_FEEDBACK_MS)
      return
    }

    const difficultyNow = FOCUS_DIFFICULTY_SEQUENCE[realRoundIndex]
    const trial: FocusRoundTrial = {
      roundIndex: realRoundIndex,
      difficultyLevel: difficultyNow.level,
      distractorCount: difficultyNow.totalPlacementCount - (targetPresent ? 1 : 0),
      similarityLevel: difficultyNow.similarityLevel,
      targetPresent,
      targetCellId: layout.targetCellId,
      selectedCellId,
      selectedNone,
      selectedCorrectly,
      falseClick,
      missedTarget,
      timedOut,
      responseTimeMs,
      createdAt: new Date().toISOString(),
    }
    const updated = [...rounds, trial]
    setRounds(updated)

    if (updated.length >= FOCUS_REAL_ROUNDS) {
      const rawSummary = summarizeFocusRounds(updated)
      const gameScore = calculateFocusScore(rawSummary)
      schedule(() => {
        onComplete({ rounds: updated, rawSummary, gameScore })
      }, FOCUS_ROUND_FEEDBACK_MS)
      return
    }

    schedule(() => {
      const nextIndex = realRoundIndex + 1
      setRealRoundIndex(nextIndex)
      beginRound('real', nextIndex)
    }, FOCUS_ROUND_FEEDBACK_MS)
  }

  const beginRound = (nextRound: Round, nextRealIndex: number) => {
    clearScheduled()
    const isReal = nextRound === 'real'
    const difficultyNow = isReal ? FOCUS_DIFFICULTY_SEQUENCE[nextRealIndex] : FOCUS_TUTORIAL_DIFFICULTY
    const gridSizeNow = isReal ? FOCUS_REAL_GRID_SIZE : FOCUS_TUTORIAL_GRID_SIZE
    const targetPresentNow =
      nextRound === 'tutorial-target'
        ? true
        : nextRound === 'tutorial-none'
          ? false
          : !noTargetRoundIndices.has(nextRealIndex)
    const distractorCountNow = difficultyNow.totalPlacementCount - (targetPresentNow ? 1 : 0)

    const layoutNow = generateFocusLayout(gridSizeNow, distractorCountNow, targetPresentNow)
    const symbolMap: Record<string, FocusSymbolSpec> = {}
    layoutNow.occupiedCells.forEach((cellId) => {
      symbolMap[cellId] =
        cellId === layoutNow.targetCellId
          ? FOCUS_TARGET_SYMBOL
          : generateDistractorSymbol(difficultyNow.similarityLevel)
    })

    setGridSize(gridSizeNow)
    setTargetPresent(targetPresentNow)
    setLayout(layoutNow)
    setSymbols(symbolMap)
    setLastOutcome(null)
    setMessage('찾는 모양을 클릭하거나, 안 보이면 "없음"을 눌러주세요.')
    setStage('playing')

    const limit = isReal ? FOCUS_ROUND_TIME_LIMIT_MS[nextRealIndex] : null
    setTimeLimitMs(limit)
    setRemainingMs(limit ?? 0)
    const startedAt = performance.now()
    setRoundStartedAt(startedAt)

    if (limit != null) {
      schedule(() => finishRound(null, false, true), limit)
    }
  }

  const startGame = () => {
    const picked = selectNoTargetRoundIndices(FOCUS_REAL_ROUNDS, FOCUS_NO_TARGET_ROUND_COUNT)
    setNoTargetRoundIndices(picked)
    setRound('tutorial-target')
    setRealRoundIndex(0)
    setRounds([])
    beginRound('tutorial-target', 0)
  }

  const handleCellClick = (cellId: string) => {
    if (stage !== 'playing' || !layout.occupiedCells.includes(cellId)) return
    finishRound(cellId, false, false)
  }

  const handleNoneClick = () => {
    if (stage !== 'playing') return
    finishRound(null, true, false)
  }

  const cellVisual = (cellId: string): 'idle' | 'occupied' | 'correct' | 'wrong' | 'reveal' => {
    const isOccupied = layout.occupiedCells.includes(cellId)
    if (stage === 'feedback' && lastOutcome) {
      if (lastOutcome.selectedCellId === cellId && lastOutcome.selectedCorrectly) return 'correct'
      if (lastOutcome.selectedCellId === cellId && !lastOutcome.selectedCorrectly) return 'wrong'
      // Reveal the real target only when one actually existed and the user
      // didn't find it — never fabricate a target position for a no-target round.
      if (targetPresent && !lastOutcome.selectedCorrectly && cellId === layout.targetCellId) return 'reveal'
    }
    return isOccupied ? 'occupied' : 'idle'
  }

  const gaugePercent = timeLimitMs == null ? 100 : Math.max(0, Math.min(100, (remainingMs / timeLimitMs) * 100))
  const gaugeCritical = timeLimitMs != null && gaugePercent < 25
  // Slightly smaller footprint on Real rounds than before (was 360px) —
  // compacts the cell/icon ratio without shrinking the search area's
  // difficulty. Icon size inside each cell is intentionally left unchanged.
  const gridMaxWidthClass = round === 'real' ? 'max-w-[320px]' : 'max-w-[240px]'

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-5 py-6">
      <header className="flex items-center justify-between gap-4">
        <Logo size="sm" />
        {mode === 'first' ? (
          <ProgressTrack current={index} />
        ) : (
          <span className="rounded-xl bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground toy-border">
            FREE PLAY
          </span>
        )}
      </header>

      {/* Fixed-height row regardless of Tutorial vs Real. */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <StatBadge stat={stat} size="md" />
          <h1 className="font-display text-2xl font-extrabold leading-none text-foreground">{stat.name}</h1>
        </div>
        {round !== 'real' ? (
          <span className="rounded-xl bg-secondary px-3 py-2 text-center font-display text-sm font-extrabold text-secondary-foreground toy-border">
            튜토리얼{' '}
            <span className="text-primary">{round === 'tutorial-target' ? 1 : 2}</span> /{' '}
            {FOCUS_TUTORIAL_ROUNDS}
          </span>
        ) : (
          <span className="rounded-xl bg-secondary px-3 py-2 text-center font-display text-sm font-extrabold text-secondary-foreground toy-border">
            실전 <span className="text-primary">{realRoundIndex + 1}</span> / {FOCUS_REAL_ROUNDS}
          </span>
        )}
      </div>

      {stage === 'intro' ? (
        <button
          type="button"
          onClick={startGame}
          className="mt-5 flex flex-1 flex-col items-center justify-center gap-5 rounded-3xl bg-card px-6 py-12 text-center toy-border toy-shadow-lg transition-colors duration-150"
        >
          <span
            className="grid h-24 w-24 place-items-center rounded-3xl toy-border toy-shadow"
            style={{ backgroundColor: `var(${stat.colorVar})` } as CSSProperties}
          >
            <FocusSymbolView {...FOCUS_TARGET_SYMBOL} color="var(--card)" size={44} />
          </span>
          <div className="max-w-sm">
            <p className="font-display text-lg font-bold leading-snug text-foreground">
              정해진 모양만 찾아 눌러보세요. 다른 모양은 누르면 안 돼요.
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-bold text-muted-foreground toy-border">
              탭해서 시작하기
            </p>
          </div>
        </button>
      ) : (
        <div className="mt-5 flex flex-1 flex-col items-center justify-center gap-3 rounded-3xl bg-card px-6 py-6 toy-border toy-shadow-lg">
          {/* Target Preview — always visible, never changes round to round. */}
          <div className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-2 toy-border">
            <span className="text-xs font-bold text-secondary-foreground">이 모양을 찾아주세요</span>
            <FocusSymbolView {...FOCUS_TARGET_SYMBOL} color={`var(${stat.colorVar})`} size={24} />
          </div>

          {/* Fixed-height message + Tutorial caption slot. */}
          <div className="flex min-h-14 flex-col items-center justify-center gap-1 text-center">
            <p
              className={cn(
                'text-pretty font-display text-base font-bold leading-snug',
                stage === 'feedback' ? 'text-primary' : 'text-foreground',
              )}
            >
              {message}
            </p>
            <p
              className={cn(
                'text-[11px] font-semibold text-muted-foreground',
                round === 'real' && 'invisible',
              )}
            >
              이 기록은 결과에 포함되지 않아요.
            </p>
          </div>

          {/* Fixed-height time gauge slot — static full bar during Tutorial. */}
          <div className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', gridMaxWidthClass)}>
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-100',
                gaugeCritical ? 'bg-destructive' : 'bg-primary',
              )}
              style={{ width: `${gaugePercent}%` }}
            />
          </div>

          {/* Grid footprint (max-width) and gap scale with round type; the
              grid's own position/size never changes round-to-round within
              Tutorial or within Real — only Tutorial→Real changes it once. */}
          <div
            className={cn('mx-auto grid aspect-square w-full gap-1.5', gridMaxWidthClass)}
            style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0,1fr))` }}
          >
            {Array.from({ length: gridSize * gridSize }, (_, i) => String(i)).map((cellId) => {
              const visual = cellVisual(cellId)
              const symbol = symbols[cellId]
              return (
                <button
                  key={cellId}
                  type="button"
                  onClick={() => handleCellClick(cellId)}
                  disabled={stage !== 'playing' || visual === 'idle'}
                  aria-label={`칸 ${cellId}`}
                  className={cn(
                    'grid aspect-square place-items-center rounded-lg toy-border transition-colors duration-100',
                    visual === 'idle' && 'bg-background opacity-40',
                    visual === 'occupied' && 'bg-card',
                    visual === 'correct' && 'bg-[var(--chart-4)]',
                    visual === 'wrong' && 'bg-destructive/70',
                    visual === 'reveal' && 'animate-pop-in bg-accent toy-shadow-sm ring-2 ring-accent',
                  )}
                >
                  {symbol && (
                    <FocusSymbolView
                      {...symbol}
                      color={`var(${stat.colorVar})`}
                      size={round === 'real' ? 16 : 24}
                    />
                  )}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={handleNoneClick}
            disabled={stage !== 'playing'}
            className={cn(
              'w-full rounded-2xl px-4 py-3 font-display text-sm font-extrabold toy-border transition-transform duration-150',
              gridMaxWidthClass,
              stage === 'playing'
                ? 'bg-secondary text-secondary-foreground hover:-translate-y-0.5'
                : 'cursor-not-allowed bg-muted text-muted-foreground opacity-60',
            )}
          >
            없음 (안 보여요)
          </button>
        </div>
      )}
    </div>
  )
}
