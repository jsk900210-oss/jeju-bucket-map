# JEJU BUCKET — 팀 통합 저장소

버킷제주 게스트하우스 방문객을 위한 장소 발견, Join 커뮤니티, RAG 안내 서비스를 관리합니다.

- 운영 웹: https://bucket-jeju-join.ep01-sleepwar.chatgpt.site
- 팀 기준 저장소: `gon311/DLthon_2nd:M3`
- 포크 동기화 브랜치: `jsk900210-oss/DLthon_2nd:m3`

## 표준 파일 구조

- `frontend/`: React 19 + TypeScript + Vinext 웹데모, Sites API, D1·Drizzle
- `backend/`: FastAPI·RAG·ChromaDB 검색 코드
- `data/`: POI CSV와 수집·가공 스크립트
- `docs/`: API 계약, 지식베이스 스키마, 인수인계 문서

1차·2차·3차 저장소가 위 경로를 공통으로 사용합니다.

## 주요 기능

- 닉네임 변경
- Join 작성·조회 및 메인 최신 Join 표시
- 모집시간 경과 시 모집완료 자동 표시
- 숙소 주변 장소 데이터 수집·정제
- ChromaDB 기반 RAG 검색·응답 준비

## 실행 위치

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

### RAG 백엔드

저장소 루트에서 Python 경로를 실행합니다.

```bash
pip install -r backend/requirements.txt
python backend/build_index.py --csv data/processed/guesthouse_pois.csv --collection poi_demo --smoke-test
```

실행 전 `OPENAI_API_KEY`, `LODGING_LAT`, `LODGING_LNG` 환경변수가 필요합니다.

## 디버깅 및 정리 내역

- 팀 `M3`와 포크 `m3`의 충돌 문서를 통합했습니다.
- 기존 `codex-vinext/` 내용을 표준 경로로 이동했습니다.
- 웹데모용 D1·Drizzle 코드는 `frontend/`에 유지했습니다.
- 중복된 루트 TypeScript DB·Supabase·Worker 백엔드는 삭제했습니다.
- RAG 백엔드와 POI 데이터는 `backend/`, `data/`, `docs/`로 분리했습니다.
- 재생성 가능한 ChromaDB 바이너리 캐시는 1차 저장소에서 제외했습니다.
- `frontend/.openai/hosting.json`의 기존 `project_id`를 보존했습니다.

## 작업 기록

최신 기능·충돌 해결·저장소 동기화·경로 변경 내역은 [디버깅 및 통합 이력](docs/DEBUGGING_HISTORY.md)에서 확인할 수 있습니다.

## 배포 주의

웹 배포는 `frontend/` 폴더를 기준으로 진행합니다. 기존 Sites 프로젝트와 운영 주소를 재사용하며 새 사이트를 만들지 않습니다.
