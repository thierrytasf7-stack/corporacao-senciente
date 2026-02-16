# trigger-to-claude-watcher.ps1
# Monitora triggers e envia automaticamente para Claude via clipboard + SendKeys

param(
    [Parameter(Mandatory=$true)]
    [string]$WorkerName
)

$ROOT = "C:\Users\User\Desktop\Diana-Corporacao-Senciente"
Set-Location $ROOT

$TRIGGER_FILE = ".trigger_$WorkerName"
$PROMPT_FILE = ".prompt_$WorkerName.txt"
$COUNTER_FILE = ".counter_$WorkerName.txt"

# Título da janela Claude (deve corresponder ao title do .bat)
# Ex: "SENTINELA-CLAUDE", "ESCRIVAO-CLAUDE", "REVISADOR-CLAUDE"
$CLAUDE_WINDOW_TITLE = "$($WorkerName.ToUpper())-CLAUDE"

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

Add-Type -AssemblyName System.Windows.Forms
Add-Type @"
    using System;
    using System.Runtime.InteropServices;
    public class Win32 {
        [DllImport("user32.dll")]
        public static extern bool SetForegroundWindow(IntPtr hWnd);

        [DllImport("user32.dll")]
        public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
    }
"@

function Write-Log {
    param([string]$Message)
    $ts = Get-Date -Format "HH:mm:ss"
    Write-Host "[$ts] [WATCHER-$($WorkerName.ToUpper())] $Message" -ForegroundColor Cyan
}

function Send-ToClaudeWindow {
    param([string]$Text)

    try {
        # Copiar para clipboard PRIMEIRO
        Set-Clipboard -Value $Text
        Write-Log "Texto copiado para clipboard (${Text.Length} chars)"

        # Método 1: Usar SendKeys diretamente no console atual
        # Isso funciona porque o watcher está rodando NO MESMO Windows Terminal
        Write-Log "Enviando para pane Claude no mesmo Windows Terminal..."

        # Criar objeto SendKeys
        $wshell = New-Object -ComObject wscript.shell

        # Aguardar um pouco
        Start-Sleep -Milliseconds 500

        # Enviar Ctrl+Tab para mudar de pane (se necessário)
        # Windows Terminal: Ctrl+Shift+] vai para próximo pane
        # Mas como Claude está na 3ª pane, vamos enviar 2x
        Write-Log "Navegando para pane Claude (Ctrl+Shift+])..."
        $wshell.SendKeys("^+{]}")
        Start-Sleep -Milliseconds 300
        $wshell.SendKeys("^+{]}")
        Start-Sleep -Milliseconds 300

        # Agora enviar Ctrl+V
        Write-Log "Colando texto (Ctrl+V)..."
        $wshell.SendKeys("^v")
        Start-Sleep -Milliseconds 500

        # Enviar Enter
        Write-Log "Enviando Enter..."
        $wshell.SendKeys("{ENTER}")
        Start-Sleep -Milliseconds 300

        # Voltar para pane do watcher (Ctrl+Shift+[)
        $wshell.SendKeys("^+{[}")
        Start-Sleep -Milliseconds 300
        $wshell.SendKeys("^+{[}")

        Write-Log "Texto enviado com sucesso!"
        return $true

    } catch {
        Write-Log "ERRO ao enviar: $_"
        Write-Log "Texto esta no clipboard. Cole manualmente no Claude."
        return $false
    }
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
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  TRIGGER WATCHER - $($WorkerName.ToUpper())" -ForegroundColor Green
Write-Host "  Envia triggers automaticamente para Claude" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Aguardar delay inicial (para Claude ter iniciado)
$delays = @{
    "sentinela" = 90   # 60s init + 30s CEO
    "escrivao" = 210   # 120s delay + 60s init + 30s CEO
    "revisador" = 330  # 240s delay + 60s init + 30s CEO
}

$initialDelay = $delays[$WorkerName]
if ($initialDelay) {
    Write-Log "Aguardando $initialDelay`s (Claude inicializar + CEO-ZERO ativar)..."

    for ($i = 30; $i -le $initialDelay; $i += 30) {
        Start-Sleep -Seconds 30
        $remaining = $initialDelay - $i
        Write-Log "  Aguardando... $i`s/$initialDelay`s (faltam $remaining`s)"
    }

    $remainder = $initialDelay % 30
    if ($remainder -gt 0) {
        Start-Sleep -Seconds $remainder
    }
}

# Enviar ativação CEO-ZERO inicial
Write-Log "Enviando ativacao CEO-ZERO inicial..."
Send-ToClaudeWindow -Text $CEO_INIT_MESSAGE
Start-Sleep -Seconds 5

Write-Log "Iniciando monitoramento de triggers..."
Write-Host ""

$taskCount = Get-Counter

# Loop de monitoramento
while ($true) {
    try {
        if (Test-Path $TRIGGER_FILE) {
            if (Test-Path $PROMPT_FILE) {
                $taskCount++

                Write-Log "TRIGGER DETECTADO! Task #$taskCount"

                $prompt = Get-Content $PROMPT_FILE -Raw -Encoding utf8

                # Enviar para Claude
                $sent = Send-ToClaudeWindow -Text $prompt

                if ($sent) {
                    # Remover trigger
                    Remove-Item $TRIGGER_FILE -Force -ErrorAction SilentlyContinue

                    # Salvar contador
                    Set-Counter -Count $taskCount

                    # A cada 10 tasks, reativar CEO-ZERO
                    if ($taskCount % 10 -eq 0) {
                        Write-Log "Task #$taskCount completada - Reativando CEO-ZERO..."
                        Start-Sleep -Seconds 3
                        Send-ToClaudeWindow -Text $CEO_INIT_MESSAGE
                        Start-Sleep -Seconds 5
                    }
                } else {
                    Write-Log "Falha ao enviar. Trigger mantido para retry."
                }
            } else {
                # Trigger sem prompt, remover
                Remove-Item $TRIGGER_FILE -Force -ErrorAction SilentlyContinue
            }
        }

        Start-Sleep -Seconds 2

    } catch {
        Write-Log "Erro no loop: $_"
        Start-Sleep -Seconds 5
    }
}
