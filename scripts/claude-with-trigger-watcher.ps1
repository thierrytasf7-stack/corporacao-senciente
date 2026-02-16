# claude-with-trigger-watcher.ps1
# Abre Claude interativo E monitora triggers em paralelo
# Quando trigger aparece, copia prompt para clipboard e notifica

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

function Write-Info {
    param([string]$Message)
    $ts = Get-Date -Format "HH:mm:ss"
    Write-Host "[$ts] [WATCHER] $Message" -ForegroundColor Cyan
}

# Banner
Clear-Host
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  CLAUDE INTERATIVO + TRIGGER WATCHER" -ForegroundColor Green
Write-Host "  Worker: $($WorkerName.ToUpper())" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

# 1. Iniciar Claude em background job (para não bloquear)
Write-Info "Iniciando Claude CLI..."
Write-Host ""

# Limpar env vars
Get-ChildItem Env:CLAUDECODE* -ErrorAction SilentlyContinue | Remove-Item
$env:CLAUDE_CODE_GIT_BASH_PATH = "D:\Git\bin\bash.exe"

# Iniciar Claude (foreground - visível no terminal)
$claudeJob = Start-Job -ScriptBlock {
    param($root)
    Set-Location $root
    & claude --dangerously-skip-permissions
} -ArgumentList $ROOT

# 2. Aguardar 60s para Claude inicializar
Write-Info "Aguardando 60s para Claude inicializar..."
for ($i = 10; $i -le 60; $i += 10) {
    Start-Sleep -Seconds 10
    Write-Info "  Inicializando... $i`s/60s"
}

# 3. Enviar ativação CEO-ZERO
Write-Info "Preparando ativacao CEO-ZERO..."
Write-Host ""
Write-Host "============================================" -ForegroundColor Yellow
Write-Host "  COPIE E COLE NO CLAUDE ABAIXO:" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow
Write-Host $CEO_INIT_MESSAGE -ForegroundColor White
Write-Host "============================================" -ForegroundColor Yellow
Write-Host ""

# Copiar para clipboard
Set-Clipboard -Value $CEO_INIT_MESSAGE
Write-Info "Mensagem copiada para clipboard! Cole no Claude (Ctrl+V + Enter)"
Write-Info "Aguardando 30s para ativacao..."
Start-Sleep -Seconds 30

# 4. Loop de monitoramento de triggers
Write-Info "Iniciando monitoramento de triggers..."
Write-Host ""

$taskCount = 0
if (Test-Path $COUNTER_FILE) {
    try {
        $taskCount = [int](Get-Content $COUNTER_FILE -Raw).Trim()
    } catch {}
}

while ($true) {
    # Verificar se Claude ainda está rodando
    if ($claudeJob.State -ne "Running") {
        Write-Info "Claude encerrado. Finalizando watcher..."
        break
    }

    # Verificar trigger
    if (Test-Path $TRIGGER_FILE) {
        if (Test-Path $PROMPT_FILE) {
            $taskCount++

            Write-Host ""
            Write-Host "============================================" -ForegroundColor Green
            Write-Host "  NOVO TRIGGER DETECTADO! Task #$taskCount" -ForegroundColor Green
            Write-Host "============================================" -ForegroundColor Green

            $prompt = Get-Content $PROMPT_FILE -Raw -Encoding utf8

            Write-Host $prompt -ForegroundColor White
            Write-Host ""
            Write-Host "============================================" -ForegroundColor Green
            Write-Host ""

            # Copiar para clipboard
            Set-Clipboard -Value $prompt
            Write-Info "Prompt copiado para clipboard! Cole no Claude (Ctrl+V + Enter)"

            # Salvar contador
            $taskCount | Out-File $COUNTER_FILE -Encoding utf8 -NoNewline

            # Remover trigger
            Remove-Item $TRIGGER_FILE -Force -ErrorAction SilentlyContinue

            # A cada 10 tasks, lembrar de reativar CEO-ZERO
            if ($taskCount % 10 -eq 0) {
                Write-Host ""
                Write-Host "============================================" -ForegroundColor Yellow
                Write-Host "  ATENCAO: 10 tasks completadas!" -ForegroundColor Yellow
                Write-Host "  Reative CEO-ZERO copiando msg abaixo:" -ForegroundColor Yellow
                Write-Host "============================================" -ForegroundColor Yellow
                Write-Host $CEO_INIT_MESSAGE -ForegroundColor White
                Write-Host "============================================" -ForegroundColor Yellow
                Write-Host ""

                # Também copiar para clipboard
                Set-Clipboard -Value $CEO_INIT_MESSAGE
                Write-Info "Mensagem CEO-ZERO copiada! Cole no Claude"
            }
        } else {
            Remove-Item $TRIGGER_FILE -Force -ErrorAction SilentlyContinue
        }
    }

    Start-Sleep -Seconds 2
}

# Cleanup
Remove-Job -Job $claudeJob -Force -ErrorAction SilentlyContinue
