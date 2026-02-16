param(
    [Parameter(Mandatory=$true)]
    [string]$TaskId,
    
    [string]$ProjectRoot = "C:/Users/User/Desktop/Diana-Corporacao-Senciente",
    
    [string]$TestCommand = "npm test"
)

Write-Host "🤝 Initiating handoff for Task: $TaskId" -ForegroundColor Cyan

$agentZeroQueue = "C:/Users/User/Desktop/Diana-Corporacao-Senciente/workers/agent-zero/queue"

if (-not (Test-Path $agentZeroQueue)) {
    New-Item -ItemType Directory -Path $agentZeroQueue -Force | Out-Null
}

$task = @{
    id = $TaskId
    task_type = "TestExecution"
    project_root = $ProjectRoot
    test_command = $TestCommand
    created_at = Get-Date -Format "o"
}

$taskFile = Join-Path $agentZeroQueue "task-$TaskId.json"
$task | ConvertTo-Json | Set-Content $taskFile -Encoding UTF8

Write-Host "✅ Task queued for Agent Zero validation." -ForegroundColor Green
