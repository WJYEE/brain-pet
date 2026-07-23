# Statling — GAME_SPEC

> Version: v1.0  
> 목적: Statling의 6개 미니게임 규칙, 기록 산정, 스탯 계산, 재도전 및 성장 반영 기준을 정의한다.  
> 대상: 제품 기획 및 개발 참고용  
> 상태: v1.0 통합 게임 규칙 확정안

---

# 1. 문서 목적

Statling은 다음 6개의 미니게임을 통해 사용자의 수행 기록을 측정한다.

```text
Memory
기억력

Focus
집중력

Reaction
순발력

Judgment
판단력

Spatial
공간감각

Reasoning
추리력
```

각 게임은 서로 다른 방식으로 기록을 생성하지만, 최종적으로는 동일한 `0~100 Stat`으로 변환하여 `MY STATUS`와 Radar Chart에 표시한다.

이 문서는 다음 항목을 정의한다.

```text
게임 규칙

플레이 시간

시도 횟수

난이도

Raw Record

Game Score

Personal Best

Percentile

Final Stat

재도전

신기록

XP

Anti-cheat

기록 History
```

---

# 2. 핵심 데이터 구조

모든 게임 결과는 다음 구조를 따른다.

```text
RAW PERFORMANCE
↓
GAME SCORE
↓
PERCENTILE
↓
FINAL STAT
```

---

# 3. Raw Performance

`Raw Performance`는 사용자가 실제 게임에서 만든 원시 기록이다.

게임마다 측정 방식과 단위가 다를 수 있다.

예:

```text
Reaction
205 ms

Memory
Level 8 / Accuracy 92%

Focus
Accuracy 94% / Average Response 1.2 sec

Judgment
Accuracy 88% / Response 620 ms

Spatial
9 / 12 Correct

Reasoning
10 / 12 Correct
```

Raw Record의 단위를 억지로 통일하지 않는다.

따라서 다음과 같은 구조는 사용하지 않는다.

```text
Reaction
205 ms

Memory
LV 8

Focus
920 pts

Judgment
850 pts

Spatial
740 pts

Reasoning
810 pts
```

단순히 UI 편의를 위해 의미 없는 `pts`를 만들어서는 안 된다.

---

# 4. Game Score

각 게임의 여러 Raw Data를 하나의 비교 가능한 내부 점수로 변환한다.

예:

```text
Reaction

Median Reaction
False Start
Consistency

↓

Reaction Game Score
```

Game Score는:

```text
내부 비교

Percentile 계산

Personal Best 판정

Ranking 계산
```

등에 활용한다.

기본 원칙:

```text
Game Score가 높을수록 좋은 성과
```

가 되도록 통일한다.

---

# 5. Game Score는 사용자에게 기본적으로 노출하지 않는다

예:

```text
GAME SCORE
8,240
```

와 같은 내부 숫자는 기본 UI에 표시하지 않는다.

사용자에게는 이해하기 쉬운 Raw Record를 보여준다.

예:

```text
⚡ 순발력

이번 기록
205 ms

개인 최고
198 ms
```

Game Score는 내부 계산용이다.

---

# 6. Final Stat

최종 `MY STATUS`에서는 6개의 게임을 모두 동일한 `0~100` Stat으로 표현한다.

Stat은 기본적으로:

```text
사용자 기록 Percentile Rank
```

와 동일하게 정의한다.

예:

```text
내 기록보다 낮은 사용자가
82%

↓

Percentile Rank
82

↓

Reaction Stat
82
```

따라서:

```text
Stat 82
=
82nd Percentile
=
상위 약 18%
```

이다.

---

# 7. MY STATUS 표시 방식

예:

```text
MY STATUS

Memory      67
Focus       94
Reaction    82
Judgment    58
Spatial     71
Reasoning   76
```

Radar Chart에서도 동일한 값을 사용한다.

```text
0
~
100
```

의 공통 축으로 비교한다.

---

# 8. Percentile 비교 집단

기본 비교 대상:

```text
동일 Game Version을 정상적으로 완료한
Statling 유효 사용자
```

유효 기록 조건:

```text
게임 정상 완료

필수 Trial 충족

비정상 입력 아님

Anti-cheat Flag 없음

동일 Game Version
```

---

# 9. 사용자 수가 적을 때의 정책

초기에는 가짜 Percentile을 만들지 않는다.

## N < 100

```text
비교 데이터 수집 중
```

으로 표시한다.

사용자에게는 Raw Record와 Personal Best만 보여준다.

예:

```text
⚡ 순발력

205 ms

현재 비교 데이터를 모으고 있어요.
```

---

## MY STATUS 초기 상태

유효 비교 데이터가 충분하지 않은 스탯은:

```text
--
```

또는:

```text
비교 중
```

으로 표시할 수 있다.

Radar Chart는 해당 축을 미확정 상태로 보여주거나 초기 공개 전 내부 테스트에서는 숨길 수 있다.

가짜 0~100 값을 생성하지 않는다.

---

## N >= 100

임시 Percentile 제공 가능.

표현:

```text
현재 Statling 참여자 기준
베타 비교 결과
```

---

## N >= 500

분포가 충분히 안정적인지 확인한 후 일반 Stat으로 제공한다.

단, 100 / 500 기준은 제품 초기 운영 가이드이며 실제 데이터 분포에 따라 변경할 수 있다.

---

# 10. 향후 외부 기준 데이터

가능한 경우 다음 분야의 공개 연구 및 대규모 데이터셋을 검토한다.

```text
Reaction Time

Working Memory

Attention

Cognitive Flexibility

Mental Rotation

Reasoning
```

향후:

```text
공개 기준 데이터

+

Statling 자체 사용자 데이터
```

를 함께 활용하는 방식을 검토할 수 있다.

v1.0 기본 Stat은 Statling 사용자 Percentile을 기준으로 한다.

---

# 11. 첫 MY STATUS와 현재 MY STATUS 분리

사용자의 최초 6게임 결과는 별도로 보존한다.

```text
INITIAL STATUS
```

이후 반복 플레이를 통해 변화하는 상태는:

```text
CURRENT STATUS
```

로 관리한다.

예:

```text
처음의 나

Reaction 62
Memory   71
Focus    68

↓

3개월 후

Reaction 79
Memory   84
Focus    76
```

이를 통해 향후:

```text
처음의 나
vs
지금의 나
```

비교 기능을 제공할 수 있다.

---

# 12. 재도전과 Current Stat

v1.0에서는 각 게임의:

```text
Best Valid Performance
```

를 Current Stat 계산 기준으로 사용한다.

예:

```text
Attempt 1
Percentile 72

Attempt 2
Percentile 81

Attempt 3
Percentile 76

↓

Current Stat
81
```

즉, 한 번 기록이 낮아졌다고 Stat이 바로 떨어지지 않는다.

---

# 13. 최근 컨디션 기능

향후에는 별도로:

```text
BEST STAT

CURRENT FORM
```

을 제공할 수 있다.

예:

```text
BEST
82

최근 5회 평균
76
```

v1.0에서는 구현하지 않는다.

---

# 14. 반복 플레이 학습 효과

같은 게임을 반복하면:

```text
게임 구조 숙련

문제 기억

클릭 패턴 학습
```

등으로 실제 능력 변화가 아니더라도 기록이 향상될 수 있다.

따라서:

```text
Personal Best
```

와:

```text
능력 성장
```

을 완전히 동일한 의미로 해석하지 않는다.

---

# 15. Stat 업데이트 제한 원칙

Personal Best는 항상 저장한다.

하지만 장기적으로 Final Stat 업데이트에는 별도의 보정 규칙을 적용할 수 있다.

후보:

```text
일일 최고 기록

최근 일정 기간 최고 기록

난이도 보정

반복 횟수 보정

문제 중복 제거
```

v1.0에서는 Best Valid Score 기반으로 시작하되 Raw History를 모두 저장하여 추후 보정 가능하게 설계한다.

---

# 16. 첫 플레이와 Free Play

## First Play

처음에는 다음 순서로 고정 진행한다.

```text
Reaction
↓
Memory
↓
Focus
↓
Judgment
↓
Spatial
↓
Reasoning
```

---

## Free Play

Statling 부화 이후에는 사용자가 원하는 게임을 자유롭게 선택한다.

기본 규칙은 첫 플레이와 동일하게 유지한다.

다만 Free Play에서는:

```text
문제 랜덤화

패턴 랜덤화

오브젝트 랜덤화

문제 Pool 변경
```

을 통해 반복성을 줄인다.

---

# 17. 난이도 정책

v1.0에서는 모든 사용자가 동일한 난이도 구조를 경험한다.

```text
Fixed Difficulty Sequence
```

사용자별 Adaptive Difficulty는 적용하지 않는다.

이유:

```text
사용자 간 비교 공정성

Percentile 계산 단순화

게임 버전 관리 용이

점수 해석 용이
```

향후 충분한 데이터가 쌓이면 Adaptive Difficulty를 검토한다.

---

# 18. 게임 공통 Flow

```text
GAME INTRO

↓

짧은 규칙 설명

↓

Practice

↓

START

↓

GAME PLAY

↓

GAME COMPLETE

↓

Raw Record

↓

Personal Best 비교

↓

짧은 Feedback

↓

새로운 Stat 발견

↓

다음 Game
```

---

# 19. Practice

규칙 이해 여부가 실제 기록에 영향을 주지 않도록 필요한 게임에는 Practice를 제공한다.

Practice 결과는 Score 계산에서 제외한다.

---

# 20. 결과 화면 공통 구조

기본:

```text
✨ 새로운 스탯 발견!

[STAT ICON]

스탯명

이번 기록

개인 최고

짧은 Feedback

X / 6 발견
```

예:

```text
✨ 새로운 스탯 발견!

⚡ 순발력

이번 기록
205 ms

개인 최고
198 ms

"반응이 꽤 빠른 편이에요."

1 / 6 발견
```

---

# 21. 짧은 Feedback

Feedback은 과학적 진단처럼 표현하지 않는다.

좋은 예:

```text
빠르고 안정적인 반응을 보여줬어요.

높은 단계까지 패턴을 기억했어요.

정확하게 목표를 찾아냈어요.
```

지양:

```text
당신은 집중력이 매우 뛰어난 사람입니다.

당신은 천재적인 추리력을 가지고 있습니다.
```

Feedback이 억지스럽거나 의미 없는 경우에는 생략하고:

```text
Raw Record
+
Personal Best
```

만 표시해도 된다.

---

# 22. Personal Best 판정

Personal Best는 게임마다 대표 성과 지표가 다르므로 게임 특성별 기준을 사용한다.

Final Stat 자체를 신기록 판정 기준으로 사용하지 않는다.

---

# 23. Reaction — 순발력

## Game ID

```text
reaction
```

## Game Name

```text
Catch the Signal
```

## 목표 시간

```text
30~60초
```

---

# 24. Reaction 측정 정의

화면에 나타나는 시각적 신호를 감지한 뒤 얼마나 빠르게 반응하는지 측정한다.

신체 전체의 운동 순발력이나 신경학적 능력을 측정한다고 표현하지 않는다.

---

# 25. Reaction 게임 연출

논리 구조는 단순 반응속도 테스트를 유지하되 게임적으로 표현한다.

예:

```text
떨어지는 별

빛나는 오브젝트

Statling 세계관의 작은 에너지
```

등을 활용한다.

게임 로직:

```text
WAIT

↓

Random Delay

↓

Target 등장

↓

Click / Tap

↓

Reaction Time 기록
```

---

# 26. Reaction Trial

```text
Practice
1회

+

Real Trial
7회
```

목표 시간:

```text
약 35~50초
```

---

# 27. Reaction Random Delay

```text
1,500ms
~
4,000ms
```

사이에서 랜덤 설정.

패턴 예측을 어렵게 한다.

---

# 28. Reaction False Start

Target 등장 전에 클릭하면:

```text
FALSE START
```

처리한다.

해당 Trial은 정상 Reaction 기록에서 제외한다.

예:

```text
앗, 너무 빨랐어요!

신호가 나타난 뒤 눌러주세요.
```

과도한 False Start는 Penalty 또는 Invalid Flag에 활용한다.

---

# 29. Reaction 저장 데이터

```ts
{
  trialIndex: number
  delayMs: number
  reactionMs: number | null
  isFalseStart: boolean
  createdAt: string
}
```

Session:

```text
validTrials

falseStarts

averageReactionMs

medianReactionMs

bestReactionMs

consistency

gameScore
```

---

# 30. Reaction 핵심 지표

핵심:

```text
Median Reaction Time
```

보조:

```text
Best Reaction

Average Reaction

Consistency

False Starts
```

단 한 번의 우연한 빠른 클릭이 결과 전체를 좌우하지 않도록 Median 중심으로 계산한다.

---

# 31. Reaction Personal Best

대표 판정 기준:

```text
가장 낮은 Valid Median Reaction Time
```

동일할 경우:

```text
False Start 적음

Consistency 높음
```

등을 Tie-breaker로 사용할 수 있다.

---

# 32. Reaction 결과 예시

```text
⚡ 새로운 스탯 발견!

순발력

이번 기록
Median 231 ms

Best Trial
204 ms

False Start
1

개인 최고
225 ms
```

---

# 33. Reaction Anti-cheat

다음 기록은 Flag 가능.

```text
80ms 이하 반응 반복

비정상적으로 동일한 ms 반복

과도한 사전 클릭

자동 입력 의심
```

Flag 기록은 Percentile 및 Ranking에서 제외 가능.

---

# 34. Memory — 기억력

## Game ID

```text
memory
```

## Game Name

```text
Memory Tiles
```

## 목표 시간

```text
30~60초
```

---

# 35. Memory 측정 정의

짧은 시간 동안 나타난 시각적 위치 정보를 유지하고 다시 재현하는 수행 능력을 측정한다.

---

# 36. Memory MVP 방식

```text
빛난 타일 위치 기억
```

방식을 사용한다.

예:

```text
■ □ ■
□ ■ □
■ □ □

↓

잠시 후 숨김

↓

□ □ □
□ □ □
□ □ □

↓

빛났던 위치 선택
```

---

# 37. Memory Round

```text
Practice
1회

+

Real
최대 8 Rounds
```

---

# 38. Memory 난이도

고정된 난이도 순서를 사용한다.

예:

```text
Level 1
3x3
3 Targets
2.0 sec

Level 2
3x3
4 Targets
1.7 sec

Level 3
4x4
5 Targets
1.7 sec

Level 4
4x4
6 Targets
1.4 sec

Level 5+
5x5
Target 증가
Exposure 감소
```

정확한 수치는 Beta 테스트 후 조정 가능하다.

---

# 39. Memory 실패

한 번 틀렸다고 즉시 종료하지 않는다.

예:

```text
Life
2
```

또는 정해진 8 Round까지 진행할 수 있다.

v1.0 구현 시 전체 플레이 시간이 60초를 크게 넘지 않도록 조정한다.

---

# 40. Memory Partial Accuracy

전체 위치를 모두 맞혀야만 점수를 받는 구조로 만들지 않는다.

기록:

```text
Correct Selection

Wrong Selection

Missed Target
```

모두 저장한다.

---

# 41. Memory 저장 데이터

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

---

# 42. Memory Game Score

반영:

```text
Difficulty

Accuracy

Perfect Recall

Response Efficiency
```

우선순위:

```text
Accuracy
>
Difficulty
>
Speed
```

속도만 빠르게 찍는 행동이 높은 점수를 얻지 않도록 한다.

---

# 43. Memory Personal Best

대표 지표:

```text
최고 Difficulty

+

Weighted Accuracy
```

예:

```text
Level 7 / Accuracy 88%
```

가:

```text
Level 5 / Accuracy 100%
```

보다 반드시 높은지 여부는 Score Formula로 결정한다.

단순 Level 하나만으로 신기록을 판정하지 않는다.

---

# 44. Memory 문제 랜덤화

Free Play에서는 매번:

```text
Target 위치

Target 조합
```

을 랜덤 생성한다.

같은 Pattern 반복을 방지한다.

---

# 45. Focus — 집중력

## Game ID

```text
focus
```

## Game Name

```text
Target Hunt
```

## 목표 시간

```text
30~60초
```

---

# 46. Focus 측정 정의

여러 방해 요소 사이에서 목표 자극을 빠르고 정확하게 찾아내는 선택적 주의 수행을 측정한다.

---

# 47. Focus MVP 방식

```text
여러 요소 중 목표 빠르게 탐색
```

구조를 사용한다.

예:

```text
TARGET

Q

↓

O O O O
O O Q O
O O O O
```

---

# 48. Focus Round

```text
Practice
1회

+

Real
약 12~15 Rounds
```

전체:

```text
약 40~60초
```

---

# 49. Focus 난이도

고정 난이도 순서.

조절 요소:

```text
Grid Size

Distractor 수

Target-Distractor 유사도

제한시간

Target 존재 여부
```

---

# 50. Focus No Target Round

일부 Round에는 Target이 존재하지 않는다.

사용자는:

```text
없음
```

을 선택해야 한다.

이를 통해 무조건 빠르게 클릭하는 전략을 방지한다.

---

# 51. Focus 저장 데이터

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

---

# 52. Focus Game Score

반영:

```text
Accuracy

Difficulty

Response Time

False Positive

Miss
```

우선순위:

```text
Accuracy
>
Difficulty
>
Speed
```

---

# 53. Focus Personal Best

복합 점수를 기준으로 한다.

단순:

```text
가장 빠른 클릭
```

만으로 판정하지 않는다.

대표:

```text
Accuracy-weighted Composite Score
```

기준.

---

# 54. Focus 랜덤화

게임마다:

```text
Target 위치

Distractor 위치

Target 존재 여부

문자 / Shape 조합
```

을 랜덤화한다.

---

# 55. Judgment — 판단력

## Game ID

```text
judgment
```

## Game Name

```text
Rule Switch
```

## 목표 시간

```text
30~60초
```

---

# 56. Judgment 측정 정의

주어진 규칙을 빠르게 적용하고, 규칙이 변경되었을 때 새로운 기준으로 전환하는 수행 능력을 측정한다.

일반적인 인생 판단력이나 의사결정의 질을 의미하지 않는다.

---

# 57. Judgment 기본 게임

예:

```text
RULE

🔴 → LEFT
🔵 → RIGHT

↓

🔴

↓

LEFT
```

중간:

```text
RULE CHANGED

🔴 → RIGHT
🔵 → LEFT
```

---

# 58. Reaction과 Judgment 차이

Reaction:

```text
Stimulus
↓
Immediate Response
```

Judgment:

```text
Stimulus
↓
Rule Processing
↓
Choice
```

반드시 Rule Interpretation이 포함된다.

---

# 59. Judgment Trial

```text
Practice
약 4 Trials

+

Real
약 24~30 Trials
```

각 Trial은 매우 짧게 진행한다.

전체:

```text
40~60초
```

---

# 60. Judgment Block

예:

```text
Block A
기본 Rule

↓

Rule Switch

↓

Block B

↓

Rule Complexity Increase

↓

Block C
```

---

# 61. Judgment 저장 데이터

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

# 62. Judgment Game Score

반영:

```text
Overall Accuracy

Response Efficiency

Switch Accuracy

Switch Cost

Post-switch Adaptation
```

우선순위:

```text
Accuracy

Switch Adaptation

Speed
```

순.

---

# 63. Judgment Personal Best

복합 Game Score 기준.

특히:

```text
규칙 변경 직후 정확도

+

응답 시간
```

을 중요하게 반영한다.

---

# 64. Spatial — 공간감각

## Game ID

```text
spatial
```

## Game Name

```text
Rotate It
```

## 목표 시간

```text
1~2분
```

---

# 65. Spatial 측정 정의

도형의 방향과 회전을 머릿속에서 변환하여 동일한 형태를 식별하는 수행 능력을 측정한다.

---

# 66. Spatial MVP 방식

```text
2D Mental Rotation
```

을 사용한다.

기준 Shape를 보여주고 회전된 동일 Shape를 선택한다.

---

# 67. Spatial Question

```text
Practice
2문제

+

Real
10~12문제
```

---

# 68. Spatial 난이도

고정 난이도 순서.

```text
Level 1
간단한 Shape
90° Rotation

Level 2
복합 Shape
90° / 180°

Level 3
Mirror Distractor 포함

Level 4
복잡한 Shape
유사 Distractor 증가
```

---

# 69. Spatial 제한시간

문제당:

```text
약 8~12초
```

난이도에 따라 조정한다.

시간 초과는 오답으로 처리한다.

---

# 70. Spatial 저장 데이터

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

# 71. Spatial Game Score

반영:

```text
Correctness

Difficulty

Efficiency
```

우선순위:

```text
Accuracy
>
Difficulty
>
Speed
```

---

# 72. Spatial Personal Best

```text
Difficulty-weighted Correct Score
```

를 기준으로 한다.

정답 개수만 동일해도 더 어려운 문제를 맞힌 세션을 더 높은 기록으로 인정할 수 있다.

---

# 73. Spatial 문제 생성

v1.0에서는 검증된 문제 Pool을 사용한다.

절차적으로 무작위 생성한 도형이:

```text
중복 정답

잘못된 Mirror

의도하지 않은 동일 Shape
```

를 만들 수 있기 때문이다.

문제 Pool을 충분히 확보하고 Session마다 랜덤 샘플링한다.

---

# 74. Reasoning — 추리력

## Game ID

```text
reasoning
```

## Game Name

```text
Pattern Reasoning
```

## 목표 시간

```text
1~2분
```

---

# 75. Reasoning 측정 정의

주어진 시각적 정보에서 규칙이나 관계를 찾아 적절한 답을 도출하는 수행 능력을 측정한다.

IQ 전체를 측정한다고 표현하지 않는다.

---

# 76. Reasoning MVP 방식

```text
Visual Pattern Reasoning
```

을 사용한다.

예:

```text
○ △ ○ △ ?

또는

▲ ● ▲
● ▲ ●
▲ ● ?
```

---

# 77. Reasoning Question

```text
Practice
2문제

+

Real
10~12문제
```

---

# 78. Reasoning 난이도

고정 난이도 순서.

```text
Level 1
Single Rule

Level 2
Two-step Pattern

Level 3
Multiple Attribute

Level 4
Compound Rule
```

---

# 79. Reasoning 제한시간

예:

```text
Easy
8~10초

Normal
10~12초

Hard
12~15초
```

전체 게임이 2분을 크게 넘지 않도록 조절한다.

---

# 80. Reasoning 저장 데이터

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

# 81. Reasoning Game Score

반영:

```text
Accuracy

Difficulty

Efficiency
```

우선순위:

```text
Accuracy

Difficulty

Speed
```

---

# 82. Reasoning Personal Best

```text
Difficulty-weighted Correct Score
```

기준.

---

# 83. Reasoning 문제 Pool

Spatial과 마찬가지로 검증된 문제 Pool을 사용한다.

문제마다:

```text
question_id

difficulty

correct_answer

rule_type
```

을 관리한다.

Free Play에서는 랜덤 샘플링하여 문제 암기를 줄인다.

---

# 84. 향후 Reasoning 확장

추후 게임 다양화를 위해:

```text
Mini Mystery

Logic Puzzle

Code Breaking

Deduction
```

등을 추가할 수 있다.

단, 다른 게임 유형은 별도 `game_id` 또는 Mode로 관리한다.

같은 Percentile 분포에 무조건 섞지 않는다.

---

# 85. 게임별 기록 요약

| Stat | MVP Game | 주요 Raw Record | Personal Best 기준 |
|---|---|---|---|
| Reaction | Catch the Signal | Median ms | 낮은 Valid Median + 보조지표 |
| Memory | Memory Tiles | Level + Accuracy | Difficulty-weighted Memory Score |
| Focus | Target Hunt | Accuracy + Response | Accuracy-weighted Composite |
| Judgment | Rule Switch | Accuracy + Switch Response | Rule-switch Composite |
| Spatial | Rotate It | Correct + Difficulty | Difficulty-weighted Score |
| Reasoning | Pattern Reasoning | Correct + Difficulty | Difficulty-weighted Score |

---

# 86. 게임별 플레이 시간

| Stat | 목표 시간 |
|---|---:|
| Reaction | 30~60초 |
| Memory | 30~60초 |
| Focus | 30~60초 |
| Judgment | 30~60초 |
| Spatial | 1~2분 |
| Reasoning | 1~2분 |

전체 첫 플레이:

```text
약 7~10분
```

을 목표로 한다.

---

# 87. 문제 반복 방지 전략

게임마다 다른 방식을 사용한다.

## Reaction

```text
Random Delay

Random Target Position / Visual
```

## Memory

```text
Random Tile Pattern
```

## Focus

```text
Random Target Position

Random Distractor Placement
```

## Judgment

```text
Stimulus Order Randomization

Rule Block Variation
```

## Spatial

```text
Validated Problem Pool
+
Random Sampling
```

## Reasoning

```text
Validated Problem Pool
+
Random Sampling
```

---

# 88. Game Version

게임 규칙이나 난이도가 변경될 경우 반드시:

```text
game_version
```

을 저장한다.

예:

```text
reaction_v1

reaction_v2
```

다른 Version의 Score를 동일한 Percentile Distribution에 무조건 섞지 않는다.

---

# 89. Device 정보

특히 Reaction은 다음 요소의 영향을 받을 수 있다.

```text
Mouse

Touch

Display Refresh Rate

Browser

Device Performance
```

가능한 범위에서 다음을 저장한다.

```text
device_type

input_type

browser

screen_size
```

---

# 90. 모바일 / PC Percentile

v1.0 초기에는:

```text
기기 정보는 저장

Percentile은 통합
```

한다.

사용자 데이터가 충분히 쌓이면:

```text
Mobile

Desktop
```

분포 차이를 분석하여 별도 Percentile이 필요한지 검토한다.

---

# 91. XP 지급

게임 완료 시 XP를 지급한다.

기본 구조:

```text
Completion XP

+

Performance Bonus

+

New Record Bonus

↓

Recommended Game Multiplier
```

---

# 92. XP 예시

초기 예시:

```text
게임 완료
+100 XP

성적 Bonus
+0~30 XP

NEW RECORD
+30 XP
```

추천 게임인 경우:

```text
Total Earned XP
×1.5
```

정확한 XP 수치는 Balance Test 후 조정한다.

---

# 93. XP와 Stat 분리

```text
STAT
=
게임에서 얼마나 좋은 기록을 만들었는가

XP
=
얼마나 플레이하고 활동했는가
```

따라서 기록이 낮더라도 플레이하면 XP를 받을 수 있다.

이는 실력이 낮은 사용자가 성장 시스템에서 소외되지 않도록 하기 위함이다.

---

# 94. New Record Bonus

Personal Best를 갱신하면 추가 보상을 제공한다.

예:

```text
NEW RECORD!

+30 XP
```

추천 게임이었다면 전체 XP에 추천 배율을 적용한다.

정확한 계산 순서는 구현 시 하나로 고정한다.

권장:

```text
Base
+
Performance
+
New Record

↓

× Recommended Multiplier
```

---

# 95. Anti-cheat

v1.0에서는 복잡한 Anti-cheat 시스템을 구현하지 않는다.

명백한 비정상 기록만 Flag한다.

예:

```text
Reaction 80ms 이하 반복

비정상적으로 짧은 Session

Trial 없이 완료 요청

API 직접 조작 의심

불가능한 점수
```

---

# 96. Invalid Attempt

기록에:

```text
is_valid_attempt

invalid_reason
```

을 저장할 수 있도록 한다.

Invalid 기록은:

```text
Percentile

Ranking

Personal Best
```

계산에서 제외한다.

---

# 97. 날짜별 History

각 Attempt를 삭제하지 않고 기록한다.

예:

```text
2026-07-20

Reaction
231ms

Score
XXX

Percentile
68
```

```text
2026-07-27

Reaction
205ms

Score
XXX

Percentile
82

NEW RECORD
```

---

# 98. Initial vs Current

최초 완료한 6개 게임은:

```text
Initial Status
```

로 별도 저장한다.

현재 최고 기록 기준 스탯은:

```text
Current Status
```

로 관리한다.

향후:

```text
처음의 나

vs

지금의 나
```

를 시각화한다.

---

# 99. Statling과 기록 연결

게임 기록 향상은 Statling의 Species 자체를 변경하지 않는다.

대신 향후 다음 요소에 반영할 수 있다.

```text
표정

대사

애니메이션

행동

작은 성장 효과
```

예:

```text
Reaction NEW RECORD

↓

Statling이 빠르게 뛰어다님

"오늘 정말 빨랐어!"
```

---

# 100. Recommended Game

부화 이후 Free Play에서 Statling이 원하는 게임 하나를 추천할 수 있다.

예:

```text
🧠 기억력

오늘 이 게임이 하고 싶어!

EXP ×1.5
```

게임 자체의 Score나 Stat 계산 방식은 일반 플레이와 동일하다.

Bonus는 XP에만 적용한다.

즉 추천 게임이라고 Stat이 더 많이 올라가지는 않는다.

---

# 101. Ranking과 Game Score

향후 Ranking을 구현할 경우:

```text
Raw Record
```

를 그대로 비교하기 어려운 게임은:

```text
Game Score
```

를 사용한다.

예:

```text
Reaction
Median ms 기준

Memory
Composite Score

Focus
Composite Score
```

Ranking은 Game별로 별도 관리한다.

6개 게임을 하나의 점수로 억지로 합친 `능력 순위`는 초기에는 만들지 않는다.

---

# 102. MY STATUS와 Ranking 차이

```text
MY STATUS
=
6개 게임에서 나의 상대적 위치

Ranking
=
특정 게임 또는 XP에서 사용자 간 순위
```

둘을 혼동하지 않는다.

---

# 103. Percentile 계산 예시

유효 사용자 1,000명.

내 Reaction Game Score보다 낮은 기록:

```text
820명
```

이면:

```text
Percentile Rank
82
```

따라서:

```text
Reaction Stat
82
```

표현:

```text
현재 Statling 사용자 기준
상위 약 18%
```

---

# 104. 동점 처리

Percentile 계산에서 동일 Score가 다수 존재할 수 있다.

구체적인 Rank 계산 방식은 DB 구현 시 확정한다.

예:

```text
Percent Rank

CUME_DIST

Average Rank
```

중 하나를 선택한다.

모든 게임에서 동일한 정책을 사용한다.

---

# 105. 스탯 값 반올림

사용자-facing Stat은 기본적으로 정수:

```text
82
```

로 표시한다.

내부 Percentile은:

```text
82.37
```

처럼 소수점으로 저장 가능.

---

# 106. 짧은 Feedback 생성 방식

v1.0에서는 AI를 사용하지 않는다.

Rule-based Feedback을 사용한다.

예:

```text
Accuracy >= 90%

→
"높은 정확도로 마무리했어요."
```

```text
New Record

→
"지난 기록을 넘어섰어요!"
```

의미 있는 Rule을 만들기 어려운 경우 Feedback을 생략한다.

---

# 107. 게임 설명 문구 원칙

사용자에게 다음과 같이 설명한다.

좋은 예:

```text
빛난 위치를 기억해보세요.

목표를 최대한 빠르게 찾아보세요.

규칙이 바뀌면 새로운 기준에 맞춰 선택하세요.
```

피해야 할 표현:

```text
당신의 진짜 기억력을 측정합니다.

당신의 지능을 평가합니다.

당신의 뇌 능력을 정확하게 진단합니다.
```

---

# 108. 게임 UI 원칙

게임은:

```text
시험
```

보다:

```text
미니게임
```

처럼 느껴져야 한다.

사용:

```text
ROUND

LEVEL

COMBO

NEW RECORD

PERFECT

MISS
```

등.

하지만 게임 UI가 측정 자체를 방해해서는 안 된다.

---

# 109. 첫 플레이 게임 완료 Flow

예:

```text
GAME COMPLETE

↓

Raw Record

↓

Personal Best 비교

↓

새로운 스탯 발견

↓

Egg / Progress 변화

↓

다음 Game
```

---

# 110. Free Play 완료 Flow

```text
GAME COMPLETE

↓

이번 기록

↓

Personal Best

↓

NEW RECORD 여부

↓

XP 획득

↓

추천 Bonus

↓

Stat 업데이트 가능 여부

↓

Room 복귀
```

---

# 111. 저장해야 할 공통 Session 데이터

```ts
interface GameSession {
  id: string
  userId: string
  gameId: string
  gameVersion: string

  startedAt: string
  completedAt?: string

  durationMs?: number

  isCompleted: boolean
  isValidAttempt: boolean

  gameScore?: number

  percentile?: number

  finalStat?: number

  isPersonalBest?: boolean

  deviceType?: string
  inputType?: string
}
```

---

# 112. Stat Result 구조

```ts
interface StatResult {
  statType:
    | "memory"
    | "focus"
    | "reaction"
    | "judgment"
    | "spatial"
    | "reasoning"

  rawSummary: unknown

  gameScore: number

  percentile?: number

  finalStat?: number

  sampleSize?: number

  isPersonalBest: boolean

  playedAt: string
}
```

---

# 113. Score Logic 위치

Score 계산을 UI Component 안에 넣지 않는다.

권장:

```text
src/lib/scoring/

reaction.ts
memory.ts
focus.ts
judgment.ts
spatial.ts
reasoning.ts
```

함수:

```text
calculateReactionScore()

calculateMemoryScore()

calculateFocusScore()

calculateJudgmentScore()

calculateSpatialScore()

calculateReasoningScore()
```

---

# 114. Difficulty Config

난이도 역시 UI에서 하드코딩하지 않는다.

권장:

```text
src/config/games/

reaction.config.ts

memory.config.ts

focus.config.ts

judgment.config.ts

spatial.config.ts

reasoning.config.ts
```

---

# 115. Question Pool

Spatial / Reasoning은 별도 문제 데이터를 사용한다.

예:

```text
src/data/games/

spatial/

reasoning/
```

각 문제:

```text
id

difficulty

asset

options

correct_answer

metadata
```

---

# 116. Analytics Event 후보

게임 관련 주요 Event:

```text
game_intro_view

game_practice_start

game_start

game_complete

game_retry

personal_best

stat_discovered

free_play_start

recommended_game_start

xp_earned
```

---

# 117. GA4와 DB 역할 분리

GA4:

```text
사용자 행동 이벤트
```

DB:

```text
Trial Raw Data

Game Result

Score

History

Percentile
```

모든 Trial을 GA4에 전송하지 않는다.

---

# 118. 주요 게임 분석 지표

```text
Game Start Rate

Game Completion Rate

Average Duration

Drop-off

Retry Rate

Personal Best Rate

Score Distribution

Stat Distribution

Free Play Rate
```

---

# 119. 게임 품질 검증 질문

## Reaction

```text
한 번 더 도전하고 싶은가?
```

## Memory

```text
난이도 상승이 자연스러운가?
```

## Focus

```text
빠른 클릭보다 실제 정확도가 반영되는가?
```

## Judgment

```text
Reaction과 다른 게임으로 느껴지는가?
```

## Spatial

```text
문제 품질에 오류가 없는가?
```

## Reasoning

```text
학교 시험처럼 느껴지지 않는가?
```

---

# 120. Closed Beta에서 반드시 확인할 항목

```text
전체 6게임 시간이 적절한가?

어느 게임이 가장 지루한가?

어느 게임이 가장 어렵나?

결과가 납득되는가?

다시 해보고 싶은 게임은 무엇인가?

설명이 없어도 플레이 가능한가?

모바일에서도 불편하지 않은가?

신기록이 동기부여가 되는가?
```

---

# 121. v1.0 게임 구조 요약

```text
Reaction
Catch the Signal

Memory
Memory Tiles

Focus
Target Hunt

Judgment
Rule Switch

Spatial
Rotate It

Reasoning
Pattern Reasoning
```

---

# 122. v1.0 Score 정책 요약

```text
Raw Record
게임별 실제 기록

↓

Game Score
내부 Composite Score

↓

Percentile
Statling 유효 사용자 기준

↓

Final Stat
0~100
```

---

# 123. v1.0 기록 정책 요약

```text
첫 6개 결과
→ Initial Status 보존

재도전
→ 모든 History 저장

신기록
→ Personal Best 갱신

Current Status
→ Best Valid Performance 기반

Stat
→ Percentile 기반
```

---

# 124. v1.0 XP 정책 요약

```text
Game Complete
→ Base XP

Performance
→ Bonus XP

NEW RECORD
→ Additional XP

Recommended Game
→ Final XP ×1.5
```

Stat 자체에는 XP 배율을 적용하지 않는다.

---

# 125. 가장 중요한 게임 설계 원칙

Statling의 게임은:

```text
"정확한 의학적 능력 검사"
```

를 목표로 하지 않는다.

하지만:

```text
무작위 숫자 놀이
```

가 되어서도 안 된다.

따라서:

```text
측정 대상이 명확한 게임 규칙

일관된 난이도

Raw Data 저장

동일 Version 비교

충분한 사용자 데이터 기반 Percentile
```

을 유지한다.

---

# 126. 최종 사용자 경험

```text
GAME PLAY

↓

"205ms!"

↓

NEW STAT DISCOVERED

↓

6 Stats Complete

↓

MY STATUS

↓

HATCH

↓

STATLING

↓

FREE PLAY

↓

NEW RECORD

↓

XP

↓

STAT GROWTH

↓

STATLING REACTION

↓

RETURN
```

---

# 127. 핵심 문장

> **게임 기록은 숫자로 남고,  
> 그 기록의 변화는 나와 Statling의 성장으로 이어진다.**

---

# 128. 개발 시 주의사항

Claude Code는 다음 원칙을 따른다.

```text
1. Game Score의 세부 상수를 임의로 정하지 않는다.

2. Fake Percentile을 생성하지 않는다.

3. Raw Record와 Final Stat을 혼용하지 않는다.

4. UI에 의미 없는 pts를 임의로 추가하지 않는다.

5. Score Logic을 UI Component와 분리한다.

6. Trial 단위 데이터를 저장할 수 있는 구조를 유지한다.

7. game_version을 반드시 고려한다.

8. Spatial / Reasoning 문제는 검증 가능한 Problem Pool을 사용한다.

9. Personal Best와 모든 Attempt History를 둘 다 저장한다.

10. Initial Status와 Current Status를 구분한다.

11. 추천 게임 XP Bonus가 Stat Score에 영향을 주지 않도록 한다.

12. 모바일과 데스크톱 Device 정보를 기록할 수 있게 한다.

13. 명백한 비정상 기록을 Flag할 수 있는 구조를 둔다.

14. 각 게임의 정확한 Score Formula는 실제 테스트 및 데이터 확보 후 보정 가능하도록 구성한다.
```

---

# 129. 현재 확정 사항

```text
Final Stat
=
Statling 사용자 Percentile Rank 0~100

재도전 Stat
=
Best Valid Performance 기준

난이도
=
모든 사용자 동일한 Fixed Sequence

Reaction
=
기존 Reaction Logic + 게임적 연출

Memory
=
빛난 타일 위치 기억

Focus
=
Target Hunt

Judgment
=
Rule Switch

Spatial
=
2D Mental Rotation

Reasoning
=
Visual Pattern Reasoning

결과 화면
=
Raw Record + Personal Best + 가능한 경우 짧은 Feedback

Game Score
=
내부 계산용

신기록
=
게임별 대표 지표 기준

Free Play
=
기본 룰 동일 + 랜덤화

문제 반복 방지
=
게임별 다른 전략

XP
=
기본 XP + 성적 Bonus + 신기록 Bonus + 추천 게임 ×1.5

Anti-cheat
=
명백한 비정상 기록 Flag

Device
=
기록하되 초기 Percentile은 통합

Initial Status
=
별도 보존

Current Status
=
성장하며 변화

반복 학습 효과
=
History를 보존하고 향후 Stat 업데이트 보정 가능 구조
```

---

# 130. 다음 단계

이 문서를 기준으로 실제 개발 전 다음 작업을 진행한다.

```text
1. 현재 v0 코드 Audit

2. 게임별 Placeholder와 실제 GAME_SPEC 비교

3. Raw Data Type 정의

4. 공통 Game Session 구조 정의

5. 6개 게임 기본 Logic 구현

6. Score Function Interface 구현

7. Personal Best / History 구조 구현

8. 사용자 데이터 축적 후 Percentile 시스템 연결
```