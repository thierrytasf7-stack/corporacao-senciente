# Claude Wrapper API Reference

**Version:** 1.0.0
**Binary:** `workers/claude-wrapper/target/release/claude-wrapper.exe`
**Platform:** Windows x64 (native)
**Language:** Rust 2021 Edition

---

## Table of Contents

1. [Overview](#overview)
2. [CLI Interface](#cli-interface)
3. [Environment Variables](#environment-variables)
4. [File System Interface](#file-system-interface)
5. [Session Management](#session-management)
6. [Exit Codes](#exit-codes)
7. [Output Format](#output-format)
8. [Integration Examples](#integration-examples)
9. [Error Handling](#error-handling)

---

## Overview

`claude-wrapper.exe` é um wrapper nativo Rust que executa Claude Code CLI em loop FIFO, processando prompts de uma queue directory e salvando outputs, mantendo sessão persistente via `--resume`.

**Key Features:**
- FIFO queue processing (oldest first)
- Session persistence between tasks
- Low memory footprint (~6-8MB)
- Zero runtime dependencies
- Native Windows performance

---

## CLI Interface

### Synopsis

```bash
claude-wrapper.exe [WORKER_NAME]
```

### Arguments

| Argument | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `WORKER_NAME` | String | No | `"default"` | Nome do worker (usado para paths queue/output/session) |

### Examples

```bash
# Start sentinela worker
claude-wrapper.exe sentinela

# Start escrivao worker
claude-wrapper.exe escrivao

# Start default worker
claude-wrapper.exe
```

---

## Environment Variables

### Required

| Variable | Value | Description |
|----------|-------|-------------|
| `CLAUDE_CODE_GIT_BASH_PATH` | `D:\Git\usr\bin\bash.exe` | Git Bash path para Claude CLI |

**Set by wrapper internally:**
```rust
env::set_var("CLAUDE_CODE_GIT_BASH_PATH", r"D:\Git\usr\bin\bash.exe");
```

### Removed

| Variable | Reason |
|----------|--------|
| `CLAUDECODE` | Removed to prevent nested session error |
| `CLAUDECODE_*` | All variants removed |

**Cleanup by wrapper:**
```rust
env::remove_var("CLAUDECODE");
```

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_PATH` | Auto-detect | Override Claude CLI executable path |

---

## File System Interface

### Directory Structure

```
C:/Users/User/Desktop/Diana-Corporacao-Senciente/
├── .queue/
│   └── {WORKER_NAME}/        # Input queue
│       ├── prompt_001.prompt
│       ├── prompt_002.prompt
│       └── ...
├── .output/
│   └── {WORKER_NAME}/        # Output directory
│       ├── latest.txt        # Latest task output
│       ├── task_1.txt
│       ├── task_2.txt
│       └── ...
└── .session_{WORKER_NAME}.txt # Session UUID file
```

### Input Queue

**Path:** `.queue/{WORKER_NAME}/*.prompt`

**Format:** Plain text files
- Extension: `.prompt` (required)
- Encoding: UTF-8
- Content: Prompt text para Claude CLI
- Processing: FIFO (oldest file first)

**Example:**
```
.queue/sentinela/prompt_1771084864.prompt
```

**Content:**
```
Analise a ETAPA_002 senciencia e crie 3 stories prioritárias.
```

**Lifecycle:**
1. Sentinela escreve `.queue/sentinela/prompt_N.prompt`
2. Wrapper detecta arquivo (oldest via mtime)
3. Wrapper lê conteúdo
4. Wrapper executa Claude com prompt
5. Wrapper salva output
6. **Wrapper deleta `.prompt` file**

---

### Output Directory

**Path:** `.output/{WORKER_NAME}/`

**Files:**
- `latest.txt` - Output da última task (sobrescreve)
- `task_N.txt` - Output da task #N (append-only log)

**Format:** Plain text (stdout do Claude CLI)

**Example output:**
```
# 🏆 VITÓRIA TOTAL! 🏆

## Confirmação Final

A arquitetura STABLE IPC dos Workers Diana está **100% IMPLEMENTADA E VALIDADA**:
...
```

---

### Session File

**Path:** `.session_{WORKER_NAME}.txt`

**Format:** Single line UUID
```
1234abcd-5678-efgh-9012-ijklmnop3456
```

**Lifecycle:**
1. First run: File não existe
2. Claude cria nova sessão
3. Output contains: `Session ID: {uuid}`
4. Wrapper extrai UUID
5. Wrapper escreve `.session_{WORKER_NAME}.txt`
6. Next run: Wrapper lê UUID
7. Wrapper passa `--resume {uuid}` para Claude
8. Claude carrega contexto da sessão

---

## Session Management

### Session Creation

**First execution (no session file):**

```rust
let session_id = None;  // No session file exists

let mut cmd = Command::new("claude");
cmd.arg("--dangerously-skip-permissions");
cmd.arg("--print");
cmd.arg(&prompt);
// NO --resume argument

let output = cmd.output()?;
```

**Output includes:**
```
Starting new session...
Session ID: abc-123-def-456
[rest of output]
```

**Wrapper extracts UUID:**
```rust
if output.contains("Session ID:") {
    for line in output.lines() {
        if line.contains("Session ID:") {
            let uuid = line.split("Session ID:")
                          .nth(1)
                          .unwrap()
                          .trim()
                          .to_string();
            save_session(&session_file, &uuid)?;
        }
    }
}
```

---

### Session Resume

**Subsequent executions:**

```rust
let session_id = load_session(&session_file);  // Some("abc-123-def-456")

let mut cmd = Command::new("claude");
cmd.arg("--dangerously-skip-permissions");
cmd.arg("--print");
cmd.arg(&prompt);
cmd.arg("--resume");
cmd.arg(session_id.unwrap());

let output = cmd.output()?;
```

**Claude loads context:**
- Previous prompts/responses
- File reads (Read tool history)
- Agent activation state
- Memory updates

**Output does NOT include new Session ID.**

---

### Session Persistence Benefits

| Without Session | With Session (`--resume`) |
|-----------------|---------------------------|
| Cold start every task | Warm start (context loaded) |
| No memory of previous tasks | Full context continuity |
| Repeat same reads | Cached file reads |
| Re-activate agents | Agents stay activated |
| ~5-10s per task | ~2-5s per task |

---

## Exit Codes

| Code | Meaning | Action |
|------|---------|--------|
| `0` | Success | Continue loop |
| `1` | Generic error | Log error, continue loop (autorestart) |
| `101` | Claude execution failed | Log stderr, continue loop |
| `102` | Session file write failed | Log error, continue with in-memory session |
| `103` | Queue directory missing | Create directory, continue loop |

**Note:** Wrapper usa `loop` infinito. Exit codes só ocorrem em panic ou shutdown manual.

---

## Output Format

### Standard Output (stdout)

**Format:** Structured log messages

```
[WRAPPER-{worker}] Iniciando...
[WRAPPER-{worker}] Monitorando: "{queue_path}"
[WRAPPER-{worker}] Output: "{output_path}"

[WRAPPER-{worker}] TASK #{n}: "{prompt_file}"
[WRAPPER-{worker}] Executando Claude ({chars} chars)...
[WRAPPER-{worker}] TASK #{n} CONCLUIDA ({bytes} bytes)
```

**Example:**
```
[WRAPPER-sentinela] Iniciando...
[WRAPPER-sentinela] Monitorando: "C:\Users\User\Desktop\Diana-Corporacao-Senciente\.queue\sentinela"
[WRAPPER-sentinela] Output: "C:\Users\User\Desktop\Diana-Corporacao-Senciente\.output\sentinela"

[WRAPPER-sentinela] TASK #1: "victory_1771084864.prompt"
[WRAPPER-sentinela] Executando Claude (86 chars)...
[WRAPPER-sentinela] TASK #1 CONCLUIDA (1913 bytes)
```

---

### Standard Error (stderr)

**Format:** Error messages only

```
[ERROR-{worker}] {error_description}
```

**Example:**
```
[ERROR-sentinela] Failed to execute Claude: No such file or directory (os error 2)
```

---

### File Output

**Path:** `.output/{WORKER_NAME}/latest.txt`

**Content:** Raw stdout from Claude CLI

**Example:**
```
# Story 1.1: Implementar Sistema de Cache

## Objective
Adicionar sistema de cache em memória para queries frequentes...

## Acceptance Criteria
- [ ] Cache implementado com TTL configurável
- [ ] Testes de integração para cache hit/miss
...
```

---

## Integration Examples

### PM2 Integration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'claude-wrapper-sentinela',
      namespace: 'WORKERS',
      script: 'C:/Users/User/Desktop/Diana-Corporacao-Senciente/workers/claude-wrapper/target/release/claude-wrapper.exe',
      args: 'sentinela',
      cwd: 'C:/Users/User/Desktop/Diana-Corporacao-Senciente',
      instances: 1,
      autorestart: true,
      interpreter: 'none',  // Native binary
      max_memory_restart: '100M',
      env: {
        CLAUDE_CODE_GIT_BASH_PATH: 'D:\\Git\\usr\\bin\\bash.exe'
      }
    }
  ]
};
```

**Start:**
```bash
pm2 start ecosystem.config.js --only claude-wrapper-sentinela
```

**Monitor:**
```bash
pm2 logs claude-wrapper-sentinela --lines 50
```

---

### Python Sentinela Integration

```python
# sentinela-genesis.py
import os
import time
from pathlib import Path

QUEUE_DIR = Path('.queue/sentinela')
QUEUE_DIR.mkdir(parents=True, exist_ok=True)

def enqueue_prompt(prompt_text):
    """Adiciona prompt na queue para Rust wrapper processar"""
    timestamp = int(time.time())
    prompt_file = QUEUE_DIR / f"prompt_{timestamp}.prompt"

    # Write prompt
    prompt_file.write_text(prompt_text, encoding='utf-8')
    print(f"[SENTINELA] Enqueued: {prompt_file.name}")

# Example usage
enqueue_prompt("Analise ETAPA_002 senciencia e crie 3 stories prioritárias.")
```

**Flow:**
```
Python Sentinela → .queue/sentinela/prompt_N.prompt
                         ↓
                  Rust Wrapper detects
                         ↓
                  Claude processes
                         ↓
                  .output/sentinela/latest.txt
```

---

### Reading Output

```python
# read-output.py
from pathlib import Path

def read_latest_output(worker_name):
    """Lê output da última task processada"""
    output_file = Path(f'.output/{worker_name}/latest.txt')

    if output_file.exists():
        return output_file.read_text(encoding='utf-8')
    else:
        return None

# Example
output = read_latest_output('sentinela')
if output:
    print(f"Claude output:\n{output}")
else:
    print("No output yet")
```

---

### PowerShell Integration

```powershell
# Submit-ClaudePrompt.ps1
param(
    [string]$WorkerName = "sentinela",
    [string]$Prompt
)

$queueDir = ".queue\$WorkerName"
New-Item -ItemType Directory -Force -Path $queueDir | Out-Null

$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$promptFile = Join-Path $queueDir "prompt_$timestamp.prompt"

Set-Content -Path $promptFile -Value $Prompt -Encoding UTF8
Write-Host "[SUBMIT] Enqueued: $promptFile"
```

**Usage:**
```powershell
.\Submit-ClaudePrompt.ps1 -WorkerName sentinela -Prompt "Analise ETAPA_002"
```

---

## Error Handling

### Errors Handled Gracefully

| Error | Handling | Recovery |
|-------|----------|----------|
| Queue directory missing | Create directory | Continue loop |
| No prompt files | Sleep 0.5s | Continue loop |
| Claude execution timeout | Log error, skip task | Continue loop |
| Session file corrupt | Ignore, create new session | Continue with new session |
| Output directory missing | Create directory | Continue loop |

**Example (queue directory missing):**
```rust
if !queue_dir.exists() {
    fs::create_dir_all(&queue_dir)?;
    println!("[WRAPPER-{}] Created queue directory", worker_name);
}
```

---

### Fatal Errors (Panic)

| Error | Cause | Action |
|-------|-------|--------|
| Cannot create queue directory | Permissions | Fix permissions, restart |
| Cannot write output file | Disk full | Free disk space, restart |
| Claude binary not found | PATH issue | Install Claude CLI, restart |

**Example (Claude not found):**
```
[ERROR-sentinela] Failed to execute Claude: No such file or directory (os error 2)
thread 'main' panicked at 'Claude execution failed'
```

**Recovery:**
```bash
# Install Claude CLI
npm install -g @anthropics/claude-code

# Verify installation
which claude

# Restart wrapper
pm2 restart claude-wrapper-sentinela
```

---

### Logging Best Practices

**PM2 logs:**
```bash
# Tail stdout
pm2 logs claude-wrapper-sentinela --out

# Tail stderr
pm2 logs claude-wrapper-sentinela --err

# Both streams
pm2 logs claude-wrapper-sentinela
```

**Log rotation (PM2):**
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## Performance Characteristics

### Resource Usage

| Metric | Value | Notes |
|--------|-------|-------|
| Binary size | 235KB | Optimized release build |
| RAM (idle) | 6-8MB | Minimal footprint |
| RAM (executing) | ~250MB | During Claude execution (subprocess) |
| CPU (idle) | <1% | Sleep 0.5s between polls |
| CPU (executing) | Varies | Depends on Claude task complexity |

---

### Latency

| Operation | Time | Notes |
|-----------|------|-------|
| Queue poll | ~1ms | Filesystem scan |
| Prompt read | ~5ms | Small text file |
| Claude startup | ~2-3s | CLI initialization |
| Claude processing | 2-10s | Depends on prompt |
| Output write | ~10ms | Text file write |
| **Total per task** | **5-15s** | End-to-end |

**Bottleneck:** Claude startup (~2-3s) is unavoidable with exec-per-task approach.

---

### Throughput

**Single worker:**
- ~4-12 tasks/minute (depends on prompt complexity)
- ~250-700 tasks/hour
- ~6,000-17,000 tasks/day

**Multiple workers (parallel):**
- 2 workers: ~2x throughput
- 5 workers: ~4-5x throughput (not linear due to resource contention)

---

## Build & Deployment

### Compilation

```bash
cd workers/claude-wrapper
cargo build --release
```

**Output:** `target/release/claude-wrapper.exe` (235KB)

**Optimization flags (Cargo.toml):**
```toml
[profile.release]
opt-level = "z"          # Optimize for size
lto = true               # Link-time optimization
codegen-units = 1        # Single codegen unit
strip = true             # Strip symbols
panic = "abort"          # Abort on panic (smaller binary)
```

---

### Deployment Checklist

- [ ] Compile release binary: `cargo build --release`
- [ ] Verify binary: `.\target\release\claude-wrapper.exe sentinela` (manual test)
- [ ] Update PM2 config: `ecosystem.config.js`
- [ ] Start worker: `pm2 start ecosystem.config.js --only claude-wrapper-{worker}`
- [ ] Verify logs: `pm2 logs claude-wrapper-{worker}`
- [ ] Test queue: Criar `.queue/{worker}/test.prompt`
- [ ] Verify output: Check `.output/{worker}/latest.txt`
- [ ] Save PM2 state: `pm2 save`

---

## Security Considerations

### File System Access

Wrapper tem acesso completo ao filesystem (necessário para Claude CLI).

**Mitigations:**
- Run as non-admin user
- Restringir PM2 process ao working directory via `cwd`
- Não expor wrapper via rede (local-only)

---

### Session Hijacking

Session UUID em plaintext no `.session_{worker}.txt`.

**Risk:** Low (local filesystem only)

**Mitigations:**
- File permissions: 600 (owner read/write only)
- Não commitar session files para git (`.gitignore`)

---

### Prompt Injection

Prompts não são sanitizados antes de enviar para Claude.

**Risk:** Medium (depende de quem escreve prompts)

**Mitigations:**
- Apenas Sentinela confiável pode escrever `.queue/*.prompt`
- Não expor queue directory via API pública

---

## References

- **Source Code:** `workers/claude-wrapper/src/main.rs`
- **ADR:** `docs/architecture/ADR-001-claude-workers-rust-wrapper.md`
- **Technical Guide:** `docs/guides/claude-workers-implementation.md`
- **Memory:** `.claude/memory/claude-workers.md`
- **Changelog:** `CHANGELOG.md` (entry pending)

---

*Claude Wrapper API Reference v1.0.0 | 2026-02-14*
