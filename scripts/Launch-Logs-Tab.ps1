# Launch-Logs-Tab.ps1
$projectRoot = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
Set-Location $projectRoot

Write-Host "🤖 Tailing Agent Zero Logs..." -ForegroundColor Cyan

$logDir = "workers/agent-zero/logs"
if (-not (Test-Path $logDir)) {
    Write-Warning "Log directory not found: $logDir"
    Read-Host "Press Enter..."
    exit
}

# Wait for a log file to appear if none exist
while (-not (Get-ChildItem "$logDir/*.json")) {
    Write-Host "Waiting for logs..."
    Start-Sleep -Seconds 2
}

Get-Content "$logDir/*.json" -Tail 10 -Wait
