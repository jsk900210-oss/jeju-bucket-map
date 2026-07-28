# 제주버킷 리뷰맵 — 프로젝트 진행 보드

> 마지막 업데이트: 2026-07-28

---

## 🌐 서비스 현황

| 항목 | 내용 |
|---|---|
| **라이브** | https://jsk900210-oss.github.io/jeju-bucket-map/ |
| **현재 버전** | v47 + D01 |
| **Supabase** | https://qgkldtfmewnwjkooeygp.supabase.co |

---

## 📋 작업 현황

### 🟩 완료

| ID | 내용 | 담당 | 커밋/비고 |
|---|---|---|---|
| D01 | 카카오 검색 보안 강화 | Claude | `9cfba03905` |
| v47 | 빈버킷·파이프라인 다국어 | Claude | `83297278f8` |
| v46 | QR 인증 제거 | Claude | `cd270d1704` |
| v45 | GIF 로딩화면 추가 | Claude | `12c8dbb2cd` |
| v44 | C01 i18n 버그 수정 병합 | Claude+GPT | `6bc830a23b` |
| v40~43 | 다국어 시스템 구축 | Claude | - |
| B01 | Supabase 실시간 공유 | GPT | `8e9a9b96` |
| A02 | 버킷메이트 GIF+로고 | GPT | `545db742` |
| A01 | AGENTS.md | GPT | `89e6f59f` |

### ⬜ 대기

| ID | 내용 |
|---|---|
| D01-verify | 라이브에서 해피족족 검색 동작 확인 |
| D02 | QR UI 실제 라이브 확인 (v46 변경사항) |
| B02 | 버스 실시간 위치 (TAGO API) |

---

## 💬 메시지 보드

[Claude → GPT] 2026-07-28:

D01 카카오 검색 보안 강화 완료했어요.

**변경 내용:**
1. ✅ 카카오 REST키를 Supabase Secret `KAKAO_REST_KEY`로 이전 (코드에서 제거)
2. ✅ Edge Function에서 `Deno.env.get('KAKAO_REST_KEY')`로 읽도록 수정
3. ✅ 프런트에서 `Authorization: Bearer` 제거 → `apikey`만 사용
4. ✅ 카카오 API 오류 시 화면에 "⚠️ 검색 서버 연결 오류" 표시
5. ✅ `map.setCenter()` → `map.setView([lat,lng], 15)` 수정
6. ✅ Edge Function 재배포 완료
7. ✅ BOARD.md에서 카카오 REST키 노출 제거

**다음 확인 필요:**
- 라이브에서 "해피족족" 검색 동작 테스트 (D01-verify)
- QR UI 실제 상태 확인 (D02)

현재 Claude 작업: 없음

---

## 📌 공유 컨텍스트

```
저장소: jsk900210-oss/jeju-bucket-map
라이브: https://jsk900210-oss.github.io/jeju-bucket-map/
Supabase: https://qgkldtfmewnwjkooeygp.supabase.co
anon key: sb_publishable_rXjjNDnelY9CQSiEmtq12A_CraIHE7Q
카카오 JS키: 3be57297d115dc48a31d134ae1db482e
카카오 REST키: [Supabase Secret으로 이동됨 — 코드에서 제거]
Supabase Edge Fn: https://qgkldtfmewnwjkooeygp.supabase.co/functions/v1/kakao-search
현재 버전: v47 + D01
```
