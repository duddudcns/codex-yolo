# codex-yolo

Claude Code 플러그인. Codex CLI를 **샌드박스 없이(`codex exec --yolo`)** 백그라운드로 직접 실행하는 `codex-yolo:run` 스킬.

- 공식 codex 플러그인의 `codex-rescue`는 샌드박스가 강제되고(ssh·네트워크 불가) 진행 상황이 안 보인다.
- 이 스킬은 출력을 로그 파일로 남겨 `status.sh`로 언제든 진행 상황을 본다.

필요: `codex` CLI 로그인 상태. 설치: `/plugin install codex-yolo@duddudcns`

## 백그라운드 강제 (0.3.0)

`hooks/require-background.js`(PreToolUse, Bash)가 `run.sh` 나 `codex exec` 를 `run_in_background: true` 없이 부르면 막는다. 앞단 실행은 세션을 붙잡고 작업 패널에도 안 뜨기 때문이다.
