# Start-AgentZero.ps1 - Agent Zero v2.0 LLM Worker
# Modes:
#   No args     → Start polling daemon
#   -Once       → Process queue once
#   -Task <f>   → Process single task file

param(
    [switch]$Once,
    [string]$Task
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path (Join-Path $ScriptDir "..\..")
Set-Location $ProjectRoot

# Ensure directories
$dirs = @("workers/agent-zero/queue", "workers/agent-zero/results", "workers/agent-zero/logs")
foreach ($d in $dirs) {
    if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   AGENT ZERO v2.0 : LLM-POWERED AIOS WORKER" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

if ($Task) {
    Write-Host "[MODE] Single task: $Task" -ForegroundColor Yellow
    node workers/agent-zero/index.js --task $Task
}
elseif ($Once) {
    Write-Host "[MODE] Process queue once" -ForegroundColor Yellow
    node workers/agent-zero/index.js --once
}
else {
    Write-Host "[MODE] Daemon - polling queue every 3s" -ForegroundColor Yellow
    Write-Host "[STOP] Create .stop file to shutdown gracefully" -ForegroundColor DarkGray
    Write-Host ""
    node workers/agent-zero/index.js
}
