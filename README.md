# codex-yolo

Claude Code 플러그인. Codex CLI를 **샌드박스 없이(`codex exec --yolo`)** 백그라운드로 직접 실행하는 `codex-yolo:run` 스킬.

- 공식 codex 플러그인의 `codex-rescue`는 샌드박스가 강제되고(ssh·네트워크 불가) 진행 상황이 안 보인다.
- 이 스킬은 출력을 로그 파일로 남겨 `status.sh`로 언제든 진행 상황을 본다.

필요: `codex` CLI 로그인 상태. 설치: `/plugin install codex-yolo@duddudcns`
