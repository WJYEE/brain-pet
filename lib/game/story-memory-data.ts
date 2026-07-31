import type { StoryQuestionCategory } from '@/lib/game/types'

export interface StoryQuestion {
  question: string
  choices: string[]
  answerIndex: number
  category: StoryQuestionCategory
}

export interface StoryRound {
  id: string
  story: string
  questions: StoryQuestion[]
  readingSeconds: number
  difficulty: 'easy' | 'normal' | 'hard'
}

/**
 * 15 hand-authored story sets (spec: "최소 12개, 난이도별 최소 4개" — 5
 * easy / 5 normal / 5 hard here), each 3-7 short sentences, built around
 * concrete memory anchors (person/place/order/number/object) rather than
 * hard vocabulary, so the game measures recall, not reading difficulty.
 * readingSeconds is fixed per story and intentionally tight (8/10/12s by
 * difficulty) with no early-skip — re-reading isn't realistically possible,
 * so this stays a memory test rather than a reading-speed test the other way.
 */
export const STORY_ROUNDS: StoryRound[] = [
  {
    id: 'school-morning',
    story:
      '민수는 아침에 빨간 우산을 들고 학교에 갔어요. 도서관에 들러 책 세 권을 빌린 뒤, 교실로 들어가 자리에 앉았어요. 창밖에는 비가 조용히 내리고 있었어요.',
    readingSeconds: 8,
    difficulty: 'easy',
    questions: [
      { question: '우산을 든 사람은 누구였나요?', choices: ['민수', '지호', '수아', '태윤'], answerIndex: 0, category: 'person' },
      { question: '민수가 들고 간 우산은 무슨 색이었나요?', choices: ['파란색', '빨간색', '노란색', '초록색'], answerIndex: 1, category: 'object' },
      { question: '민수는 책을 몇 권 빌렸나요?', choices: ['한 권', '두 권', '세 권', '네 권'], answerIndex: 2, category: 'number' },
      { question: '민수는 도서관에 들른 뒤 어디로 갔나요?', choices: ['교실', '운동장', '급식실', '보건실'], answerIndex: 0, category: 'order' },
    ],
  },
  {
    id: 'park-picnic',
    story:
      '수아와 지호는 공원으로 소풍을 갔어요. 먼저 돗자리를 편 다음, 파란 가방에서 샌드위치 네 개를 꺼냈어요. 잠시 뒤 노란 나비가 날아와 근처에 앉았어요.',
    readingSeconds: 8,
    difficulty: 'easy',
    questions: [
      { question: '공원에 소풍을 간 두 사람은 누구였나요?', choices: ['수아와 지호', '민수와 태윤', '수아와 태윤', '지호와 민수'], answerIndex: 0, category: 'person' },
      { question: '샌드위치는 몇 개였나요?', choices: ['두 개', '세 개', '네 개', '다섯 개'], answerIndex: 2, category: 'number' },
      { question: '가방은 무슨 색이었나요?', choices: ['빨간색', '파란색', '초록색', '검은색'], answerIndex: 1, category: 'object' },
      { question: '돗자리를 편 다음 무엇을 했나요?', choices: ['나비를 잡았다', '샌드위치를 꺼냈다', '낮잠을 잤다', '집에 갔다'], answerIndex: 1, category: 'order' },
    ],
  },
  {
    id: 'market-errand',
    story:
      '태윤이는 시장에 가서 사과 다섯 개와 우유 한 병을 샀어요. 계산을 마친 뒤 빵집에 들러 초코빵을 하나 더 샀어요. 집에 오는 길에 우체국 앞에서 이웃을 만났어요.',
    readingSeconds: 10,
    difficulty: 'normal',
    questions: [
      { question: '태윤이는 사과를 몇 개 샀나요?', choices: ['세 개', '네 개', '다섯 개', '여섯 개'], answerIndex: 2, category: 'number' },
      { question: '시장에서 산 것이 아닌 것은?', choices: ['사과', '우유', '초코빵', '계란'], answerIndex: 3, category: 'object' },
      { question: '태윤이는 계산 후 어디에 들렀나요?', choices: ['빵집', '약국', '학교', '병원'], answerIndex: 0, category: 'order' },
      { question: '이웃을 만난 곳은 어디였나요?', choices: ['빵집 앞', '우체국 앞', '시장 입구', '집 안'], answerIndex: 1, category: 'place' },
    ],
  },
  {
    id: 'kitchen-baking',
    story:
      '지호는 주말에 쿠키를 굽기로 했어요. 먼저 밀가루와 설탕을 섞고, 버터를 넣어 반죽을 만들었어요. 반죽을 열두 조각으로 나눈 뒤 오븐에 넣었어요.',
    readingSeconds: 10,
    difficulty: 'normal',
    questions: [
      { question: '지호는 무엇을 만들었나요?', choices: ['빵', '쿠키', '케이크', '피자'], answerIndex: 1, category: 'object' },
      { question: '반죽은 몇 조각으로 나눴나요?', choices: ['열 조각', '열한 조각', '열두 조각', '열세 조각'], answerIndex: 2, category: 'number' },
      { question: '밀가루와 설탕을 섞은 다음 무엇을 넣었나요?', choices: ['버터', '계란', '우유', '소금'], answerIndex: 0, category: 'order' },
      { question: '반죽을 나눈 뒤 어디에 넣었나요?', choices: ['냉장고', '오븐', '전자레인지', '냄비'], answerIndex: 1, category: 'place' },
    ],
  },
  {
    id: 'zoo-visit',
    story:
      '민수네 가족은 동물원에 갔어요. 코끼리를 먼저 보고, 그다음 기린 세 마리를 구경했어요. 마지막으로 원숭이 우리 앞에서 사진을 찍었어요. 하늘은 맑고 화창했어요.',
    readingSeconds: 10,
    difficulty: 'normal',
    questions: [
      { question: '민수네 가족이 처음 본 동물은?', choices: ['기린', '코끼리', '원숭이', '사자'], answerIndex: 1, category: 'order' },
      { question: '기린은 몇 마리였나요?', choices: ['두 마리', '세 마리', '네 마리', '다섯 마리'], answerIndex: 1, category: 'number' },
      { question: '사진을 찍은 곳은 어디 앞이었나요?', choices: ['코끼리 우리', '기린 우리', '원숭이 우리', '매표소'], answerIndex: 2, category: 'place' },
      { question: '이날 날씨는 어땠나요?', choices: ['비가 왔다', '맑고 화창했다', '눈이 왔다', '흐렸다'], answerIndex: 1, category: 'object' },
    ],
  },
  {
    id: 'camping-night',
    story:
      '수아네 가족은 강가로 캠핑을 떠났어요. 텐트를 친 다음 장작 여섯 개를 모아 불을 피웠어요. 저녁으로 옥수수를 구워 먹고, 별 세 개가 유난히 밝게 빛났어요.',
    readingSeconds: 12,
    difficulty: 'hard',
    questions: [
      { question: '캠핑을 간 장소는 어디였나요?', choices: ['바닷가', '강가', '산속', '들판'], answerIndex: 1, category: 'place' },
      { question: '장작은 몇 개를 모았나요?', choices: ['네 개', '다섯 개', '여섯 개', '일곱 개'], answerIndex: 2, category: 'number' },
      { question: '텐트를 친 다음 무엇을 했나요?', choices: ['불을 피웠다', '별을 봤다', '옥수수를 먹었다', '잠을 잤다'], answerIndex: 0, category: 'order' },
      { question: '저녁으로 무엇을 구워 먹었나요?', choices: ['감자', '고구마', '옥수수', '소시지'], answerIndex: 2, category: 'object' },
    ],
  },
  {
    id: 'beach-morning',
    story:
      '태윤이는 이른 아침 바다에 갔어요. 모래성을 쌓은 뒤 조개 일곱 개를 주웠어요. 파도가 밀려와 모래성 하나를 무너뜨렸고, 태윤이는 웃으며 다시 쌓기 시작했어요.',
    readingSeconds: 12,
    difficulty: 'hard',
    questions: [
      { question: '태윤이가 간 곳은 어디였나요?', choices: ['강가', '바다', '호수', '수영장'], answerIndex: 1, category: 'place' },
      { question: '주운 조개는 몇 개였나요?', choices: ['다섯 개', '여섯 개', '일곱 개', '여덟 개'], answerIndex: 2, category: 'number' },
      { question: '모래성을 쌓은 다음 무엇을 했나요?', choices: ['조개를 주웠다', '수영을 했다', '집에 갔다', '낮잠을 잤다'], answerIndex: 0, category: 'order' },
      { question: '파도가 무너뜨린 것은 무엇이었나요?', choices: ['모래성', '조개', '파라솔', '튜브'], answerIndex: 0, category: 'object' },
    ],
  },
  {
    id: 'birthday-party',
    story:
      '지호의 생일 파티에 친구 다섯 명이 모였어요. 케이크에 촛불을 켠 뒤 다 함께 노래를 불렀어요. 선물을 연 지호는 파란 로봇 장난감을 가장 좋아했어요.',
    readingSeconds: 12,
    difficulty: 'hard',
    questions: [
      { question: '생일 파티의 주인공은 누구였나요?', choices: ['민수', '수아', '지호', '태윤'], answerIndex: 2, category: 'person' },
      { question: '파티에 모인 친구는 몇 명이었나요?', choices: ['세 명', '네 명', '다섯 명', '여섯 명'], answerIndex: 2, category: 'number' },
      { question: '촛불을 켠 다음 무엇을 했나요?', choices: ['노래를 불렀다', '선물을 열었다', '케이크를 먹었다', '사진을 찍었다'], answerIndex: 0, category: 'order' },
      { question: '지호가 가장 좋아한 선물은 무엇이었나요?', choices: ['파란 로봇 장난감', '빨간 자동차', '노란 풍선', '초록 공룡 인형'], answerIndex: 0, category: 'object' },
    ],
  },
  {
    id: 'playground-afternoon',
    story:
      '지호는 방과 후 놀이터에 갔어요. 그네를 다섯 번 탄 뒤, 미끄럼틀 옆에서 친구 은우를 만났어요. 둘은 함께 모래놀이를 했어요.',
    readingSeconds: 8,
    difficulty: 'easy',
    questions: [
      { question: '방과 후 놀이터에 간 사람은 누구였나요?', choices: ['지호', '수아', '은우', '태윤'], answerIndex: 0, category: 'person' },
      { question: '그네를 몇 번 탔나요?', choices: ['세 번', '네 번', '다섯 번', '여섯 번'], answerIndex: 2, category: 'number' },
      { question: '미끄럼틀 옆에서 만난 친구는 누구였나요?', choices: ['민수', '수아', '은우', '태윤'], answerIndex: 2, category: 'person' },
    ],
  },
  {
    id: 'grocery-simple',
    story:
      '수아는 슈퍼에서 우유와 계란을 샀어요. 계산대에서 사탕 두 개를 더 골랐어요. 집으로 오는 길에 노란 고양이를 봤어요.',
    readingSeconds: 8,
    difficulty: 'easy',
    questions: [
      { question: '슈퍼에 간 사람은 누구였나요?', choices: ['수아', '지호', '민수', '태윤'], answerIndex: 0, category: 'person' },
      { question: '계산대에서 더 고른 것은 몇 개였나요?', choices: ['사탕 한 개', '사탕 두 개', '사탕 세 개', '사탕 네 개'], answerIndex: 1, category: 'number' },
      { question: '집에 오는 길에 본 동물은 무엇이었나요?', choices: ['강아지', '고양이', '토끼', '참새'], answerIndex: 1, category: 'object' },
    ],
  },
  {
    id: 'rainy-classroom',
    story:
      '태윤이는 쉬는 시간에 창가에 서서 비를 봤어요. 짝꿍 민수가 우산을 안 가져왔다고 말했어요. 태윤이는 자신의 우산을 같이 쓰자고 했어요.',
    readingSeconds: 8,
    difficulty: 'easy',
    questions: [
      { question: '창가에 서서 비를 본 사람은 누구였나요?', choices: ['태윤', '지호', '수아', '은우'], answerIndex: 0, category: 'person' },
      { question: '우산을 안 가져온 사람은 누구였나요?', choices: ['태윤', '민수', '지호', '수아'], answerIndex: 1, category: 'person' },
      { question: '태윤이는 민수에게 무엇을 제안했나요?', choices: ['우산을 같이 쓰자고 했다', '집까지 데려다주겠다고 했다', '우산을 빌려주고 갔다', '선생님께 말하겠다고 했다'], answerIndex: 0, category: 'order' },
    ],
  },
  {
    id: 'library-project',
    story:
      '지호와 수아는 도서관에서 발표 준비를 했어요. 먼저 책 네 권을 찾아 자리에 앉았어요. 자료를 정리한 뒤, 색연필로 표지를 꾸몄어요. 마지막으로 선생님께 검사를 받으러 갔어요.',
    readingSeconds: 10,
    difficulty: 'normal',
    questions: [
      { question: '도서관에서 발표 준비를 한 두 사람은 누구였나요?', choices: ['지호와 수아', '민수와 태윤', '지호와 태윤', '수아와 은우'], answerIndex: 0, category: 'person' },
      { question: '책은 몇 권을 찾았나요?', choices: ['세 권', '네 권', '다섯 권', '여섯 권'], answerIndex: 1, category: 'number' },
      { question: '자료를 정리한 다음 무엇을 했나요?', choices: ['표지를 꾸몄다', '검사를 받았다', '책을 반납했다', '발표를 했다'], answerIndex: 0, category: 'order' },
      { question: '마지막으로 무엇을 하러 갔나요?', choices: ['선생님께 검사받으러', '집에 가려고', '책을 더 찾으러', '친구를 만나러'], answerIndex: 0, category: 'order' },
    ],
  },
  {
    id: 'farm-morning',
    story:
      '민수네 가족은 이른 아침 농장에 도착했어요. 닭장에서 달걀 여섯 개를 모았어요. 그 다음 염소에게 먹이를 주고, 마지막으로 트랙터를 구경했어요.',
    readingSeconds: 10,
    difficulty: 'normal',
    questions: [
      { question: '민수네 가족이 이른 아침 도착한 곳은 어디였나요?', choices: ['농장', '바다', '동물원', '산속'], answerIndex: 0, category: 'place' },
      { question: '닭장에서 모은 달걀은 몇 개였나요?', choices: ['다섯 개', '여섯 개', '일곱 개', '여덟 개'], answerIndex: 1, category: 'number' },
      { question: '달걀을 모은 다음 무엇을 했나요?', choices: ['염소에게 먹이를 줬다', '트랙터를 탔다', '집에 갔다', '낮잠을 잤다'], answerIndex: 0, category: 'order' },
      { question: '마지막으로 구경한 것은 무엇이었나요?', choices: ['닭장', '염소', '트랙터', '돼지'], answerIndex: 2, category: 'order' },
    ],
  },
  {
    id: 'school-festival',
    story:
      '지호네 반은 학교 축제에서 붕어빵 가게를 열었어요. 먼저 반죽을 만들고, 그다음 팥소를 채운 뒤 틀에 구웠어요. 한 시간 만에 서른 개를 팔았어요. 남은 이익금 중 반은 기부하기로 했어요. 지호는 손님에게 붕어빵 두 개를 서비스로 더 줬어요.',
    readingSeconds: 12,
    difficulty: 'hard',
    questions: [
      { question: '붕어빵 가게를 연 것은 누구네 반이었나요?', choices: ['지호네 반', '수아네 반', '민수네 반', '태윤이네 반'], answerIndex: 0, category: 'person' },
      { question: '한 시간 동안 몇 개를 팔았나요?', choices: ['스무 개', '스물다섯 개', '서른 개', '서른다섯 개'], answerIndex: 2, category: 'number' },
      { question: '반죽을 만든 다음 무엇을 했나요?', choices: ['팥소를 채웠다', '틀에 구웠다', '손님을 받았다', '가게를 열었다'], answerIndex: 0, category: 'order' },
      { question: '남은 이익금 중 절반은 어떻게 하기로 했나요?', choices: ['기부하기로 했다', '나눠 가지기로 했다', '저금하기로 했다', '다시 재료를 샀다'], answerIndex: 0, category: 'object' },
      { question: '지호는 손님에게 무엇을 서비스로 더 줬나요?', choices: ['붕어빵 한 개', '붕어빵 두 개', '음료수', '쿠폰'], answerIndex: 1, category: 'number' },
    ],
  },
  {
    id: 'museum-trip',
    story:
      '수아네 학교는 박물관으로 현장학습을 갔어요. 먼저 공룡 화석 전시실을 둘러봤어요. 그다음 우주관에서 별자리 영상을 봤어요. 점심으로 김밥을 먹은 뒤, 마지막으로 기념품 가게에 들렀어요. 수아는 별 모양 열쇠고리를 샀어요.',
    readingSeconds: 12,
    difficulty: 'hard',
    questions: [
      { question: '현장학습을 간 곳은 어디였나요?', choices: ['박물관', '동물원', '미술관', '과학관'], answerIndex: 0, category: 'place' },
      { question: '가장 먼저 둘러본 전시실은 무엇이었나요?', choices: ['공룡 화석 전시실', '우주관', '기념품 가게', '식물원'], answerIndex: 0, category: 'order' },
      { question: '우주관 다음에 무엇을 했나요?', choices: ['점심을 먹었다', '기념품을 샀다', '버스를 탔다', '집에 갔다'], answerIndex: 0, category: 'order' },
      { question: '점심으로 무엇을 먹었나요?', choices: ['김밥', '샌드위치', '떡볶이', '피자'], answerIndex: 0, category: 'object' },
      { question: '수아가 기념품 가게에서 산 것은 무엇이었나요?', choices: ['별 모양 열쇠고리', '공룡 인형', '우주 포스터', '연필'], answerIndex: 0, category: 'object' },
    ],
  },
]

/** Picks a story other than `excludeId` (when possible) so a replay never sees the exact same set twice in a row. */
export function pickStoryRound(excludeId: string | null): StoryRound {
  const candidates = excludeId ? STORY_ROUNDS.filter((s) => s.id !== excludeId) : STORY_ROUNDS
  const pool = candidates.length > 0 ? candidates : STORY_ROUNDS
  return pool[Math.floor(Math.random() * pool.length)]
}

/** Module-scoped last-picked id (survives across game remounts within the same browser tab) so StoryMemoryGame doesn't need to thread this through game-flow.tsx. */
let lastPickedStoryId: string | null = null

export function pickNextStoryRound(): StoryRound {
  const round = pickStoryRound(lastPickedStoryId)
  lastPickedStoryId = round.id
  return round
}
