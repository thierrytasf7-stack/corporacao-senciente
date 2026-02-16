# claude-worker-stable.ps1 - Claude Interactive Worker (NO external spawning)
# Runs Claude CLI in FOREGROUND with persistent session visible in terminal
# Sentinela writes triggers, THIS script reads and feeds to SAME Claude session

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("sentinela", "escrivao", "revisador")]
    [string]$WorkerName
)

$ROOT = Split-Path -Parent $PSScriptRoot
$TRIGGER = Join-Path $ROOT ".trigger_$WorkerName"
$PROMPT_FILE = Join-Path $ROOT ".prompt_$WorkerName.txt"
$SESSION_FILE = Join-Path $ROOT ".session_$WorkerName.txt"
$RESPONSE_FILE = Join-Path $ROOT ".response_$WorkerName.txt"

$MODEL = "claude-sonnet-4-5-20250929"
$POLL_INTERVAL = 2

$ROLES = @{
    "sentinela" = "Genesis - gera stories de evolucao senciente"
    "escrivao"  = "Escrivao - implementa stories do backlog"
    "revisador" = "Revisador - revisa stories completadas"
}

# Clean CLAUDECODE vars, preserve GIT_BASH_PATH
$gitBashPath = $env:CLAUDE_CODE_GIT_BASH_PATH
if (-not $gitBashPath) { $gitBashPath = "D:\Git\bin\bash.exe" }
Get-ChildItem Env: | Where-Object { $_.Name -like "CLAUDECODE*" } | ForEach-Object {
    Remove-Item "Env:\$($_.Name)" -ErrorAction SilentlyContinue
}
$env:CLAUDE_CODE_GIT_BASH_PATH = $gitBashPath

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  DIANA WORKER: $($WorkerName.ToUpper())" -ForegroundColor Yellow
Write-Host "  Papel: $($ROLES[$WorkerName])" -ForegroundColor Gray
Write-Host "  Modelo: Sonnet 4.5 + CEO-ZERO" -ForegroundColor Gray
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Get or create session
$sessionId = $null
if (Test-Path $SESSION_FILE) {
    $sessionId = (Get-Content $SESSION_FILE -Raw).Trim()
    Write-Host "[OK] Sessao existente: $($sessionId.Substring(0, 12))..." -ForegroundColor Green
} else {
    Write-Host "[!] Criando nova sessao CEO-ZERO..." -ForegroundColor Yellow
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

# === INTERACTIVE LOOP ===
# This keeps Claude running IN THIS TERMINAL (no external spawn)
$taskCount = 0

while ($true) {
    $prompt = $null

    # Check for trigger
    if (Test-Path $TRIGGER) {
        $taskCount++
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
        Write-Host "  TASK #$taskCount DETECTADA" -ForegroundColor Yellow
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

        # Read prompt
        if (Test-Path $PROMPT_FILE) {
            $prompt = Get-Content $PROMPT_FILE -Raw -Encoding UTF8
            Remove-Item $PROMPT_FILE -Force -ErrorAction SilentlyContinue
        }
        if (-not $prompt) {
            $prompt = Get-Content $TRIGGER -Raw -Encoding UTF8
        }

        Remove-Item $TRIGGER -Force -ErrorAction SilentlyContinue
    }

    # No trigger = init prompt on first run
    if (-not $prompt -and $taskCount -eq 0) {
        $prompt = $initPrompt
        $taskCount = 1
    }

    # Execute Claude IN FOREGROUND (same terminal, visible)
    if ($prompt -and $prompt.Trim().Length -gt 10) {
        Write-Host ""
        Write-Host "[>] Executando via Claude (sessao $sessionId)..." -ForegroundColor Cyan
        Write-Host ""

        # === CRITICAL: Run Claude in FOREGROUND with session ===
        # Output is VISIBLE in this terminal (no external spawn)
        try {
            if ($sessionId) {
                # Resume existing session
                $output = & claude --resume $sessionId -p $prompt --model $MODEL --dangerously-skip-permissions 2>&1
            } else {
                # Create new session (first run)
                $output = & claude -p $prompt --model $MODEL --dangerously-skip-permissions 2>&1
            }

            # Display output line by line (VISIBLE in terminal)
            $output | ForEach-Object {
                Write-Host $_
            }

            # Capture session ID if not set
            if (-not $sessionId) {
                Start-Sleep -Seconds 1
                $SESSIONS_DIR = Join-Path $env:USERPROFILE ".claude\projects\C--Users-User-Desktop-Diana-Corporacao-Senciente"
                if (Test-Path $SESSIONS_DIR) {
                    $newest = Get-ChildItem "$SESSIONS_DIR\*.jsonl" -ErrorAction SilentlyContinue |
                              Sort-Object LastWriteTime -Descending |
                              Select-Object -First 1
                    if ($newest) {
                        $sessionId = $newest.BaseName
                        $sessionId | Set-Content $SESSION_FILE -Encoding UTF8
                        Write-Host ""
                        Write-Host "[OK] Sessao criada: $($sessionId.Substring(0, 12))..." -ForegroundColor Green
                    }
                }
            }

            Write-Host ""
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
            Write-Host "  TASK #$taskCount CONCLUIDA" -ForegroundColor Green
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
            Write-Host ""

        } catch {
            Write-Host ""
            Write-Host "[ERRO] Task #$taskCount falhou: $_" -ForegroundColor Red
            Write-Host ""
        }
    }

    # Wait for next trigger
    if ($taskCount -eq 0) {
        Write-Host "[~] Inicializando worker..." -ForegroundColor Gray
    } else {
        $ts = Get-Date -Format "HH:mm:ss"
        Write-Host "[$ts] Aguardando proxima task... (Ctrl+C para sair)" -ForegroundColor DarkGray
    }

    Start-Sleep -Seconds $POLL_INTERVAL
}
