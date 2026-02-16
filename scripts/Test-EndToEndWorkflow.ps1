# Test-EndToEndWorkflow.ps1 - Integration test for Hive and Agent Zero handoff

$storyDir = "C:/Users/User/Desktop/Diana-Corporacao-Senciente/docs/stories"
$testStory = Join-Path $storyDir "test_integration_flow.md"
$agentZeroQueue = "C:/Users/User/Desktop/Diana-Corporacao-Senciente/workers/agent-zero/queue"

Write-Host "🧪 Starting End-to-End Integration Test..." -ForegroundColor Cyan

# 1. Create a dummy story
Write-Host "   -> Creating test story..." -ForegroundColor Gray
$content = @"
# Story: Test Integration Flow
Status: TODO
subStatus: pending_worker
Revisions: 0

## Contexto
Teste de integração do fluxo nativo.

## Critérios
- [ ] Validar handoff.

## Aider Prompt
> ```text
> EXECUTE_COMMAND: echo 'Integration Test Success'
> ```
"@
$content | Set-Content $testStory -Encoding UTF8

# 2. Simulate Handoff to Agent Zero
Write-Host "   -> Simulating handoff to Agent Zero..." -ForegroundColor Gray
& ".\scripts\Invoke-WorkerHandoff.ps1" -TaskId "test-int-001" -TestCommand "echo 'Validation Success'"

# 3. Wait for Agent Zero to pick it up
Write-Host "   -> Waiting for Agent Zero to process (10s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 4. Check for completion log
$logPath = "C:/Users/User/Desktop/Diana-Corporacao-Senciente/workers/agent-zero/logs"
$completedFile = Get-ChildItem $logPath -Filter "completed-task-test-int-001.json"

if ($completedFile) {
    Write-Host "✅ [SUCCESS] Agent Zero processed the integration task!" -ForegroundColor Green
} else {
    Write-Host "❌ [FAIL] Agent Zero did not process the task in time." -ForegroundColor Red
}

# 5. Cleanup
Write-Host "   -> Cleaning up..." -ForegroundColor Gray
if (Test-Path $testStory) { Remove-Item $testStory }
if ($completedFile) { Remove-Item $completedFile.FullName }

Write-Host "✨ Integration test finished." -ForegroundColor Cyan
