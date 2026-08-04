# 버킷제주 디버깅 및 통합 이력

현재 버전: **v1.5.0**  
버전 기준일: 2026-08-04

## 버전 이력

### v1.5.0 — 저장소 표준 경로 통합 및 최신 디버깅 기록

- 1차 저장소를 팀 기준 `frontend/`, `backend/`, `data/`, `docs/` 구조로 변경
- 기존 `codex-vinext/` 파일 44개 이동 및 누락 0개 확인
- 중복 DB·Drizzle·Supabase·Worker 등 13개 파일 삭제
- 기존 Sites `project_id` 보존 확인
- 최신 기능·동기화·배포·남은 작업을 디버깅 문서로 통합

### v1.4.0 — 팀 M3 및 포크 m3 동기화

- 팀 `gon311/DLthon_2nd:M3` 내용을 포크 `jsk900210-oss/DLthon_2nd:m3`에 반영
- 뒤처진 팀 커밋 23개 반영
- `frontend/BUCKET_JEJU_HANDOFF.md` 충돌 해결
- 동기화 후 팀 변경 누락 0개 확인
- 팀 M3 대상 Draft PR #7 생성

### v1.3.0 — RAG 백엔드 및 POI 자료 통합

- POI 수집·변환·설명 생성 스크립트 반영
- 숙소 기준 거리 계산 공용 모듈 반영
- ChromaDB 인덱스 생성 및 RAG 검색 서비스 반영
- API 계약서와 지식베이스 스키마 반영
- 생성 가능한 ChromaDB 바이너리는 1차 저장소에서 제외

### v1.2.0 — Join 마감 상태 디버깅

- 모집인원과 관계없이 마감시간 경과 시 모집완료 처리
- 오늘 20시 마감 Join은 20시 이후 모집완료가 되는 기준 확정
- Join 목록과 메인 화면 상태 표시 기준 통일

### v1.1.0 — Join 작성·조회 및 프로필 개선

- Join 작성 모달과 카테고리 필터 구현
- 작성한 Join을 메인 최신 Join 영역에 연결
- 닉네임 조회·변경 화면과 API 구현
- D1·Drizzle 기반 사용자와 Join 저장 구조 추가

### v1.0.0 — 초기 웹데모

- React 19 + TypeScript + Vinext 기본 웹데모 구성
- 홈, 근처 발견, Join, AI 질문, 프로필 탭 구성
- 버킷제주 주변 장소 카드와 모바일 내비게이션 구성
- 기존 Sites 프로젝트와 운영 주소 연결

최종 갱신: 2026-08-04  
기준 브랜치: `jsk900210-oss/jeju-bucket-map:gpt`

## 저장소 연결 관계

1. 1차 작업 저장소: `jsk900210-oss/jeju-bucket-map:gpt`
2. 2차 포크 저장소: `jsk900210-oss/DLthon_2nd:m3`
3. 3차 팀 저장소: `gon311/DLthon_2nd:M3`

세 저장소는 다음 표준 경로를 공통으로 사용한다.

- `frontend/`: React/Vinext 웹데모, Sites API, D1·Drizzle
- `backend/`: FastAPI 및 RAG 검색 백엔드
- `data/`: POI CSV와 수집·가공 스크립트
- `docs/`: API 계약, 지식베이스, 인수인계와 디버깅 문서

## 완료된 기능

### 사용자와 프로필

- ChatGPT 로그인 사용자를 서비스 사용자로 식별
- 닉네임 조회 및 변경 화면
- 닉네임 변경 API와 D1 저장 구조

### Join 시스템

- Join 글 작성 모달
- Join 목록 조회 및 카테고리 필터
- 작성한 Join의 메인 화면 최신 목록 반영
- 모집시간이 지나면 모집인원 충족 여부와 관계없이 `모집완료`로 표시
- 합성 데이터 폴백과 D1 API 구조 준비

### 장소 및 지도

- 버킷제주 중심 주변 장소 카드
- 약 2km 서비스 범위 표현
- Kakao 지도 API 연동을 위한 계약과 문서 정리

### RAG 준비

- POI 수집·CSV 변환·설명 생성 스크립트
- 숙소 기준 거리 계산 공용 모듈
- OpenAI Embeddings 기반 ChromaDB 인덱스 생성 코드
- ChromaDB 검색, 거리·1인 적합성 재정렬, 자연어 응답 생성 코드
- API 계약서와 지식베이스 스키마 반영

## 해결된 문제

### Join 글이 메인에 나타나지 않음

- 원인: Join 화면의 작성 상태와 메인 화면의 표시 데이터가 분리되어 있었다.
- 조치: 동일 Join API 및 최신 목록 흐름을 사용하도록 정리했다.
- 결과: 작성된 Join이 메인 최신 Join 영역에 반영되는 구조가 되었다.

### 모집 시간이 지나도 모집중으로 표시됨

- 원인: 모집인원 충족 여부만 상태 판단에 사용되거나 시간 비교가 누락된 경우가 있었다.
- 조치: 현재 시간이 모집 마감시간 이상이면 자동으로 모집완료를 반환하도록 정리했다.
- 검증 기준: 오늘 20시 마감 Join은 인원이 남아도 20시 이후 모집완료로 표시한다.

### 팀 M3 변경이 포크에 누락됨

- 초기 상태: 포크 `m3`가 팀 `M3`보다 23개 커밋 뒤에 있었고 서로 갈라져 있었다.
- 충돌 파일: `frontend/BUCKET_JEJU_HANDOFF.md` 1개
- 조치: 팀 RAG 내용을 보존하면서 프론트엔드 인수인계 내용을 통합했다.
- 결과: 포크의 팀 M3 누락 커밋이 0개가 되었고 PR은 충돌 없이 병합 가능한 상태가 되었다.
- 관련 PR: https://github.com/gon311/DLthon_2nd/pull/7

### 저장소마다 파일 경로가 달랐음

- 원인: 1차 저장소 웹데모가 `codex-vinext/` 아래에 있고, 팀 저장소는 기능별 루트 폴더를 사용했다.
- 조치: 1차 저장소를 `frontend/`, `backend/`, `data/`, `docs/` 구조로 이동했다.
- 이동 결과: 44개 파일 이동, 누락 0개
- 정리 결과: 중복 DB·Drizzle·Supabase·Worker 및 이전 협업 문서 13개 삭제
- 기존 `codex-vinext/` 파일 잔여: 0개

## 현재 배포 설정

- 운영 주소: https://bucket-jeju-join.ep01-sleepwar.chatgpt.site/
- 배포 기준 폴더: `frontend/`
- 설정 파일: `frontend/.openai/hosting.json`
- 기존 `project_id`: `appgprj_6a6af8aa68188191b0b6e49911cbf2b1`
- 새 사이트를 만들지 않고 기존 프로젝트와 주소를 재사용한다.
- GitHub 변경과 운영 사이트 배포는 자동으로 연결되지 않으므로 별도 배포가 필요하다.

## 제외한 데이터

1차 저장소에서는 생성 가능한 ChromaDB 바이너리 캐시를 제외했다.

- 제외 경로: `data/index/chroma/`
- 제외 이유: 용량 증가와 바이너리 충돌 방지
- 재생성 재료: `data/processed/`, `data/scripts/`, `backend/build_index.py`

## 실행 및 검증 방법

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

확인 항목:

- 닉네임 변경
- Join 작성 및 목록 반영
- 메인 최신 Join 표시
- 마감시간 경과 후 모집완료 표시

### RAG 백엔드

```bash
pip install -r backend/requirements.txt
python backend/build_index.py \
  --csv data/processed/guesthouse_pois.csv \
  --collection poi_demo \
  --smoke-test
```

필요한 환경변수:

- `OPENAI_API_KEY`
- `LODGING_LAT`
- `LODGING_LNG`

## 남은 작업

- Join 참여·취소 API 및 DB 저장
- AI 질문 탭과 RAG API 실제 연결
- 답변 출처와 장소 근거 표시
- 1층·2층 공간 안내 및 이용규칙 화면
- 방문객 장소 리뷰 탭
- Kakao 지도 API 운영 키 연결
- 최신 GitHub 소스를 기존 Sites 프로젝트에 재배포
- 팀 리뷰 후 PR #7을 `gon311:M3`에 병합
