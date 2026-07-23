# Brain_Pet — GAME_SPEC

> Version: v0.1
> 목적: 6개 능력 스탯 측정을 위한 MVP 미니게임의 세부 규칙 정의
> 대상: Claude Code 및 개발 참고용
> 상태: 1차 확정안

---

# 0. 공통 설계 원칙

## 0.1 6개 스탯

Brain_Pet 다음 6개의 스탯을 측정한다.

```text
1. Memory      기억력
2. Focus       집중력
3. Reaction    순발력
4. Judgment    판단력
5. Spatial     공간감각
6. Reasoning   추리력
```

최종 결과는 육각형 Radar Chart 형태의 `MY STATUS`로 표현한다.

---

# 0.2 게임 길이

스탯별 목표 플레이 시간은 다음과 같다.

| Stat      | 목표 플레이 시간 |
| --------- | --------: |
| Reaction  |    30~60초 |
| Judgment  |    30~60초 |
| Memory    |    30~60초 |
| Focus     |    30~60초 |
| Spatial   |      1~2분 |
| Reasoning |      1~2분 |

각 게임의 시도 횟수와 문제 수는 동일하게 통일하지 않는다.

각 능력 특성에 맞게 별도로 설계한다.

---

# 0.3 점수 구조

Brain_Pet은 아래 세 값을 구분한다.

```text
RAW DATA
↓
GAME SCORE
↓
STAT PERCENTILE
```

---

## RAW DATA

사용자가 실제로 수행한 원본 데이터.

예:

```text
Reaction Time = 231ms

Correct = 12
Wrong = 2

Response Time = 4.2sec
```

가능한 경우 Trial 단위로 저장한다.

---

## GAME SCORE

각 게임에서 계산되는 기록 또는 점수.

예:

```text
Reaction Score
82,430

Memory Score
7,820
```

사용자가 기록을 갱신하고 비교하기 위한 값이다.

게임별 Score Formula는 서로 다를 수 있다.

---

## STAT

최종 스탯은 절대점수를 그대로 0~100으로 변환하지 않고 상대 백분위를 기반으로 한다.

예:

```text
Reaction Game Score
82,430

↓

서비스 사용자 분포 기준

Percentile
78.4%

↓

Reaction STAT
78
```

즉:

```text
STAT ≈ Percentile Rank
```

로 사용한다.

---

# 0.4 Percentile 정책

초기 사용자 데이터가 부족할 때 임의 Percentile을 생성하지 않는다.

초기 MVP에서는:

```text
Reaction Record

231ms

STAT
비교 데이터 수집 중
```

형태로 표시할 수 있다.

충분한 데이터 확보 이후:

```text
Reaction

231ms

서비스 사용자 2,381명 기준
상위 18%

STAT 82
```

형태로 변경한다.

---

## Percentile 계산 기준

가능하면 아래 조건을 만족하는 사용자만 비교군에 포함한다.

```text
- 게임 정상 완료
- 비정상 입력 제외
- Bot / 반복 매크로 제외
- 최소 Trial 충족
- 동일 Game Version
```

게임 룰이나 난이도가 크게 변경되는 경우:

```text
game_version
```

을 반드시 저장한다.

서로 다른 버전의 점수를 무조건 같은 분포에 섞지 않는다.

---

# 0.5 점수 방향 통일

내부적으로 최종 `GAME SCORE`는:

```text
높을수록 좋은 기록
```

이 되도록 통일하는 것을 권장한다.

예:

Reaction은 원래 ms가 낮을수록 좋지만 Score 계산 시 역변환한다.

```text
231ms → 높은 Score
420ms → 낮은 Score
```

이를 통해:

```text
Higher Score = Better Performance
```

원칙을 유지한다.

---

# 0.6 최고 기록 정책

각 게임은 최소 다음 기록을 저장한다.

```text
current_score
best_score
previous_best_score
attempt_count
```

재도전 결과:

```text
현재 Score > Best Score
```

일 경우:

```text
NEW RECORD
```

표시.

---

# 0.7 Stat 업데이트 정책

MVP 권장 방식:

```text
Best Valid Score
→ Percentile 계산
→ Current Stat
```

즉, 최근 기록 하나 때문에 스탯이 크게 떨어지지 않도록 한다.

예:

```text
Reaction

Attempt 1: 72 percentile
Attempt 2: 81 percentile
Attempt 3: 76 percentile

Current Reaction Stat
81
```

단, 향후 `최근 실력` 개념을 별도로 제공할 수 있다.

```text
BEST STAT
CURRENT FORM
```

MVP에서는 구현하지 않는다.

---

# 0.8 게임 공통 Flow

모든 게임은 가능한 한 아래 구조를 따른다.

```text
GAME INTRO

↓

간단한 Rule 설명

↓

Practice 또는 Demo

↓

Countdown

3
2
1

↓

GAME PLAY

↓

GAME COMPLETE

↓

Raw Result

↓

Game Score

↓

Best Record 비교

↓

Stat 결과 또는 Stat 발견

↓

다음 게임 CTA
```

---

# 0.9 Practice 정책

게임 규칙 이해 실패가 실제 능력 점수에 영향을 주지 않도록 한다.

따라서 필요한 게임에는:

```text
Practice Round
```

를 제공한다.

Practice 데이터는 실제 Score 계산에서 제외한다.

특히:

```text
Judgment
Spatial
Reasoning
```

에는 Practice를 권장한다.

---

# 1. REACTION

# 1.1 기본 정보

```text
ID
reaction

표시명
순발력

영문명
Reaction

MVP Game
Catch the Signal

목표 시간
30~60초
```

---

# 1.2 측정 정의

화면에 나타나는 시각 자극을 감지한 후 반응하는 속도를 측정한다.

주의:

```text
신체 전체의 순발력
운동 능력
신경학적 능력
```

을 직접 측정한다고 표현하지 않는다.

사용자-facing 설명:

```text
화면에 나타나는 신호를 얼마나 빠르게 감지하고 반응하는지 확인합니다.
```

---

# 1.3 핵심 게임 컨셉

단순 색 변화보다 게임처럼 표현한다.

MVP 추천 Theme:

```text
⭐ Catch the Star
```

예:

```text
화면

"준비..."

↓

랜덤 Delay

↓

⭐ 갑자기 별 등장

↓

사용자 Click / Tap

↓

231 ms
```

펫 세계관 적용 가능:

```text
떨어지는 별을 잡아주세요!
```

---

# 1.4 Trial 수

총:

```text
7 Trials
```

권장.

구성:

```text
Practice 1회
+
실전 7회
```

Practice는 기록 미포함.

예상 시간:

```text
약 35~50초
```

---

# 1.5 Trial Flow

```text
READY

↓

Random Delay
1,500 ~ 4,000ms

↓

Target Spawn

↓

User Input

↓

reaction_ms 기록

↓

간단 Feedback

↓

Next Trial
```

---

# 1.6 False Start

신호가 나오기 전에 클릭할 경우:

```text
FALSE START
```

처리.

해당 Trial은 정상 Reaction 기록에서 제외한다.

화면:

```text
앗, 너무 빨랐어요!

신호가 나타난 뒤 눌러주세요.
```

---

## False Start 제한

지나친 반복 클릭 방지를 위해:

```text
False Start 3회 이상
```

시 경고.

필요하면 해당 Attempt를:

```text
invalid_attempt = true
```

처리할 수 있다.

MVP에서는 3회 이상 시 게임을 종료하지 않고:

```text
Score Penalty
```

를 적용하는 방식을 권장한다.

---

# 1.7 저장 데이터

Trial 단위:

```ts
{
  trialIndex: number
  delayMs: number
  reactionMs: number | null
  isFalseStart: boolean
  timestamp: string
}
```

Session 결과:

```ts
{
  validTrials: number
  falseStarts: number
  averageReactionMs: number
  medianReactionMs: number
  bestReactionMs: number
  consistency: number
  gameScore: number
}
```

---

# 1.8 결과 계산

단순 최고 기록만 사용하지 않는다.

한 번의 우연한 클릭 영향을 줄이기 위해:

```text
Median Reaction Time
```

을 핵심 기준으로 사용한다.

보조 데이터:

```text
Best Reaction
Average Reaction
Consistency
False Starts
```

---

## 권장 Score Formula

개념적 구조:

```text
Reaction Score

=
Speed Score
×
Accuracy Modifier
×
Consistency Modifier
```

예:

```text
Speed Score
Median Reaction 기반

Accuracy Modifier
False Start 반영

Consistency Modifier
Trial 간 변동성 반영
```

정확한 상수는 실제 Beta 데이터 확보 후 Calibration.

초기 구현에서는 Score Formula를 별도 함수로 분리한다.

```ts
calculateReactionScore()
```

하드코딩 금지.

---

# 1.9 결과 화면

예:

```text
⚡ REACTION COMPLETE

231 ms
BEST REACTION

Median
247 ms

False Start
1

SCORE
82,430

NEW RECORD!
```

이후:

```text
⚡ REACTION STAT 발견

현재 비교 데이터 수집 중
```

또는 표본 확보 후:

```text
서비스 사용자 기준
상위 18%

REACTION
82
```

---

# 1.10 재도전 포인트

Reaction은 가장 재도전성이 높은 게임으로 설계한다.

결과 화면:

```text
231ms

"200ms 벽까지 31ms!"

[한 번 더]
```

같은 개인 기록 중심 Motivation 사용 가능.

---

# 2. MEMORY

# 2.1 기본 정보

```text
ID
memory

표시명
기억력

영문명
Memory

MVP Game
Memory Tiles

목표 시간
30~60초
```

---

# 2.2 측정 정의

짧은 시간 동안 시각 정보를 유지하고 위치를 다시 재현하는 수행 능력을 측정한다.

User-facing:

```text
잠시 나타난 위치와 패턴을 기억해보세요.
```

---

# 2.3 게임 컨셉

추천 Theme:

```text
✨ Firefly Memory
```

또는

```text
🌟 Star Memory
```

Grid 안에서 여러 칸이 일정 시간 빛난다.

예:

```text
■ □ ■
□ ■ □
■ □ □

↓

화면 숨김

↓

□ □ □
□ □ □
□ □ □

"빛났던 곳을 선택하세요."
```

---

# 2.4 라운드 구성

```text
Practice 1
+
실전 최대 8 Rounds
```

예상:

```text
30~60초
```

사용자가 실패하면 난이도 조정 또는 종료.

---

# 2.5 난이도 구조

Difficulty는 다음 요소로 조절한다.

```text
Grid Size

Target Count

Exposure Time
```

예:

### Level 1

```text
3x3
3 Targets
2.0 sec
```

### Level 2

```text
3x3
4 Targets
1.7 sec
```

### Level 3

```text
4x4
5 Targets
1.7 sec
```

### Level 4

```text
4x4
6 Targets
1.4 sec
```

### Level 5+

```text
5x5
Target 증가
Exposure 감소
```

---

# 2.6 Round Flow

```text
Grid 등장

↓

Targets Highlight

↓

Exposure Time

↓

Blank / Mask

↓

사용자가 기억한 칸 선택

↓

Submit

↓

Correct / Incorrect Feedback

↓

Next Difficulty
```

---

# 2.7 실패 정책

한 번 틀렸다고 즉시 게임 종료하지 않는다.

권장:

```text
Life = 2
```

완전히 정확하면:

```text
Difficulty +1
```

부분적으로 맞으면:

```text
동일 또는 소폭 상승
```

오답이 많으면:

```text
Life -1
```

Life 0:

```text
Game Complete
```

또는 최대 Round 도달 시 종료.

---

# 2.8 Partial Accuracy

전체 위치를 완벽히 맞히는 것만 평가하면 정보 손실이 크다.

따라서:

```text
precision
recall
```

개념을 사용할 수 있다.

예:

실제 Target:

```text
5개
```

사용자가:

```text
정답 4개
오답 1개
```

선택.

단순 0점 처리하지 않는다.

---

# 2.9 저장 데이터

Round:

```ts
{
  roundIndex: number
  gridSize: number
  targetCount: number
  exposureMs: number
  targetCells: string[]
  selectedCells: string[]
  correctSelections: number
  wrongSelections: number
  missedTargets: number
  responseTimeMs: number
  difficultyLevel: number
}
```

Session:

```text
maxDifficulty
totalCorrect
totalWrong
totalMissed
averageAccuracy
perfectRounds
gameScore
```

---

# 2.10 Score 구조

Memory Score는 다음을 반영한다.

```text
Difficulty
+
Accuracy
+
Perfect Recall
+
Response Efficiency
```

단:

```text
속도 비중 < 정확도 비중
```

으로 설계한다.

기억력 테스트에서 빠르게 찍는 행동이 높은 점수를 가져서는 안 된다.

개념:

```text
Memory Score

=
Difficulty Score
×
Accuracy Modifier
+
Perfect Round Bonus
```

---

# 2.11 결과

예:

```text
🧠 MEMORY COMPLETE

최고 단계
LEVEL 6

정확도
87%

Perfect Round
4

SCORE
7,820

NEW RECORD!
```

---

# 3. FOCUS

# 3.1 기본 정보

```text
ID
focus

표시명
집중력

영문명
Focus

MVP Game
Target Hunt

목표 시간
30~60초
```

---

# 3.2 측정 정의

여러 방해 자극 사이에서 목표 자극을 선택적으로 찾아내고 지속적으로 주의를 유지하는 수행 능력을 측정한다.

User-facing:

```text
비슷한 것들 사이에서 목표를 놓치지 마세요.
```

---

# 3.3 MVP 게임 컨셉

단순 `OOOOQOOOO`만 반복하지 않는다.

MVP에서는:

```text
Target Hunt
```

구조로 구현.

Round 시작 시 Target을 보여준다.

예:

```text
TARGET

Q
```

이후 Grid:

```text
O O O O O
O O O Q O
O O O O O
```

빠르게 Target 클릭.

---

# 3.4 Round 수

```text
Practice 1
+
실전 12~15 Rounds
```

각 Round는 짧게 진행.

총:

```text
약 40~60초
```

---

# 3.5 난이도

다음 요소로 조절:

```text
Grid Size 증가

Target-Distractor Similarity 증가

Target 수 변화

제한시간 감소

일부 Moving Element
```

MVP에서는 지나친 애니메이션은 제외 가능.

---

## 예시 단계

### Easy

```text
Target: Q
Distractor: O
Grid 4x4
```

### Normal

```text
Target: 6
Distractor: 9
Grid 5x5
```

### Hard

```text
Target:
미묘하게 다른 Shape

Distractors:
거의 동일한 Shape
```

---

# 3.6 Catch Trial

항상 Target이 있는 구조만 사용하면 무조건 클릭하는 전략이 생길 수 있다.

일부 Round:

```text
NO TARGET
```

을 섞는다.

사용자는:

```text
없음
```

버튼을 선택해야 한다.

이를 통해:

```text
False Detection
```

도 측정한다.

---

# 3.7 저장 데이터

```ts
{
  roundIndex: number
  difficultyLevel: number
  targetType: string
  targetPresent: boolean
  selectedCorrectly: boolean
  falseClick: boolean
  missedTarget: boolean
  responseTimeMs: number
}
```

Session:

```text
accuracy
falsePositiveRate
missRate
averageResponseTime
highDifficultyAccuracy
gameScore
```

---

# 3.8 Score 구조

Focus에서는:

```text
Accuracy
```

가 가장 중요하다.

그다음:

```text
Speed
```

를 반영.

개념:

```text
Focus Score

=
Accuracy Base
×
Difficulty Modifier
×
Speed Modifier
```

오답 페널티를 충분히 적용해:

```text
무작정 빠르게 클릭
```

하는 전략을 방지한다.

---

# 3.9 결과 화면

```text
🎯 FOCUS COMPLETE

정확도
92%

평균 탐색
1.28 sec

오탐
1

최고 난이도
LEVEL 5

SCORE
9,140
```

---

# 4. JUDGMENT

# 4.1 기본 정보

```text
ID
judgment

표시명
판단력

영문명
Judgment

MVP Game
Rule Switch

목표 시간
30~60초
```

---

# 4.2 측정 정의

주어진 규칙을 빠르게 이해하고 적용하며, 규칙이 바뀌었을 때 새로운 규칙으로 전환하는 수행 능력을 측정한다.

주의:

```text
인생의 좋은 판단
의사결정의 질
도덕적 판단
```

등을 측정하는 게임이 아니다.

---

# 4.3 Reaction과의 차이

Reaction:

```text
자극
→ 즉시 반응
```

Judgment:

```text
자극
→ 규칙 확인
→ 선택
```

따라서 반드시:

```text
Rule Processing
```

이 포함되어야 한다.

---

# 4.4 게임 컨셉

예:

```text
RULE

🔴 → LEFT
🔵 → RIGHT

START
```

이후:

```text
🔴

LEFT / RIGHT
```

선택.

중간에:

```text
⚠ RULE CHANGED

🔴 → RIGHT
🔵 → LEFT
```

규칙 변경.

---

# 4.5 Trial 구성

```text
Practice 4 Trials

+

실전 24~30 Trials
```

각 Trial은 매우 짧음.

총:

```text
약 40~60초
```

---

# 4.6 Block 구조

예:

```text
Block A
8 Trials
기본 Rule

↓

Rule Switch

↓

Block B
8 Trials

↓

Rule Complexity Increase

↓

Block C
8 Trials
```

---

# 4.7 난이도

초기:

```text
2 Choices
2 Stimuli
```

중간:

```text
Rule Reverse
```

후반:

```text
Context Rule
```

예:

```text
Shape가 ○이면
색상 기준

Shape가 △이면
방향 기준
```

단, MVP에서 지나치게 복잡하게 만들지 않는다.

---

# 4.8 핵심 측정값

```text
overallAccuracy

overallReactionTime

switchAccuracy

switchReactionTime

postSwitchErrors

adaptationSpeed
```

특히:

```text
Rule Switch 직후 성능
```

을 중요하게 본다.

---

# 4.9 저장 데이터

```ts
{
  trialIndex: number
  blockIndex: number
  ruleId: string
  stimulus: string
  correctAnswer: string
  selectedAnswer: string
  isCorrect: boolean
  responseTimeMs: number
  isSwitchTrial: boolean
  trialsSinceSwitch: number
}
```

---

# 4.10 Score 구조

```text
Judgment Score

=
Accuracy
+
Response Efficiency
+
Switch Adaptation
```

추천 가중 방향:

```text
Accuracy
높음

Switch Adaptation
높음

Raw Speed
중간
```

빠르기만 하고 오답이 많으면 낮은 점수.

---

# 4.11 결과

```text
⚖ JUDGMENT COMPLETE

정확도
89%

규칙 변경 후 정확도
83%

평균 판단 시간
624 ms

SCORE
8,630
```

---

# 5. SPATIAL

# 5.1 기본 정보

```text
ID
spatial

표시명
공간감각

영문명
Spatial

MVP Game
Rotate It

목표 시간
1~2분
```

---

# 5.2 측정 정의

도형이나 물체의 회전, 방향, 위치 관계를 머릿속에서 파악하는 수행 능력을 측정한다.

User-facing:

```text
머릿속으로 도형을 돌려보고 같은 모양을 찾아보세요.
```

---

# 5.3 게임 컨셉

화면에 기준 Shape를 보여준다.

```text
REFERENCE

   ■
 ■ ■
   ■
```

질문:

```text
이 도형을 회전했을 때
같은 모양은 무엇일까요?
```

4개 선택지.

---

# 5.4 문제 수

```text
Practice 2

+

실전 10~12 Questions
```

목표:

```text
약 60~120초
```

---

# 5.5 문제 구성

초반:

```text
2D Rotation
```

중반:

```text
Complex 2D Rotation
```

후반:

```text
Mirror Distractor
```

선택지 중:

```text
Rotation은 같지만 Reflection은 다른 것
```

을 섞는다.

---

# 5.6 난이도

난이도 요소:

```text
Shape Complexity

Rotation Angle

Distractor Similarity

Mirror Confusion

Time Limit
```

예:

### Level 1

```text
간단한 Shape
90° Rotation
```

### Level 2

```text
복합 Shape
90° / 180°
```

### Level 3

```text
유사 Distractor
Mirror 포함
```

### Level 4

```text
더 복잡한 Shape
Multiple Rotation
```

---

# 5.7 제한시간

문제별 제한시간:

```text
약 8~12초
```

난이도별 조정 가능.

시간 초과:

```text
incorrect
```

처리.

---

# 5.8 저장 데이터

```ts
{
  questionIndex: number
  difficultyLevel: number
  shapeId: string
  rotationAngle: number
  correctOption: number
  selectedOption: number | null
  isCorrect: boolean
  responseTimeMs: number
  timedOut: boolean
}
```

---

# 5.9 Score 구조

```text
Spatial Score

=
Correctness
×
Difficulty
+
Efficiency Bonus
```

정확도가 핵심.

속도는 보조 요소.

```text
Accuracy > Speed
```

---

# 5.10 Adaptive 가능성

향후:

```text
초반 3문제 결과
↓
난이도 자동 조정
```

가능.

MVP에서는 사전 정의된 난이도 순서로 진행해도 됨.

---

# 5.11 결과

```text
🧊 SPATIAL COMPLETE

9 / 12 Correct

정확도
75%

최고 난이도
LEVEL 4

평균 풀이
6.8 sec

SCORE
7,450
```

---

# 6. REASONING

# 6.1 기본 정보

```text
ID
reasoning

표시명
추리력

영문명
Reasoning

MVP Game
Pattern Reasoning

목표 시간
1~2분
```

---

# 6.2 측정 정의

주어진 정보에서 규칙, 관계 또는 조건을 찾아 적절한 답을 도출하는 수행 능력을 측정한다.

주의:

```text
IQ
전체 지능
학업 능력
```

을 직접 측정한다고 표현하지 않는다.

---

# 6.3 MVP 방향

초기 MVP는 공정한 채점과 구현 난이도를 위해:

```text
Visual / Logical Pattern Reasoning
```

으로 시작한다.

향후:

```text
Mini Mystery
Deduction Puzzle
Code Breaking
Logic Story
```

등으로 확장한다.

---

# 6.4 문제 예시

### Sequence Pattern

```text
○ △ ○ △ ?

① ○
② △
```

---

### Matrix Pattern

```text
▲ ● ▲
● ▲ ●
▲ ● ?

?
```

---

### Attribute Pattern

```text
색상
방향
개수
회전

규칙을 조합
```

---

# 6.5 문제 수

```text
Practice 2

+

실전 10~12 Questions
```

목표:

```text
60~120초
```

---

# 6.6 난이도

난이도는 규칙 수로 증가.

### Level 1

```text
Single Rule
```

### Level 2

```text
Two-step Pattern
```

### Level 3

```text
Multiple Attribute
```

### Level 4

```text
Compound Rule
```

---

# 6.7 문제 제한시간

예:

```text
Easy
8~10초

Normal
10~12초

Hard
12~15초
```

전체 시간이 2분을 크게 넘지 않도록 한다.

---

# 6.8 Hint

MVP에서는 Hint 기능을 넣지 않는 것을 권장.

이유:

```text
Hint 사용 여부가 Score 비교를 복잡하게 만듦
```

향후 추가 시 반드시:

```text
hint_used
```

저장 및 Score Penalty 적용.

---

# 6.9 저장 데이터

```ts
{
  questionIndex: number
  questionId: string
  reasoningType: string
  difficultyLevel: number
  correctOption: number
  selectedOption: number | null
  isCorrect: boolean
  responseTimeMs: number
  timedOut: boolean
}
```

---

# 6.10 Score 구조

Reasoning에서는:

```text
Accuracy
Difficulty
```

가 핵심.

Speed는 보조.

개념:

```text
Reasoning Score

=
Difficulty Weighted Correct Score
+
Efficiency Bonus
```

---

# 6.11 결과

```text
🔍 REASONING COMPLETE

8 / 10 Correct

최고 난이도
LEVEL 4

평균 풀이
7.4 sec

SCORE
8,120
```

---

# 7. 6개 게임 요약

| Stat      | MVP Game          |     시간 | 핵심 측정    | 속도 비중 | 정확도 비중 |
| --------- | ----------------- | -----: | -------- | ----: | -----: |
| Reaction  | Catch the Signal  | 30~60초 | 반응시간     | 매우 높음 |     중간 |
| Memory    | Memory Tiles      | 30~60초 | 단기 위치 기억 |    낮음 |  매우 높음 |
| Focus     | Target Hunt       | 30~60초 | 목표 탐지    |    중간 |  매우 높음 |
| Judgment  | Rule Switch       | 30~60초 | 규칙 적용·전환 |    높음 |  매우 높음 |
| Spatial   | Rotate It         |   1~2분 | 정신적 회전   | 낮음~중간 |  매우 높음 |
| Reasoning | Pattern Reasoning |   1~2분 | 규칙 추론    | 낮음~중간 |  매우 높음 |

---

# 8. 게임별 권장 진행 순서

첫 사용자에게 반드시 아래 순서를 강제할 필요는 없다.

다만 Onboarding 기본 순서는 추천:

```text
1. Reaction
↓
2. Memory
↓
3. Focus
↓
4. Judgment
↓
5. Spatial
↓
6. Reasoning
```

이유:

```text
Reaction
가장 즉각적이고 설명이 적음

↓

Memory / Focus
직관적인 게임

↓

Judgment
규칙 이해 필요

↓

Spatial / Reasoning
상대적으로 생각할 시간이 필요
```

따라서 점차 깊어지는 구조.

---

# 9. 첫 세션 피로도 관리

총 예상:

```text
Reaction
~45초

Memory
~45초

Focus
~45초

Judgment
~50초

Spatial
~90초

Reasoning
~90초
```

순수 게임 시간:

```text
약 6분
```

Intro / Result / 전환 포함:

```text
약 7~10분
```

전체 6개를 반드시 한 번에 완료하도록 강제하지 않는다.

---

# 10. 중간 저장

사용자가 중간에 나갈 수 있으므로:

```text
completedStats
```

를 저장한다.

예:

```ts
{
  reaction: true,
  memory: true,
  focus: false,
  judgment: false,
  spatial: false,
  reasoning: false
}
```

재방문:

```text
2 / 6 DISCOVERED

이어서 발견하기
```

---

# 11. Egg Progress 연결

각 게임 완료 시:

```text
Stat Discovered
↓
Egg Progress +1
```

예:

첫 게임:

```text
⚡ REACTION 발견!

🥚

1 / 6 DISCOVERED
```

3개:

```text
🥚✨

3 / 6 DISCOVERED
```

5개:

```text
🥚💥

"알에 금이 가기 시작했어요."

5 / 6
```

6개:

```text
✨ HATCHING ✨
```

---

# 12. 재도전 정책

각 게임은 자유롭게 재도전 가능.

하지만:

```text
Stat
=
Best Valid Score Percentile
```

을 MVP 기본값으로 한다.

재도전 시:

```text
Current Attempt
vs
Personal Best
```

표시.

예:

```text
REACTION

이번 기록
238ms

BEST
225ms

13ms 차이

[다시 도전]
```

---

# 13. Anti-Cheat / 데이터 품질

완벽한 Anti-Cheat는 MVP 범위 밖이지만 최소한 아래를 고려한다.

---

## Reaction

```text
비정상적으로 빠른 반응
예: < 80ms

반복 동일 값

과도한 False Start
```

Flag 가능.

---

## 다른 게임

```text
비정상적으로 짧은 응답시간

반복 자동 입력

Session 중단

문제 데이터 미완료
```

검증.

---

## 저장 필드

```text
is_valid_attempt
invalid_reason
```

권장.

---

# 14. Device 차이

Reaction은 특히:

```text
Mouse
Touch
Display Refresh Rate
Browser
Device Performance
```

의 영향을 받을 수 있다.

따라서 가능하면:

```text
device_type
input_type
browser
screen_refresh_rate // 가능할 경우
```

를 기록한다.

향후 Percentile에서:

```text
Mobile
Desktop
```

을 별도로 비교할 가능성도 고려한다.

초기에는 전체 통합 결과를 보여주더라도 원본 데이터는 남긴다.

---

# 15. Percentile 최소 표본 정책

정확한 기준은 실제 데이터 확인 후 결정.

초기 권장:

```text
N < 100

"비교 데이터 수집 중"
```

```text
N >= 100

Experimental Percentile
```

```text
N >= 500

일반 Percentile 표시 고려
```

단, 이 수치는 통계적 품질 보장 기준이 아니라 제품 표시 정책의 초기 가이드다.

분포 안정성을 확인 후 변경 가능.

---

# 16. Percentile 표시 문구

금지:

```text
당신의 기억력은 상위 8%입니다.
```

이 표현은 실제 인간 전체의 능력을 의미하는 것처럼 보일 수 있다.

권장:

```text
현재 Brain_Pet 사용자 기록 기준
상위 8%
```

또는:

```text
이 게임 수행 기록 기준
상위 8%
```

---

# 17. Stat 표시

예:

```text
MEMORY

STAT
82

Brain_Pet 사용자 기록 기준
상위 18%
```

즉:

```text
82 STAT
≈
82nd Percentile
```

로 이해할 수 있도록 한다.

---

# 18. Game Score vs Stat 예시

사용자 A:

```text
Reaction

Median
247ms

Game Score
81,840

Percentile
76.2

Stat
76
```

사용자 B:

```text
Memory

Max Level
7

Accuracy
91%

Game Score
8,720

Percentile
88.7

Stat
89
```

Game Score 단위는 게임마다 다르지만:

```text
Stat
```

은 모두 Percentile 기반 0~100 범위이므로 Radar Chart에서 비교 가능하다.

---

# 19. 향후 게임 확장 구조

하나의 Stat에 여러 게임을 연결할 수 있어야 한다.

예:

```text
MEMORY

├ Memory Tiles
├ Sequence Memory
├ Room Changes
└ Number Memory
```

단, 서로 다른 게임 Score를 곧바로 같은 Percentile에 섞지 않는다.

각 게임별:

```text
game_id
game_version
score_distribution
```

을 별도 관리.

향후 Stat 통합 방식은:

```text
게임별 Percentile
→ Composite Stat
```

방식으로 별도 설계한다.

MVP에서는:

```text
1 Stat = 1 Game
```

이므로 단순화 가능.

---

# 20. MVP 구현 우선순위

## STEP 1

Reaction 완성.

```text
Intro

Practice

7 Trials

False Start

Result

Trial Data
```

---

## STEP 2

Memory.

---

## STEP 3

Focus.

---

## STEP 4

Judgment.

---

## STEP 5

Spatial.

---

## STEP 6

Reasoning.

---

## STEP 7

공통 구조 통합.

```text
GameResult

GameSession

Trial

Score

Best Record
```

---

# 21. 추천 Type 구조

초안:

```ts
type StatType =
  | 'memory'
  | 'focus'
  | 'reaction'
  | 'judgment'
  | 'spatial'
  | 'reasoning';

interface GameSession {
  id: string;
  gameId: string;
  gameVersion: string;
  statType: StatType;

  startedAt: string;
  completedAt?: string;

  isCompleted: boolean;
  isValidAttempt: boolean;

  gameScore?: number;

  deviceType?: 'mobile' | 'desktop' | 'tablet';
  inputType?: 'mouse' | 'touch' | 'keyboard';
}

interface StatResult {
  statType: StatType;

  gameScore: number;

  percentile?: number;

  statScore?: number;

  sampleSize?: number;

  isPersonalBest: boolean;
}
```

게임별 Trial Type은 별도로 만든다.

---

# 22. Score 함수 원칙

각 Score 계산은 UI Component 내부에 작성하지 않는다.

예:

```text
/lib/scoring/

reaction.ts
memory.ts
focus.ts
judgment.ts
spatial.ts
reasoning.ts
```

예:

```ts
calculateReactionScore()
calculateMemoryScore()
calculateFocusScore()
calculateJudgmentScore()
calculateSpatialScore()
calculateReasoningScore()
```

목적:

```text
UI와 Scoring Logic 분리

추후 Formula 변경 용이

A/B Test 가능

Unit Test 가능
```

---

# 23. 난이도 설정 파일

난이도 역시 Component에 하드코딩하지 않는 것을 권장.

예:

```text
/config/games/

reaction.config.ts
memory.config.ts
focus.config.ts
judgment.config.ts
spatial.config.ts
reasoning.config.ts
```

예:

```ts
export const MEMORY_LEVELS = [
  {
    level: 1,
    gridSize: 3,
    targetCount: 3,
    exposureMs: 2000,
  },
  {
    level: 2,
    gridSize: 3,
    targetCount: 4,
    exposureMs: 1700,
  },
];
```

---

# 24. Analytics Event

게임 공통:

```text
game_intro_view

game_practice_start

game_start

game_round_complete

game_complete

game_retry

personal_best

stat_discovered
```

Properties:

```text
game_id
stat_type
game_version
difficulty
game_score
duration
attempt_number
```

---

# 25. 게임별 특수 Event

Reaction:

```text
reaction_false_start
```

Memory:

```text
memory_perfect_round
```

Focus:

```text
focus_false_detection
```

Judgment:

```text
judgment_rule_switch
```

Spatial:

```text
spatial_timeout
```

Reasoning:

```text
reasoning_timeout
```

모든 Trial Event를 GA4에 전송할 필요는 없다.

세부 Trial Raw Data는 DB에 저장하고 GA4에는 주요 행동 이벤트만 보낸다.

---

# 26. 핵심 성공 지표

각 게임에서 최소 다음을 측정한다.

```text
Start Rate

Completion Rate

Average Duration

Retry Rate

Drop-off

Score Distribution
```

---

# 27. 게임 품질 판단 기준

Beta 이후 아래 질문에 답한다.

### Reaction

```text
한 번 더 하고 싶은가?
```

### Memory

```text
난이도 상승이 자연스러운가?
```

### Focus

```text
오답보다 실제 집중 차이를 측정하는가?
```

### Judgment

```text
Reaction과 다른 경험으로 느껴지는가?
```

### Spatial

```text
문제가 반복적으로 느껴지지 않는가?
```

### Reasoning

```text
학교 시험처럼 느껴지지 않는가?
```

---

# 28. 가장 중요한 MVP 원칙

```text
테스트를 받는다
```

라는 느낌보다:

```text
짧은 게임을 플레이한다
```

는 느낌이 우선되어야 한다.

따라서:

```text
문제 1 / 10
```

보다는:

```text
ROUND 3
LEVEL UP!
COMBO
NEW RECORD
```

같은 게임 UI를 적극적으로 활용한다.

단:

```text
게임 UI가 측정 정확성을 방해해서는 안 된다.
```

---

# 29. 최종 플레이 경험

사용자는 다음 경험을 하게 된다.

```text
REACTION PLAY
↓
"231ms!"
↓
⚡ 첫 Stat 발견
↓
🥚 1/6
↓
MEMORY PLAY
↓
🧠 두 번째 Stat 발견
↓
🥚✨ 2/6
↓
...
↓
6개 완료
↓
MY STATUS
↓
Egg Hatch
↓
Personalized Pet
```

---

# 30. 현재 확정 사항

```text
6 Stats

Memory
Focus
Reaction
Judgment
Spatial
Reasoning
```

플레이 시간:

```text
Reaction
Judgment
Memory
Focus

→ 30~60초

Spatial
Reasoning

→ 1~2분
```

시도/문제 수:

```text
게임마다 별도 설계
```

점수:

```text
Game Score / Record 방식
```

Stat:

```text
상대 Percentile 기반
```

MVP:

```text
1 Stat = 1 대표 Game
```

---

# 31. 현재 권장 MVP Game

```text
Reaction
→ Catch the Signal

Memory
→ Memory Tiles

Focus
→ Target Hunt

Judgment
→ Rule Switch

Spatial
→ Rotate It

Reasoning
→ Pattern Reasoning
```

이 구성을 v0.1 기본안으로 사용한다.

---

# 32. 개발 시 Claude Code 지침

Claude Code는 이 문서를 구현 기준으로 참고한다.

단:

```text
1. Score Formula의 세부 상수는 임의로 확정하지 않는다.

2. Percentile 데이터를 임의로 생성하지 않는다.

3. 실제 사용자 데이터가 부족한 상태에서
   "상위 X%"를 가짜로 표시하지 않는다.

4. 게임 로직과 UI를 분리한다.

5. Trial 단위 Raw Data 구조를 유지한다.

6. game_version을 저장할 수 있도록 설계한다.

7. 모바일과 데스크톱을 모두 고려한다.

8. 첫 개발은 Reaction Game부터 시작한다.

9. 처음부터 6개 게임 전체를 한 번에 구현하지 않는다.

10. 각 게임 구현 후 실제 플레이 검증을 거친다.
```

---

# 33. 다음 개발 작업

첫 구현 대상:

```text
REACTION — Catch the Signal
```

범위:

```text
1. Game Intro

2. Practice Trial 1회

3. Real Trial 7회

4. Random Delay

5. False Start 처리

6. Reaction ms 기록

7. Trial Data 저장

8. Median / Average / Best 계산

9. Game Score 계산 Interface

10. Result 화면

11. Retry

12. Personal Best 비교
```

아직 구현하지 않는 것:

```text
Percentile 실제 계산

Ranking

XP

Pet

Supabase

Auth

Daily Challenge
```

Reaction Prototype을 먼저 플레이해본 후:

```text
재미

길이

False Start UX

결과 화면

재도전 욕구
```

를 확인하고 다음 게임 개발로 넘어간다.
