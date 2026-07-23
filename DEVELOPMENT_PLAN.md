# Statling — DEVELOPMENT_PLAN

> Version: v1.0
> 목적: 현재 v0 기반 UI 코드를 출발점으로 Statling 공개 MVP v1.0을 완성하기 위한 실제 개발 순서와 단계별 완료 조건을 정의한다.
> 대상: Claude Code 및 개발 참고용
> 상태: v1.0 개발 계획 확정안

---

# 1. 현재 프로젝트 상태

현재 Statling 프로젝트에는 v0를 통해 생성된 초기 UI 코드가 존재한다.

현재 구현된 주요 화면 및 흐름:

```text
Landing

↓

Reaction UI

↓

Memory UI

↓

Focus UI

↓

Judgment UI

↓

Spatial UI

↓

Reasoning UI

↓

Stat Discovery UI

↓

MY STATUS

↓

Radar Chart
```

현재 코드는 완성된 제품이 아니라:

```text
UI Prototype
+
초기 사용자 Flow
```

단계로 간주한다.

---

# 2. 현재 코드에서 유지할 것

현재 v0 디자인의 전체 구조와 디자인 언어는 최대한 활용한다.

유지:

```text
Cream 계열 배경

Brown 계열 Outline

Orange Main Accent

6개 Stat별 고유 색상

둥근 UI

Casual Game 느낌

Landing 기본 구조

Game Progress 구조

Stat Discovery 구조

MY STATUS 구조

Radar Chart 구조
```

---

# 3. 현재 코드에서 개선할 것

현재 UI를 그대로 확정하지 않는다.

다음 요소를 개선한다.

```text
너무 강한 Outline

강한 Offset Shadow

과도한 빈 공간

한국어 줄바꿈 오류

Statling 세계관 부족

Test Site처럼 보이는 일부 UI

Raw Record / Final Stat 혼용

MY STATUS 이후 Flow 부재
```

전체 목표:

```text
현재 디자인 60~70% 유지

+

더 편안하고 아기자기한
Casual Pet Game UI
```

---

# 4. 개발 최종 목표

Statling v1.0의 전체 Flow:

```text
Landing

↓

Anonymous User 생성

↓

6개 Sequential Games

↓

6 Stat Discovery

↓

MY STATUS

↓

Radar Chart

↓

Egg

↓

Hatch

↓

Statling Reveal

↓

Save / Share

↓

Login / Signup

↓

Naming

↓

Statling Room

↓

Care

↓

Grow

↓

Free Play

↓

Game Record Update

↓

XP

↓

Return to Room
```

---

# 5. 전체 개발 전략

기본 개발 순서:

```text
현재 코드 분석

↓

전체 v1.0 UI Flow 연결

↓

6개 Game 기본 Logic

↓

Score / Stat

↓

Egg / Hatch / Statling

↓

DB / Anonymous User

↓

Login / Signup

↓

Room

↓

Care

↓

Free Play

↓

XP

↓

History

↓

QA

↓

Closed Beta

↓

GA4 / GTM

↓

Production
```

---

# 6. 핵심 개발 원칙

## 6.1 빠른 MVP 우선

완벽한 기능보다:

```text
End-to-End Flow
```

를 먼저 완성한다.

첫 목표:

```text
Landing에서 시작해서

Room까지

끊김 없이 도달 가능
```

하도록 만드는 것.

---

# 6.2 UI 전체 Flow를 먼저 연결

본격적인 세부 로직 구현 전에:

```text
MY STATUS

↓

Egg

↓

Hatch

↓

Statling Reveal

↓

Login

↓

Naming

↓

Room

↓

Grow

↓

Free Play
```

까지 Placeholder 기반으로 연결한다.

---

# 6.3 기존 코드 재사용

v0 코드를 무조건 다시 작성하지 않는다.

먼저:

```text
현재 Component 구조 분석

재사용 가능 Component 확인

중복 확인

Route 구조 확인
```

후 필요한 부분만 수정한다.

---

# 6.4 Scope 밖 기능을 선제 구현하지 않는다

다음 기능은 v1.0 필수 아님.

```text
Evolution

Shop

Inventory

Furniture Editing

Friend

Guild

Chat

Season Ranking

AI Conversation

KakaoTalk Analysis

Complex Theme System
```

---

# 7. PHASE 0 — 현재 코드 Audit

## 목표

Claude Code가 기존 v0 코드를 이해한 뒤 수정하도록 한다.

바로 대규모 리팩터링하지 않는다.

---

## 확인 항목

```text
현재 Route

Component 구조

State 구조

6개 Game Placeholder 구조

Radar Chart

Responsive 상태

사용 Package

CSS / Tailwind 구조

중복 Component

Hardcoded Data
```

---

## 산출물

Claude Code는 먼저 다음을 보고한다.

```text
현재 구현된 화면

재사용 가능한 Component

수정 필요한 구조

삭제하면 안 되는 파일

기술적 위험 요소

추천 작업 순서
```

---

## 완료 조건

현재 코드를 이해하지 않은 상태에서 구현을 시작하지 않는다.

---

# 8. PHASE 1 — v1.0 전체 UI Flow 연결

## 목표

실제 기능 구현 전에 v1.0 전체 화면을 클릭 가능한 상태로 만든다.

---

## 기존 화면

```text
Landing

6 Game Screen

Stat Discovery

MY STATUS
```

---

## 신규 화면

```text
Egg State

Hatch

Statling Reveal

Save / Share

Login / Signup

Naming

Room

My Stats

Ranking Placeholder

My Page

Theme Placeholder

Grow

Free Play Selection
```

---

## 전체 클릭 Flow

```text
Landing

↓

6 Games Placeholder

↓

MY STATUS

↓

Meet My Statling

↓

Egg

↓

Hatch

↓

Reveal

↓

Save / Login

↓

Naming

↓

Room

↓

Grow

↓

Free Play

↓

Game

↓

Room
```

---

## 완료 조건

실제 Game Logic이나 DB 없이도 전체 Flow를 클릭으로 확인 가능해야 한다.

---

# 9. PHASE 2 — 디자인 정제

## 목표

현재 v0 UI를 Statling의 브랜드에 맞게 다듬는다.

---

## 수정 방향

```text
Outline 조금 얇게

Shadow 강도 완화

Pastel Tone 보조색

한국어 Typography 개선

과도한 빈 공간 정리

작은 World 요소 추가

Game Screen은 상대적으로 Clean 유지
```

---

## 특히 수정할 항목

### Stat Discovery

기존:

```text
좋아요!
순발력 스탯을 발견했어요.
```

권장:

```text
✨ 새로운 스탯 발견!

⚡ 순발력

이번 기록
205 ms

1 / 6 발견
```

---

### 한국어 줄바꿈

금지:

```text
순발력 스
탯
```

한국어 단어 중간 줄바꿈을 방지한다.

---

### Landing

다음을 더 명확하게 노출:

```text
6개의 게임

↓

6개의 스탯

↓

나만의 Statling 탄생
```

---

# 10. PHASE 3 — 6개 Game 기본 Logic

## 목표

6개 게임을 실제 플레이 가능한 상태로 만든다.

---

# 10.1 개발 방식

기본 전략:

```text
6개 게임 모두 기본 구현
```

을 우선한다.

이유:

```text
전체 Flow 빠른 검증

전체 플레이 시간 확인

난이도 비교

개발 난이도 조기 파악
```

---

## 안전장치

다음 문제가 발생하면:

```text
공통 State 구조가 불안정

게임별 버그가 동시에 증가

Scoring Logic 충돌

개발 복잡성 급증
```

개발 방식을:

```text
Reaction 완성

↓

공통 구조 검증

↓

나머지 5개 순차 구현
```

으로 변경할 수 있다.

즉:

```text
기본 전략 = 6개 동시 기본 구현

Fallback = Reaction 우선 안정화
```

---

# 11. Game 구현 목록

## Reaction

```text
Random Delay

Target Spawn

Reaction Time

False Start

Multiple Trials
```

---

## Memory

```text
Grid

Highlight

Hide

Recall

Difficulty
```

---

## Focus

```text
Target

Distractor

Target Absent

Accuracy

Response Time
```

---

## Judgment

```text
Rule

Choice

Rule Switch

Accuracy

Response Time
```

---

## Spatial

```text
Shape

Rotation

Multiple Choice

Difficulty
```

---

## Reasoning

```text
Pattern

Rule

Multiple Choice

Difficulty
```

세부 규칙은:

```text
GAME_SPEC.md
```

를 우선한다.

---

# 12. PHASE 4 — Raw Record / Score / Stat

## 목표

현재 UI에서 혼용되는:

```text
ms

LV

pts
```

문제를 명확히 분리한다.

---

# 12.1 구조

```text
Raw Record

↓

Game Score

↓

Percentile

↓

Final Stat
```

---

## Raw Record

게임별 고유 단위 사용 가능.

```text
Reaction
205ms

Memory
Level 8

Focus
Accuracy 92%

Spatial
9/12
```

---

## Final Stat

```text
0~100
```

동일 Scale.

MY STATUS와 Radar Chart에서는 Final Stat만 사용한다.

---

# 12.2 Score 함수 분리

```text
src/lib/scoring/
```

권장:

```text
reaction.ts

memory.ts

focus.ts

judgment.ts

spatial.ts

reasoning.ts
```

---

# 12.3 Percentile

실제 사용자 데이터가 부족한 상태에서:

```text
Fake Percentile 금지
```

초기에는:

```text
비교 데이터 수집 중
```

표시 가능.

---

# 13. PHASE 5 — Egg / Hatch / Reveal

## 목표

Statling 서비스의 핵심 감정 보상을 구현한다.

---

## Flow

```text
MY STATUS

↓

나의 Statling 만나러 가기

↓

Egg Idle

↓

Egg Move

↓

Crack

↓

HATCH

↓

Statling Reveal
```

---

## Hatch 길이

약:

```text
3~5초
```

권장.

Skip 가능성은 추후 검토.

---

# 14. PHASE 6 — Statling Character System

## 목표

처음에는 대표 1종으로 시스템을 구현하고 이후 확장 가능한 구조를 만든다.

---

# 14.1 초기 전략

```text
대표 Statling 1종

↓

Character System 정상 동작 검증

↓

6개 Primary Type

↓

향후 다수 Species 확장
```

---

# 14.2 중요한 구조 원칙

Statling을:

```text
6종 고정 시스템
```

으로 설계하지 않는다.

향후:

```text
수십 종

수백 종
```

까지 확장할 수 있어야 한다.

---

## 데이터 구조 예시

```text
species_id

species_name

base_asset

primary_stat_affinity

rarity

available_variations
```

---

## User Statling

```text
user_statling_id

species_id

primary_stat

name

created_at

current_state
```

---

# 14.3 v1.0 Type

Primary Stat 기준:

```text
Reaction

Memory

Focus

Judgment

Spatial

Reasoning
```

6개 기본 타입 가능.

하지만:

```text
Type
≠
Species
```

로 설계한다.

즉 하나의 Type에 향후 여러 Species가 들어갈 수 있도록 한다.

예:

```text
Focus Type

├ Species A
├ Species B
├ Species C
└ ...
```

이 구조를 권장한다.

---

# 15. PHASE 7 — Anonymous DB 연결

## 목표

게임 기록과 Hatch 결과를 실제 DB에 저장한다.

DB를 프로젝트 마지막까지 미루지 않는다.

Egg/Hatch와 Login 개발 이전에 기본 구조를 연결한다.

---

## 권장

```text
Supabase

PostgreSQL
```

---

# 15.1 저장 시작 시점

Landing 최초 진입:

```text
Anonymous ID 생성
```

게임 플레이 중:

```text
Game Session

Trial

Result
```

저장.

---

## 이유

사용자가:

```text
6게임 도중 이탈

새로고침

네트워크 오류
```

가 발생해도 기록 보호.

---

# 15.2 최소 Table

```text
users

anonymous_sessions

game_sessions

game_trials

game_results

user_stats

statlings

statling_states

xp_history
```

구체적인 Schema는 구현 전 별도 설계.

---

# 16. PHASE 8 — Auth

## 목표

부화 후 자연스럽게 계정 저장을 유도한다.

---

# 16.1 로그인 시점

```text
Hatch

↓

Statling Reveal

↓

"이 아이를 잃어버리지 않도록 저장할까요?"

↓

Login / Signup
```

---

# 16.2 로그인 방식

v1.0:

```text
Google OAuth

+

Email / Password
```

둘 다 지원.

---

## 이유

Google 계정을 사용하지 않거나 OAuth를 원하지 않는 사용자를 고려한다.

---

# 16.3 Flow

```text
Anonymous User

↓

Sign Up / Login

↓

Authenticated User

↓

Anonymous Data 연결

↓

Statling 유지

↓

Room
```

---

# 16.4 로그인 Skip

로그인을 강제하지 않는다.

```text
나중에 하기
```

가능.

단 익명 사용자 데이터 유실 가능성에 대한 안내를 제공할 수 있다.

---

# 17. PHASE 9 — Naming

## 목표

Statling 부화 후 애착 형성.

---

## Flow

```text
Statling Reveal

↓

Save / Login

↓

Naming

↓

Room
```

---

## 기능

```text
이름 입력

길이 제한

금칙어 기본 검증

저장
```

---

# 18. PHASE 10 — Statling Room

## 목표

부화 후 서비스의 메인 Home을 구현한다.

---

## 기본 구조

```text
Left Navigation

+

Statling Room

+

Status

+

Care Actions

+

Grow CTA
```

---

# 18.1 Navigation

```text
홈

내 스탯

랭킹

마이페이지

테마
```

---

## 실제 기능

```text
홈

내 스탯

마이페이지
```

---

## Placeholder 가능

```text
랭킹

테마
```

---

# 19. PHASE 11 — Pet State

v1.0 상태:

```text
포만감

청결도

애정도
```

---

# 19.1 감소 로직

v1.0에서는:

```text
시간 기반 자동 감소
```

를 구현하지 않는다.

초기에는:

```text
Interaction을 통한 증가
```

중심.

---

## 이유

실시간 다마고치 State 감소는:

```text
시간 계산

Offline 처리

Timezone

재접속

Balance

Notification
```

등 복잡도가 높음.

후속 버전으로 이동.

---

# 20. PHASE 12 — Care Actions

## v1.0 실제 작동

동시에 기본 구현:

```text
밥 주기

놀아주기

쓰다듬기
```

---

## 결과

### 밥

```text
포만감 증가
```

### 놀기

```text
애정도 증가
```

### 쓰다듬기

```text
애정도 증가
```

---

# 20.1 UI 표시

다음 메뉴도 Front에는 표시:

```text
샤워

청소하기

대화하기
```

---

## 샤워 / 청소

초기:

```text
준비 중
```

또는 단순 UI Feedback.

---

# 21. PHASE 13 — 대화하기

v1.0에서는 단순 구현.

---

## 방식

사용자가 짧은 말을 입력.

예:

```text
오늘도 귀여워

잘했어

같이 놀자
```

---

## 결과

```text
애정도 +1
```

---

## 제한

v1.0에서는:

```text
AI 의미 분석 X

감정 분석 X

KakaoTalk 연동 X
```

---

# 22. PHASE 14 — Grow / Free Play

## 목표

Room에서 실제 게임으로 다시 연결한다.

---

## Flow

```text
Room

↓

성장시키기

↓

6 Game Selection

↓

Game

↓

Result

↓

Record Update

↓

XP

↓

Room
```

---

# 23. Free Play

6개 게임 개별 선택.

```text
Reaction

Memory

Focus

Judgment

Spatial

Reasoning
```

---

## 각 카드

```text
Stat Icon

Game Name

Personal Best

Recent Record

Recommended Badge
```

---

# 24. Statling Recommended Game

Statling이 원하는 게임 하나를 표시한다.

예:

```text
🧠 MEMORY

오늘 이 게임이 하고 싶어!

EXP ×1.5
```

---

## UI

추천 게임은:

```text
다른 Border

Glow

Badge

Statling Icon

색상 강조
```

등으로 명확히 구분.

---

# 24.1 추천 알고리즘

v1.0에서는 복잡하게 하지 않는다.

예:

```text
Daily Random

또는

Lowest Stat

또는

간단 Rule
```

세부 규칙은 별도 결정 가능.

임의로 AI 추천 시스템을 구현하지 않는다.

---

# 25. PHASE 15 — XP

## v1.0 범위

구현:

```text
Game Complete XP

Recommended Game ×1.5

Total XP
```

---

## 아직 구현하지 않아도 되는 것

```text
Complex Level Curve

Evolution

XP Ranking

Season XP

Skill Tree
```

---

# 25.1 기본 Flow

```text
Game Complete

↓

Base XP

↓

추천 게임 여부 확인

↓

Normal
×1.0

Recommended
×1.5

↓

Total XP Update
```

---

# 25.2 XP History

가능하면:

```text
xp_history
```

에 저장.

```text
user

game

base_xp

multiplier

final_xp

created_at
```

---

# 26. PHASE 16 — Record / History

## 목표

사용자의 성장 데이터를 축적한다.

---

## 저장

각 Attempt:

```text
Date

Game

Raw Record

Game Score

Stat

Personal Best 여부
```

---

## 신기록

```text
NEW RECORD
```

표시.

---

## 최고 기록

기존보다 좋은 기록일 때만 갱신.

하지만 과거 기록은 삭제하지 않는다.

---

# 26.1 향후 분석

```text
Before / After

Growth Trend

Day-by-Day

Retry Effect

Pet Request Effect
```

가능하도록 설계.

---

# 27. PHASE 17 — My Stats

## 화면

```text
Radar Chart

6 Final Stats

Personal Best

Latest Record

History
```

---

## v1.0

간단한 기록 리스트 또는 Trend만 구현 가능.

복잡한 Analytics Dashboard는 제외.

---

# 28. PHASE 18 — Ranking Placeholder

Navigation에는:

```text
랭킹
```

표시.

---

## v1.0

실제 Ranking Backend 없음.

예:

```text
🏆 랭킹

더 많은 Statling이 모이면
랭킹이 열려요.

Coming Soon
```

---

# 29. PHASE 19 — Theme Placeholder

Navigation:

```text
테마
```

표시 가능.

실제 테마 변경 기능은 후속.

---

# 30. PHASE 20 — Share

Statling Reveal에서:

```text
공유하기
```

표시.

---

## v1.0 최소 구현 후보

Web Share API 가능 시:

```text
기본 링크 공유
```

지원.

지원하지 않는 브라우저:

```text
링크 복사
```

---

## 향후

```text
MY STATUS

Radar

Statling

Type
```

이 포함된 Share Card 생성.

---

# 31. PHASE 21 — Developer QA

개발자 단독 테스트.

---

## 전체 Flow

```text
Landing

→ 6 Game

→ MY STATUS

→ Hatch

→ Login

→ Naming

→ Room

→ Care

→ Grow

→ Free Play

→ XP

→ Record
```

---

## Edge Cases

```text
새로고침

뒤로가기

게임 중 이탈

로그인 취소

Anonymous 유지

중복 Hatch

중복 Naming

DB 실패

Network 실패

Duplicate XP

Duplicate Result

Mobile
```

---

# 32. PHASE 22 — Closed Beta

Production 공개 전:

```text
지인 5~10명
```

대상.

---

## 확인 질문

```text
서비스를 설명 없이 이해했는가?

6게임이 너무 긴가?

어느 게임에서 지루했는가?

Statling을 만나고 싶어서 끝까지 했는가?

Hatch가 만족스러웠는가?

로그인 시점이 자연스러운가?

Room에서 무엇을 해야 할지 이해되는가?

다시 게임하고 싶은가?

Statling에 애착이 생기는가?
```

---

# 32.1 Beta 측정

가능하면:

```text
Completion

시간

이탈 지점

버그

정성 피드백
```

수집.

---

# 33. PHASE 23 — Beta 수정

Closed Beta 결과에 따라:

```text
Game Length

Difficulty

UI

Copy

Login Timing

Hatch

Room

Care
```

수정.

---

# 34. PHASE 24 — GA4 / GTM

핵심 기능이 완성되고 Beta 수정 이후 연결한다.

---

## 이유

UI와 Flow가 계속 바뀌는 동안 Analytics를 먼저 깊게 연결하면:

```text
Event 수정

중복 Event

Naming 불일치
```

가 발생할 수 있음.

---

# 34.1 하지만 개발 중 Event Plan은 유지

미리 정의:

```text
landing_view

first_game_start

game_start

game_complete

stat_discovered

all_stats_complete

status_view

hatch_start

statling_hatched

share_click

signup_start

signup_complete

statling_named

room_view

care_action

grow_click

free_game_start

new_record

xp_earned
```

---

# 35. PHASE 25 — Production Deploy

배포 기준:

```text
Core Flow 정상

6 Games 정상

DB 정상

Auth 정상

Hatch 정상

Room 정상

Care 정상

Free Play 정상

XP 정상

Record 정상

Closed Beta 수정 완료

GA4 정상

Mobile 기본 대응
```

---

# 36. 권장 기술 스택

## Frontend

```text
Next.js

TypeScript

Tailwind CSS
```

현재 v0 코드 기반 유지.

---

## Backend

```text
Supabase

PostgreSQL
```

---

## Auth

```text
Supabase Auth

Google OAuth

Email / Password
```

---

## Analytics

```text
GA4

GTM
```

---

## Deploy

```text
Vercel
```

---

# 37. 구현 우선순위

## P0

```text
현재 코드 Audit

v1.0 전체 UI Flow

6개 Game Logic
```

---

## P1

```text
Score

Stat

MY STATUS

Hatch
```

---

## P2

```text
DB

Anonymous User

Auth

Naming
```

---

## P3

```text
Room

Care

Grow

Free Play
```

---

## P4

```text
XP

Record History

My Stats
```

---

## P5

```text
Share

Ranking Placeholder

Theme Placeholder
```

---

## P6

```text
QA

Closed Beta

GA4

Deploy
```

---

# 38. Git 개발 방식

`main`에서 모든 작업을 직접 하지 않는 것을 권장한다.

---

## Branch 예시

```text
main

↓

develop/v1.0
```

기능 단위 필요 시:

```text
feature/full-flow

feature/game-logic

feature/hatch

feature/auth

feature/room

feature/free-play
```

---

# 38.1 빠른 MVP를 위한 현실적 방식

너무 많은 Branch 관리가 부담이라면:

```text
main

↓

develop/v1.0
```

하나에서 Phase별 Commit 후,

안정 시:

```text
Pull Request
→ main
```

방식도 가능.

---

# 39. Commit 기준

예:

```text
refactor: Statling v1.0 UI 구조 정리

feat: v1.0 전체 화면 플로우 추가

feat: 6개 미니게임 기본 로직 구현

feat: 게임 점수 및 스탯 계산 구조 추가

feat: Statling 부화 플로우 구현

feat: 익명 사용자 데이터 저장 연결

feat: Google 및 이메일 로그인 추가

feat: Statling 이름 설정 기능 추가

feat: Statling Room 구현

feat: 기본 돌보기 기능 구현

feat: 자유 플레이 및 추천 게임 추가

feat: 게임 경험치 시스템 추가

feat: 날짜별 플레이 기록 저장

test: v1.0 사용자 흐름 QA

feat: GA4 이벤트 추적 추가
```

---

# 40. Claude Code 작업 방식

Claude Code에게:

```text
"v1.0 전체 구현해줘"
```

라고 한 번에 요청하지 않는다.

---

## 권장

```text
Phase 하나 지정

↓

현재 코드 분석

↓

작업 계획

↓

검토

↓

구현

↓

로컬 실행

↓

QA

↓

Commit

↓

다음 Phase
```

---

# 41. Claude Code 첫 작업

현재 가장 먼저 해야 할 작업:

```text
PHASE 0
+
PHASE 1
```

---

## 목표

```text
현재 v0 코드 분석

+

현재 화면을 최대한 유지하면서

MY STATUS 이후

Egg
Hatch
Reveal
Login
Naming
Room
Grow
Free Play

까지 Placeholder Flow 연결
```

---

## 아직 구현 금지

```text
실제 DB

실제 Auth

실제 XP

실제 Care Logic

실제 Ranking

실제 Theme

AI

KakaoTalk
```

---

# 42. 첫 Claude Code 요청 범위

Claude Code는 먼저:

```text
1. 기획.md

2. GAME_SPEC.md

3. MVP_SCOPE.md

4. DEVELOPMENT_PLAN.md

5. 현재 실제 코드
```

를 모두 확인한다.

---

## 먼저 보고할 것

```text
현재 구현 상태

기획과 코드 차이

재사용 가능한 Component

필요한 신규 Route

권장 Component 구조

PHASE 0~1 작업 목록

위험 요소
```

이후 사용자 승인 후 구현.

---

# 43. 개발 완료 판단 기준

Statling v1.0은 단순히:

```text
6개 테스트가 작동한다
```

로 완료되지 않는다.

다음 루프가 연결되어야 한다.

```text
DISCOVER

↓

HATCH

↓

CARE

↓

GROW

↓

PLAY AGAIN
```

이 루프가 Statling의 핵심 제품 구조다.

---

# 44. 최종 개발 Flow 요약

```text
CURRENT V0 UI

↓

CODE AUDIT

↓

FULL V1 UI FLOW

↓

6 GAME LOGIC

↓

SCORING / STAT

↓

HATCH

↓

DATABASE

↓

AUTH

↓

NAMING

↓

ROOM

↓

CARE

↓

GROW

↓

FREE PLAY

↓

XP

↓

RECORD HISTORY

↓

MY STATS

↓

QA

↓

CLOSED BETA

↓

IMPROVEMENT

↓

GA4 / GTM

↓

PRODUCTION
```

---

# 45. 가장 중요한 원칙

개발 과정에서 기능이 늘어날 때 항상 묻는다.

```text
이 기능이

"내 스탯으로 태어난 Statling과
함께 성장한다"

는 핵심 경험을 강화하는가?
```

아니라면 v1.0에서 제외하거나 Backlog로 이동한다.
