import type { StatId } from '@/lib/brain-bet'

/**
 * Presentation-layer content for the "강점과 주의할 점" / "나에게 잘 맞는 방식"
 * sections — purely additive copy, no matching/scoring logic. Never
 * diagnostic or absolute ("당신은 무조건 ~합니다") — always framed as a
 * tendency ("~하는 경향이 있어요", "~할 수 있어요").
 */
export interface StatInsight {
  strengths: string[]
  cautions: string[]
  learningStyle: string[]
  workStyle: string[]
  summary: string
}

interface StatInsightBase {
  strengths: string[]
  cautions: string[]
  learningStyle: string[]
  workStyle: string[]
}

/** Per-stat candidate pools. Combined 2-primary + 1-secondary per category, then deduped. */
const STAT_INSIGHT_BASE: Record<StatId, StatInsightBase> = {
  reaction: {
    strengths: [
      '나는 빠른 판단이 필요한 순간, 남들보다 먼저 움직이는 편이에요',
      '나는 새로운 자극에도 망설임 없이 반응하는 편이에요',
      '나는 변화가 많은 환경에도 빠르게 적응하는 편이에요',
    ],
    cautions: [
      '나는 급하게 결정하다 세부사항을 놓칠 때가 있어요',
      '나는 차분히 기다려야 하는 상황에서 답답함을 느낄 수 있어요',
    ],
    learningStyle: [
      '짧고 반복적인 연습으로 감각을 익히는 방식이 잘 맞아요',
      '직접 부딪히며 배우는 실전형 학습이 효과적일 수 있어요',
      '긴 설명보다 바로 해보는 방식을 선호하는 편이에요',
    ],
    workStyle: [
      '빠르게 시도하고 수정하는 흐름에서 강점을 보일 수 있어요',
      '즉각적인 피드백이 있는 업무에서 몰입도가 높아질 수 있어요',
      '동시에 여러 일을 처리해야 하는 상황에 강한 편이에요',
    ],
  },
  memory: {
    strengths: [
      '나는 한 번 접한 정보를 오래 붙잡아 두는 편이에요',
      '나는 세부적인 내용도 놓치지 않고 잘 기억해요',
      '나는 쌓아온 경험을 새로운 상황에 잘 연결하는 편이에요',
    ],
    cautions: [
      '나는 새로운 방식으로 전환할 때 시간이 조금 더 걸리는 편이에요',
      '나는 익숙한 방법을 고수하다 변화에 더디게 반응할 수 있어요',
    ],
    learningStyle: [
      '반복 학습과 정리된 자료로 차근차근 쌓아가는 방식이 잘 맞아요',
      '기존 지식과 연결지어 배우면 오래 기억하는 편이에요',
      '기록을 남기며 학습할 때 효과가 좋을 수 있어요',
    ],
    workStyle: [
      '축적된 자료와 사례를 다루는 업무에서 강점을 보일 수 있어요',
      '장기 프로젝트에서 꾸준한 힘을 발휘하는 편이에요',
      '세부 이력 관리가 필요한 역할에 잘 맞을 수 있어요',
    ],
  },
  focus: {
    strengths: [
      '나는 한 가지 목표에 깊이 몰입하는 편이에요',
      '나는 방해 요소가 있어도 쉽게 흔들리지 않는 편이에요',
      '나는 긴 시간 하나의 작업에 집중을 유지할 수 있어요',
    ],
    cautions: [
      '나는 여러 일을 동시에 처리할 때 전환이 조금 느린 편이에요',
      '나는 몰입하다 주변의 다른 신호를 놓칠 때가 있어요',
    ],
    learningStyle: [
      '한 주제를 깊게 파고드는 학습 방식이 잘 맞아요',
      '방해받지 않는 조용한 환경에서 효율이 높아질 수 있어요',
      '긴 호흡의 과제에서 강점을 발휘하는 편이에요',
    ],
    workStyle: [
      '몰입이 필요한 심층 작업에서 강점을 보일 수 있어요',
      '잦은 전환보다 한 가지 업무에 집중하는 구조가 잘 맞아요',
      '혼자 깊이 파고드는 역할에서 성과를 내는 편이에요',
    ],
  },
  judgment: {
    strengths: [
      '나는 상황을 빠르게 정리해서 결정을 내리는 편이에요',
      '나는 복잡한 정보 속에서도 핵심을 잘 골라내요',
      '나는 제한된 시간 안에서도 결단력을 발휘하는 편이에요',
    ],
    cautions: [
      '나는 빠르게 결정한 뒤 다시 확인하는 과정을 건너뛸 때가 있어요',
      '나는 충분히 논의되기 전에 결론부터 낼 때가 있어요',
    ],
    learningStyle: [
      '핵심 요약과 사례 중심 학습이 잘 맞아요',
      '직접 선택하고 결과를 확인하며 배우는 방식을 선호하는 편이에요',
      '긴 설명보다 요점 정리된 자료를 선호할 수 있어요',
    ],
    workStyle: [
      '빠른 의사결정이 필요한 자리에서 강점을 보일 수 있어요',
      '우선순위를 정리하는 역할에 잘 맞는 편이에요',
      '촉박한 마감이 있는 업무에서 힘을 발휘할 수 있어요',
    ],
  },
  spatial: {
    strengths: [
      '나는 머릿속으로 구조와 그림을 잘 그려내는 편이에요',
      '나는 복잡한 모양이나 배치를 직관적으로 파악하는 편이에요',
      '나는 전체 구조를 입체적으로 이해하는 편이에요',
    ],
    cautions: [
      '나는 말이나 글로 설명하는 데 시간이 조금 더 걸리는 편이에요',
      '나는 세부 절차보다 큰 그림에 먼저 집중하는 편이에요',
    ],
    learningStyle: [
      '그림, 도표로 배우는 방식이 잘 맞아요',
      '직접 그려보거나 조립해보며 이해하는 편이에요',
      '전체 구조를 먼저 파악한 뒤 세부로 들어가는 방식을 선호할 수 있어요',
    ],
    workStyle: [
      '구조를 설계하거나 배치하는 업무에서 강점을 보일 수 있어요',
      '시각 자료를 다루는 역할에 잘 맞는 편이에요',
      '공간이나 흐름을 기획하는 일에서 힘을 발휘할 수 있어요',
    ],
  },
  reasoning: {
    strengths: [
      '나는 숨은 규칙과 패턴을 잘 찾아내는 편이에요',
      '나는 단서를 모아 논리적으로 결론을 이끌어내는 편이에요',
      '나는 복잡한 문제를 차근차근 분석하는 편이에요',
    ],
    cautions: [
      '나는 분석이 길어지며 결정이 조금 늦어질 때가 있어요',
      '나는 직관적인 판단보다 검증을 우선해서 속도가 늦어질 수 있어요',
    ],
    learningStyle: [
      '원리와 이유를 이해하며 배우는 방식이 잘 맞아요',
      '퍼즐이나 사례 분석으로 학습할 때 효과적일 수 있어요',
      '스스로 근거를 따져보는 과정을 선호하는 편이에요',
    ],
    workStyle: [
      '분석과 검증이 필요한 업무에서 강점을 보일 수 있어요',
      '문제의 원인을 추적하는 역할에 잘 맞는 편이에요',
      '체계적으로 검토하는 일에서 힘을 발휘할 수 있어요',
    ],
  },
}

/** Appends items from `secondary` after `primary`, dropping exact-duplicate phrases, capped at `limit`. */
function combine(primary: string[], secondary: string[], limit: number): string[] {
  const merged = [...primary, ...secondary]
  const seen = new Set<string>()
  const result: string[] = []
  for (const item of merged) {
    if (seen.has(item)) continue
    seen.add(item)
    result.push(item)
    if (result.length >= limit) break
  }
  return result
}

/**
 * Combines the top+secondary stat's candidate pools into one deduped
 * insight — content actually varies across all 30 ordered (top, secondary)
 * combinations since each stat contributes its own phrasing.
 */
export function buildStatInsight(topStat: StatId, secondaryStat: StatId): StatInsight {
  const top = STAT_INSIGHT_BASE[topStat]
  const secondary = STAT_INSIGHT_BASE[secondaryStat]

  return {
    strengths: combine(top.strengths.slice(0, 2), secondary.strengths.slice(0, 1), 3),
    cautions: combine(top.cautions.slice(0, 1), secondary.cautions.slice(0, 1), 2),
    learningStyle: combine(top.learningStyle.slice(0, 2), secondary.learningStyle.slice(0, 1), 3),
    workStyle: combine(top.workStyle.slice(0, 2), secondary.workStyle.slice(0, 1), 3),
    summary: '두 스탯을 중심으로 강점과 어울리는 방식을 정리했어요.',
  }
}
