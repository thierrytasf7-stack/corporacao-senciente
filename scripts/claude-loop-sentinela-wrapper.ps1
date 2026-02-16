# claude-loop-sentinela-wrapper.ps1
# Wrapper PowerShell que define env var e lança bash loop

$env:CLAUDE_CODE_GIT_BASH_PATH = "D:\Git\bin\bash.exe"

# Executar bash e esperar (blocking, para PM2 manter processo vivo)
$bashPath = "D:\Git\bin\bash.exe"
$scriptPath = Join-Path $PSScriptRoot "claude-loop-worker.sh"

Write-Host "[WRAPPER] Iniciando bash loop sentinela..."
& $bashPath $scriptPath "sentinela"
