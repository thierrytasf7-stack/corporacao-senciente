# claude-worker-simple.ps1 - SIMPLES: Roda Claude e processa comandos IPC
param([string]$WorkerName = "sentinela")

$root = "C:\Users\User\Desktop\Diana-Corporacao-Senciente"
$cmdFile = "$root\.claude_cmd_$WorkerName.txt"
$lockFile = "$root\.claude_cmd_$WorkerName.lock"
$sessionFile = "$root\.session_$WorkerName.txt"

Set-Location $root

# Fix encoding UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

# Limpar env vars conflitantes
Get-ChildItem env:CLAUDECODE* -ErrorAction SilentlyContinue | Remove-Item
$env:CLAUDE_CODE_GIT_BASH_PATH = "D:\Git\bin\bash.exe"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  DIANA CLAUDE WORKER - $($WorkerName.ToUpper())" -ForegroundColor Cyan
Write-Host "  Modo: Execucao direta (output visivel)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar sessão existente
$sessionId = $null
if (Test-Path $sessionFile) {
    $sessionId = Get-Content $sessionFile -Raw -ErrorAction SilentlyContinue | ForEach-Object { $_.Trim() }
    if ($sessionId) {
        Write-Host "[OK] Sessao existente: $($sessionId.Substring(0, [Math]::Min(12, $sessionId.Length)))..." -ForegroundColor Green
    }
}

$taskCount = 0

Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Aguardando comandos IPC..." -ForegroundColor Yellow
Write-Host "(Ctrl+C para sair)" -ForegroundColor DarkGray
Write-Host ""

# Loop principal
while ($true) {
    try {
        # Verifica comando IPC
        if ((Test-Path $cmdFile) -and -not (Test-Path $lockFile)) {
            $taskCount++

            # Lock
            New-Item $lockFile -ItemType File -Force | Out-Null

            # Ler prompt
            $prompt = Get-Content $cmdFile -Raw -Encoding UTF8 | ForEach-Object { $_.Trim() }

            if ($prompt) {
                Write-Host ""
                Write-Host ("="*60) -ForegroundColor Cyan
                Write-Host "  TASK #$taskCount DETECTADA" -ForegroundColor Green
                Write-Host ("="*60) -ForegroundColor Cyan
                Write-Host ""

                # Construir comando Claude
                $claudeArgs = @("--dangerously-skip-permissions", "-p", $prompt)
                if ($sessionId) {
                    $claudeArgs += @("--resume", $sessionId)
                }

                Write-Host "[>] Executando Claude..." -ForegroundColor Yellow
                Write-Host ""

                # EXECUTAR CLAUDE DIRETO (output completo e verboso!)
                & claude @claudeArgs

                Write-Host ""

                Write-Host ""
                Write-Host ("="*60) -ForegroundColor Cyan
                Write-Host "  TASK #$taskCount CONCLUIDA" -ForegroundColor Green
                Write-Host ("="*60) -ForegroundColor Cyan
                Write-Host ""
            }

            # Cleanup
            Remove-Item $cmdFile -ErrorAction SilentlyContinue
            Remove-Item $lockFile -ErrorAction SilentlyContinue
        }

        Start-Sleep -Milliseconds 500

    } catch {
        Write-Host "[ERRO] $($_.Exception.Message)" -ForegroundColor Red
        if (Test-Path $lockFile) { Remove-Item $lockFile -ErrorAction SilentlyContinue }
        Start-Sleep -Seconds 1
    }
}
