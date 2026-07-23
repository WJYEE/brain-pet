# Brain_Pet — DEVELOPMENT_PLAN

> Version: v0.1
> 목적: Brain_Pet MVP의 실제 개발 순서, 단계별 완료 조건, 작업 우선순위를 정의한다.
> 대상: Claude Code 및 개발 참고용
> 상태: v0.1 개발 계획 확정안

---

# 1. 개발 목표

Brain_Pet v0.1의 개발 목표는 가능한 빠르게 다음 핵심 경험을 완성하고 배포하는 것이다.

```text
Landing

↓

6개 게임 연속 플레이

↓

6개 스탯 완성

↓

MY STATUS

↓

Radar Chart

↓

익명 사용자 기록 DB 저장

↓

GA4 행동 데이터 수집

↓

배포
```

v0.1에서는:

```text
Pet
XP
Level
Ranking
Daily Challenge
```

등의 확장 기능보다,

```text
게임 자체가 실제로 동작하는가

6개 게임 흐름이 자연스러운가

사용자 행동 데이터가 정상 수집되는가
```

를 우선 검증한다.

---

# 2. 개발 기본 전략

Brain_Pet v0.1은 다음 방식으로 개발한다.

```text
전체 UI 구조 먼저 설계

↓

와이어프레임 수준 전체 화면 구현

↓

6개 게임 기본 로직 동시 구현

↓

게임 간 연결

↓

점수 및 스탯 로직 정제

↓

최종 MVP 직전 DB 연결

↓

GA4 연결

↓

개발자 단독 테스트

↓

배포
```

---

# 3. 핵심 개발 원칙

## 3.1 빠른 MVP 완성 우선

완벽한 디자인보다:

```text
전체 Flow가 먼저 작동하는 것
```

을 우선한다.

초기 목표는:

```text
예쁘지만 일부만 동작하는 서비스
```

가 아니라:

```text
6개 게임을 처음부터 끝까지 실제로 플레이할 수 있는 서비스
```

이다.

---

## 3.2 UI 먼저, 로직은 이후

처음부터 각 게임의 세부 알고리즘을 완성하지 않는다.

먼저:

```text
Landing

↓

Game Intro

↓

Game Screen

↓

Transition

↓

Next Game

↓

Final Status
```

전체 UI 흐름을 와이어프레임 수준으로 연결한다.

그다음 실제 게임 로직을 삽입한다.

---

## 3.3 6개 게임을 동시에 기본 구현

Reaction 하나를 완벽하게 만든 후 다음 게임으로 넘어가는 방식보다:

```text
6개 게임 모두
기본적으로 플레이 가능한 상태
```

를 먼저 만든다.

목적:

```text
전체 Flow 빠른 검증

게임별 개발 난이도 조기 확인

전체 플레이 시간 확인

UI 구조 문제 조기 발견
```

---

## 3.4 DB는 후반에 연결

초기 UI 및 게임 개발 단계에서는 DB 의존도를 최소화한다.

초기에는:

```text
Mock Data

Local State

Temporary State
```

를 사용한다.

게임 전체가 정상 작동한 이후 최종 MVP 직전에 DB를 연결한다.

---

## 3.5 Web First

초기 개발은 웹 환경을 우선한다.

우선:

```text
Desktop Web
```

에서 전체 기능을 완성한다.

그다음:

```text
Responsive Web

Mobile Browser
```

를 최적화한다.

별도의 Native Mobile App은 v0.1 범위에 포함하지 않는다.

---

# 4. 문서 기준

개발 시 다음 문서를 기준으로 사용한다.

```text
기획.md
→ 서비스 전체 방향

GAME_SPEC.md
→ 6개 게임 규칙

MVP_SCOPE.md
→ 현재 구현 범위

DEVELOPMENT_PLAN.md
→ 실제 개발 순서
```

충돌 시 우선순위:

```text
현재 Scope
→ MVP_SCOPE.md

게임 규칙
→ GAME_SPEC.md

개발 순서
→ DEVELOPMENT_PLAN.md

장기 방향
→ 기획.md
```

---

# 5. 전체 개발 Phase

```text
PHASE 0
Project Setup

↓

PHASE 1
전체 Wireframe UI

↓

PHASE 2
6개 게임 기본 구현

↓

PHASE 3
게임 흐름 연결

↓

PHASE 4
Scoring / Stat

↓

PHASE 5
Final Status / Radar Chart

↓

PHASE 6
UX 정제

↓

PHASE 7
DB 연결

↓

PHASE 8
GA4 / GTM

↓

PHASE 9
Developer QA

↓

PHASE 10
Web / Mobile Optimization

↓

PHASE 11
Production Deployment
```

---

# 6. PHASE 0 — Project Setup

## 목표

개발에 필요한 기본 프로젝트 환경을 구성한다.

---

## 권장 기술

```text
Next.js

TypeScript

Tailwind CSS
```

추후:

```text
Supabase
PostgreSQL

GA4
GTM

Vercel
```

---

## 기본 구조 예시

```text
Brain_Pet/

├ docs/
│
│  ├ 기획.md
│  ├ GAME_SPEC.md
│  ├ MVP_SCOPE.md
│  └ DEVELOPMENT_PLAN.md
│
├ src/
│
│  ├ app/
│
│  ├ components/
│
│  ├ games/
│  │
│  ├ lib/
│
│  ├ config/
│
│  ├ types/
│
│  └ data/
│
└ README.md
```

문서가 현재 프로젝트 Root에 있다면 이동은 필수가 아니다.

---

## 완료 조건

```text
Next.js 정상 실행

TypeScript 설정

Tailwind 적용

기본 Routing 가능

Git 초기화

개발 서버 정상 실행
```

---

# 7. PHASE 1 — 전체 Wireframe UI

## 목표

게임 로직보다 먼저 Brain_Pet 전체 사용자 흐름을 화면으로 연결한다.

디자인 완성도가 아니라:

```text
전체 Flow 구조
```

를 검증한다.

---

# 7.1 구현 화면

최소 다음 화면을 만든다.

```text
1. Landing

2. Game Intro

3. Game Play

4. Game Complete / Transition

5. Progress

6. Final Status

7. Radar Chart
```

---

# 7.2 Landing Wireframe

필수:

```text
서비스 이름

간단한 설명

6개 능력 아이콘

예상 플레이 시간

START 버튼
```

CTA:

```text
Start
```

클릭 시 첫 게임으로 이동.

---

# 7.3 Game Intro Template

각 게임 공통 구조를 먼저 만든다.

```text
STAT ICON

게임 이름

짧은 설명

How To Play

START
```

6개 게임 모두 동일 Layout 기반으로 재사용 가능하게 한다.

---

# 7.4 Game Screen Template

공통 영역:

```text
Progress

Current Game

Round / Level

Game Area

Feedback
```

각 게임별 Game Area만 교체할 수 있도록 구조화한다.

---

# 7.5 Game Complete / Transition

각 게임 완료 후:

```text
GAME COMPLETE

현재 기록

Progress

다음 게임 CTA
```

예:

```text
1 / 6 COMPLETE

[다음 능력 확인하기]
```

---

# 7.6 Final Status Wireframe

구조:

```text
MY STATUS

Memory
Focus
Reaction
Judgment
Spatial
Reasoning

↓

Radar Chart
```

초기에는 임시 Mock Score를 사용한다.

---

# 7.7 Phase 1 완료 조건

다음 Flow를 클릭만으로 끝까지 진행할 수 있어야 한다.

```text
Landing

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

Final Status
```

아직 실제 게임 로직이 없어도 된다.

---

# 8. PHASE 2 — 6개 게임 기본 구현

## 목표

6개 게임 모두 최소한 플레이 가능한 상태로 만든다.

이 단계에서는:

```text
완벽한 점수 시스템

DB

Percentile

최종 디자인
```

은 구현하지 않는다.

---

# 8.1 Reaction

구현:

```text
Practice

Random Delay

Target Spawn

User Click

Reaction Time

False Start

Trial 반복
```

GAME_SPEC 기준:

```text
Practice 1

Real Trial 7
```

---

# 8.2 Memory

구현:

```text
Grid

Highlighted Cells

Exposure

Hide

User Selection

Submit

Correct / Incorrect

Difficulty Change
```

---

# 8.3 Focus

구현:

```text
Target Display

Distractor Grid

Target Search

Target Absent Round

User Selection

Result
```

---

# 8.4 Judgment

구현:

```text
Rule Display

Stimulus

Left / Right Choice

Rule Switch

Accuracy

Response Time
```

---

# 8.5 Spatial

구현:

```text
Reference Shape

Rotation Question

Multiple Choice

Answer Check

Difficulty
```

---

# 8.6 Reasoning

구현:

```text
Pattern Problem

Multiple Choice

Answer Check

Difficulty
```

---

# 8.7 Phase 2 우선 목표

모든 게임에서:

```text
Start

↓

Play

↓

Complete

↓

Result
```

가 가능해야 한다.

이 단계에서는 Score Formula는 임시 Interface만 있어도 된다.

---

# 8.8 완료 조건

```text
6개 게임 모두 시작 가능

게임 중 오류 없음

각 게임 완료 가능

기본 Raw Data 생성 가능

게임 상태 초기화 가능

재시작 가능
```

---

# 9. PHASE 3 — 게임 Flow 연결

## 목표

6개의 독립 게임을 하나의 연속 사용자 경험으로 연결한다.

---

## 기본 Flow

```text
Reaction Complete

↓

Transition

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

Final Status
```

---

# 9.1 Global Progress

예:

```text
1 / 6

2 / 6

3 / 6
```

또는:

```text
⚡ ✓

🧠 ✓

🎯 ●

⚖ ○

🧊 ○

🔍 ○
```

---

# 9.2 중간 이탈 고려

DB 연결 전에는 Local State 또는 Browser Storage를 임시 사용한다.

저장:

```text
currentGame

completedGames

temporaryResults
```

목적:

페이지 새로고침 시 개발 테스트 편의성 확보.

---

# 9.3 완료 조건

한 번 Start하면:

```text
6개 Game

↓

Final Result
```

까지 중간 Home 이동 없이 완주 가능해야 한다.

---

# 10. PHASE 4 — Scoring / Stat Logic

## 목표

각 게임의 Raw Data를 Game Score로 변환한다.

---

# 10.1 구조

```text
Trial Raw Data

↓

Game Aggregation

↓

Game Score

↓

Personal Best

↓

Percentile

↓

Stat
```

---

# 10.2 Score Logic 분리

경로 권장:

```text
src/lib/scoring/
```

파일:

```text
reaction.ts

memory.ts

focus.ts

judgment.ts

spatial.ts

reasoning.ts
```

---

## 예

```text
calculateReactionScore()

calculateMemoryScore()

calculateFocusScore()

calculateJudgmentScore()

calculateSpatialScore()

calculateReasoningScore()
```

UI Component 내부에서 점수 Formula를 계산하지 않는다.

---

# 10.3 Percentile

이 단계에서는 실제 사용자 분포가 없으므로:

```text
Fake Percentile 생성 금지
```

개발 상태에서는:

```text
percentile = null
```

처리 가능.

개발용 Mock Percentile을 사용할 경우 반드시:

```text
development-only
```

로 분리한다.

Production에는 노출하지 않는다.

---

# 10.4 Stat

실제 Percentile 데이터가 없을 경우 최종 UI에서는:

```text
비교 데이터 수집 중
```

또는 개발 정책에 맞는 Placeholder를 사용한다.

---

# 10.5 완료 조건

```text
모든 게임 Score 계산 가능

동일 입력 → 동일 Score

Scoring Logic UI와 분리

Unit Test 가능 구조

Game Version 관리 가능
```

---

# 11. PHASE 5 — Final Status / Radar Chart

## 목표

6개 게임 결과를 최종 화면에서 통합한다.

---

# 11.1 최종 데이터

```text
Memory

Focus

Reaction

Judgment

Spatial

Reasoning
```

---

# 11.2 화면

```text
MY STATUS

↓

6 Stat

↓

Radar Chart
```

---

# 11.3 Radar Chart Library

가벼운 Chart Library 사용 가능.

예:

```text
Recharts
```

또는 적절한 대체 Library.

불필요하게 무거운 시각화 Library는 피한다.

---

# 11.4 완료 조건

```text
6개 게임 완료 후 자동 이동

6 Stat 정상 전달

Radar Chart 렌더링

Responsive 가능

값 누락 처리
```

---

# 12. PHASE 6 — UX 정제

## 목표

기능은 모두 존재하는 상태에서 사용자 흐름을 자연스럽게 만든다.

---

# 12.1 주요 확인

```text
게임 설명 길이

Start CTA 위치

게임 간 Transition

Progress 표시

Feedback 속도

전체 플레이 시간

Game Over 느낌 여부

Final Result 도달감
```

---

# 12.2 게임성 요소

필요한 수준에서:

```text
ROUND

LEVEL

COMBO

NEW RECORD

CORRECT

MISS
```

등을 추가할 수 있다.

단:

```text
과도한 애니메이션

긴 Transition

게임 측정 방해
```

는 피한다.

---

# 12.3 디자인 수준

v0.1에서는:

```text
완전한 최종 브랜드 디자인
```

보다:

```text
일관된 기본 UI

읽기 쉬운 Typography

명확한 CTA

직관적인 Feedback
```

을 우선한다.

---

# 13. PHASE 7 — DB 연결

## 목표

최종 MVP 직전에 실제 데이터 저장 구조를 연결한다.

---

# 13.1 Backend

권장:

```text
Supabase

PostgreSQL
```

---

# 13.2 Anonymous User

로그인 없이:

```text
anonymous_user_id
```

생성.

Browser에 식별자를 저장하고 DB와 연결한다.

---

# 13.3 최소 Table

```text
anonymous_users

game_sessions

game_trials

game_results

user_stats
```

필요 시 구조 확장.

---

# 13.4 저장 시점

게임 시작:

```text
Game Session 생성
```

Trial:

```text
필요 Raw Data 저장
```

게임 완료:

```text
Game Result 저장
```

전체 완료:

```text
Final Stat 저장
```

---

# 13.5 DB 실패 처리

DB 저장 실패가 게임 진행 자체를 완전히 막지 않도록 고려한다.

예:

```text
Temporary Local Queue

Retry Save
```

MVP에서는 최소한:

```text
에러 처리

사용자 진행 보호
```

가 필요하다.

---

# 13.6 완료 조건

```text
익명 사용자 생성

6개 게임 Session 저장

Trial 저장

Game Result 저장

Completion 저장

Final Result 저장

새로고침 시 기록 불러오기 가능
```

---

# 14. PHASE 8 — GA4 / GTM

## 목표

첫 Production 배포 전에 사용자 행동 추적을 연결한다.

첫 배포 기준에는 반드시 GA4 연결이 포함된다.

---

# 14.1 기본 이벤트

```text
landing_view

game_start

game_complete

game_exit

next_game_start

all_games_complete

final_status_view
```

---

# 14.2 Properties

가능한 항목:

```text
game_id

game_order

game_version

game_score

duration

attempt_number
```

---

# 14.3 GA4에 저장하지 않을 데이터

Trial 단위 상세 Raw Data는:

```text
DB
```

에 저장한다.

GA4는:

```text
사용자 행동 분석
```

용으로 사용한다.

---

# 14.4 개인정보 원칙

다음은 GA4 Event Property로 보내지 않는다.

```text
Email

실명

직접적인 사용자 식별 정보

DB Primary Key 그대로
```

---

# 14.5 Debug

배포 전:

```text
GA4 DebugView

GTM Preview
```

등으로 이벤트를 검증한다.

---

# 14.6 완료 조건

실제 플레이 1회에서:

```text
Landing

↓

Game Start

↓

6 Game Complete

↓

Final Status
```

각 핵심 이벤트가 정상 수집되는 것을 확인한다.

---

# 15. PHASE 9 — Developer QA

## 테스트 방식

v0.1 첫 배포 전 테스트는:

```text
개발자 단독 테스트
```

로 진행한다.

외부 Closed Beta는 첫 배포 이후 단계로 미룬다.

---

# 15.1 Functional QA

확인:

```text
Landing 정상

6개 Game 정상

게임 순서 정상

Progress 정상

Result 정상

Radar Chart 정상

DB 정상

GA4 정상
```

---

# 15.2 Edge Case

확인:

```text
새로고침

뒤로가기

게임 중 이탈

빠른 연타

잘못된 클릭

시간 초과

네트워크 실패

DB 저장 실패

중복 제출

게임 재시작
```

---

# 15.3 Game QA

Reaction:

```text
False Start

Timer 정확도
```

Memory:

```text
Grid Selection

Difficulty
```

Focus:

```text
No Target

False Click
```

Judgment:

```text
Rule Switch
```

Spatial:

```text
정답 Rotation
```

Reasoning:

```text
문제 정답 정확성
```

---

# 16. PHASE 10 — Web / Mobile Optimization

## 우선순위

```text
Web First
```

후:

```text
Mobile Web
```

최적화.

---

# 16.1 Desktop

우선 확인:

```text
Chrome

Edge
```

필요 시 다른 Browser 추가.

---

# 16.2 Mobile

확인:

```text
Touch Input

Viewport

Button Size

Game Area

Reaction Timing

Orientation

Scroll 방지
```

---

# 16.3 Reaction 특별 주의

Reaction Game은:

```text
Mouse

Touch
```

입력 차이가 있으므로 Device 정보를 기록한다.

가능하면:

```text
input_type
device_type
```

저장.

---

# 17. PHASE 11 — Production Deployment

## 배포 기준

다음이 모두 완료된 이후 첫 Production 배포를 진행한다.

```text
6개 Game 정상 동작

↓

연속 Flow 정상

↓

Scoring 정상

↓

Final Stat 정상

↓

Radar Chart 정상

↓

DB 저장 정상

↓

GA4 정상

↓

Developer QA 완료

↓

Web / Mobile 기본 대응
```

---

# 17.1 Hosting

권장:

```text
Vercel
```

---

# 17.2 Production 환경

분리:

```text
Development

Production
```

환경 변수:

```text
Supabase URL

Supabase Key

GA Measurement ID

기타 설정
```

Git에 직접 노출하지 않는다.

---

# 17.3 첫 배포 후 바로 확인

Production에서 직접:

```text
처음부터 6게임 완주

DB 확인

GA4 확인

Mobile 확인

Console Error 확인
```

을 진행한다.

---

# 18. 개발 우선순위

## P0 — 반드시 먼저

```text
전체 Wireframe

6개 게임 기본 플레이

연속 Flow
```

---

## P1

```text
Game Score

Final Stat

Radar Chart
```

---

## P2

```text
UX 정제

오류 처리
```

---

## P3

```text
DB
```

---

## P4

```text
GA4
```

---

## P5

```text
Mobile Optimization

Deployment
```

단:

```text
첫 배포는 GA4 완료 이후
```

에만 진행한다.

---

# 19. 개발 중 하지 않을 것

v0.1 개발 도중 다음 기능을 발견 즉시 추가하지 않는다.

```text
Pet

Egg

XP

Level

Ranking

Daily Challenge

Shop

Inventory

Friend

Chat

Share Card

AI Feature

Complex Account
```

아이디어가 생기면:

```text
기획.md 또는 Backlog
```

에만 기록한다.

현재 개발 Scope를 변경하지 않는다.

---

# 20. Claude Code 작업 방식

Claude Code는 한 번에 전체 MVP를 구현하지 않는다.

각 Phase 단위로 작업한다.

권장 흐름:

```text
Phase 설명 전달

↓

Claude가 작업 계획 제시

↓

해당 Phase 구현

↓

실행 확인

↓

오류 수정

↓

Commit

↓

다음 Phase
```

---

# 21. 첫 Claude Code Task

첫 작업은:

```text
PHASE 0 + PHASE 1
```

까지만 진행한다.

즉:

```text
Project Setup

+

전체 Wireframe UI
```

---

## 첫 작업 범위

```text
Landing

Reaction Intro

Reaction Placeholder

Memory Intro / Placeholder

Focus Intro / Placeholder

Judgment Intro / Placeholder

Spatial Intro / Placeholder

Reasoning Intro / Placeholder

Final Status Placeholder

Radar Chart Placeholder
```

---

## 목표

아직 실제 게임 로직 없이:

```text
Landing

↓

6 Game

↓

Final Status
```

전체 Flow를 클릭으로 확인한다.

---

# 22. 첫 Claude Code 지침 예시

```text
기획.md
GAME_SPEC.md
MVP_SCOPE.md
DEVELOPMENT_PLAN.md

이 네 문서를 프로젝트 기준으로 사용해줘.

현재는 DEVELOPMENT_PLAN.md의
PHASE 0과 PHASE 1만 진행한다.

목표:
전체 서비스를 와이어프레임 수준으로 먼저 구성하고,
Landing부터 6개 게임을 거쳐 Final Status까지
클릭 가능한 전체 Flow를 만든다.

중요:
- 실제 게임 로직은 아직 구현하지 않는다.
- DB를 연결하지 않는다.
- GA4를 연결하지 않는다.
- Pet, XP, Ranking 기능을 만들지 않는다.
- 각 Game은 Placeholder 상태로 둔다.
- 향후 실제 게임 로직을 쉽게 삽입할 수 있도록 구조화한다.
- Web First로 구현한다.
- 과도한 디자인 작업은 하지 않는다.
- 구현 전 예상 파일 구조와 작업 계획을 먼저 제시한다.
```

---

# 23. Phase별 완료 체크

## Phase 0

```text
[ ] Project 실행
[ ] TypeScript
[ ] Tailwind
[ ] Git
```

## Phase 1

```text
[ ] Landing
[ ] Game Intro
[ ] 6 Game Placeholder
[ ] Progress
[ ] Final Status
[ ] Radar Placeholder
[ ] 전체 클릭 Flow
```

## Phase 2

```text
[ ] Reaction 기본 구현
[ ] Memory 기본 구현
[ ] Focus 기본 구현
[ ] Judgment 기본 구현
[ ] Spatial 기본 구현
[ ] Reasoning 기본 구현
```

## Phase 3

```text
[ ] 6 Game 연속 연결
[ ] Progress
[ ] Transition
[ ] 중간 상태 유지
```

## Phase 4

```text
[ ] 6 Score Logic
[ ] Raw → Score
[ ] Personal Best
```

## Phase 5

```text
[ ] 6 Stat
[ ] Final Result
[ ] Radar Chart
```

## Phase 6

```text
[ ] UX 정제
[ ] Feedback
[ ] Error State
```

## Phase 7

```text
[ ] Anonymous User
[ ] DB Tables
[ ] Trial Save
[ ] Result Save
```

## Phase 8

```text
[ ] GA4
[ ] GTM
[ ] Event Debug
```

## Phase 9

```text
[ ] Developer QA
[ ] Edge Cases
```

## Phase 10

```text
[ ] Desktop
[ ] Mobile Web
```

## Phase 11

```text
[ ] Production Build
[ ] Vercel
[ ] Production Test
```

---

# 24. Git 작업 권장 방식

Phase 단위 Commit을 권장한다.

예:

```text
feat: initialize Brain_Pet project

feat: add MVP wireframe flow

feat: add six game prototypes

feat: connect sequential game flow

feat: implement scoring system

feat: add final status radar chart

feat: connect anonymous database storage

feat: add GA4 tracking

fix: resolve MVP QA issues

chore: prepare production deployment
```

---

# 25. 첫 MVP 완료 정의

다음 시나리오가 실제 Production 환경에서 성공하면 v0.1 첫 배포가 완료된 것으로 본다.

```text
사용자가 사이트 방문

↓

Landing 확인

↓

Start

↓

Reaction 완료

↓

Memory 완료

↓

Focus 완료

↓

Judgment 완료

↓

Spatial 완료

↓

Reasoning 완료

↓

6개의 결과 저장

↓

최종 Stat 생성

↓

Radar Chart 표시

↓

DB 정상 저장

↓

GA4 이벤트 정상 수집
```

---

# 26. v0.1 배포 이후

첫 배포 이후 실제 사용자를 받기 시작한다.

그다음 분석:

```text
Landing → Start

Game별 Completion

Game별 Drop-off

전체 Completion

평균 플레이 시간

Final Status 도달률
```

이 데이터를 본 뒤:

```text
UI 개선

게임 난이도 수정

순서 변경

게임 길이 수정
```

등을 결정한다.

---

# 27. 이후 개발 Phase

v0.1 안정화 이후:

```text
NEXT PHASE

Egg Progress

↓

Hatching

↓

Personalized Pet
```

다음:

```text
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
Daily Challenge

↓

Ranking

↓

Retention

↓

Share
```

현재 DEVELOPMENT_PLAN에서는 위 기능을 구현하지 않는다.

---

# 28. 최종 개발 흐름 요약

```text
DOCUMENTS

↓

PROJECT SETUP

↓

WIREFRAME UI

↓

6 GAME BASIC LOGIC

↓

SEQUENTIAL FLOW

↓

SCORING

↓

6 STAT

↓

RADAR CHART

↓

UX POLISH

↓

DATABASE

↓

GA4 / GTM

↓

DEVELOPER QA

↓

WEB / MOBILE OPTIMIZATION

↓

DEPLOY

↓

REAL USER DATA

↓

ANALYSIS

↓

IMPROVEMENT
```

---

# 29. 현재 바로 시작할 작업

현재 다음 문서가 준비되어 있다.

```text
기획.md

GAME_SPEC.md

MVP_SCOPE.md

DEVELOPMENT_PLAN.md
```

따라서 다음 실제 작업은:

```text
PHASE 0
+
PHASE 1
```

이다.

즉:

```text
프로젝트 초기화

↓

전체 Wireframe UI

↓

Landing부터 Final Status까지
클릭 가능한 전체 흐름 확인
```

까지만 먼저 진행한다.

게임 세부 로직은 이 단계가 완료된 뒤 구현한다.
