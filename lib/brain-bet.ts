import {
  Zap,
  Layers,
  Target,
  Scale,
  Boxes,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react'

export type StatId =
  | 'reaction'
  | 'memory'
  | 'focus'
  | 'judgment'
  | 'spatial'
  | 'reasoning'

export interface StatDef {
  id: StatId
  /** Display name */
  name: string
  /** One-line hook shown on cards */
  tagline: string
  /** Short instruction placeholder for the game area */
  howTo: string
  /** Lucide icon component */
  icon: LucideIcon
  /** CSS variable name holding the stat color */
  colorVar: string
  /** Label describing what the raw record measures (varies per game) */
  rawLabel: string
}

/**
 * All six stats, keyed by id. Colors reference CSS variables declared in
 * globals.css so the whole visual system (icons, radar, chips) stays in sync.
 */
export const STATS: Record<StatId, StatDef> = {
  reaction: {
    id: 'reaction',
    name: '순발력',
    tagline: '얼마나 빠르게 반응할까?',
    howTo: '노란 번개로 바뀌는 순간 탭하세요.',
    icon: Zap,
    colorVar: '--stat-reaction',
    rawLabel: '평균 반응 속도',
  },
  memory: {
    id: 'memory',
    name: '기억력',
    tagline: '패턴을 얼마나 기억할까?',
    howTo: '순서를 본 뒤 그대로 따라 입력하세요.',
    icon: Layers,
    colorVar: '--stat-memory',
    rawLabel: '도달 레벨',
  },
  focus: {
    id: 'focus',
    name: '집중력',
    tagline: '흔들림 없이 집중할 수 있을까?',
    howTo: '방해 요소는 무시하고 목표만 쫓으세요.',
    icon: Target,
    colorVar: '--stat-focus',
    rawLabel: '정확도 · 반응 속도',
  },
  judgment: {
    id: 'judgment',
    name: '판단력',
    tagline: '순간의 선택, 얼마나 정확할까?',
    howTo: '시간이 끝나기 전에 정답을 고르세요.',
    icon: Scale,
    colorVar: '--stat-judgment',
    rawLabel: '정확도 · 반응 속도',
  },
  spatial: {
    id: 'spatial',
    name: '공간감각',
    tagline: '머릿속으로 얼마나 잘 돌려볼까?',
    howTo: '회전했을 때 같은 모양이 되는 조각을 찾으세요.',
    icon: Boxes,
    colorVar: '--stat-spatial',
    rawLabel: '정답 수 · 난이도',
  },
  reasoning: {
    id: 'reasoning',
    name: '추리력',
    tagline: '숨은 규칙을 찾아낼 수 있을까?',
    howTo: '규칙을 파악해 다음을 완성하세요.',
    icon: Lightbulb,
    colorVar: '--stat-reasoning',
    rawLabel: '정답 수 · 난이도',
  },
}

/**
 * First-time sequential play order.
 * Landing → Reaction → Memory → Focus → Judgment → Spatial → Reasoning → Status
 */
export const PLAY_ORDER: StatId[] = [
  'reaction',
  'memory',
  'focus',
  'judgment',
  'spatial',
  'reasoning',
]

export const TOTAL_GAMES = PLAY_ORDER.length

/** Order stats are displayed on the radar / status screen. */
export const STAT_DISPLAY_ORDER: StatId[] = [
  'memory',
  'focus',
  'reaction',
  'judgment',
  'spatial',
  'reasoning',
]

/**
 * Raw performance record for one game. Each game measures different things,
 * so the raw unit differs per stat. This is intentionally separate from the
 * unified 0–100 Final Stat shown on MY STATUS.
 */
export interface RawRecord {
  /** Headline raw value, e.g. "205 ms" or "Lv 8" */
  primary: string
  /** Optional secondary raw metric, e.g. "정확도 92%" */
  secondary?: string
}


/**
 * Statling type metadata. In MVP v1 the highest Final Stat decides which of
 * six base Statling types you get. Later versions will personalize using the
 * full six-stat combination.
 */
export interface StatlingType {
  id: StatId
  /** Short type label, e.g. "번쩍 타입" */
  typeName: string
  /** Personality one-liner shown on the reveal screen */
  personality: string
}

export const STATLING_TYPES: Record<StatId, StatlingType> = {
  reaction: { id: 'reaction', typeName: '번쩍 타입', personality: '호기심 많고 잠시도 가만히 있지 못하는 성격' },
  memory: { id: 'memory', typeName: '차곡 타입', personality: '작은 것도 오래 기억하는 다정한 성격' },
  focus: { id: 'focus', typeName: '몰입 타입', personality: '한 번 빠지면 끝을 보는 집중형 성격' },
  judgment: { id: 'judgment', typeName: '결단 타입', personality: '망설임 없이 선택하는 야무진 성격' },
  spatial: { id: 'spatial', typeName: '입체 타입', personality: '머릿속에 세계를 그리는 상상형 성격' },
  reasoning: { id: 'reasoning', typeName: '탐정 타입', personality: '숨은 규칙을 찾아내는 똑똑한 성격' },
}

/** Returns the stat id with the highest Final Stat (the winning type). */
export function getTopStat(finals: Record<StatId, number>): StatId {
  return STAT_DISPLAY_ORDER.reduce((best, id) =>
    (finals[id] ?? 0) > (finals[best] ?? 0) ? id : best,
  )
}

/** Returns the stat id with the second-highest Final Stat (the supporting type used by the pet-matching explanation). */
export function getSecondStat(finals: Record<StatId, number>): StatId {
  const top = getTopStat(finals)
  return STAT_DISPLAY_ORDER.filter((id) => id !== top).reduce((best, id) =>
    (finals[id] ?? 0) > (finals[best] ?? 0) ? id : best,
  )
}
