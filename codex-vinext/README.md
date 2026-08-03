# BUCKET JEJU

버킷제주 게스트하우스 방문객을 위한 장소 발견 및 Join 커뮤니티 웹앱입니다.

- 운영 주소: https://bucket-jeju-join.ep01-sleepwar.chatgpt.site
- 사용자 식별: ChatGPT 로그인 후 서비스 내부 사용자 ID와 닉네임 사용
- 데이터 저장: Cloudflare D1 + Drizzle ORM
- 장소 범위: 버킷제주 기준 반경 2km

## 파일 구성

### 프론트엔드

- `app/client-home.tsx`: 홈, 장소, Join, AI 질문, 프로필 탭과 Join 작성 화면
- `app/globals.css`: 반응형 레이아웃과 Join 작성 모달 스타일
- `app/page.tsx`: 로그인 사용자 및 저장된 닉네임을 화면에 전달
- `app/layout.tsx`: 앱 공통 레이아웃

### 백엔드

- `app/api/joins/route.ts`: Join 목록 조회, 작성, 모집시간 종료 처리
- `app/api/profile/route.ts`: 닉네임 변경
- `app/chatgpt-auth.ts`: ChatGPT 인증 헤더 처리
- `db/schema.ts`: 사용자, Join, 참여자 테이블
- `db/index.ts`: Cloudflare D1 연결
- `drizzle/0000_cheerful_spacker_dave.sql`: 기본 테이블 생성
- `drizzle/0001_empty_secret_warriors.sql`: Join 키워드 필드 추가

## 구현 기능

- 닉네임을 2~20자로 변경하고 D1에 저장
- 로그인 사용자가 Join 글 작성
- 작성된 Join을 Join 탭과 메인 화면 최신 목록에 즉시 반영
- 검색 키워드별 Join 필터링
- 모집시간이 지나면 `모집중`을 `모집완료`로 자동 변경
- 다겸님·현겸님 자료 반영 전 단계의 AI 질문 탭 제공

## 디버깅 기록

### 닉네임이 다시 원래 이름으로 바뀌는 문제

- 원인: 페이지를 열 때 인증 헤더의 이름으로 `displayName`을 매번 덮어씀
- 수정: 기존 DB 닉네임을 우선 사용하고 `PATCH /api/profile`로만 변경
- 검증: 2~20자 유효성 검사와 변경 후 화면 갱신 확인

### Join 글을 작성할 수 없는 문제

- 원인: 화면에 정적 빈 배열만 있고 저장 API와 작성 폼이 없었음
- 수정: D1 기반 `GET/POST /api/joins`, 로그인 검사, 작성 모달 추가
- 검증: 제목·설명·장소·날짜·시간·키워드·인원 검증 및 저장 확인

### 작성한 Join이 목록에 바로 보이지 않는 문제

- 원인: 필터 결과 `useMemo`가 `keyword`만 의존해 `joins` 변경을 감지하지 못함
- 수정: 의존성을 `[joins, keyword]`로 변경
- 검증: 작성 성공 직후 Join 탭에 새 카드 표시

### Join 글이 메인 화면에 보이지 않는 문제

- 원인: 홈 미리보기가 DB Join 목록과 연결되지 않았음
- 수정: 최신 Join 3건을 홈 미리보기에 연결
- 검증: 새 Join 작성 후 홈 이동 시 최신 카드 표시

### 모집시간이 지나도 모집중으로 남는 문제

- 원인: 저장된 `status`만 읽고 현재 시각과 `scheduledAt`을 비교하지 않음
- 수정: 목록 조회 시 만료된 `모집중` 행을 `모집완료`로 갱신하고 응답에서도 방어적으로 계산
- 검증: `scheduledAt <= 현재시각` 조건의 상태 변환 코드 및 빌드 통과

## 데이터베이스 적용

배포 환경의 D1에 아래 마이그레이션이 순서대로 적용되어야 합니다.

1. `drizzle/0000_cheerful_spacker_dave.sql`
2. `drizzle/0001_empty_secret_warriors.sql`

`.openai/hosting.json`의 D1 바인딩 이름은 `DB`를 사용합니다.

## 검증

- `vinext build` 성공
- 최신 구현 커밋: `9602f9a152cab2c39bd1b308b2e6b26dcde8df1f`
- 모집시간 자동 종료 구현을 포함한 소스 보관 파일:
  `outputs/bucket-jeju-auto-close-v15.tar.gz`

## 미완료 및 다음 단계

- Join 참여·취소는 아직 브라우저 상태만 변경하며 DB에 저장되지 않음
- AI 질문 탭은 자리만 마련했으며 RAG 데이터 연결 전
- 다겸님·현겸님 자료를 받은 뒤 문서 분할, 임베딩, 검색, 답변 출처 표시 추가 예정
- 방문객 리뷰 탭은 요청에 따라 추후 추가
- 운영 URL은 최신 모집시간 자동 종료 커밋 재배포 필요

