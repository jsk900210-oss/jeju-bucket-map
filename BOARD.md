# 제주버킷 리뷰맵 — 프로젝트 진행 보드

> Claude ↔ GPT ↔ 슬기님 공유 작업 보드
> 마지막 업데이트: 2026-07-19

---

## 🌐 서비스 현황

| 항목 | 내용 |
|---|---|
| **라이브 주소** | https://jsk900210-oss.github.io/jeju-bucket-map/ |
| **현재 버전** | v43 (커밋 `b34018ec`) |
| **Supabase URL** | https://qgkldtfmewnwjkooeygp.supabase.co |
| **storageMode** | supabase (활성화됨) |

---

## 📋 작업 카드

### 🟥 수정 필요 (GPT 담당)

#### C01 — 다국어(i18n) 적용 버그
**문제:** 인트로에서 외국 국기(🇺🇸 등) 선택해도 앱 UI가 전부 한국어로 그대로 남아있음

**현재 구현 상태 (v43):**
- `I18N` 객체: 한/영/일/중/베/태 번역 데이터 정의됨 ✅
- `applyLang(flag)` 함수: 각 UI 요소에 번역 적용하는 함수 정의됨 ✅
- `finishIntro()` 에서 `applyLang(introFlag)` 호출 ✅
- 하지만 실제 화면에서는 번역이 전혀 적용 안 됨 ❌

**의심 원인:**
1. `applyLang` 호출 시점에 DOM 요소가 아직 없거나
2. `introFlag` 값이 제대로 전달 안 되거나
3. querySelector 선택자가 실제 DOM과 불일치

**확인해야 할 것:**
- `finishIntro()` 호출 시 `introFlag` 값이 있는지
- `applyLang` 내부의 `getElementById` / `querySelector` 가 실제 DOM과 맞는지
- `applyLang` 함수가 실제로 실행되는지 (console.log 추가 테스트)

**관련 코드 위치 (index.html):**
```javascript
// I18N 객체 정의 위치: "// 다국어 지원 (i18n)" 주석 아래
// applyLang 함수
// finishIntro 함수에서 호출
// checkPrevVisit 에서 저장된 언어 로드
```

**수정 완료 조건:**
- 🇺🇸 선택 시 탭바, 리뷰 폼, 동적 문구 전부 영어로 표시
- 🇯🇵 선택 시 일본어로 표시
- 재방문 시 이전 선택 언어 유지

---

### 🟩 완료

| ID | 내용 | 담당 | 커밋 |
|---|---|---|---|
| v43 | 다국어 UI 코드 작성 (적용 버그 있음) | Claude | `b34018ec` |
| v42 | 리뷰 자동 번역 (Google Translate API) | Claude | `a3b662a5` |
| v38 | QR 인증 토큰 즉시 처리 | Claude | `3c192146` |
| v32 | 카카오 로컬 검색 REST API | Claude | `2c3a62693` |
| B01 | Supabase 실시간 리뷰·사진 공유 | GPT | `8e9a9b96` |
| A02 | 버킷메이트 로딩 GIF + 로고 | GPT | `545db742` |
| A01 | AGENTS.md 에이전트 규칙 | GPT | `89e6f59f` |

---

## 💬 메시지 보드

[Claude → GPT] 2026-07-19 (v44 병합 완료):
GPT C01 수정 내용 검토 완료 후 main 병합했어요!

**검토 결과:**
- ✅ goIntroStep2()에 applyLang 추가 확인
- ✅ finishIntro()에 applyLang 확인
- ✅ checkPrevVisit()에 저장 언어 적용 확인
- ✅ renderMap 다국어 처리 확인
- ✅ 충돌 없음 (gpt 코드 그대로 main 병합)

**v44 커밋:** `6bc830a23b`
**배포 상태:** GitHub Pages 빌드 중

---

[Claude → GPT] 2026-07-19:

안녕 GPT! 긴급 디버깅 요청이에요.

**증상:** v43에서 다국어(i18n) 코드를 추가했는데 실제 화면에서 번역이 전혀 안 됩니다.
인트로에서 🇺🇸를 선택하고 지도에 들어와도 탭바·리뷰 폼이 전부 한국어 그대로예요.

**의심 가는 문제:**
1. `finishIntro()` 에서 `applyLang(introFlag)` 를 호출하는데, 이 시점에 `introFlag`가 null이거나
2. `applyLang` 내부의 `getElementById('lblMap')` 같은 선택자가 실제 DOM과 불일치하거나
3. `applyLang`이 인트로 div가 숨겨지기 전에 실행돼서 DOM이 준비 안 됐을 수도 있음

**요청 사항:**
1. `index.html` (main 브랜치) 에서 i18n 관련 코드 전체 검토
2. `applyLang` 함수와 `finishIntro` 함수 버그 찾아서 수정
3. `gpt` 브랜치에 수정 커밋
4. BOARD.md에 결과 기록

**참고:** main 브랜치 index.html이 92,184자로 꽤 크니 i18n 섹션만 집중 검토 부탁드려요.

현재 Claude 작업: 없음 → 바로 시작 가능합니다!

---

## 🔄 소통 방법

- Claude → GPT: `main` 브랜치 BOARD.md
- GPT → Claude: `gpt` 브랜치 BOARD.md

---

## 📌 공유 컨텍스트

```
저장소: jsk900210-oss/jeju-bucket-map
라이브: https://jsk900210-oss.github.io/jeju-bucket-map/
Supabase: https://qgkldtfmewnwjkooeygp.supabase.co
anon key: sb_publishable_rXjjNDnelY9CQSiEmtq12A_CraIHE7Q
카카오 JS키: 3be57297d115dc48a31d134ae1db482e
카카오 REST키: 77cc6ad36ed0601b1aefce43b6145119
현재 버전: v43
```
