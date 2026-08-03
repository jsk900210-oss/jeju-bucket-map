# B01-1 서버·DB 후보 비교 및 권장 구조

- 작업 ID: B01-1
- 작성일/조사 기준일: 2026-07-19
- 범위: 팀원 간 리뷰 공유를 위한 서버·DB 후보 비교 및 권장 구조 문서화
- 코드 변경: 없음

## 1. 결론

**1차 권장안은 Supabase(Postgres + Auth + Storage + Realtime)이며, GitHub Pages는 화면 배포에 그대로 유지한다.**

이 프로젝트는 작지만 리뷰 본문, 장소, 별점, 작성자, 사진 사이의 관계가 명확하다. Supabase는 정적 웹에서 직접 사용할 수 있는 데이터 API, 관계형 Postgres, Row Level Security(RLS), 파일 저장소, 실시간 구독을 한 서비스에서 제공하므로 현재 단일 HTML 구조를 크게 바꾸지 않고 시작할 수 있다.

B01 구현 원칙은 다음과 같다.

1. 브라우저에는 Supabase **publishable/anon key만** 둔다. RLS를 우회하는 service role key는 절대 넣지 않는다.
2. 공개 읽기는 허용할 수 있지만 쓰기는 익명 인증 또는 정식 인증을 거친 사용자로 제한한다.
3. 현재 브라우저의 검수 로직은 UX용 사전 검사로만 보고, DB 제약·RLS 또는 서버 함수에서 검증을 다시 강제한다.
4. 사진은 DB의 JSON 문자열이 아니라 Storage에 저장하고 DB에는 경로와 메타데이터만 기록한다.
5. 무료 한도와 휴면 정책을 운영 전에 재확인하고 사용량 알림을 설정한다.

## 2. 현재 구조와 문제

현재 `index.html`은 `window.storage` → `localStorage` → 메모리 순으로 저장소를 선택한다. 리뷰는 `jeju-reviews-v1` 키 하나에 전체 배열로 저장하며, 사진은 `jb-media:{reviewId}` 키에 JSON으로 저장한다.

현재 리뷰 필드는 `id, poiId, nick, flag, text, stars, mediaCount, onsite, ts`이다.

문제점:

- GitHub Pages에서는 보통 `window.storage`가 없으므로 기기 간 공유가 되지 않는다.
- 두 사용자가 동시에 저장하면 마지막 전체 배열 쓰기가 앞선 변경을 덮어쓸 수 있다.
- 클라이언트 검수는 개발자 도구나 직접 API 호출로 우회할 수 있다.
- 사진을 base64/JSON으로 저장하면 용량과 전송량이 커지고 브라우저 한도에 쉽게 걸린다.
- 작성자 식별, 수정·삭제 권한, 신고, 감사 기록을 안전하게 확장하기 어렵다.

따라서 B01에서는 공유 KV 하나를 만드는 대신 **리뷰 한 건을 DB 한 행으로 저장하는 구조**로 전환해야 한다.

## 3. 후보 비교

| 후보 | 무료·비용 관점 | 실시간 공유 | 보안·권한 | 사진 | 구현 난이도 | 판단 |
|---|---|---|---|---|---|---|
| **Supabase** | Free: DB 500MB, Storage 1GB, egress 5GB, Realtime 메시지 200만/월·최대 연결 200개. 무료 프로젝트 휴면 가능 | Postgres 변경 구독 | Auth + RLS | Storage + RLS | 낮음~중간 | **권장** |
| **Firebase (Firestore)** | 저장 1GiB, 읽기 5만/일, 쓰기 2만/일 무료 할당량. 실시간 리스너도 읽기 과금 | 성숙한 실시간 리스너 | Auth + Security Rules | Cloud Storage는 Blaze 결제 계정 필요 | 낮음 | 차선 |
| **Cloudflare Workers + D1 + R2** | D1 Free: 읽기 500만 행/일, 쓰기 10만 행/일, 저장 5GB | D1 자체에는 클라이언트 실시간 구독 없음 | Worker API에서 직접 구현 | R2 별도 설계 | 중간~높음 | 서버 제어가 중요할 때 |
| **Higgsfield `window.storage`** | 현재 코드와 결합 비용은 낮을 수 있음 | shared 플래그를 기대 | 공식 문서로 권한·쿼터·백업·이식성을 확인하지 못함 | JSON/base64 방식 한계 | 낮음(해당 환경 한정) | **검증 전 보류** |
| **자체 서버 + 관리형 DB** | 작은 서비스에도 운영·백업 비용 발생 | 자유롭게 구현 | 통제력과 운영 책임 모두 큼 | 자유롭게 구현 | 높음 | 현 단계 과잉 |

### Supabase

장점:

- 관계형 스키마가 리뷰, 장소, 미디어, 작성자 관계에 잘 맞는다.
- 정적 웹에서도 JavaScript SDK로 직접 연결할 수 있다.
- RLS로 사용자별 쓰기·수정·삭제 권한을 DB에서 강제할 수 있다.
- DB, 인증, 파일, 실시간 구독을 한 프로젝트에서 운영할 수 있다.
- 현재 26개 POI와 소규모 팀 리뷰에는 무료 범위가 충분할 가능성이 높다.

주의:

- RLS 정책을 잘못 작성하면 전부 차단되거나 과도하게 공개될 수 있다.
- 익명 로그인을 허용하면 CAPTCHA/Turnstile과 요청 제한이 필요하다.
- 무료 프로젝트의 휴면과 저장·전송 한도를 운영 체크리스트에 포함해야 한다.

### Firebase

장점은 웹 SDK와 실시간 동기화가 성숙했고 Auth와 Security Rules로 빠르게 시작할 수 있다는 점이다. 다만 읽기·쓰기 횟수 기반 과금이라 실시간 리스너의 재연결과 갱신도 읽기 비용에 영향을 준다. 리뷰 관계가 늘어나면 문서 구조와 중복 데이터 설계가 복잡해진다. 현재 Cloud Storage for Firebase는 Blaze 플랜 연결이 필요하므로 “결제수단 없는 완전 무료” 요구와 맞지 않는다.

### Cloudflare Workers + D1

Worker 뒤에서 서버 검증, CORS, 요청 제한을 명시적으로 통제할 수 있고 D1 무료 한도가 크며 SQL을 사용할 수 있다. 반면 Auth, 실시간 갱신, 파일 저장을 조합해 직접 운영해야 하므로 현재 단일 HTML 앱의 첫 선택으로는 구현 요소가 많다.

### Higgsfield / `window.storage`

저장소에는 Higgsfield 사이트 ID와 slug가 기록되어 있고 코드도 `window.storage.set/get(key, value, shared)`를 우선 시도한다. 그러나 조사 기준일에 해당 API의 공식 공개 문서, GitHub Pages 사용 가능 여부, 권한 모델, 데이터 내보내기, 백업, 동시 쓰기, 용량·요금을 확인하지 못했다.

다음 자료를 확보하기 전에는 운영 DB로 권장하지 않는다.

- 공식 API 문서와 서비스 약관
- GitHub Pages에서 호출 가능한지 여부
- 사용자별 인증·권한과 공개 범위
- 용량, 요청 한도, 요금
- 동시 쓰기 충돌 처리
- 데이터 내보내기·삭제·백업 방법
- 이미지 저장 방식

자료가 확인되고 배포 플랫폼을 Higgsfield로 고정한다면 단기 데모에는 사용할 수 있다. 그래도 전체 리뷰 배열 덮어쓰기 대신 리뷰별 키 또는 트랜잭션 가능한 구조가 필요하다.

## 4. 권장 아키텍처

```text
GitHub Pages (index.html)
        │
        ├─ Supabase Auth: 익명 로그인 또는 승인된 팀원 로그인
        ├─ Supabase Data API: pois / reviews / review_media
        ├─ Supabase Realtime: reviews 변경 구독
        └─ Supabase Storage: review-media 버킷
```

### 데이터 모델 초안

#### `pois`

| 열 | 형식 | 설명 |
|---|---|---|
| `id` | text PK | 현재 POI id 유지 |
| `name` | text | 장소명 |
| `category` | text | stay/fish/boat/food/hot/oreum |
| `active` | boolean | 노출 여부 |

초기에는 POI 상수를 기존 코드에 유지하되 외래키 검증을 위해 DB에 최소 목록을 둔다.

#### `reviews`

| 열 | 형식 | 제약/설명 |
|---|---|---|
| `id` | uuid PK | 서버 생성 |
| `poi_id` | text FK | `pois.id` 참조 |
| `author_id` | uuid | `auth.uid()` |
| `nickname` | text | 1~30자 |
| `flag` | text | 허용 목록 또는 짧은 문자열 |
| `body` | text | 10~1000자 |
| `stars` | smallint | 1~5 |
| `onsite_verified` | boolean | 클라이언트 주장만으로 true 허용 금지 |
| `status` | text | pending/approved/rejected |
| `created_at` | timestamptz | 서버 기본값 |
| `updated_at` | timestamptz | 서버 관리 |

#### `review_media`

| 열 | 형식 | 제약/설명 |
|---|---|---|
| `id` | uuid PK | 미디어 식별자 |
| `review_id` | uuid FK | 리뷰 삭제 시 함께 정리 |
| `owner_id` | uuid | 업로더 |
| `object_path` | text unique | Storage 객체 경로 |
| `mime_type` | text | 허용 목록 |
| `size_bytes` | bigint | 앱 제한 검증 |
| `created_at` | timestamptz | 서버 기본값 |

### 최소 RLS 정책

- `reviews SELECT`: `status = 'approved'`인 행 공개. 작성자와 검수자에게 필요한 pending 조회는 별도 정책.
- `reviews INSERT`: 인증 사용자만, `author_id = auth.uid()`. 길이, 별점, POI 존재 여부를 DB 제약으로도 검사.
- `reviews UPDATE/DELETE`: 작성자 본인 또는 관리자만. 일반 사용자가 `status`나 `onsite_verified`를 승인 상태로 바꾸지 못하게 제한.
- `review_media`: 경로를 `{auth.uid()}/{review_id}/...`로 고정하고 소유자만 쓰기 허용.
- 브라우저에 service role key 저장 금지.
- 익명 로그인 사용 시 CAPTCHA/Turnstile, 제출 간격, 파일 형식·크기 제한 적용.

브라우저 검수는 빠른 피드백용으로 유지하되 신뢰 경계는 DB/서버로 옮긴다. QR 체크인과 GPS 인증은 별도 검증 설계가 완료될 때까지 `pending` 또는 `false`로 취급한다.

## 5. 마이그레이션 순서

### 1단계: 설정과 스키마

1. Supabase Free 프로젝트 생성 및 리전 선택
2. `pois`, `reviews`, `review_media` 테이블과 제약 생성
3. RLS를 먼저 활성화하고 정책 테스트
4. 비공개 `review-media` 버킷 생성
5. URL과 publishable key만 배포 설정에 사용

### 2단계: 읽기 전환

1. 기존 `loadReviews()`와 화면 모델 사이에 저장소 어댑터 정의
2. 승인 리뷰 조회 및 실패 상태 표시
3. Realtime 구독으로 새 리뷰 반영
4. 새로고침, 다른 브라우저, 동시 접속 검증

### 3단계: 쓰기 전환

1. 익명 또는 팀원 인증
2. 리뷰를 행 단위로 INSERT
3. 사진 압축·형식·크기 검사 후 Storage 업로드
4. 업로드 성공 뒤 `review_media` 행 생성
5. 일부 실패 시 고아 파일 정리 또는 재시도
6. 클라이언트와 서버 제약의 실패 메시지 검증

### 4단계: 기존 데이터 이전

현재 localStorage 데이터는 각 기기에 따로 있으므로 한곳에서 자동 수집할 수 없다.

1. 승인된 기기에서 `jeju-reviews-v1` JSON 내보내기
2. 필드, POI id, 중복 검증
3. 사진 별도 추출·압축·업로드
4. 테스트 프로젝트에 먼저 import
5. 건수, 별점, 장소별 목록, 사진 대조
6. 승인 후 운영 DB에 한 번만 import
7. 성공 확인 전까지 localStorage를 읽기 전용 백업으로 유지

## 6. B01 구현 완료 조건 제안

- 서로 다른 두 브라우저에서 같은 승인 리뷰 목록이 보인다.
- 동시 리뷰 작성 시 어느 리뷰도 덮어써지지 않는다.
- 새 리뷰가 새로고침 없이 다른 브라우저에 반영된다.
- 권한 없는 사용자의 수정·삭제·상태 변경이 거부된다.
- 잘못된 POI, 별점, 짧은 본문, 과대 파일, 잘못된 MIME 형식이 서버에서도 거부된다.
- 네트워크 실패와 무료 한도 초과가 로컬 성공처럼 보이지 않는다.
- service role key와 비밀키가 저장소, 브라우저, 로그에 없다.
- 기존 localStorage 이전 건수와 원본 백업이 확인된다.
- 월 비용 상한 또는 사용량 알림이 설정된다.

## 7. 사용자 승인 필요 항목

1. Supabase 프로젝트와 계정 소유자
2. 익명 작성 허용 여부 또는 팀원 로그인 방식
3. 즉시 공개 또는 `pending` 검수 후 공개
4. 사진 형식, 개수, 파일당 크기
5. 닉네임·국기·GPS/QR 정보의 보관 범위와 삭제 정책
6. 기존 기기별 리뷰의 수집·중복 제거 기준
7. 무료 프로젝트 휴면과 한도 초과 시 대응

## 8. 권장 결정

- **지금:** Supabase Free 검증 프로젝트에서 텍스트 리뷰부터 연결
- **다음:** Auth + RLS + DB 제약 검증 후 Realtime 활성화
- **그다음:** 사진을 Storage로 이전
- **보류:** Higgsfield는 공식 저장 API·권한·요금·이식성 자료 확보 후 재평가
- **대안:** Google 생태계와 결제 계정 연결이 가능하면 Firebase, 서버 제어가 더 중요해지면 Workers + D1

## 9. 공식 출처

확인일: 2026-07-19

- [Supabase Pricing](https://supabase.com/pricing)
- [Supabase Realtime Pricing](https://supabase.com/docs/guides/realtime/pricing)
- [Supabase Database](https://supabase.com/docs/guides/database/overview)
- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Supabase Storage Limits](https://supabase.com/docs/guides/storage/uploads/file-limits)
- [Cloud Firestore Pricing](https://firebase.google.com/docs/firestore/pricing)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Firebase Storage billing requirements](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024)
- [Cloudflare D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [Cloudflare Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/)

> 가격과 무료 한도는 변경될 수 있으므로 B01 구현 시작일에 공식 가격 페이지를 다시 확인한다.
