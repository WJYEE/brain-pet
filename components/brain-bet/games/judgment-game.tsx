'use client'

import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Logo } from '@/components/brain-bet/logo'
import { ProgressTrack } from '@/components/brain-bet/progress-track'
import { StatBadge } from '@/components/brain-bet/stat-badge'
import { JudgmentSymbolView } from '@/components/brain-bet/games/judgment-symbol'
import { STATS } from '@/lib/brain-bet'
import {
  JUDGMENT_BLOCK_EXIT_MS,
  JUDGMENT_COMBO_BONUS_FEEDBACK_MS,
  JUDGMENT_COMBO_BONUS_INTERVAL,
  JUDGMENT_COMBO_BONUS_TIME_MS,
  JUDGMENT_GAME_DURATION_MS,
  JUDGMENT_MAX_COMBO_TIME_BONUSES,
  JUDGMENT_QUEUE_PREVIEW_COUNT,
  JUDGMENT_RULE_SWITCH_OVERLAY_MS,
  JUDGMENT_SEGMENT_LENGTH,
  JUDGMENT_THIRD_OPTION_INTRO_MS,
  JUDGMENT_TUTORIAL_COUNT_STIMULI,
  JUDGMENT_TUTORIAL_SHAPE_STIMULI,
  getSegmentConfig,
} from '@/lib/config/judgment.config'
import {
  JUDGMENT_STIMULI_2WAY,
  JUDGMENT_STIMULI_3WAY,
  computeJudgmentAnswerForMapping,
  generateBlockStimuli,
  generateRuleMapping,
  isConflictStimulus,
  pickSegmentConflictCount,
} from '@/lib/game/judgment-stimulus'
import type {
  JudgmentAnswer,
  JudgmentMappingValue,
  JudgmentRawSummary,
  JudgmentRuleId,
  JudgmentRuleMapping,
  JudgmentStimulus,
  JudgmentTrial,
} from '@/lib/game/types'
import { calculateJudgmentScore, summarizeJudgmentTrials } from '@/lib/scoring/judgment'
import { cn } from '@/lib/utils'

type AppStage = 'intro' | 'tutorial' | 'playing' | 'finished'

interface QueueBlock {
  key: number
  stimulus: JudgmentStimulus
  ruleId: JudgmentRuleId
  choiceCount: 2 | 3
  /** The Left/Down/Right assignment active for this Block's whole segment — shuffled once per segment, never per Block. */
  ruleMapping: JudgmentRuleMapping
  /** Which rule segment (Tutorial phase or real Time Attack segment) this Block belongs to. */
  segmentIndex: number
  /** Position within its segment — 0 marks a potential switch/heads-up boundary. */
  indexInSegment: number
  /**
   * Whether this Block's segment mapping disagrees with the immediately
   * preceding segment's mapping for this exact stimulus. Computed once at
   * generation time (using that segment's true previous mapping) and stored
   * here rather than recomputed at resolution time — by the time a Block is
   * actually answered, the queue's lookahead may have already generated
   * several segments further ahead, so re-deriving "the previous mapping"
   * from a shared ref at that later point would silently drift.
   */
  isConflictTrial: boolean
  /** False for Tutorial Blocks — never recorded into `trials`, never scored. */
  recorded: boolean
}

interface ExitingBlock {
  key: number
  stimulus: JudgmentStimulus
  ruleId: JudgmentRuleId
  choiceCount: 2 | 3
  outcome: 'correct' | 'wrong'
}

interface ComboBonusFeedback {
  key: number
  milestone: number
}

interface JudgmentGameProps {
  index: number
  mode: 'first' | 'free'
  onComplete: (payload: {
    trials: JudgmentTrial[]
    rawSummary: JudgmentRawSummary
    gameScore: number
  }) => void
}

/** Per-rule "last mapping used" memory — lets a rule's re-shuffle avoid repeating its own previous permutation even though the other rule always plays in between. */
type LastMappingByRule = Record<JudgmentRuleId, JudgmentRuleMapping | null>

const RULE_LABEL: Record<JudgmentRuleId, string> = { shape: '모양 규칙', count: '개수 규칙' }
const RULE_FOCUS_LABEL: Record<JudgmentRuleId, string> = { shape: '모양', count: '개수' }
const ANSWER_ICON: Record<JudgmentAnswer, string> = { left: '←', right: '→', down: '↓' }
const SHAPE_LABEL: Record<JudgmentStimulus['shape'], string> = { circle: '동그라미', square: '네모', triangle: '세모' }
const COUNT_LABEL: Record<JudgmentStimulus['dotCount'], string> = { 1: '점 1개', 2: '점 2개', 3: '점 3개' }

/** A mapping value is either a shape name or a dot count — `typeof` alone tells them apart, no rule-id context or casts needed. */
function mappingValueLabel(value: JudgmentMappingValue): string {
  return typeof value === 'number' ? COUNT_LABEL[value] : SHAPE_LABEL[value]
}

/** What a given answer button maps to under the CURRENT (randomized, per-segment) mapping — shown directly on the button so nothing needs to be memorized by position. */
function labelForAnswer(mapping: JudgmentRuleMapping, answer: JudgmentAnswer): string {
  const value = answer === 'left' ? mapping.left : answer === 'right' ? mapping.right : mapping.down
  return value === null ? '' : mappingValueLabel(value)
}

function buildSegmentBlocks(
  segmentIndex: number,
  startKey: number,
  previousMapping: JudgmentRuleMapping | null,
  lastMappingForRule: JudgmentRuleMapping | null,
): { blocks: QueueBlock[]; nextKey: number; mapping: JudgmentRuleMapping } {
  const { ruleId, choiceCount } = getSegmentConfig(segmentIndex)
  const mapping = generateRuleMapping(ruleId, choiceCount, lastMappingForRule)
  const pool = choiceCount === 3 ? JUDGMENT_STIMULI_3WAY : JUDGMENT_STIMULI_2WAY
  const classify = (s: JudgmentStimulus) => isConflictStimulus(s, mapping, previousMapping)
  const conflictCount = pickSegmentConflictCount(JUDGMENT_SEGMENT_LENGTH)
  const stimuli = generateBlockStimuli(pool, JUDGMENT_SEGMENT_LENGTH, conflictCount, classify)
  let key = startKey
  const blocks: QueueBlock[] = stimuli.map((stimulus, indexInSegment) => ({
    key: key++,
    stimulus,
    ruleId,
    choiceCount,
    ruleMapping: mapping,
    segmentIndex,
    indexInSegment,
    isConflictTrial: classify(stimulus),
    recorded: true,
  }))
  return { blocks, nextKey: key, mapping }
}

/** Keeps the queue topped up to JUDGMENT_QUEUE_PREVIEW_COUNT by generating whole segments ahead of time — the real queue is functionally endless until the Time Attack timer runs out. */
function fillQueue(
  current: QueueBlock[],
  nextKeyRef: { current: number },
  nextSegmentRef: { current: number },
  previousMappingRef: { current: JudgmentRuleMapping | null },
  lastMappingByRuleRef: { current: LastMappingByRule },
): QueueBlock[] {
  let q = current
  while (q.length < JUDGMENT_QUEUE_PREVIEW_COUNT) {
    const segmentIndex = nextSegmentRef.current
    const { ruleId } = getSegmentConfig(segmentIndex)
    const { blocks, nextKey, mapping } = buildSegmentBlocks(
      segmentIndex,
      nextKeyRef.current,
      previousMappingRef.current,
      lastMappingByRuleRef.current[ruleId],
    )
    nextKeyRef.current = nextKey
    nextSegmentRef.current += 1
    previousMappingRef.current = mapping
    lastMappingByRuleRef.current = { ...lastMappingByRuleRef.current, [ruleId]: mapping }
    q = [...q, ...blocks]
  }
  return q
}

function buildTutorialBlocks(): QueueBlock[] {
  const shapeMapping = generateRuleMapping('shape', 2, null)
  const countMapping = generateRuleMapping('count', 2, null)
  let key = 0
  const shapeBlocks: QueueBlock[] = JUDGMENT_TUTORIAL_SHAPE_STIMULI.map((stimulus, indexInSegment) => ({
    key: key++,
    stimulus,
    ruleId: 'shape',
    choiceCount: 2,
    ruleMapping: shapeMapping,
    segmentIndex: 0,
    indexInSegment,
    isConflictTrial: false,
    recorded: false,
  }))
  const countBlocks: QueueBlock[] = JUDGMENT_TUTORIAL_COUNT_STIMULI.map((stimulus, indexInSegment) => ({
    key: key++,
    stimulus,
    ruleId: 'count',
    choiceCount: 2,
    ruleMapping: countMapping,
    segmentIndex: 1,
    indexInSegment,
    isConflictTrial: false,
    recorded: false,
  }))
  return [...shapeBlocks, ...countBlocks]
}

/** Uses the View Transitions API when available for a smooth queue-shift; falls back to a plain (instant) state update everywhere else. */
function withViewTransition(update: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }
  if (typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(() => flushSync(update))
  } else {
    update()
  }
}

/**
 * Real, interactive Judgment ("Rule Switch") game — GAME_SPEC §55-63, Time
 * Attack rework. A continuous horizontal queue of Blocks is always visible;
 * the player clears the current (leftmost, highlighted) Block by choosing
 * Left/Down/Right, the queue shifts immediately (no blocking per-trial
 * feedback screen), and the rule changes every JUDGMENT_SEGMENT_LENGTH
 * Blocks processed. Each rule segment shuffles a fresh Left/Down/Right
 * mapping (held fixed for that whole segment) so the direction can't be
 * memorized by button position — only actually read off the Rule Banner.
 * The whole session runs against one global JUDGMENT_GAME_DURATION_MS timer.
 */
export function JudgmentGame({ index, mode, onComplete }: JudgmentGameProps) {
  const stat = STATS.judgment

  const [appStage, setAppStage] = useState<AppStage>('intro')
  const [queue, setQueue] = useState<QueueBlock[]>([])
  const [exitingBlock, setExitingBlock] = useState<ExitingBlock | null>(null)
  const [isRuleChanging, setIsRuleChanging] = useState(false)
  const [ruleChangeMessage, setRuleChangeMessage] = useState('')
  const [upcomingMapping, setUpcomingMapping] = useState<JudgmentRuleMapping | null>(null)
  const [trials, setTrials] = useState<JudgmentTrial[]>([])
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [timeLeftMs, setTimeLeftMs] = useState(JUDGMENT_GAME_DURATION_MS)
  const [comboBonusFeedback, setComboBonusFeedback] = useState<ComboBonusFeedback | null>(null)

  const nextKeyRef = useRef(0)
  const nextSegmentToGenerateRef = useRef(0)
  const previousMappingRef = useRef<JudgmentRuleMapping | null>(null)
  const lastMappingByRuleRef = useRef<LastMappingByRule>({ shape: null, count: null })
  const trialsRef = useRef<JudgmentTrial[]>([])
  const blockShownAtRef = useRef(0)
  const endAtRef = useRef(0)
  /** Combo values (10, 20, ...) that have already granted a Bonus this session — a Set (not a counter) so resetting Combo back to a milestone already reached never re-grants it. */
  const grantedComboMilestonesRef = useRef<Set<number>>(new Set())
  const comboBonusKeyRef = useRef(0)
  const timerIntervalRef = useRef<number | null>(null)
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
  const stopTimer = () => {
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
  }
  useEffect(
    () => () => {
      clearScheduled()
      stopTimer()
    },
    [],
  )

  const finishGame = () => {
    stopTimer()
    setAppStage('finished')
    const finalTrials = trialsRef.current
    const rawSummary = summarizeJudgmentTrials(finalTrials, JUDGMENT_GAME_DURATION_MS)
    const gameScore = calculateJudgmentScore(rawSummary)
    schedule(() => onComplete({ trials: finalTrials, rawSummary, gameScore }), 300)
  }

  const startTimer = () => {
    stopTimer()
    timerIntervalRef.current = window.setInterval(() => {
      const remaining = Math.max(0, endAtRef.current - performance.now())
      setTimeLeftMs(remaining)
      if (remaining <= 0) finishGame()
    }, 100)
  }

  const beginTutorial = () => {
    clearScheduled()
    setAppStage('tutorial')
    setQueue(buildTutorialBlocks())
    setExitingBlock(null)
    setIsRuleChanging(false)
    blockShownAtRef.current = performance.now()
  }

  const beginRealGame = () => {
    clearScheduled()
    nextKeyRef.current = 0
    nextSegmentToGenerateRef.current = 0
    previousMappingRef.current = null
    lastMappingByRuleRef.current = { shape: null, count: null }
    trialsRef.current = []
    setTrials([])
    setCombo(0)
    setMaxCombo(0)
    grantedComboMilestonesRef.current = new Set()
    setComboBonusFeedback(null)
    setExitingBlock(null)
    setIsRuleChanging(false)
    setQueue(fillQueue([], nextKeyRef, nextSegmentToGenerateRef, previousMappingRef, lastMappingByRuleRef))
    setAppStage('playing')
    endAtRef.current = performance.now() + JUDGMENT_GAME_DURATION_MS
    setTimeLeftMs(JUDGMENT_GAME_DURATION_MS)
    blockShownAtRef.current = performance.now()
    startTimer()
  }

  const resolveCurrent = (answer: JudgmentAnswer) => {
    if (appStage !== 'tutorial' && appStage !== 'playing') return
    if (isRuleChanging) return
    if (queue.length === 0) return
    const current = queue[0]
    if (answer === 'down' && current.choiceCount !== 3) return

    const correctAnswer = computeJudgmentAnswerForMapping(current.ruleMapping, current.stimulus)
    const isCorrect = correctAnswer !== null && answer === correctAnswer
    const responseTimeMs = Math.round(performance.now() - blockShownAtRef.current)

    setExitingBlock({
      key: current.key,
      stimulus: current.stimulus,
      ruleId: current.ruleId,
      choiceCount: current.choiceCount,
      outcome: isCorrect ? 'correct' : 'wrong',
    })
    schedule(() => setExitingBlock((e) => (e && e.key === current.key ? null : e)), JUDGMENT_BLOCK_EXIT_MS)

    if (current.recorded && correctAnswer !== null) {
      const isSwitchTrial = current.indexInSegment === 0 && current.segmentIndex > 0
      const previousRuleId = current.segmentIndex > 0 ? getSegmentConfig(current.segmentIndex - 1).ruleId : null
      const trial: JudgmentTrial = {
        trialIndex: trialsRef.current.length,
        segmentIndex: current.segmentIndex,
        ruleId: current.ruleId,
        previousRuleId,
        stimulus: current.stimulus,
        ruleMapping: current.ruleMapping,
        correctAnswer,
        selectedAnswer: answer,
        isCorrect,
        responseTimeMs,
        isSwitchTrial,
        trialsSinceSwitch: current.indexInSegment,
        isConflictTrial: current.isConflictTrial,
        choiceCount: current.choiceCount,
        createdAt: new Date().toISOString(),
      }
      trialsRef.current = [...trialsRef.current, trial]
      setTrials(trialsRef.current)
      const nextCombo = isCorrect ? combo + 1 : 0
      setCombo(nextCombo)
      setMaxCombo((m) => Math.max(m, nextCombo))

      // Combo Bonus Time — a gameplay reward only (never a Score input, see
      // judgment.config.ts). Each milestone (10, 20, ...) can grant at most
      // once per session, tracked by value rather than by count, so resetting
      // Combo and climbing back to a milestone already reached never
      // re-grants it. endAtRef stays the single source of truth for the
      // Timer — extending it here is all that's needed for the existing
      // interval tick to pick up the new remaining time correctly next tick;
      // setTimeLeftMs is also nudged immediately so the Gauge doesn't wait
      // up to 100ms to visibly reflect the bonus.
      if (
        isCorrect &&
        nextCombo > 0 &&
        nextCombo % JUDGMENT_COMBO_BONUS_INTERVAL === 0 &&
        !grantedComboMilestonesRef.current.has(nextCombo) &&
        grantedComboMilestonesRef.current.size < JUDGMENT_MAX_COMBO_TIME_BONUSES
      ) {
        grantedComboMilestonesRef.current.add(nextCombo)
        endAtRef.current += JUDGMENT_COMBO_BONUS_TIME_MS
        setTimeLeftMs((t) => t + JUDGMENT_COMBO_BONUS_TIME_MS)
        const feedbackKey = comboBonusKeyRef.current++
        setComboBonusFeedback({ key: feedbackKey, milestone: nextCombo })
        schedule(
          () => setComboBonusFeedback((f) => (f && f.key === feedbackKey ? null : f)),
          JUDGMENT_COMBO_BONUS_FEEDBACK_MS,
        )
      }
    }

    const rest = queue.slice(1)

    if (!current.recorded && rest.length === 0) {
      // Tutorial exhausted — short completion beat, then the real Time Attack begins.
      withViewTransition(() => setQueue([]))
      setIsRuleChanging(true)
      setUpcomingMapping(null)
      setRuleChangeMessage('튜토리얼 완료! 이제 실전을 시작할게요.')
      schedule(() => beginRealGame(), JUDGMENT_RULE_SWITCH_OVERLAY_MS + 500)
      blockShownAtRef.current = performance.now()
      return
    }

    const filled = current.recorded ? fillQueue(rest, nextKeyRef, nextSegmentToGenerateRef, previousMappingRef, lastMappingByRuleRef) : rest
    withViewTransition(() => setQueue(filled))
    blockShownAtRef.current = performance.now()

    const upcoming = filled[0]
    if (upcoming && upcoming.segmentIndex !== current.segmentIndex) {
      const choiceCountChanged = upcoming.choiceCount !== current.choiceCount
      setIsRuleChanging(true)
      setUpcomingMapping(upcoming.ruleMapping)
      setRuleChangeMessage(choiceCountChanged ? '규칙이 바뀌었어요! 선택지가 하나 더 늘어났어요!' : '규칙이 바뀌었어요!')
      const overlayMs = choiceCountChanged ? JUDGMENT_THIRD_OPTION_INTRO_MS : JUDGMENT_RULE_SWITCH_OVERLAY_MS
      schedule(() => setIsRuleChanging(false), overlayMs)
    }
  }

  // Arrow keys mirror the on-screen buttons. event.repeat is blocked so holding
  // a key down never auto-fires more than the one Block it was pressed for.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.repeat) return
      if (appStage !== 'tutorial' && appStage !== 'playing') return
      if (isRuleChanging || queue.length === 0) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        resolveCurrent('left')
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        resolveCurrent('right')
      } else if (e.key === 'ArrowDown' && queue[0].choiceCount === 3) {
        e.preventDefault()
        resolveCurrent('down')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  const current = queue[0] ?? null
  const upcomingPreview = queue.slice(1, JUDGMENT_QUEUE_PREVIEW_COUNT)
  const choiceCount = current?.choiceCount ?? 2
  const visibleAnswers: JudgmentAnswer[] = choiceCount === 3 ? ['left', 'down', 'right'] : ['left', 'right']
  const secondsLeft = Math.ceil(timeLeftMs / 1000)
  const timePercent = Math.max(0, Math.min(100, (timeLeftMs / JUDGMENT_GAME_DURATION_MS) * 100))
  const bannerMapping = isRuleChanging ? upcomingMapping : (current?.ruleMapping ?? null)

  function renderStimulus(stimulus: JudgmentStimulus, color: string, size: number) {
    return <JudgmentSymbolView stimulus={stimulus} color={color} size={size} />
  }

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

      {/* Fixed-height status row: Tutorial badge OR Time Gauge + Combo, never both, always same height. */}
      <div className="mt-6 flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <StatBadge stat={stat} size="md" />
          <h1 className="font-display text-2xl font-extrabold leading-none text-foreground">{stat.name}</h1>
        </div>

        {appStage === 'tutorial' ? (
          <span className="rounded-xl bg-secondary px-3 py-2 text-center font-display text-sm font-extrabold text-secondary-foreground toy-border">
            튜토리얼
          </span>
        ) : appStage === 'playing' || appStage === 'finished' ? (
          <div className="relative flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              {maxCombo > 0 && combo >= 2 && (
                <span className="font-display text-xs font-extrabold text-primary">COMBO ×{combo}</span>
              )}
              <span className="font-display text-lg font-extrabold tabular-nums text-foreground">{secondsLeft}초</span>
            </div>
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-secondary">
              <div
                className={cn('h-full rounded-full transition-[width] duration-100 ease-linear', timePercent <= 20 ? 'bg-destructive' : 'bg-primary')}
                style={{ width: `${timePercent}%` }}
              />
            </div>

            {/* Combo Bonus Time pop-up — absolutely positioned so it never
                shifts the Timer/Gauge above it, never blocks Queue input. */}
            {comboBonusFeedback && (
              <div
                key={comboBonusFeedback.key}
                className="animate-pop-in pointer-events-none absolute right-0 top-full z-10 mt-1.5 whitespace-nowrap rounded-xl bg-primary px-3 py-1.5 text-center font-display text-xs font-extrabold text-primary-foreground toy-border"
              >
                {comboBonusFeedback.milestone} COMBO! +{JUDGMENT_COMBO_BONUS_TIME_MS / 1000}초
              </div>
            )}
          </div>
        ) : null}
      </div>

      {appStage === 'intro' ? (
        <button
          type="button"
          onClick={beginTutorial}
          className="mt-5 flex flex-1 flex-col items-center justify-center gap-5 rounded-3xl bg-card px-6 py-12 text-center toy-border toy-shadow-lg transition-colors duration-150"
        >
          <span
            className="grid h-24 w-24 place-items-center rounded-3xl toy-border toy-shadow"
            style={{ backgroundColor: `var(${stat.colorVar})` } as CSSProperties}
          >
            {renderStimulus({ shape: 'circle', dotCount: 1 }, 'var(--card)', 44)}
          </span>
          <div className="max-w-sm">
            <p className="font-display text-lg font-bold leading-snug text-foreground">
              규칙에 맞게 Block을 빠르게 처리하세요. 제한시간 안에 최대한 많이, 정확하게!
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-bold text-muted-foreground toy-border">
              탭해서 시작하기
            </p>
          </div>
        </button>
      ) : (
        <div className="relative mt-5 flex flex-1 flex-col items-center justify-center gap-4 rounded-3xl bg-card px-6 py-6 toy-border toy-shadow-lg">
          {/* Rule Banner — fixed height so the Rule Change overlay never shifts the layout. Mapping is randomized per segment, so it's shown here (and on the buttons below) rather than ever assumed memorized. */}
          <div className="flex min-h-16 w-full max-w-sm flex-col items-center justify-center gap-1.5 rounded-2xl bg-secondary px-4 py-3 text-center toy-border">
            {isRuleChanging ? (
              <>
                <p className="font-display text-sm font-extrabold text-primary">{ruleChangeMessage}</p>
                {bannerMapping && (
                  <p className="text-xs font-bold text-secondary-foreground">
                    이번에는 {RULE_FOCUS_LABEL[bannerMapping.ruleId]}을 보세요.
                  </p>
                )}
              </>
            ) : current ? (
              <>
                <p className="text-[11px] font-bold uppercase tracking-wide text-secondary-foreground">현재 규칙</p>
                <p className="font-display text-base font-extrabold text-secondary-foreground">
                  {RULE_LABEL[current.ruleId]}
                </p>
              </>
            ) : (
              <p className="font-display text-base font-extrabold text-primary">시간 종료!</p>
            )}
            {bannerMapping && (
              <div className="flex items-center justify-center gap-3 text-[11px] font-bold text-secondary-foreground">
                <span>{ANSWER_ICON.left} {labelForAnswer(bannerMapping, 'left')}</span>
                {bannerMapping.choiceCount === 3 && (
                  <span>{ANSWER_ICON.down} {labelForAnswer(bannerMapping, 'down')}</span>
                )}
                <span>{ANSWER_ICON.right} {labelForAnswer(bannerMapping, 'right')}</span>
              </div>
            )}
          </div>

          {/* Block Queue: current (enlarged, glowing) + upcoming preview, fading out. */}
          <div className="flex h-24 w-full max-w-lg items-center justify-center gap-2">
            <div className="relative">
              {current && (
                <div
                  className="grid h-24 w-24 place-items-center rounded-3xl bg-background toy-border toy-shadow-lg"
                  style={{ boxShadow: `0 0 0 3px var(${stat.colorVar})` } as CSSProperties}
                >
                  {renderStimulus(current.stimulus, `var(${stat.colorVar})`, 60)}
                </div>
              )}
              {exitingBlock && (
                <div
                  className={cn(
                    'absolute inset-0 grid place-items-center rounded-3xl bg-background toy-border',
                    exitingBlock.outcome === 'correct' ? 'animate-block-clear' : 'animate-block-shake-once',
                  )}
                  aria-hidden="true"
                >
                  {renderStimulus(exitingBlock.stimulus, `var(${stat.colorVar})`, 60)}
                  <span
                    className={cn(
                      'animate-badge-float absolute -top-2 right-0 rounded-full px-2 py-0.5 text-xs font-extrabold',
                      exitingBlock.outcome === 'correct'
                        ? 'bg-[var(--chart-4)] text-foreground'
                        : 'bg-destructive text-destructive-foreground',
                    )}
                  >
                    {exitingBlock.outcome === 'correct' ? '+1' : 'MISS'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {upcomingPreview.map((block, i) => (
                <div
                  key={block.key}
                  className={cn(
                    'grid place-items-center rounded-2xl bg-background toy-border',
                    i === 0 ? 'h-16 w-16 opacity-80' : 'h-12 w-12 opacity-45',
                  )}
                >
                  {renderStimulus(block.stimulus, `var(${stat.colorVar})`, i === 0 ? 34 : 24)}
                </div>
              ))}
            </div>
          </div>

          <div
            className={cn(
              'mx-auto grid w-full max-w-sm gap-3',
              choiceCount === 3 ? 'grid-cols-3' : 'grid-cols-2',
            )}
          >
            {visibleAnswers.map((answer) => (
              <button
                key={answer}
                type="button"
                onClick={() => resolveCurrent(answer)}
                disabled={appStage === 'finished' || isRuleChanging || !current}
                className={cn(
                  'flex flex-col items-center justify-center gap-1.5 rounded-2xl px-3 py-5 font-display toy-border transition-transform duration-150',
                  appStage !== 'finished' &&
                    !isRuleChanging &&
                    current &&
                    'bg-card text-foreground hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none',
                  (appStage === 'finished' || isRuleChanging || !current) && 'cursor-not-allowed bg-muted text-muted-foreground opacity-60',
                )}
              >
                <span className="text-2xl font-extrabold leading-none">{ANSWER_ICON[answer]}</span>
                <span className="text-xs font-bold">{current ? labelForAnswer(current.ruleMapping, answer) : ''}</span>
              </button>
            ))}
          </div>

          <p className="hidden text-[10px] font-semibold text-muted-foreground sm:block">
            {choiceCount === 3 ? '← ↓ → 방향키 사용 가능' : '← → 방향키 사용 가능'}
          </p>
        </div>
      )}
    </div>
  )
}
