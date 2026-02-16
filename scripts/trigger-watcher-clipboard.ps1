# trigger-watcher-clipboard.ps1
# Monitora triggers e copia para clipboard com notificacao visual

param([Parameter(Mandatory=$true)][string]$WorkerName)

$ROOT = "C:\Users\User\Desktop\Diana-Corporacao-Senciente"
Set-Location $ROOT

$TRIGGER_FILE = ".trigger_$WorkerName"
$PROMPT_FILE = ".prompt_$WorkerName.txt"
$COUNTER_FILE = ".counter_$WorkerName.txt"

$ROLES = @{
    "sentinela" = "Genesis - gera stories de evolucao senciente"
    "escrivao" = "Trabalhador - implementa stories do backlog"
    "revisador" = "Revisor - revisa e aprova stories completadas"
}

$ceoMsg = "Voce e o worker '$WorkerName' da Diana Corporacao Senciente.`n"
$ceoMsg += "Papel: $($ROLES[$WorkerName])`n`n"
$ceoMsg += "Ative o modo CEO-ZERO (Zeus) para orquestrar tasks via Agent Zero.`n"
$ceoMsg += "Confirme ativacao respondendo: WORKER $($WorkerName.ToUpper()) ONLINE"

function Log($msg, $color="Cyan") {
    Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] [WATCHER] $msg" -ForegroundColor $color
}

function Notify($title, $msg) {
    Write-Host "`n╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║  $title" -ForegroundColor Yellow
    Write-Host "╠═══════════════════════════════════════════════════════════╣" -ForegroundColor Yellow
    $msg -split "`n" | ForEach-Object { Write-Host "║  $_" -ForegroundColor White }
    Write-Host "╚═══════════════════════════════════════════════════════════╝`n" -ForegroundColor Yellow
    [Console]::Beep(800, 200)
}

function Get-Count {
    if (Test-Path $COUNTER_FILE) { try { return [int](Get-Content $COUNTER_FILE -Raw).Trim() } catch {} }
    return 0
}

function Set-Count($n) {
    $n | Out-File $COUNTER_FILE -Encoding utf8 -NoNewline
}

# Banner
Clear-Host
Write-Host "`n════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  TRIGGER WATCHER - $($WorkerName.ToUpper())" -ForegroundColor Green
Write-Host "  Modo: Clipboard + Notificacao" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════`n" -ForegroundColor Green

# Delay inicial
$delays = @{ "sentinela"=90; "escrivao"=210; "revisador"=330 }
$delay = $delays[$WorkerName]

if ($delay) {
    Log "Aguardando $delay`s (Claude inicializar + CEO ativar)..."
    for ($i=30; $i -le $delay; $i+=30) {
        Start-Sleep -Seconds 30
        Log "  $i`s/$delay`s (faltam $($delay-$i)`s)"
    }
    if ($delay % 30 -gt 0) { Start-Sleep -Seconds ($delay % 30) }
}

# CEO-ZERO inicial
Log "Preparando CEO-ZERO inicial..." "Yellow"
Set-Clipboard -Value $ceoMsg

$notif = "Mensagem copiada para clipboard!`n`n"
$notif += "Cole no terminal CLAUDE (pane inferior):`n"
$notif += "- Clique no Claude`n"
$notif += "- Aperte Ctrl+V`n"
$notif += "- Aperte Enter`n"

Notify "ATIVE CEO-ZERO NO CLAUDE!" $notif
Log "Aguardando 30s para ativacao..."
Start-Sleep -Seconds 30

Log "Iniciando monitoramento de triggers...`n" "Green"

$count = Get-Count

# Loop principal
while ($true) {
    try {
        if (Test-Path $TRIGGER_FILE) {
            if (Test-Path $PROMPT_FILE) {
                $count++
                Log "TRIGGER #$count DETECTADO!" "Green"

                $prompt = Get-Content $PROMPT_FILE -Raw -Encoding utf8
                Set-Clipboard -Value $prompt

                $notif = "Prompt copiado para clipboard!`n`n"
                $notif += "Cole no terminal CLAUDE:`n"
                $notif += "- Clique no Claude (pane de baixo)`n"
                $notif += "- Ctrl+V + Enter`n`n"
                $notif += "Tamanho: $($prompt.Length) caracteres"

                Notify "NOVA TASK #$count - COLE NO CLAUDE!" $notif

                Remove-Item $TRIGGER_FILE -Force -ErrorAction SilentlyContinue
                Set-Count $count

                # A cada 10 tasks
                if ($count % 10 -eq 0) {
                    Log "Task #$count - Reativando CEO-ZERO..." "Yellow"
                    Start-Sleep -Seconds 5

                    Set-Clipboard -Value $ceoMsg
                    $notif = "Mensagem copiada!`n`nCole no Claude: Ctrl+V + Enter"
                    Notify "REATIVE CEO-ZERO (10 TASKS)!" $notif
                }
            } else {
                Remove-Item $TRIGGER_FILE -Force -ErrorAction SilentlyContinue
            }
        }

        Start-Sleep -Seconds 2

    } catch {
        Log "Erro: $_" "Red"
        Start-Sleep -Seconds 5
    }
}
