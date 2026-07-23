# Statling — MVP_SCOPE

> Version: v1.0
> 목적: Statling의 첫 공개 MVP에서 반드시 구현할 기능과 후속 버전으로 미룰 기능을 명확히 구분한다.
> 대상: Claude Code 및 개발 참고용
> 상태: v1.0 범위 확정안

---

# 1. 서비스 한 줄 정의

Statling은 6개의 짧은 미니게임으로 사용자의 수행 스탯을 발견하고, 그 결과를 바탕으로 자신만의 작은 펫을 부화시킨 뒤 함께 성장시키는 웹 기반 캐주얼 육성 게임 서비스다.

핵심 경험:

```text
PLAY
↓
DISCOVER STATS
↓
MY STATUS
↓
HATCH
↓
MEET MY STATLING
↓
CARE
↓
GROW
↓
REPLAY
```

---

# 2. v1.0 핵심 목표

Statling v1.0은 단순한 능력 테스트 사이트가 아니라 다음 경험까지 완성하는 것을 목표로 한다.

```text
6개 게임 플레이
↓
6개 스탯 발견
↓
MY STATUS 완성
↓
Statling 부화
↓
로그인 / 저장
↓
이름 짓기
↓
Statling Room
↓
기본 돌보기
↓
성장시키기
↓
6개 게임 자유 플레이
```

사용자는 첫 방문에서 자신의 능력을 발견하고, 그 결과로 탄생한 Statling에 애착을 느낀 뒤 다시 게임을 플레이할 이유를 가져야 한다.

---

# 3. 첫 방문 사용자 흐름

```text
Landing
↓
익명 사용자 생성
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
MY STATUS
↓
Radar Chart
↓
Egg Reaction
↓
Hatch
↓
Statling Reveal
↓
공유 / 저장 CTA
↓
로그인 유도
↓
익명 기록을 계정에 연결
↓
Statling 이름 짓기
↓
Statling Room
```

첫 6개 게임은 사용자가 선택하지 않고 순서대로 자연스럽게 이어진다.

---

# 4. 6개 스탯

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

---

# 5. 첫 게임 순서

```text
1. Reaction
2. Memory
3. Focus
4. Judgment
5. Spatial
6. Reasoning
```

첫 방문에서는 위 순서대로 진행한다.

Statling 부화 이후에는 원하는 게임을 자유롭게 선택할 수 있다.

---

# 6. 게임 결과 구조

게임 결과는 다음 3단계를 구분한다.

```text
RAW RECORD
↓
GAME SCORE
↓
FINAL STAT
```

## RAW RECORD

각 게임에서 실제로 측정한 기록.

예:

```text
Reaction
205 ms

Memory
Level 8

Focus
Accuracy 92%

Spatial
9 / 12 correct
```

게임마다 단위가 달라도 된다.

---

## GAME SCORE

각 게임 내부에서 비교 및 기록 갱신을 위해 계산되는 점수.

게임별 계산 방식은 `GAME_SPEC.md`를 따른다.

---

## FINAL STAT

최종 MY STATUS에서는 6개의 스탯을 동일한 척도로 표현한다.

```text
0 ~ 100
```

최종적으로는 사용자 분포 기반 Percentile을 활용한다.

게임별 Raw Record 단위를 직접 Radar Chart에 사용하지 않는다.

---

# 7. 스탯 발견 화면

각 게임을 완료하면 단순 완료가 아니라:

```text
새로운 스탯 발견!
```

이라는 수집 경험으로 표현한다.

예:

```text
✨ 새로운 스탯 발견!

⚡
순발력

이번 기록
205 ms

1 / 6 발견

[다음: 기억력]
```

사용 문구:

```text
발견했어요
새로운 스탯 발견
```

사용하지 않는 문구:

```text
테스트 완료
검사 완료
측정 완료
```

---

# 8. MY STATUS

6개의 게임을 모두 완료하면:

```text
MY STATUS

Memory
Focus
Reaction
Judgment
Spatial
Reasoning

Radar Chart
```

를 보여준다.

최초 완료 시 메인 CTA는:

```text
나의 Statling 만나러 가기
```

로 한다.

`다시 하기`는 Secondary CTA로 둔다.

---

# 9. Egg / Hatch

MY STATUS 이후 별도의 부화 Flow를 제공한다.

```text
MY STATUS
↓
알이 반응하기 시작함
↓
나의 Statling 만나러 가기
↓
Egg Idle
↓
Egg Move
↓
Egg Crack
↓
HATCH
↓
Statling Reveal
```

부화 연출은 길지 않게 약 3~5초 수준으로 설계한다.

---

# 10. Statling 기본 구조

Statling은 반드시:

```text
사람 형태가 아닌
작은 펫 / 판타지 생명체
```

로 디자인한다.

금지:

```text
Human Character
Chibi Human
사람 몸 + 동물 귀 형태
```

---

# 11. Statling 타입

v1.0에서는 가장 높은 Final Stat을 기준으로 기본 Type을 결정한다.

```text
Reaction Type
Memory Type
Focus Type
Judgment Type
Spatial Type
Reasoning Type
```

총 6개 기본 Type.

향후에는:

```text
1위 스탯
+
2위 스탯
+
전체 스탯 조합
```

을 활용한 더 정교한 개인화로 확장한다.

v1.0에서는 우선 Primary Stat 기반 개인화를 사용한다.

---

# 12. Statling Reveal

부화 이후:

```text
✨ HATCH!

나의 Statling이 태어났어요!

[Statling]

당신의 가장 강한 스탯은
집중력이에요.

집중력 타입 Statling이
당신을 만나러 왔어요.
```

CTA:

```text
저장하기
공유하기
우리 방으로 가기
```

공유 기능이 완전히 구현되지 않은 경우에도 공유 CTA UI는 표시할 수 있다.

---

# 13. 로그인 및 저장 시점

첫 6개 게임은 로그인 없이 진행한다.

```text
Landing
↓
Anonymous User
↓
6 Games
↓
MY STATUS
↓
Hatch
```

Statling 부화 직후 자연스럽게 로그인을 유도한다.

추천 문구:

```text
이 아이를 잃어버리지 않도록
저장해둘까요?
```

CTA:

```text
Google로 저장하기
나중에 하기
```

로그인 성공 시:

```text
Anonymous User Data
↓
Authenticated User
```

로 기존 기록을 연결한다.

---

# 14. Statling Naming

로그인 또는 저장 이후 Statling에게 이름을 지을 수 있다.

```text
이 친구에게 이름을 지어주세요.

[ 이름 입력 ]

[ 이름 정하기 ]
```

이름은 이후 Room에서 표시한다.

---

# 15. Statling Room

부화 이후 핵심 홈 화면은 Statling Room이다.

스타일:

```text
아기자기한 2D 육성 게임 Room

Statling이 중앙

작은 가구와 생활 요소

따뜻하고 편안한 디자인
```

예:

```text
창문
러그
쿠션
작은 침대
화분
책
장식품
```

Statling이 가장 중요한 중심 요소여야 한다.

---

# 16. Room 기본 UI

왼쪽 Navigation:

```text
🏠 홈

📊 내 스탯

🏆 랭킹

👤 마이페이지

🎨 테마 변경
```

---

## 홈

```text
Statling Room

Statling

기본 상태 수치

돌보기 Action

성장시키기
```

---

## 내 스탯

```text
Radar Chart

현재 6개 Stat

개인 최고 기록

날짜별 기록 변화
```

---

## 랭킹

v1.0에서는:

```text
UI만 표시
```

실제 랭킹 로직은 구현하지 않아도 된다.

예:

```text
랭킹 기능 준비 중
```

---

## 마이페이지

```text
로그인 상태

계정 정보

로그아웃

기록 저장 상태
```

---

## 테마 변경

v1.0에서는:

```text
Navigation UI는 표시 가능
```

실제 Theme 변경 기능은 후속 버전으로 미뤄도 된다.

---

# 17. Statling 상태 수치

v1.0에서는 다음 3개 상태를 사용한다.

```text
포만감

청결도

애정도
```

예:

```text
🍎 포만감   72

✨ 청결도   81

💗 애정도   65
```

---

# 18. 돌보기 기능

Room 하단에 다음 Action을 노출한다.

```text
밥 주기

샤워

청소하기

놀아주기

쓰다듬기

대화하기
```

---

# 19. v1.0에서 실제 작동할 돌보기 기능

우선 실제 작동:

```text
밥 주기

쓰다듬기

놀아주기
```

예:

```text
밥 주기
→ 포만감 증가

쓰다듬기
→ 애정도 증가

놀아주기
→ 애정도 증가
```

---

# 20. UI만 표시 가능한 돌보기 기능

다음 기능은 버튼/UI는 보여주되 실제 로직은 후속 개발 가능.

```text
샤워

청소하기
```

예:

```text
준비 중
```

또는 UI 상호작용만 제공.

---

# 21. 대화하기

v1.0에서는 단순한 형태로 구현한다.

사용자가 짧은 애정 표현을 입력할 수 있다.

예:

```text
"오늘도 귀여워!"

"잘했어!"

"같이 놀자."
```

결과:

```text
애정도 +1
```

복잡한 AI 분석은 하지 않는다.

---

## 향후 확장

향후 별도 기능으로:

```text
사용자가 본인 카카오톡 대화 데이터 업로드
↓
말투 / 표현 패턴 분석
↓
Statling 대화 스타일 개인화
```

를 검토할 수 있다.

v1.0에서는 구현하지 않는다.

개인정보 및 제3자 대화 데이터 문제를 별도 검토해야 한다.

---

# 22. 성장시키기

Room의 핵심 CTA:

```text
성장시키기
```

클릭 시:

```text
6개 게임 선택 화면
```

으로 이동한다.

---

# 23. Free Play

Statling 부화 이후에는 원하는 게임을 자유롭게 선택할 수 있다.

```text
순발력

기억력

집중력

판단력

공간감각

추리력
```

각 카드:

```text
아이콘

스탯 이름

현재 최고 기록

최근 기록
```

---

# 24. Statling 추천 게임

Statling은 자연스럽게 특정 게임을 원할 수 있다.

예:

```text
🧠 기억력

Statling이 지금
이 게임을 하고 싶어 해요!

BONUS
EXP ×1.5
```

시각적 표현:

```text
특별 색상

반짝임

Bonus Badge

Statling Icon
```

등을 사용할 수 있다.

---

# 25. 경험치

v1.0에서는 성장시키기 Flow에 경험치 개념을 고려한다.

기본:

```text
Game Complete
→ EXP 획득
```

Statling 추천 게임:

```text
EXP ×1.5
```

단:

```text
복잡한 Level Curve
진화 시스템
랭킹용 Total XP
```

까지는 v1.0 필수 범위가 아니다.

최소한의 EXP 구조만 구현 가능.

---

# 26. 게임 재도전 및 기록 갱신

각 게임 재도전 시:

```text
Current Record

Personal Best
```

를 비교한다.

신기록이면:

```text
NEW RECORD
```

으로 갱신한다.

---

# 27. 기록 이력

단순 최고 기록만 저장하지 않는다.

날짜별 기록을 저장한다.

예:

```text
2026-07-20
Reaction
231ms

2026-07-23
Reaction
219ms

2026-07-27
Reaction
205ms
```

이를 통해 향후:

```text
Before / After

Growth Trend

Personal Analytics
```

가 가능해야 한다.

---

# 28. 내 스탯 화면

최소:

```text
Radar Chart

6개 현재 Stat

게임별 개인 최고 기록

최근 기록

날짜별 변화
```

를 보여줄 수 있는 구조로 설계한다.

v1.0에서 상세 그래프는 단순화 가능하다.

---

# 29. 랭킹

Navigation에:

```text
🏆 랭킹
```

탭은 존재한다.

v1.0에서는 실제 랭킹 계산 및 경쟁 기능은 후순위.

가능한 화면:

```text
랭킹 기능 준비 중

더 많은 Statling이 모이면
새로운 경쟁이 시작돼요.
```

---

# 30. 테마 변경

Navigation에:

```text
🎨 테마
```

를 노출할 수 있다.

실제 Theme Switch 기능은 v1.0 필수 아님.

향후:

```text
Room Theme

UI Theme

Season Theme
```

등으로 확장 가능.

---

# 31. 공유

Statling 부화 이후:

```text
공유하기
```

CTA를 노출한다.

향후 공유 카드:

```text
MY STATUS

Radar Chart

My Statling

Type

URL
```

등을 포함할 수 있다.

v1.0에서는 최소 공유 UI 또는 기본 Web Share를 고려한다.

---

# 32. 익명 DB 저장

첫 방문부터 내부적으로 익명 User ID를 생성한다.

저장:

```text
Anonymous User

Game Sessions

Trial Data

Game Results

MY STATUS

Hatched Statling
```

로그인 전에도 데이터가 유실되지 않도록 한다.

---

# 33. 로그인 전환

부화 이후 로그인하면:

```text
Anonymous Data
↓
Authenticated Account
```

로 연결한다.

로그인 강제는 하지 않는다.

목표:

```text
최대한 초기 이탈률을 줄이고

Statling을 얻은 뒤
저장 이유가 생겼을 때 로그인 유도
```

---

# 34. GA4 적용 시점

GA4는 핵심 기능 구현 후 연결한다.

순서:

```text
Frontend Core

↓

Game Logic

↓

MY STATUS

↓

Hatch

↓

Room

↓

Care

↓

Free Play

↓

DB

↓

QA

↓

GA4 / GTM
```

단, 이벤트 구조는 개발 중 문서화해둔다.

---

# 35. v1.0 반드시 구현

## First Experience

```text
Landing

6 Sequential Games

Stat Discovery

MY STATUS

Radar Chart

Egg

Hatch

Statling Reveal
```

---

## Account / Data

```text
Anonymous User

Anonymous DB Save

Post-Hatch Login

Anonymous → Account Data Linking

Naming
```

---

## Room

```text
Statling Room

포만감

청결도

애정도

밥 주기

놀아주기

쓰다듬기

대화하기
```

---

## Navigation

```text
Home

My Stats

Ranking Tab UI

My Page

Theme Tab UI
```

---

## Growth

```text
성장시키기

6 Game Free Play

Personal Best

New Record

Date-based History

Recommended Game 표시

Bonus EXP Concept
```

---

# 36. v1.0 UI는 표시하지만 실제 기능은 후순위 가능

```text
샤워

청소하기

랭킹 실제 계산

테마 변경

복잡한 공유 카드
```

UI는 존재할 수 있다.

---

# 37. v1.0 제외

```text
복잡한 진화 시스템

다단계 Pet Evolution

Shop

Inventory

Furniture Editing

Friend System

Chat Between Users

Guild

실시간 Ranking

Season Ranking

Push Notification

복잡한 AI Conversation

KakaoTalk Conversation Analysis

AI Generated Pet

복잡한 Economy
```

---

# 38. 향후 버전

## v1.x

```text
XP / Level 고도화

Daily Challenge

Ranking

Theme Change

Share Card

Pet Request
```

---

## v2.0+

```text
Stat Combination 기반 Pet 개인화

Evolution

Room Customization

Shop

Inventory

Friends

Social

Advanced Personal Analytics

AI Conversation

KakaoTalk 기반 말투 개인화 검토
```

---

# 39. 핵심 장기 루프

```text
ROOM

↓

STATLING REQUEST

↓

GROW

↓

SELECT GAME

↓

PLAY

↓

NEW RECORD

↓

STAT UPDATE

↓

EXP

↓

RETURN TO ROOM

↓

CARE

↓

REPEAT
```

---

# 40. v1.0 성공 조건

다음 Flow가 실제로 정상 작동하면 v1.0 핵심 완료로 본다.

```text
첫 방문

↓

로그인 없이 6개 게임 완주

↓

6개 스탯 생성

↓

MY STATUS

↓

Egg Hatch

↓

Statling 생성

↓

저장 / 공유 CTA

↓

로그인 연결

↓

이름 짓기

↓

Room 입장

↓

밥 / 놀기 / 쓰다듬기 가능

↓

성장시키기

↓

6개 게임 자유 선택

↓

게임 재도전

↓

신기록 저장

↓

날짜별 기록 저장
```

---

# 41. 제품 핵심 원칙

Statling의 핵심은:

```text
"테스트 결과를 보는 것"
```

이 아니다.

```text
"내 플레이 결과가
하나의 작은 생명체로 태어나고,
그 존재와 함께 내가 성장하는 것"
```

이다.

모든 기능 판단은 이 경험을 강화하는 방향으로 결정한다.
