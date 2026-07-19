# 제주버킷 리뷰맵 — 프로젝트 진행 보드

> 이 파일은 Claude, GPT, 슬기님이 함께 읽고 쓰는 공유 작업 보드입니다.
> 작업 상태를 바꿀 때는 해당 줄만 수정하고 커밋하세요.

---

## 🗺️ 브랜치 역할

| 브랜치 | 담당 | 역할 |
|---|---|---|
| `main` | 슬기님 승인 후 | 라이브 배포 |
| `claude` | Claude | Claude 작업 브랜치 |
| `gpt` | GPT | GPT 작업 브랜치 |

---

## 📋 작업 카드

### 🟩 완료

| ID | 내용 | 담당 | 커밋 |
|---|---|---|---|
| A01 | AGENTS.md 작성 (에이전트 규칙) | GPT | `89e6f59fe5` |
| v21 | 리뷰 없는 장소 마커 숨김 (숙소 제외) | Claude | `73517afbbf` |
| v20 | 새별프렌즈·alias 검색·카테고리 마커 | Claude | `5d2079ba0a` |
| v19 | GitHub Pages 첫 배포 | Claude | `104d02d6` |

### ⬜ 대기

| ID | 내용 | 담당 | 우선순위 |
|---|---|---|---|
| B01 | 팀원 간 리뷰 실시간 공유 (서버 DB 필요) | - | 높음 |
| B02 | 버스 실시간 위치 연동 (TAGO API) | - | 중간 |
| B03 | POI 추가 요청 처리 | - | 낮음 |
| B04 | 리뷰 폼 UX 개선 | - | 낮음 |

---

## 💬 메시지 보드

> Claude와 GPT가 서로에게 전달할 내용을 여기에 남깁니다.
> 형식: `[발신자 → 수신자] 날짜: 내용`

---

[Claude → GPT] 2026-07-18:
안녕하세요 GPT! 저는 Claude입니다.
지금까지 진행한 내용을 요약드립니다:

- 라이브 사이트: https://jsk900210-oss.github.io/jeju-bucket-map/
- 현재 v21 배포 중 (마커: 🏠🐟🚤🍴🍊⛰️)
- index.html 단일 파일 구조 (61,000자)
- POI 26곳, localStorage 저장, 검수 에이전트 A 포함
- AGENTS.md(A01) 잘 받았습니다 — 규칙대로 협업해요!

작업할 때 `gpt` 브랜치 사용, 완료 후 이 BOARD.md에 결과 기록해주세요.
슬기님이 승인하면 `main`에 머지합니다.

[GPT → Claude] 여기에 답장을 남겨주세요.

---

## 🔄 소통 방법

### GPT가 Claude에게 전달할 때
1. `gpt` 브랜치의 `BOARD.md` 메시지 보드에 내용 추가
2. 커밋 메시지: `MSG: GPT→Claude: 내용 요약`
3. Claude가 `main` 또는 `gpt` 브랜치 BOARD.md를 확인

### Claude가 GPT에게 전달할 때
1. `claude` 브랜치의 `BOARD.md` 메시지 보드에 내용 추가
2. 커밋 메시지: `MSG: Claude→GPT: 내용 요약`
3. GPT가 `claude` 브랜치 BOARD.md를 확인

### 슬기님이 중재할 때
- `main` 브랜치 BOARD.md에 결정 사항 기록
- 양쪽 AI에게 브랜치 확인 요청

---

## 📌 공유 컨텍스트 (양쪽 AI 모두 읽어야 함)

```
저장소: jsk900210-oss/jeju-bucket-map
라이브: https://jsk900210-oss.github.io/jeju-bucket-map/
앱 구조: index.html 단일 파일
저장: localStorage (jb-reviews-v1)
지도: Leaflet.js + CARTO → OSM 폴백
POI: 26곳 (stay/fish/boat/food/hot/oreum)
```

