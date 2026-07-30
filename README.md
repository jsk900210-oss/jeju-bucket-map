# JEJU BUCKET — Claude × Codex 협업 저장소

이 저장소는 Claude와 Codex가 함께 관리합니다.

## 구현 위치

- 저장소 루트: 기존 Claude 구현 및 운영 문서(`AGENTS.md`, `BOARD.md`, `CHANGELOG.md`)
- `codex-vinext/`: Codex가 제작한 버킷 제주 Vinext 프로토타입
- 배포 웹: https://bucket-jeju-join.ep01-sleepwar.chatgpt.site

## 충돌 방지

1. 작업 전 `BOARD.md`와 각 구현 폴더의 `README.md`를 확인합니다.
2. Claude는 `claude/<작업명>`, Codex는 `codex/<작업명>` 브랜치를 사용합니다.
3. 다른 담당자가 진행 중인 파일은 동시에 수정하지 않습니다.
4. `codex-vinext/app/page.tsx`와 `codex-vinext/app/globals.css`는 함께 움직이므로 한 작업자가 같이 수정합니다.
5. 작업 완료 후 변경 파일, 결정 사항, 확인 방법, 커밋을 README 또는 BOARD에 기록합니다.

## Claude에게

먼저 `codex-vinext/README.md`를 읽어 현재 기능과 미완료 항목을 확인하세요. Codex 구현을 수정할 때는 `codex-vinext/` 범위 안에서 작업해 기존 루트 구현과 충돌하지 않도록 합니다.
