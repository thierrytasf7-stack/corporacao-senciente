# claude-worker-auto-v2.ps1 - Worker automatizado (PowerShell)
# Arquitetura: Executa Claude CLI com -p para cada trigger (não mantém processo)
# A cada 10 tasks: clear session + reativa CEO-ZERO

param(
    [Parameter(Mandatory=$true)]
    [string]$WorkerName
)

$ErrorActionPreference = "Stop"
$ROOT = "C:\Users\User\Desktop\Diana-Corporacao-Senciente"
Set-Location $ROOT

# Configuração
$TRIGGER_FILE = ".trigger_$WorkerName"
$PROMPT_FILE = ".prompt_$WorkerName.txt"
$LOCK_FILE = ".worker_$WorkerName.lock"
$SESSION_FILE = ".session_$WorkerName.txt"
$COUNTER_FILE = ".counter_$WorkerName.txt"

$MODEL = "claude-sonnet-4-5-20250929"
$REACTIVATE_INTERVAL = 10
$POLL_INTERVAL = 2

# Delays escalonados
$STARTUP_DELAYS = @{
    "sentinela" = 0
    "escrivao" = 120
    "revisador" = 240
    "corp" = 0
}

$WORKER_ROLES = @{
    "sentinela" = "Genesis - gera stories de evolucao senciente"
    "escrivao" = "Trabalhador - implementa stories do backlog"
    "revisador" = "Revisor - revisa e aprova stories completadas"
    "corp" = "Orquestrador corporativo geral"
}

$CEO_INIT_MESSAGE = @"
Voce e o worker '$WorkerName' da Diana Corporacao Senciente.
Papel: {0}

Ative o modo CEO-ZERO (Zeus) para orquestrar tasks via Agent Zero com custo minimo.
Use *fire para tasks simples e *batch para multiplas.
Delegue para Agent Zero sempre que possivel (modelos free).

Confirme ativacao respondendo: WORKER $($WorkerName.ToUpper()) ONLINE
"@

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $ts = Get-Date -Format "HH:mm:ss"
    Write-Host "[$ts] [$($WorkerName.ToUpper())] $Message"
}

function Get-Counter {
    if (Test-Path $COUNTER_FILE) {
        try {
            return [int](Get-Content $COUNTER_FILE -Raw).Trim()
        } catch {
            return 0
        }
    }
    return 0
}

function Set-Counter {
    param([int]$Count)
    $Count | Out-File $COUNTER_FILE -Encoding utf8 -NoNewline
}

function Get-SessionId {
    if (Test-Path $SESSION_FILE) {
        return (Get-Content $SESSION_FILE -Raw).Trim()
    }
    return $null
}

function Set-SessionId {
    param([string]$SessionId)
    $SessionId | Out-File $SESSION_FILE -Encoding utf8 -NoNewline
}

function Test-Locked {
    if (Test-Path $LOCK_FILE) {
        $age = (Get-Date) - (Get-Item $LOCK_FILE).LastWriteTime
        if ($age.TotalSeconds -gt 600) {
            Remove-Item $LOCK_FILE -Force
            return $false
        }
        return $true
    }
    return $false
}

function Invoke-Claude {
    param([string]$Prompt, [bool]$NewSession = $false)

    # Limpar env vars conflitantes
    Get-ChildItem Env:CLAUDECODE* | Remove-Item -ErrorAction SilentlyContinue
    $env:CLAUDE_CODE_GIT_BASH_PATH = "D:\Git\bin\bash.exe"

    # Comando base
    $claudeArgs = @("--model", $MODEL, "--dangerously-skip-permissions", "-p", $Prompt)

    # Session ID (se não for new session)
    $sessionId = Get-SessionId
    if (-not $NewSession -and $sessionId) {
        $claudeArgs = @("--resume", $sessionId) + $claudeArgs
    }

    Write-Log "Executando Claude CLI..."
    $output = & claude @claudeArgs 2>&1 | Out-String

    Write-Host $output
    return $output
}

# Main
$role = $WORKER_ROLES[$WorkerName]
Write-Log "Worker automatizado iniciado - Papel: $role"

$taskCount = Get-Counter
Write-Log "Contador atual: $taskCount tasks processadas"

# Delay escalonado
$startupDelay = $STARTUP_DELAYS[$WorkerName]
if ($startupDelay -gt 0) {
    Write-Log "Aguardando $($startupDelay)s para inicializacao sequencial..."
    Write-Log "  (Evita sobrecarga - workers inicializam em ordem: Genesis → Escrivao → Revisador)"

    for ($i = 30; $i -le $startupDelay; $i += 30) {
        Start-Sleep -Seconds 30
        $remaining = $startupDelay - $i
        Write-Log "  Aguardando... $i`s/$startupDelay`s (faltam $remaining`s)"
    }

    $remainder = $startupDelay % 30
    if ($remainder -gt 0) {
        Start-Sleep -Seconds $remainder
    }

    Write-Log "Delay de startup concluido. Iniciando worker..."
}

# Ativar CEO-ZERO inicial
Write-Log "Ativando CEO-ZERO inicial..."
$ceoPrompt = $CEO_INIT_MESSAGE -f $role
Invoke-Claude -Prompt $ceoPrompt -NewSession $true
Start-Sleep -Seconds 10

Write-Log "CEO-ZERO ativado. Iniciando processamento de triggers..."

# Loop de processamento
while ($true) {
    try {
        if (Test-Path $TRIGGER_FILE) {
            # Verificar lock
            if (Test-Locked) {
                Start-Sleep -Seconds $POLL_INTERVAL
                continue
            }

            # Verificar prompt
            if (-not (Test-Path $PROMPT_FILE)) {
                Write-Log "Trigger sem prompt, ignorando" -Level "WARN"
                Remove-Item $TRIGGER_FILE -Force
                continue
            }

            # Criar lock
            Get-Date -Format "o" | Out-File $LOCK_FILE -Encoding utf8

            # Processar task
            $taskCount++
            Write-Log "Processando task #$taskCount..."

            $prompt = Get-Content $PROMPT_FILE -Raw -Encoding utf8
            Invoke-Claude -Prompt $prompt

            # Remover trigger
            Remove-Item $TRIGGER_FILE -Force -ErrorAction SilentlyContinue

            # Salvar contador
            Set-Counter -Count $taskCount

            # A cada 10 tasks, reativar CEO-ZERO
            if ($taskCount % $REACTIVATE_INTERVAL -eq 0) {
                Write-Log "Task #$taskCount - Reativando CEO-ZERO (ciclo a cada 10 tasks)"
                Start-Sleep -Seconds 2

                $ceoPrompt = $CEO_INIT_MESSAGE -f $role
                Invoke-Claude -Prompt $ceoPrompt -NewSession $true

                Start-Sleep -Seconds 10
            }

            # Aguardar antes de remover lock
            Start-Sleep -Seconds 5

            if (Test-Path $LOCK_FILE) {
                Remove-Item $LOCK_FILE -Force
            }
        }

        Start-Sleep -Seconds $POLL_INTERVAL

    } catch {
        Write-Log "Erro no loop: $_" -Level "ERROR"
        Start-Sleep -Seconds 5
    }
}
