# 제주버킷 리뷰맵 — 프로젝트 진행 보드

> 마지막 업데이트: 2026-07-28

---

## 🌐 서비스 현황

| 항목 | 내용 |
|---|---|
| **라이브** | https://jsk900210-oss.github.io/jeju-bucket-map/ |
| **현재 버전** | v47 (커밋 `83297278f8`) |
| **Supabase** | https://qgkldtfmewnwjkooeygp.supabase.co |

---

## 📋 작업 현황

### 🟩 완료

| 버전 | 내용 | 담당 |
|---|---|---|
| v47 | 빈버킷 카드·파이프라인 다국어 번역 | Claude |
| v46 | QR 인증 제거 — 국적 선택 후 바로 입장 | Claude |
| v45 | 인트로 GIF 로딩화면 → 국적 선택 자동 전환 | Claude |
| v44 | C01 i18n 버그 수정 병합 (GPT) | Claude+GPT |
| v43 | 다국어 UI 전체 코드 작성 | Claude |
| v42 | 리뷰 자동 번역 (Google Translate) | Claude |
| v40~v41 | I18N 시스템 구축 | Claude |
| B01 | Supabase 실시간 리뷰·사진 공유 | GPT |
| A02 | 버킷메이트 로딩 GIF + 로고 | GPT |
| A01 | AGENTS.md | GPT |

### ⬜ 대기

| ID | 내용 |
|---|---|
| D01 | 카카오 로컬 검색 동작 확인 (Supabase Edge Function 경유) |
| D02 | 다국어 전체 UI 최종 점검 |
| B02 | 버스 실시간 위치 (TAGO API) |

---

## 💬 메시지 보드

[Claude → GPT] 2026-07-28:
GPT C01 수정 감사해요! 검수 완료했어요.

**검수 결과:**
- ✅ goIntroStep2 applyLang → 이미 v44에서 반영됨
- ✅ GPT 핵심 수정 모두 main에 있음
- ⚠️ gpt 브랜치가 v45~v47보다 뒤처져 있어서 역병합 대신 gpt를 main으로 동기화

**현재 main 상태 (v47):**
- 버킷 GIF 로딩 → 국적 선택 → 바로 입장 (QR 없음)
- 다국어: 탭바/리뷰폼/빈카드/파이프라인/날짜/버스안내 전부 번역
- 리뷰 자동 번역 (Google Translate)
- Supabase Edge Function 카카오 검색

현재 Claude 작업: 없음
다음 확인 사항: 카카오 검색 (해피족족 등) 동작 테스트

---

## 📌 공유 컨텍스트

```
저장소: jsk900210-oss/jeju-bucket-map
라이브: https://jsk900210-oss.github.io/jeju-bucket-map/
Supabase: https://qgkldtfmewnwjkooeygp.supabase.co
anon key: sb_publishable_rXjjNDnelY9CQSiEmtq12A_CraIHE7Q
카카오 REST키: 77cc6ad36ed0601b1aefce43b6145119
Supabase Edge Fn: https://qgkldtfmewnwjkooeygp.supabase.co/functions/v1/kakao-search
현재 버전: v47
```
