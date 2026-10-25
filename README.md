# codex-yolo

Claude Code 플러그인. Codex CLI를 **샌드박스 없이(`codex exec --yolo`)** 백그라운드로 직접 실행하는 `codex-yolo:run` 스킬.

- 공식 codex 플러그인의 `codex-rescue`는 샌드박스가 강제되고(ssh·네트워크 불가) 진행 상황이 안 보인다.
- 이 스킬은 출력을 로그 파일로 남겨 `status.sh`로 언제든 진행 상황을 본다.

필요: `codex` CLI 로그인 상태. 설치: `/plugin install codex-yolo@duddudcns`

> **주의:** `--yolo`는 샌드박스와 승인 절차를 모두 끈다. Codex가 파일 삭제·네트워크 접근·임의 명령 실행을 확인 없이 할 수 있으니, 믿을 수 있는 작업과 저장소에서만 쓰고 중요한 변경은 커밋해 둔 뒤 실행할 것.

## 백그라운드 강제 (0.3.0)

`hooks/require-background.js`(PreToolUse, Bash)가 `run.sh` 나 `codex exec` 를 `run_in_background: true` 없이 부르면 막는다. 앞단 실행은 세션을 붙잡고 작업 패널에도 안 뜨기 때문이다. 또 명령이 `codex_job="<작업 이름>" bash .../run.sh` 로 시작하지 않으면 막는다. 작업 패널은 명령의 앞부분을 작업 이름으로 보여 주기 때문이다(`run.sh` 도 `codex_job` 이 없으면 종료 코드 2).
