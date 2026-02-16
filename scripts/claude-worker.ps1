# claude-worker.ps1 - Claude CLI Worker for Diana Sentient Corporation
# Persistent session with CEO-ZERO activation + Sonnet 4.5 model
# Sessions persist via --resume, CEO-ZERO stays active across tasks
#
# Usage: powershell -NoProfile -File claude-worker.ps1 -WorkerName sentinela

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("sentinela", "escrivao", "revisador")]
    [string]$WorkerName
)

$ROOT = Split-Path -Parent $PSScriptRoot
$TRIGGER = Join-Path $ROOT ".trigger_$WorkerName"
$PROMPT_FILE = Join-Path $ROOT ".prompt_$WorkerName.txt"
$LOCK = Join-Path $ROOT ".worker_$WorkerName.lock"
$SESSION_FILE = Join-Path $ROOT ".session_$WorkerName.txt"
$STOP_FILE = Join-Path $ROOT ".stop_$WorkerName"
$SESSIONS_DIR = Join-Path $env:USERPROFILE ".claude\projects\C--Users-User-Desktop-Diana-Corporacao-Senciente"

$MODEL = "claude-sonnet-4-5-20250929"
$POLL_INTERVAL = 3

$ICONS = @{
    "sentinela" = "SENTINELA"
    "escrivao"  = "ESCRIVAO"
    "revisador" = "REVISADOR"
}

$ROLES = @{
    "sentinela" = "Genesis - gera stories de evolucao senciente"
    "escrivao"  = "Escrivao - implementa stories do backlog"
    "revisador" = "Revisador - revisa stories completadas"
}

# === ENV CLEANUP ===
# Clean CLAUDECODE env vars to allow nested claude CLI invocations
# Preserve GIT_BASH_PATH which claude needs
$gitBashPath = $env:CLAUDE_CODE_GIT_BASH_PATH
if (-not $gitBashPath) { $gitBashPath = "D:\Git\bin\bash.exe" }

Get-ChildItem Env: | Where-Object { $_.Name -like "CLAUDECODE*" } | ForEach-Object {
    Remove-Item "Env:\$($_.Name)" -ErrorAction SilentlyContinue
}
$env:CLAUDE_CODE_GIT_BASH_PATH = $gitBashPath

# === FUNCTIONS ===
function Log($msg, $color = "Cyan") {
    $ts = Get-Date -Format "HH:mm:ss"
    Write-Host "[$ts] [$($ICONS[$WorkerName])] $msg" -ForegroundColor $color
}

function Get-SessionId {
    if (Test-Path $SESSION_FILE) {
        $sid = (Get-Content $SESSION_FILE -Raw -ErrorAction SilentlyContinue)
        if ($sid) { return $sid.Trim() }
    }
    return $null
}

function Init-CeoZero {
    Log "Inicializando CEO-ZERO + Sonnet 4.5..." "Yellow"

    # Record existing sessions before init
    $beforeSessions = @()
    if (Test-Path $SESSIONS_DIR) {
        $beforeSessions = @(Get-ChildItem "$SESSIONS_DIR\*.jsonl" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name)
    }

    $role = $ROLES[$WorkerName]
    $initPrompt = @"
Voce e o worker '$WorkerName' da Diana Corporacao Senciente.
Papel: $role

Ative o modo CEO-ZERO (Zeus) para orquestrar tasks via Agent Zero com custo minimo.
Use *fire para tasks simples e *batch para multiplas.
Delegue para Agent Zero sempre que possivel (modelos free).

Confirme ativacao respondendo: WORKER $WorkerName ONLINE
"@

    & claude -p $initPrompt --model $MODEL --dangerously-skip-permissions 2>&1 | ForEach-Object { Write-Host $_ }

    # Find new session created by init
    Start-Sleep -Seconds 2
    if (Test-Path $SESSIONS_DIR) {
        $afterSessions = @(Get-ChildItem "$SESSIONS_DIR\*.jsonl" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Name)
        $newSessions = $afterSessions | Where-Object { $_ -notin $beforeSessions }
        if ($newSessions) {
            $first = if ($newSessions -is [array]) { $newSessions[0] } else { $newSessions }
            $sid = [System.IO.Path]::GetFileNameWithoutExtension($first)
            $sid | Set-Content $SESSION_FILE -Encoding UTF8
            Log "Sessao persistente criada: $($sid.Substring(0, 8))..." "Green"
            return $sid
        }
    }

    Log "WARN: Session ID nao capturado (fallback sem resume)" "DarkYellow"
    return $null
}

function Run-Claude($prompt) {
    $sessionId = Get-SessionId
    if ($sessionId) {
        & claude --resume $sessionId -p $prompt --model $MODEL --dangerously-skip-permissions 2>&1 | ForEach-Object { Write-Host $_ }
    } else {
        & claude -p $prompt --model $MODEL --dangerously-skip-permissions 2>&1 | ForEach-Object { Write-Host $_ }
        # Try to capture session for next time
        Start-Sleep -Seconds 1
        if (Test-Path $SESSIONS_DIR) {
            $newest = Get-ChildItem "$SESSIONS_DIR\*.jsonl" -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
            if ($newest) {
                $newest.BaseName | Set-Content $SESSION_FILE -Encoding UTF8
                Log "Sessao capturada: $($newest.BaseName.Substring(0, 8))..." "DarkGray"
            }
        }
    }
}

# === STARTUP ===
Log "Worker Claude iniciado (Model: Sonnet 4.5)" "Green"
Log "Trigger: .trigger_$WorkerName | Session: .session_$WorkerName.txt" "DarkGray"

# Initialize CEO-ZERO session if none exists
$sessionId = Get-SessionId
if (-not $sessionId) {
    $sessionId = Init-CeoZero
} else {
    Log "Sessao existente: $($sessionId.Substring(0, 8))..." "Green"
}

Log "Aguardando tasks..." "Green"
$taskCount = 0

# === MAIN LOOP ===
while ($true) {
    # Check stop signal
    if (Test-Path $STOP_FILE) {
        Log "Stop signal recebido. Encerrando..." "Yellow"
        Remove-Item $STOP_FILE -Force -ErrorAction SilentlyContinue
        break
    }

    if (Test-Path $TRIGGER) {
        $taskCount++
        Get-Date -Format "o" | Set-Content -Path $LOCK -Encoding UTF8

        Log "Task #$taskCount detectada! Processando..." "Yellow"

        # Read prompt (from .prompt file or trigger content)
        $prompt = $null
        if (Test-Path $PROMPT_FILE) {
            $prompt = Get-Content $PROMPT_FILE -Raw -Encoding UTF8
            Remove-Item $PROMPT_FILE -Force -ErrorAction SilentlyContinue
        }
        if (-not $prompt) {
            $prompt = Get-Content $TRIGGER -Raw -Encoding UTF8
        }

        Remove-Item $TRIGGER -Force -ErrorAction SilentlyContinue

        if ($prompt -and $prompt.Trim().Length -gt 10) {
            Log "Executando via Claude CLI (resume session)..." "Yellow"
            Write-Host ("=" * 60) -ForegroundColor DarkGray

            $startTime = Get-Date
            try {
                Run-Claude $prompt
                $elapsed = ((Get-Date) - $startTime).TotalSeconds
                Write-Host ("=" * 60) -ForegroundColor DarkGray
                Log "Task #$taskCount concluida em $([math]::Round($elapsed))s" "Green"
            } catch {
                Log "ERRO task #$taskCount : $_" "Red"
                # Reset session on error (might be corrupted)
                if (Test-Path $SESSION_FILE) {
                    Remove-Item $SESSION_FILE -Force -ErrorAction SilentlyContinue
                    Log "Sessao resetada - proxima task cria nova sessao" "DarkYellow"
                }
            }
        } else {
            Log "Prompt vazio - ignorando" "DarkYellow"
        }

        Remove-Item $LOCK -Force -ErrorAction SilentlyContinue
        Log "Aguardando proxima task..." "Green"
    }

    Start-Sleep -Seconds $POLL_INTERVAL
}
