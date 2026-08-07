'use client'

import { useEffect, useRef, useState } from 'react'
import { PET_AUTONOMY_CONFIG, WALK_TILT_DEG, ZONE_OFFSET_PX } from '@/lib/config/pet-autonomy.config'
import { pickAutonomousAction } from '@/lib/pet-care/autonomous-action-selector'
import { resolveAutonomousOutcome } from '@/lib/pet-care/autonomous-actions'
import type { InitiatedDialogueCategory } from '@/lib/pet-care/initiated-dialogue'
import type { AutonomousActionId, CareStatId, PetAnimation, PetZone } from '@/lib/pet-care/types'

export interface UsePetAutonomyInput {
  stats: Record<CareStatId, number>
  lastUserActionAt: number | null
  /** True whenever a higher-priority mode (levelUp/gameReaction/userAction/speaking) is active — autonomy may not start a new action while this is true. */
  suppressed: boolean
  onRequestDialogue: (category: InitiatedDialogueCategory) => void
  /** Returns whether the bonus was actually granted (under the daily cap) — unused by the hook itself, just forwarded for callers that want to know. */
  onBonus: (kind: 'sleep' | 'playAlone') => boolean
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Recursive setTimeout scheduler (not setInterval — the wait is randomized
 * per-tick, 8-20s) that picks and plays one autonomous action at a time.
 * Pauses while the tab is hidden (Page Visibility — first use of it in this
 * project) and restarts fresh (not "catch up") on return, and skips (without
 * penalty — just re-schedules) any tick where `suppressed` or the
 * post-user-action cooldown window is true.
 */
export function usePetAutonomy(input: UsePetAutonomyInput) {
  const [zone, setZone] = useState<PetZone>('center')
  const [activeAction, setActiveAction] = useState<AutonomousActionId | null>(null)
  const [animation, setAnimation] = useState<PetAnimation | null>(null)
  /** Signed lean angle while a walkLeft/walkRight move is in flight — 0 the rest of the time. See WALK_TILT_DEG. */
  const [walkTiltDeg, setWalkTiltDeg] = useState(0)
  /**
   * Which way the Statling's body currently faces — 'left' matches the
   * source art's own facing (never flipped), so this only ever changes on an
   * actual walkLeft/walkRight relocation (never on a mere lookLeft/lookRight
   * glance) and then stays put (sticky) until the next one — the character
   * keeps facing the direction it last walked, exactly like it visually kept
   * moving that way.
   */
  const [facing, setFacing] = useState<'left' | 'right'>('left')

  const zoneRef = useRef(zone)
  zoneRef.current = zone
  /** Last zone actually applied — compared against the new one each tick purely to sign the walk tilt (left move vs right move), independent of `action`'s exact id. */
  const prevOffsetPxRef = useRef(ZONE_OFFSET_PX[zone])
  const lastActionIdRef = useRef<AutonomousActionId | null>(null)
  const statsRef = useRef(input.stats)
  statsRef.current = input.stats
  const suppressedRef = useRef(input.suppressed)
  suppressedRef.current = input.suppressed
  const lastUserActionAtRef = useRef(input.lastUserActionAt)
  lastUserActionAtRef.current = input.lastUserActionAt
  const onRequestDialogueRef = useRef(input.onRequestDialogue)
  onRequestDialogueRef.current = input.onRequestDialogue
  const onBonusRef = useRef(input.onBonus)
  onBonusRef.current = input.onBonus

  const scheduleTimeoutRef = useRef<number | null>(null)
  const holdTimeoutsRef = useRef<number[]>([])

  useEffect(() => {
    function scheduleNext() {
      const { minIntervalMs, maxIntervalMs } = PET_AUTONOMY_CONFIG
      const delay = minIntervalMs + Math.random() * (maxIntervalMs - minIntervalMs)
      scheduleTimeoutRef.current = window.setTimeout(tick, delay)
    }

    function tick() {
      const recentlyActedByUser =
        lastUserActionAtRef.current !== null &&
        Date.now() - lastUserActionAtRef.current < PET_AUTONOMY_CONFIG.pauseAfterUserActionMs
      if (suppressedRef.current || recentlyActedByUser) {
        scheduleNext()
        return
      }

      const action = pickAutonomousAction({
        stats: statsRef.current,
        lastActionId: lastActionIdRef.current,
        reducedMotion: prefersReducedMotion(),
      })
      lastActionIdRef.current = action
      const outcome = resolveAutonomousOutcome(action, zoneRef.current)

      const newOffsetPx = ZONE_OFFSET_PX[outcome.zone]
      const movedPx = newOffsetPx - prevOffsetPxRef.current
      prevOffsetPxRef.current = newOffsetPx

      setActiveAction(action)
      setAnimation(outcome.animation)
      setZone(outcome.zone)
      setWalkTiltDeg(outcome.animation === 'walk' && movedPx !== 0 ? Math.sign(movedPx) * WALK_TILT_DEG : 0)
      if (action === 'walkLeft') setFacing('left')
      else if (action === 'walkRight') setFacing('right')

      if (outcome.requestDialogueCategory) onRequestDialogueRef.current(outcome.requestDialogueCategory)
      if (outcome.bonusKind) onBonusRef.current(outcome.bonusKind)

      const holdId = window.setTimeout(() => {
        setActiveAction(null)
        setAnimation(null)
        setWalkTiltDeg(0)
      }, outcome.holdMs)
      holdTimeoutsRef.current.push(holdId)

      scheduleNext()
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        if (scheduleTimeoutRef.current !== null) window.clearTimeout(scheduleTimeoutRef.current)
        return
      }
      // Coming back visible: always a fresh random wait, never a burst of missed actions.
      if (scheduleTimeoutRef.current !== null) window.clearTimeout(scheduleTimeoutRef.current)
      scheduleNext()
    }

    scheduleNext()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (scheduleTimeoutRef.current !== null) window.clearTimeout(scheduleTimeoutRef.current)
      holdTimeoutsRef.current.forEach((id) => window.clearTimeout(id))
      holdTimeoutsRef.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally mount-once; all inputs are read via refs
  }, [])

  return {
    active: activeAction !== null,
    animation,
    offsetPx: ZONE_OFFSET_PX[zone],
    walkTiltDeg,
    facing,
  }
}
