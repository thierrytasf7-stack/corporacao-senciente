# trigger-to-claude-simple.ps1
# Versão SIMPLES: Apenas copia para clipboard e notifica
# Usuário cola manualmente no Claude

param(
    [Parameter(Mandatory=$true)]
    [string]$WorkerName
)

$ROOT = "C:\Users\User\Desktop\Diana-Corporacao-Senciente"
Set-Location $ROOT

$TRIGGER_FILE = ".trigger_$WorkerName"
$PROMPT_FILE = ".prompt_$WorkerName.txt"
$COUNTER_FILE = ".counter_$WorkerName.txt"

$WORKER_ROLES = @{
    "sentinela" = "Genesis - gera stories de evolucao senciente"
    "escrivao" = "Trabalhador - implementa stories do backlog"
    "revisador" = "Revisor - revisa e aprova stories completadas"
}

$CEO_INIT_MESSAGE = @"
Voce e o worker '$WorkerName' da Diana Corporacao Senciente.
Papel: $($WORKER_ROLES[$WorkerName])

Ative o modo CEO-ZERO (Zeus) para orquestrar tasks via Agent Zero com custo minimo.
Use *fire para tasks simples e *batch para multiplas.
Delegue para Agent Zero sempre que possivel (modelos free).

Confirme ativacao respondendo: WORKER $($WorkerName.ToUpper()) ONLINE
"@

function Write-Log {
    param([string]$Message, [string]$Color = "Cyan")
    $ts = Get-Date -Format "HH:mm:ss"
    Write-Host "[$ts] [WATCHER] $Message" -ForegroundColor $Color
}

function Show-Notification {
    param([string]$Title, [string]$Message)
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║  $Title" -ForegroundColor Yellow
    Write-Host "╠═══════════════════════════════════════════════════════════╣" -ForegroundColor Yellow
    Write-Host "║" -ForegroundColor Yellow
    $Message -split "`n" | ForEach-Object {
        Write-Host "║  $_" -ForegroundColor White
    }
    Write-Host "║" -ForegroundColor Yellow
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
    Write-Host ""

    # Beep para chamar atenção
    [Console]::Beep(800, 200)
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

# Banner
Clear-Host
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  TRIGGER WATCHER - $($WorkerName.ToUpper())" -ForegroundColor Green
Write-Host "  Modo: Clipboard + Notificacao (Cole manualmente)" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Delays
$delays = @{
    "sentinela" = 90
    "escrivao" = 210
    "revisador" = 330
}

$initialDelay = $delays[$WorkerName]
if ($initialDelay) {
    Write-Log "Aguardando $initialDelay`s (Claude inicializar + CEO ativar)..."

    for ($i = 30; $i -le $initialDelay; $i += 30) {
        Start-Sleep -Seconds 30
        $remaining = $initialDelay - $i
        Write-Log "  $i`s/$initialDelay`s (faltam $remaining`s)"
    }

    if ($initialDelay % 30 -gt 0) {
        Start-Sleep -Seconds ($initialDelay % 30)
    }
}

# Enviar CEO-ZERO inicial
Write-Log "Preparando CEO-ZERO inicial..." "Yellow"
Set-Clipboard -Value $CEO_INIT_MESSAGE

$msg = "Mensagem copiada para clipboard!`n`n"
$msg += "Cole no terminal CLAUDE (pane inferior):`n"
$msg += "1. Clique no terminal Claude (pane de baixo)`n"
$msg += "2. Aperte Ctrl+V`n"
$msg += "3. Aperte Enter`n`n"
$msg += "Aguardando ativacao..."

Show-Notification "ATIVE CEO-ZERO NO CLAUDE!" $msg

Write-Log "Aguardando 30s para usuario ativar CEO-ZERO..."
Start-Sleep -Seconds 30

Write-Log "Iniciando monitoramento de triggers..." "Green"
Write-Host ""

$taskCount = Get-Counter

# Loop
while ($true) {
    try {
        if (Test-Path $TRIGGER_FILE) {
            if (Test-Path $PROMPT_FILE) {
                $taskCount++

                Write-Log "TRIGGER #$taskCount DETECTADO!" "Green"

                $prompt = Get-Content $PROMPT_FILE -Raw -Encoding utf8
                Set-Clipboard -Value $prompt

                $msg = "Prompt copiado para clipboard!`n`n"
                $msg += "Cole no terminal CLAUDE:`n"
                $msg += "1. Clique no Claude (pane de baixo)`n"
                $msg += "2. Ctrl+V`n"
                $msg += "3. Enter`n`n"
                $msg += "Tamanho: $($prompt.Length) caracteres"

                Show-Notification "NOVA TASK #$taskCount - COLE NO CLAUDE!" $msg

                Remove-Item $TRIGGER_FILE -Force -ErrorAction SilentlyContinue
                Set-Counter -Count $taskCount

                # A cada 10 tasks
                if ($taskCount % 10 -eq 0) {
                    Write-Log "Task #$taskCount - Reativando CEO-ZERO..." "Yellow"
                    Start-Sleep -Seconds 5

                    Set-Clipboard -Value $CEO_INIT_MESSAGE
                    $msg = "Mensagem copiada para clipboard!`n`n"
                    $msg += "Cole no Claude:`n"
                    $msg += "1. Clique no Claude`n"
                    $msg += "2. Ctrl+V`n"
                    $msg += "3. Enter"

                    Show-Notification "REATIVE CEO-ZERO (10 TASKS)!" $msg
                }
            } else {
                Remove-Item $TRIGGER_FILE -Force -ErrorAction SilentlyContinue
            }
        }

        Start-Sleep -Seconds 2

    } catch {
        Write-Log "Erro: $_" "Red"
        Start-Sleep -Seconds 5
    }
}
