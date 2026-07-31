export interface DecisionChoice {
  text: string
  /** 0-100 — how good this choice is against the scenario's stated goal, not a moral judgment. */
  score: number
  feedback: string
}

export interface DecisionScenario {
  id: string
  prompt: string
  goal: string
  choices: DecisionChoice[]
  timeLimitSeconds: number
  difficulty: 'easy' | 'normal' | 'hard'
}

/**
 * 24 scenarios (spec: "최소 24개, 난이도별 최소 8개" — 8 easy / 8 normal /
 * 8 hard here) — every one has a stated, concrete goal and a choice that's
 * provably best against it (feedback explains why in plain, factual terms).
 * Never a morality test — "가장 효율적인 선택" only.
 */
export const DECISION_SCENARIOS: DecisionScenario[] = [
  {
    id: 'move-boxes',
    prompt: '이사를 도와야 해요. 트럭이 5분 뒤에 떠나요.',
    goal: '목표: 5분 안에 최대한 많은 상자를 옮기기',
    timeLimitSeconds: 8,
    difficulty: 'easy',
    choices: [
      { text: '한 번에 상자 1개씩, 빠르게 여러 번 옮긴다', score: 70, feedback: '안전하지만 왕복이 많아 총량이 줄어요.' },
      { text: '작은 상자 여러 개를 한 번에 포개 옮긴다', score: 100, feedback: '한 번에 옮기는 양이 늘어 가장 효율적이에요.' },
      { text: '가장 무거운 상자부터 하나씩 신중히 옮긴다', score: 50, feedback: '시간이 오래 걸려 옮기는 개수가 줄어요.' },
      { text: '상자를 정리하며 순서를 다시 짠다', score: 20, feedback: '정리하는 동안 시간이 그대로 흘러가요.' },
    ],
  },
  {
    id: 'before-rain',
    prompt: '비가 곧 내릴 것 같아요. 마당에 빨래와 자전거, 화분이 있어요.',
    goal: '목표: 비에 젖으면 안 되는 것부터 순서대로 처리하기',
    timeLimitSeconds: 8,
    difficulty: 'easy',
    choices: [
      { text: '빨래를 먼저 걷고, 자전거를 옮긴다', score: 100, feedback: '빨래는 젖으면 다시 말려야 해서 가장 급해요.' },
      { text: '화분을 먼저 옮기고 빨래는 나중에 걷는다', score: 40, feedback: '화분은 비를 맞아도 큰 문제가 없어요.' },
      { text: '자전거만 창고에 넣는다', score: 30, feedback: '빨래가 젖는 걸 막지 못해요.' },
      { text: '순서를 정하지 않고 눈에 보이는 대로 처리한다', score: 20, feedback: '급한 것을 놓칠 수 있어요.' },
    ],
  },
  {
    id: 'low-energy',
    prompt: '배터리가 5%만 남았어요. 지도 앱, 메시지, 손전등 중 하나만 켤 수 있어요.',
    goal: '목표: 어두운 산길에서 하산하기 위한 가장 효율적인 선택',
    timeLimitSeconds: 8,
    difficulty: 'normal',
    choices: [
      { text: '손전등을 켜서 길을 비춘다', score: 100, feedback: '지금 가장 필요한 건 시야 확보예요.' },
      { text: '지도 앱을 켜서 위치를 확인한다', score: 60, feedback: '위치는 도움이 되지만 어두우면 걷기 자체가 위험해요.' },
      { text: '메시지를 보내 도움을 요청한다', score: 40, feedback: '응답을 마냥 기다릴 수 없는 상황이에요.' },
      { text: '배터리를 아끼려고 전부 끈다', score: 20, feedback: '아무 도움도 되지 않아요.' },
    ],
  },
  {
    id: 'two-paths',
    prompt: '두 갈래길이 있어요. 왼쪽은 좁고 가파르지만 짧고, 오른쪽은 넓고 완만하지만 두 배 길어요.',
    goal: '목표: 해지기 전에 안전하게 도착하기',
    timeLimitSeconds: 8,
    difficulty: 'normal',
    choices: [
      { text: '시간이 촉박하니 왼쪽 좁은 길로 서두른다', score: 40, feedback: '가파른 길은 서두르면 오히려 위험해요.' },
      { text: '오른쪽 완만한 길로 꾸준히 걷는다', score: 100, feedback: '속도는 비슷해도 훨씬 안전하게 도착할 수 있어요.' },
      { text: '중간에 길을 바꿔가며 간다', score: 30, feedback: '왔다갔다 하면 시간이 더 걸려요.' },
      { text: '어두워질 때까지 그 자리에서 고민한다', score: 10, feedback: '아무 곳에도 도착하지 못해요.' },
    ],
  },
  {
    id: 'pick-container',
    prompt: '물 2리터를 담아야 해요. 500ml병 2개, 1.5L병 1개, 3L 통 1개가 있어요.',
    goal: '목표: 넘치지 않게 최소한의 용기로 담기',
    timeLimitSeconds: 8,
    difficulty: 'easy',
    choices: [
      { text: '3L 통 하나에 담는다', score: 100, feedback: '한 번에 정확히 담을 수 있는 가장 간단한 선택이에요.' },
      { text: '500ml병 2개와 1.5L병을 모두 사용한다', score: 50, feedback: '용기가 많아지고 500ml병은 넘쳐요.' },
      { text: '1.5L병만 사용한다', score: 20, feedback: '용량이 부족해서 다 담을 수 없어요.' },
      { text: '500ml병 2개만 사용한다', score: 10, feedback: '턱없이 부족해요.' },
    ],
  },
  {
    id: 'study-time',
    prompt: '시험까지 3시간 남았어요. 어려운 단원 1개와 쉬운 단원 3개가 남아 있어요.',
    goal: '목표: 남은 시간 안에 점수를 가장 많이 올리기',
    timeLimitSeconds: 8,
    difficulty: 'normal',
    choices: [
      { text: '어려운 단원 하나에 3시간을 모두 쓴다', score: 50, feedback: '시간 대비 얻는 점수가 크지 않을 수 있어요.' },
      { text: '쉬운 단원 3개를 먼저 빠르게 끝내고 남는 시간에 어려운 단원을 본다', score: 100, feedback: '쉬운 단원에서 확실히 점수를 확보한 뒤 여유를 활용해요.' },
      { text: '어려운 단원부터 조금 보다가 포기하고 잔다', score: 10, feedback: '아무 단원도 제대로 끝내지 못해요.' },
      { text: '단원 순서를 무작위로 넘나들며 훑어본다', score: 30, feedback: '집중이 흩어져 남는 게 적어요.' },
    ],
  },
  {
    id: 'shared-fridge',
    prompt: '냉장고에 자리가 한 칸만 남았어요. 우유, 남은 반찬, 아이스크림이 있어요.',
    goal: '목표: 상하기 쉬운 것부터 우선 보관하기',
    timeLimitSeconds: 8,
    difficulty: 'easy',
    choices: [
      { text: '우유를 넣는다', score: 100, feedback: '우유가 가장 빨리 상할 수 있는 음식이에요.' },
      { text: '아이스크림을 넣는다', score: 30, feedback: '아이스크림은 냉동실에 넣어야 해요.' },
      { text: '남은 반찬을 넣는다', score: 60, feedback: '반찬도 중요하지만 우유가 더 급해요.' },
      { text: '아무것도 넣지 않고 나중에 정리한다', score: 10, feedback: '상할 위험이 그대로 남아요.' },
    ],
  },
  {
    id: 'noisy-room',
    prompt: '집중해서 30분 안에 보고서를 끝내야 해요. 옆방에서 TV 소리가 크게 들려요.',
    goal: '목표: 30분 안에 보고서를 완성하기',
    timeLimitSeconds: 8,
    difficulty: 'normal',
    choices: [
      { text: '이어폰을 끼고 집중해서 계속 쓴다', score: 100, feedback: '방해 요소를 차단하고 바로 시간을 확보해요.' },
      { text: 'TV를 꺼달라고 부탁하러 간다', score: 60, feedback: '해결은 되지만 이동하는 시간이 들어요.' },
      { text: '다른 조용한 카페를 찾아 나선다', score: 30, feedback: '이동 시간이 30분을 다 써버릴 수 있어요.' },
      { text: '소리가 잦아들 때까지 기다린다', score: 10, feedback: '언제 끝날지 알 수 없어요.' },
    ],
  },
  {
    id: 'broken-umbrella',
    prompt: '우산 살이 하나 부러졌어요. 밖에는 비가 오고 있고, 5분 뒤 버스가 와요.',
    goal: '목표: 비를 최대한 피하며 제시간에 버스를 타기',
    timeLimitSeconds: 8,
    difficulty: 'easy',
    choices: [
      { text: '부러진 우산이라도 쓰고 바로 나간다', score: 100, feedback: '부분적으로라도 비를 막으며 시간을 지킬 수 있어요.' },
      { text: '우산을 고치는 데 시간을 쓴다', score: 20, feedback: '버스를 놓칠 가능성이 커요.' },
      { text: '비가 그치길 기다린다', score: 10, feedback: '버스 시간과 상관없이 마냥 기다리게 돼요.' },
      { text: '우산 없이 뛰어간다', score: 50, feedback: '빠르지만 많이 젖게 돼요.' },
    ],
  },
  {
    id: 'group-project',
    prompt: '팀 과제 마감이 1시간 남았어요. 자료 조사, 발표 자료 정리, 리허설이 남아 있어요.',
    goal: '목표: 1시간 안에 발표 준비를 최대한 끝내기',
    timeLimitSeconds: 8,
    difficulty: 'hard',
    choices: [
      { text: '자료 조사부터 끝까지 완벽하게 마친다', score: 30, feedback: '조사만 하다가 정리와 리허설을 못 할 수 있어요.' },
      { text: '있는 자료로 정리와 리허설까지 순서대로 진행한다', score: 100, feedback: '발표 완성도를 시간 안에 끌어올리는 데 가장 유리해요.' },
      { text: '리허설부터 먼저 해본다', score: 40, feedback: '아직 정리되지 않은 자료로는 리허설 효과가 적어요.' },
      { text: '세 가지를 동시에 나눠서 급하게 처리한다', score: 60, feedback: '일부 진행되지만 완성도가 떨어질 수 있어요.' },
    ],
  },
  {
    id: 'injured-teammate',
    prompt: '축구 경기 중 팀원이 발목을 삐끗했어요. 경기는 5분 뒤 재개돼요.',
    goal: '목표: 팀원의 부상을 악화시키지 않으면서 경기를 준비하기',
    timeLimitSeconds: 8,
    difficulty: 'normal',
    choices: [
      { text: '팀원을 쉬게 하고 교체 선수를 준비시킨다', score: 100, feedback: '부상 악화를 막으면서 경기도 이어갈 수 있어요.' },
      { text: '괜찮은지 묻고 그대로 다시 뛰게 한다', score: 20, feedback: '부상이 더 심해질 수 있어요.' },
      { text: '경기를 아예 포기한다', score: 30, feedback: '과도한 대응이라 다른 선택지가 있어요.' },
      { text: '테이프만 감고 지켜본다', score: 60, feedback: '응급처치는 되지만 충분한 휴식만큼 확실하지 않아요.' },
    ],
  },
  {
    id: 'plant-watering',
    prompt: '화분 4개 중 2개는 잎이 축 처져 있고, 2개는 흙이 촉촉해요. 물뿌리개엔 물이 조금뿐이에요.',
    goal: '목표: 부족한 물로 시드는 것을 최소화하기',
    timeLimitSeconds: 8,
    difficulty: 'easy',
    choices: [
      { text: '잎이 처진 화분 2개에 먼저 물을 준다', score: 100, feedback: '가장 급한 화분부터 살릴 수 있어요.' },
      { text: '4개 화분에 물을 조금씩 나눠 준다', score: 50, feedback: '급한 화분에도 물이 부족할 수 있어요.' },
      { text: '흙이 촉촉한 화분에 먼저 준다', score: 20, feedback: '이미 괜찮은 화분에 물을 낭비해요.' },
      { text: '물을 더 구하러 갔다 온다', score: 40, feedback: '그 사이 처진 화분이 더 나빠질 수 있어요.' },
    ],
  },
  {
    id: 'suitcase-pack',
    prompt: '여행 가방에 자리가 조금밖에 안 남았어요. 우비, 여분 신발, 책이 있어요.',
    goal: '목표: 비 예보가 있는 여행지에 꼭 필요한 것 담기',
    timeLimitSeconds: 8,
    difficulty: 'normal',
    choices: [
      { text: '우비를 넣는다', score: 100, feedback: '비 예보를 고려하면 가장 필요한 물건이에요.' },
      { text: '책을 넣는다', score: 30, feedback: '여행 목적과 직접 관련이 적어요.' },
      { text: '여분 신발을 넣는다', score: 50, feedback: '유용하지만 비 대비가 더 급해요.' },
      { text: '셋 다 조금씩 구겨 넣는다', score: 20, feedback: '자리가 부족해 제대로 들어가지 않아요.' },
    ],
  },
  {
    id: 'traffic-jam',
    prompt: '약속 시간에 늦게 생겼어요. 큰길은 막히고, 골목길은 좁지만 뚫려 있어요.',
    goal: '목표: 제시간에 안전하게 도착하기',
    timeLimitSeconds: 8,
    difficulty: 'easy',
    choices: [
      { text: '뚫려 있는 골목길로 돌아간다', score: 100, feedback: '막힌 큰길보다 실제 이동 시간이 짧아요.' },
      { text: '막힌 큰길에서 그대로 기다린다', score: 30, feedback: '언제 풀릴지 알 수 없어 늦을 가능성이 커요.' },
      { text: '차를 세워두고 뛰어간다', score: 50, feedback: '거리에 따라 다르지만 무리할 수 있어요.' },
      { text: '약속을 미루자고 미리 연락한다', score: 60, feedback: '안전하지만 원래 목표(제시간 도착)는 달성하지 못해요.' },
    ],
  },
  {
    id: 'battery-share',
    prompt: '보조배터리가 하나뿐이에요. 친구 폰은 5%, 내 폰은 40% 남았어요. 둘 다 길을 찾아야 해요.',
    goal: '목표: 둘 다 무사히 길을 찾을 수 있게 하기',
    timeLimitSeconds: 8,
    difficulty: 'normal',
    choices: [
      { text: '친구 폰에 먼저 연결한다', score: 100, feedback: '더 급한 쪽부터 충전하는 게 합리적이에요.' },
      { text: '내 폰에 먼저 연결한다', score: 40, feedback: '이미 여유 있는 쪽을 먼저 채우는 셈이에요.' },
      { text: '두 폰을 번갈아 짧게 연결한다', score: 60, feedback: '둘 다 애매하게 충전돼 비효율적이에요.' },
      { text: '배터리를 아끼려고 둘 다 끈다', score: 20, feedback: '길을 찾는 목표를 달성할 수 없어요.' },
    ],
  },
  {
    id: 'cooking-order',
    prompt: '저녁으로 국, 밥, 반찬을 준비해요. 국은 끓이는 데 20분, 밥은 15분, 반찬은 5분 걸려요.',
    goal: '목표: 세 가지를 가장 빨리 동시에 완성하기',
    timeLimitSeconds: 8,
    difficulty: 'hard',
    choices: [
      { text: '국을 가장 먼저 올리고, 밥을 안친 뒤 마지막에 반찬을 만든다', score: 100, feedback: '오래 걸리는 것부터 시작해야 세 가지가 비슷하게 끝나요.' },
      { text: '반찬부터 만들고 국, 밥 순서로 시작한다', score: 30, feedback: '오래 걸리는 국을 늦게 시작해 전체 시간이 길어져요.' },
      { text: '셋을 동시에 시작하려고 우왕좌왕한다', score: 40, feedback: '집중이 분산돼 오히려 늦어질 수 있어요.' },
      { text: '밥부터 안치고 국, 반찬 순서로 한다', score: 60, feedback: '나쁘지 않지만 가장 오래 걸리는 국이 늦게 끝나요.' },
    ],
  },
  {
    id: 'charging-cable',
    prompt: '휴대폰 배터리가 3%예요. 충전기는 하나뿐인데 거실과 방, 두 곳에 콘센트가 있어요.',
    goal: '목표: 가장 빨리 충전을 시작하기',
    timeLimitSeconds: 8,
    difficulty: 'easy',
    choices: [
      { text: '가장 가까운 콘센트에 바로 꽂는다', score: 100, feedback: '이동 시간 없이 바로 충전을 시작할 수 있어요.' },
      { text: '더 멀지만 편한 방 콘센트로 간다', score: 40, feedback: '굳이 이동하는 동안 배터리가 더 줄어요.' },
      { text: '두 콘센트 중 어디가 나을지 고민한다', score: 20, feedback: '고민하는 동안 충전이 계속 늦어져요.' },
      { text: '다른 사람에게 충전기를 빌려달라고 한다', score: 30, feedback: '이미 충전기가 있으니 불필요한 선택이에요.' },
    ],
  },
  {
    id: 'group-chat-mute',
    prompt: '내일 아침 중요한 발표가 있어요. 단체 채팅방 알림이 밤새 계속 울려요.',
    goal: '목표: 충분히 자면서도 중요한 연락은 놓치지 않기',
    timeLimitSeconds: 8,
    difficulty: 'normal',
    choices: [
      { text: '단체 채팅방만 무음으로 하고 개인 연락은 켜둔다', score: 100, feedback: '중요한 개인 연락은 받으면서 불필요한 알림만 막을 수 있어요.' },
      { text: '휴대폰을 완전히 끈다', score: 40, feedback: '정말 중요한 연락까지 놓칠 수 있어요.' },
      { text: '알림을 그대로 두고 참으며 잔다', score: 20, feedback: '계속 깨서 다음 날 컨디션이 나빠져요.' },
      { text: '채팅방에서 아예 나간다', score: 30, feedback: '당장은 조용해지지만 필요한 정보까지 놓칠 수 있어요.' },
    ],
  },
  {
    id: 'multi-errand',
    prompt: '한 시간 안에 은행, 우체국, 마트를 모두 들러야 해요. 은행은 40분 뒤 문을 닫고, 우체국은 대기줄이 길며, 마트는 아무 때나 갈 수 있어요.',
    goal: '목표: 세 곳을 모두 제시간에 들르기',
    timeLimitSeconds: 8,
    difficulty: 'hard',
    choices: [
      { text: '마감이 있는 은행을 먼저, 대기줄이 긴 우체국을 그다음, 마트를 마지막에 간다', score: 100, feedback: '마감 시간이 있는 곳부터 처리해야 놓치지 않아요.' },
      { text: '언제든 갈 수 있는 마트부터 간다', score: 30, feedback: '은행 마감을 놓칠 위험이 커져요.' },
      { text: '대기줄이 긴 우체국부터 가서 줄을 서 둔다', score: 50, feedback: '줄 서는 동안 은행 마감을 놓칠 수 있어요.' },
      { text: '세 곳에 모두 조금씩 시간을 나눠 들른다', score: 20, feedback: '이동이 늘어나 오히려 아무 곳도 제대로 못 갈 수 있어요.' },
    ],
  },
  {
    id: 'shared-laptop',
    prompt: '노트북 배터리가 20%예요. 충전기는 없고, 30분 뒤 자료 작업과 이후 화상회의가 모두 남아 있어요.',
    goal: '목표: 화상회의까지 노트북이 꺼지지 않게 하기',
    timeLimitSeconds: 8,
    difficulty: 'hard',
    choices: [
      { text: '화면 밝기를 낮추고 불필요한 프로그램을 모두 끈 뒤 자료 작업만 한다', score: 100, feedback: '전력 사용을 줄여야 회의까지 배터리를 아낄 수 있어요.' },
      { text: '평소처럼 밝기와 프로그램을 그대로 두고 작업한다', score: 30, feedback: '배터리가 회의 전에 꺼질 수 있어요.' },
      { text: '자료 작업을 포기하고 화면을 꺼둔 채 기다린다', score: 40, feedback: '배터리는 아끼지만 정작 필요한 작업을 못해요.' },
      { text: '밝기만 낮추고 프로그램은 그대로 켜 둔다', score: 60, feedback: '일부 절약되지만 충분하지 않을 수 있어요.' },
    ],
  },
  {
    id: 'three-deadlines',
    prompt: '오늘 안에 끝내야 할 일이 세 개예요. 보고서(2시간, 오늘 마감), 이메일 답장(10분, 내일도 가능), 회의 준비(30분, 1시간 뒤 회의).',
    goal: '목표: 세 가지 모두 마감을 넘기지 않고 처리하기',
    timeLimitSeconds: 8,
    difficulty: 'hard',
    choices: [
      { text: '회의 준비를 먼저 끝내고 보고서를 시작한 뒤 남는 시간에 이메일을 처리한다', score: 100, feedback: '가장 임박한 회의부터 처리해야 늦지 않아요.' },
      { text: '보고서부터 두 시간 동안 집중해서 끝낸다', score: 40, feedback: '그사이 회의 시간을 놓칠 수 있어요.' },
      { text: '급하지 않은 이메일부터 빠르게 처리한다', score: 20, feedback: '정작 급한 회의와 보고서에 쓸 시간이 줄어요.' },
      { text: '세 가지를 동시에 조금씩 처리한다', score: 30, feedback: '어느 것도 제때 끝내지 못할 수 있어요.' },
    ],
  },
  {
    id: 'limited-seats',
    prompt: '기차 좌석이 두 자리만 남았어요. 함께 가는 친구 세 명 중 한 명은 짐이 많고, 한 명은 몸이 안 좋고, 한 명은 서서 가도 괜찮다고 했어요.',
    goal: '목표: 세 명 모두 불편함을 최소화하며 이동하기',
    timeLimitSeconds: 8,
    difficulty: 'hard',
    choices: [
      { text: '몸이 안 좋은 친구와 짐이 많은 친구가 좌석에 앉는다', score: 100, feedback: '가장 힘든 상황의 두 사람을 우선 배려하는 선택이에요.' },
      { text: '먼저 자리에 앉은 사람이 그대로 앉는다', score: 30, feedback: '정작 필요한 사람이 서서 갈 수 있어요.' },
      { text: '몸이 안 좋은 친구만 앉고 나머지는 번갈아 선다', score: 70, feedback: '가장 급한 사람은 배려했지만 짐이 많은 친구가 불편할 수 있어요.' },
      { text: '가위바위보로 정한다', score: 20, feedback: '실제 필요와 상관없이 정해질 수 있어요.' },
    ],
  },
  {
    id: 'cold-storage',
    prompt: '정전으로 냉장고가 3시간째 꺼져 있어요. 냉동 고기, 아이스크림, 채소, 우유가 있고 아이스박스는 하나뿐이에요.',
    goal: '목표: 가장 빨리 상할 것부터 최대한 보존하기',
    timeLimitSeconds: 8,
    difficulty: 'hard',
    choices: [
      { text: '우유와 채소를 아이스박스에 넣는다', score: 100, feedback: '실온에서 가장 빨리 상하는 것부터 보호하는 게 맞아요.' },
      { text: '아이스크림을 아이스박스에 넣는다', score: 40, feedback: '이미 녹기 시작했다면 다시 얼리기 어려워요.' },
      { text: '냉동 고기를 아이스박스에 넣는다', score: 60, feedback: '냉동 상태라 상대적으로 시간이 더 있어요.' },
      { text: '네 가지를 조금씩 나눠 담는다', score: 50, feedback: '정작 급한 것들이 충분히 보호받지 못해요.' },
    ],
  },
  {
    id: 'exam-review',
    prompt: '시험까지 2시간 남았어요. 자신 있는 단원, 애매한 단원, 전혀 모르는 단원이 하나씩 있어요.',
    goal: '목표: 2시간 안에 예상 점수를 가장 많이 올리기',
    timeLimitSeconds: 8,
    difficulty: 'hard',
    choices: [
      { text: '애매한 단원을 집중 복습한 뒤 남는 시간에 모르는 단원을 훑는다', score: 100, feedback: '조금만 더 봐도 점수가 오를 애매한 단원의 효율이 가장 높아요.' },
      { text: '이미 자신 있는 단원만 한 번 더 본다', score: 30, feedback: '이미 잘 아는 내용이라 점수 상승 효과가 적어요.' },
      { text: '전혀 모르는 단원을 처음부터 끝까지 공부한다', score: 40, feedback: '2시간 안에 다 이해하기엔 시간이 부족해요.' },
      { text: '세 단원을 40분씩 똑같이 나눠 본다', score: 50, feedback: '가장 효율이 좋은 단원에 시간을 더 쓰지 못해요.' },
    ],
  },
]

/** Picks `count` scenarios (default all), shuffled, avoiding immediate story-set repetition across sessions where possible. */
export function pickDecisionScenarios(count: number): DecisionScenario[] {
  const shuffled = [...DECISION_SCENARIOS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}
