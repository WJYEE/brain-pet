# Brain_Bet — MVP_SCOPE

> Version: v0.1
> 목적: Brain_Bet의 첫 MVP 개발 범위를 명확히 정의하고, 현재 구현 범위와 이후 확장 기능을 구분한다.
> 대상: Claude Code 및 개발 참고용
> 상태: v0.1 범위 확정안

---

# 1. MVP 목표

Brain_Bet v0.1의 목표는 다음 한 가지 경험을 완성하는 것이다.

```text
사용자가 처음 서비스를 방문한다.

↓

6개의 미니게임을 순서대로 끊김 없이 플레이한다.

↓

각 게임의 수행 결과가 기록된다.

↓

6개의 스탯이 모두 완성된다.

↓

최종 MY STATUS와 Radar Chart를 확인한다.
```

v0.1에서는 이 핵심 경험이 자연스럽고 안정적으로 동작하는지를 검증하는 데 집중한다.

---

# 2. v0.1 핵심 사용자 경험

사용자는 처음 방문했을 때 6개의 게임을 하나의 연속된 흐름으로 진행한다.

기본 흐름:

```text
Landing

↓

Game Introduction

↓

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

↓

6 Stats Complete

↓

Final MY STATUS

↓

Radar Chart
```

초기 첫 플레이에서는 사용자가 게임을 하나씩 직접 선택하는 구조보다:

```text
정해진 순서대로 다음 게임으로 자연스럽게 연결되는 구조
```

를 우선한다.

목적:

```text
첫 플레이 경험 단순화

게임 선택으로 인한 이탈 최소화

6개 스탯 완성률 측정

전체 테스트 흐름 검증
```

---

# 3. v0.1 게임 순서

초기 기본 순서는 다음과 같다.

```text
1. Reaction
2. Memory
3. Focus
4. Judgment
5. Spatial
6. Reasoning
```

이 순서는 첫 사용자 경험 기준이다.

이후 버전에서는 자유 선택 플레이가 가능하도록 확장할 수 있다.

---

# 4. v0.1 반드시 구현할 기능

## 4.1 Landing

서비스의 핵심 컨셉을 간단하게 전달한다.

사용자가 바로 첫 게임을 시작할 수 있어야 한다.

필수 요소:

```text
서비스 소개

6개 스탯 안내

예상 플레이 시간

시작 CTA
```

---

# 4.2 6개 미니게임

반드시 다음 6개 게임을 구현한다.

```text
Reaction
Memory
Focus
Judgment
Spatial
Reasoning
```

각 게임의 세부 규칙은:

```text
GAME_SPEC.md
```

를 기준으로 한다.

---

# 4.3 게임 간 연속 진행

첫 플레이에서는 게임 종료 후:

```text
결과 확인

↓

다음 게임으로 진행
```

이 자연스럽게 이어져야 한다.

사용자가 매번 홈이나 게임 선택 화면으로 돌아가지 않는다.

예:

```text
Reaction 완료

↓

짧은 결과

↓

다음 능력 발견하기

↓

Memory 시작
```

---

# 4.4 개별 게임 결과 처리

각 게임 종료 후 내부적으로 다음 데이터를 계산한다.

```text
Raw Data

Game Score

Personal Best 여부

완료 여부
```

단, v0.1 사용자-facing 결과 화면에서는 복잡한 상세 분석을 우선 노출하지 않는다.

---

# 4.5 진행 상태

사용자가 현재 전체 과정 중 어디까지 완료했는지 확인할 수 있어야 한다.

예:

```text
2 / 6 COMPLETE
```

또는:

```text
Reaction     ✓
Memory       ✓
Focus        ●
Judgment     ○
Spatial      ○
Reasoning    ○
```

정확한 UI는 추후 디자인 단계에서 결정한다.

---

# 4.6 최종 MY STATUS

6개의 게임을 모두 완료하면 최종 스탯을 생성한다.

스탯:

```text
Memory
Focus
Reaction
Judgment
Spatial
Reasoning
```

각 스탯은 상대 백분위 기반으로 설계한다.

단, 사용자 표본이 충분하지 않은 초기 단계에서는 임의 Percentile을 생성하지 않는다.

Percentile 계산 정책은:

```text
GAME_SPEC.md
```

를 따른다.

---

# 4.7 Radar Chart

최종 결과 화면에는 6개의 스탯을 육각형 Radar Chart로 표현한다.

축:

```text
Memory
Focus
Reaction
Judgment
Spatial
Reasoning
```

예:

```text
              Focus
                ▲

       Memory       Reaction


     Reasoning       Judgment

                ▼
              Spatial
```

Radar Chart는 최종 결과의 핵심 시각화 요소이다.

---

# 5. 최종 결과 화면 범위

v0.1의 최종 결과 화면은 의도적으로 단순하게 유지한다.

반드시 표시:

```text
6개 Stat

Radar Chart
```

현재 v0.1에서는 기본적으로 표시하지 않는 항목:

```text
Pet

XP

Level

Ranking

Daily Challenge

Detailed Analysis

성향 설명

강점 유형

Pet Personality

Share Card
```

---

# 6. v0.1 결과 화면 구조

기본 구조:

```text
MY STATUS

Memory      XX
Focus       XX
Reaction    XX
Judgment    XX
Spatial     XX
Reasoning   XX

↓

Radar Chart
```

추가적인 설명이나 분석 카피는 최소화한다.

v0.1의 목적은:

```text
6개 게임을 끝까지 플레이했을 때
사용자가 자신의 전체 스탯을 한눈에 확인할 수 있는가
```

를 검증하는 것이다.

---

# 7. 데이터 저장 정책

v0.1에서는 로그인 없이 시작한다.

모든 사용자는 초기에는:

```text
Anonymous User
```

로 처리한다.

---

# 7.1 익명 사용자 ID

서비스 최초 진입 시 익명 식별자를 생성한다.

예:

```text
anonymous_user_id
```

이 ID를 기준으로 사용자 데이터를 연결한다.

---

# 7.2 DB 저장

v0.1의 게임 기록은 브라우저 내부에만 저장하지 않고 DB에 저장한다.

저장 대상:

```text
Anonymous User

Game Session

Trial Data

Game Result

Game Score

Completion Status

6개 Stat

Created At

Game Version
```

---

# 7.3 로그인

v0.1에서는 회원가입 및 로그인을 필수 기능으로 구현하지 않는다.

즉:

```text
서비스 진입

↓

익명 사용자 생성

↓

게임 플레이

↓

DB 저장

↓

최종 결과
```

구조를 사용한다.

---

# 7.4 재방문

익명 사용자 ID가 유지되는 경우 기존 진행 상태와 기록을 불러올 수 있도록 설계 가능하다.

다만:

```text
기기 변경

브라우저 데이터 삭제

Private Mode
```

등의 경우 익명 사용자 식별이 유지되지 않을 수 있다.

정식 계정 연결 기능은 이후 버전에서 고려한다.

---

# 8. v0.1 중간 저장

6개 게임을 모두 한 번에 완료하지 못할 가능성을 고려한다.

각 게임 완료 후 즉시:

```text
Completion Status
Game Result
Trial Data
```

를 저장한다.

예:

```text
Reaction  ✓
Memory    ✓
Focus     ✓
Judgment  ○
Spatial   ○
Reasoning ○
```

사용자가 중간에 이탈하더라도 저장된 기록이 손실되지 않도록 한다.

---

# 9. v0.1 포함 범위

## Core Experience

```text
Landing

6개 연속 게임

Game Transition

Progress

Final Status

Radar Chart
```

---

## Game Logic

```text
Reaction Logic

Memory Logic

Focus Logic

Judgment Logic

Spatial Logic

Reasoning Logic
```

---

## Data

```text
Anonymous User ID

Game Session

Trial Data

Game Result

Game Score

Completion Status

Final Stat Data
```

---

## Basic UX

```text
Responsive Design

Mobile Support

Desktop Support

Loading State

Error State

Game Restart

Session Recovery
```

---

# 10. v0.1 제외 범위

다음 기능은 v0.1에서 구현하지 않는다.

---

## Pet

```text
Egg

Hatching

Personalized Pet

Pet Naming

Pet Personality

Pet Animation
```

---

## Growth

```text
XP

Level

Streak

Evolution

Growth History
```

---

## Retention

```text
Daily Challenge

Pet Request

Daily Reward

Push Notification
```

---

## Social

```text
Weekly Ranking

All-Time Ranking

Game Ranking

Nearby Ranking

Friend System

Share Card

Referral
```

---

## Economy

```text
Shop

Coin

Inventory

Item

Accessory

Room Decoration
```

---

## Account

```text
Mandatory Signup

Social Login

Account Profile
```

---

# 11. 다음 단계 확정 방향

v0.1 이후 서비스는 다음 구조로 확장한다.

```text
v0.1

6 Game
↓
6 Stat
↓
Radar Chart
```

다음 단계:

```text
6 Stat Complete

↓

Egg Hatch

↓

Personalized Pet
```

이후:

```text
개별 게임 자유 플레이

↓

게임 기록 갱신

↓

XP 획득

↓

Pet 성장
```

---

# 12. Pet 이후 플레이 구조

초기 6개 스탯을 모두 완료하고 Pet이 부화한 이후에는 게임 흐름이 달라진다.

첫 플레이:

```text
6개 게임을 순서대로 진행
```

Pet 부화 이후:

```text
사용자가 원하는 Stat Game을 자유롭게 선택
```

구조로 변경한다.

예:

```text
PLAY

├ Reaction
├ Memory
├ Focus
├ Judgment
├ Spatial
└ Reasoning
```

---

# 13. Pet Request 시스템 — 향후 확정 방향

향후 Pet은 특정 스탯 게임을 플레이하고 싶어 하는 요청을 할 수 있다.

예:

```text
🐣

"오늘은 기억력 게임을
같이 해보고 싶어!"

🧠 MEMORY

BONUS XP
+50%
```

사용자가 Pet이 원하는 스탯을 플레이하면:

```text
Normal XP
+
Bonus XP
```

를 획득한다.

---

# 13.1 목적

이 기능은 다음 문제를 해결하기 위한 Retention Mechanism이다.

```text
사용자가 특정 게임만 반복하는 문제

무엇을 플레이할지 고민하는 문제

매일 접속할 이유 부족

Pet과 실제 플레이의 연결 부족
```

Pet Request를 통해:

```text
Pet

↓

오늘 원하는 Stat 제안

↓

사용자가 해당 게임 플레이

↓

Bonus XP

↓

Pet 성장
```

이라는 루프를 만든다.

---

# 14. 전체 장기 루프

Brain_Bet의 장기 서비스 구조는 다음과 같다.

```text
FIRST VISIT

6 Games

↓

6 Stats

↓

Radar Chart

↓

Egg Hatch

↓

Personalized Pet

↓

FREE PLAY MODE

↓

Pet Request

↓

Recommended Stat Game

↓

Bonus XP

↓

Level Up

↓

Pet Growth

↓

Retry

↓

Personal Record

↓

Return
```

단:

```text
v0.1
```

에서는 다음까지만 구현한다.

```text
6 Games
↓
6 Stats
↓
Radar Chart
```

---

# 15. v0.1 성공 조건

다음 조건을 만족하면 v0.1 핵심 개발이 완료된 것으로 본다.

---

## Functional

```text
1. 사용자가 Landing에서 게임을 시작할 수 있다.

2. 6개 게임이 순서대로 정상 진행된다.

3. 각 게임이 GAME_SPEC.md 규칙대로 동작한다.

4. 게임 사이 전환이 끊기지 않는다.

5. Trial 데이터가 정상 기록된다.

6. 게임 결과가 DB에 저장된다.

7. 익명 사용자를 구분할 수 있다.

8. 중간 이탈 시 완료 기록이 보존된다.

9. 6개 게임 완료 여부를 확인할 수 있다.

10. 6개의 최종 Stat을 생성할 수 있다.

11. Radar Chart가 정상 표시된다.

12. 모바일과 데스크톱에서 플레이 가능하다.
```

---

# 16. v0.1에서 검증할 핵심 질문

제품 관점:

```text
사용자가 첫 게임을 시작하는가?

6개 게임을 끝까지 진행하는가?

어느 게임에서 가장 많이 이탈하는가?

전체 플레이 시간이 너무 길지 않은가?

게임 사이 전환이 자연스러운가?

최종 Radar Chart까지 볼 가치가 있다고 느끼는가?
```

---

# 17. 핵심 Funnel

v0.1에서 가장 먼저 볼 Funnel:

```text
Landing View

↓

Game Start

↓

Reaction Complete

↓

Memory Complete

↓

Focus Complete

↓

Judgment Complete

↓

Spatial Complete

↓

Reasoning Complete

↓

All Games Complete

↓

Final Status View
```

---

# 18. 핵심 분석 지표

```text
Landing → Game Start Rate

각 Game Completion Rate

Game별 Drop-off Rate

Game별 Average Duration

전체 6 Game Completion Rate

전체 평균 완료 시간

Final Status View Rate
```

---

# 19. GA4 기본 이벤트

v0.1에서는 최소한 다음 이벤트를 고려한다.

```text
landing_view

game_start

game_complete

game_exit

next_game_start

all_games_complete

final_status_view
```

Properties:

```text
game_id

game_version

game_order

game_score

duration

anonymous_user_id는 GA4에 직접 PII 형태로 전송하지 않는다.
```

상세 Trial 데이터는 GA4가 아니라 DB에 저장한다.

---

# 20. 현재 우선순위

v0.1 개발 우선순위:

```text
P0

6개 게임이 실제로 재미있고 정상 동작하는 것

↓

P1

게임 간 연속 Flow

↓

P2

정확한 데이터 저장

↓

P3

최종 Stat 생성

↓

P4

Radar Chart

↓

P5

Analytics
```

Pet이나 Gamification 기능은 현재 P0~P5 범위 이후이다.

---

# 21. 개발 금지 사항

Claude Code는 v0.1 개발 중 아래 기능을 임의로 추가하지 않는다.

```text
Pet 생성

Egg Animation

XP

Level

Ranking

Daily Challenge

Shop

Inventory

Social Login

Friend

AI Feature

Complex Dashboard
```

기획에 존재하더라도 현재 Scope 밖의 기능은 구현하지 않는다.

---

# 22. Claude Code 문서 우선순위

개발 시 문서 역할:

```text
기획.md
→ 전체 제품 방향

GAME_SPEC.md
→ 각 게임의 세부 규칙

MVP_SCOPE.md
→ 현재 구현 범위
```

충돌 발생 시:

```text
현재 구현 범위
→ MVP_SCOPE.md 우선

게임 세부 로직
→ GAME_SPEC.md 우선

장기 제품 방향
→ 기획.md 참고
```

---

# 23. v0.1 완료 후 다음 Phase

v0.1 검증 이후:

```text
Phase 2

Egg Progress

↓

Egg Hatch

↓

Personalized Pet

↓

Pet Naming
```

다음:

```text
Phase 3

Free Play

↓

XP

↓

Level

↓

Pet Request

↓

Bonus XP
```

다음:

```text
Phase 4

Daily Challenge

↓

Ranking

↓

Growth History

↓

Share / Referral
```

이 순서는 v0.1 결과에 따라 조정할 수 있다.

---

# 24. 최종 Scope 요약

## v0.1

```text
Landing

↓

6개 게임 연속 플레이

Reaction
Memory
Focus
Judgment
Spatial
Reasoning

↓

각 게임 결과 DB 저장

↓

6개 Stat 완성

↓

MY STATUS

↓

Radar Chart
```

---

## v0.1 이후

```text
Egg

↓

Pet Hatch

↓

Personalized Pet

↓

Free Play

↓

Pet Request

↓

Bonus XP

↓

Level / Growth

↓

Daily Challenge

↓

Ranking
```

---

# 25. 현재 최우선 개발 목표

Brain_Bet v0.1은:

```text
"펫을 키우는 서비스"
```

를 만드는 단계가 아니다.

현재 목표는:

```text
"6개의 짧은 미니게임을 끝까지 플레이하고
내 6개 스탯을 완성하는 경험이
실제로 재미있고 자연스러운가?"
```

를 검증하는 것이다.

따라서 모든 개발 판단은 이 질문을 기준으로 한다.
