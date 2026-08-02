'use client'

import { useEffect } from 'react'
import { ArrowRight, Check, PartyPopper, Trophy } from 'lucide-react'
import { EggImage } from '@/components/brain-bet/egg-image'
import { ProgressTrack } from '@/components/brain-bet/progress-track'
import { StatBadge } from '@/components/brain-bet/stat-badge'
import { useSound } from '@/hooks/use-sound'
import { PLAY_ORDER, STATS, TOTAL_GAMES, type RawRecord, type StatId } from '@/lib/brain-bet'
import { EGG_STAGE_MESSAGE, EGG_STAGE_MOTION } from '@/lib/egg-growth'

/** Fixed set of small-sparkle positions, sliced to however many a stage's EGG_STAGE_MOTION calls for. */
const SPARKLE_POSITIONS = ['-left-3 -top-1', 'right-0 top-0', 'left-4 bottom-0']

interface CompleteScreenProps {
  statId: StatId
  /** zero-based index of the game just finished */
  index: number
  /** this round's real 0-100 gameScore — the headline number (see game-flow.tsx, lib/scoring/*) */
  gameScore: number
  /** display raw record for this round (formatted per-game, see lib/scoring/*) — shown as a small parenthetical under the score, never as the headline */
  raw: RawRecord
  /** current Personal Best gameScore, if one exists and differs from this round's */
  personalBestScore?: number | null
  /** whether this round's result is now the Personal Best */
  isNewRecord?: boolean
  onNext: () => void
}

export function CompleteScreen({
  statId,
  index,
  gameScore,
  raw,
  personalBestScore,
  isNewRecord,
  onNext,
}: CompleteScreenProps) {
  const stat = STATS[statId]
  const isLast = index === TOTAL_GAMES - 1
  const nextStat = isLast ? null : STATS[PLAY_ORDER[index + 1]]
  /** How many of the 6 First Play games are done as of this screen — doubles as the Egg's growth stage. */
  const eggStage = index + 1
  const motion = EGG_STAGE_MOTION[eggStage] ?? EGG_STAGE_MOTION[1]
  const { play } = useSound()

  useEffect(() => {
    play('game-complete')
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire exactly once per mount (GameFlow remounts this screen fresh each round via stepKey)
  }, [])

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-5 py-10 text-center">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground toy-border toy-shadow-sm">
        <PartyPopper size={14} strokeWidth={2.6} />
        {stat.name} 발견
      </span>

      <div className="relative mt-6">
        <StatBadge stat={stat} size="lg" />
        <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground toy-border">
          <Check size={14} strokeWidth={3.5} />
        </span>
      </div>

      <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight text-foreground">
        좋아요!
        <br />
        <span className="text-primary">{stat.name}</span>을 발견했어요.
      </h1>

      {/* this round's gameScore — the headline number; raw detail (개수/정확도) is a small parenthetical below it, never the other way around */}
      <div className="mt-6 w-full rounded-2xl bg-card px-6 py-5 toy-border toy-shadow">
        <div className="flex items-center justify-center gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            이번 점수
          </p>
          {isNewRecord && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              <Trophy size={10} strokeWidth={3} />
              NEW RECORD
            </span>
          )}
        </div>
        <p className="mt-1 font-display text-4xl font-extrabold leading-none text-foreground">
          {gameScore}
          <span className="text-lg">점</span>
        </p>
        <div className="mt-2 flex flex-col items-center gap-0.5">
          <p className="text-xs font-semibold text-muted-foreground">{raw.primary}</p>
          {raw.secondary && <p className="text-xs font-semibold text-muted-foreground">{raw.secondary}</p>}
        </div>

        {personalBestScore != null && !isNewRecord && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              개인 최고
            </p>
            <p className="mt-1 font-display text-lg font-extrabold text-foreground">
              {personalBestScore}점
            </p>
          </div>
        )}
      </div>

      {/* egg growth teaser — one more of the 6 games done, one step closer to Hatch.
          Card layout/size never changes across stages; only the egg's own
          entrance motion (transform, not layout) and the decorative overlays
          below vary, so nothing here ever shifts surrounding text/CTA. */}
      <div className="mt-6 flex flex-col items-center gap-1.5 rounded-2xl bg-card px-6 py-4 toy-border toy-shadow-sm">
        <div className="relative" style={{ width: 92, height: 92 }}>
          {motion.glow && (
            <span
              className="animate-egg-glow-pulse pointer-events-none absolute inset-0 rounded-full"
              style={{ boxShadow: '0 0 22px 8px var(--accent)' }}
              aria-hidden="true"
            />
          )}
          {motion.ring && (
            <span
              className="animate-egg-impact-ring pointer-events-none absolute inset-0 rounded-full"
              style={{ boxShadow: '0 0 0 3px var(--accent)' }}
              aria-hidden="true"
            />
          )}
          <EggImage key={eggStage} stage={eggStage} size={92} className={motion.animationClass} />
          {SPARKLE_POSITIONS.slice(0, motion.sparkles).map((pos, i) => (
            <span
              key={pos}
              className={`animate-sparkle-burst pointer-events-none absolute text-lg ${pos}`}
              style={{ animationDelay: `${420 + i * 150}ms` }}
              aria-hidden="true"
            >
              ✨
            </span>
          ))}
        </div>
        <p className="text-pretty text-sm font-bold text-foreground">{EGG_STAGE_MESSAGE[eggStage]}</p>
        <p className="text-xs font-semibold text-muted-foreground">알 성장 {eggStage}/{TOTAL_GAMES}</p>
      </div>

      {/* overall progress */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <ProgressTrack current={index + 1} />
      </div>

      {/* continue CTA */}
      <button
        type="button"
        onClick={onNext}
        className="group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-display text-lg font-extrabold text-primary-foreground toy-border toy-shadow-lg transition-transform duration-150 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        {isLast ? 'MY STATUS 보기' : `다음: ${nextStat?.name}`}
        <ArrowRight
          size={20}
          strokeWidth={2.8}
          className="transition-transform duration-150 group-hover:translate-x-1"
        />
      </button>
    </div>
  )
}
