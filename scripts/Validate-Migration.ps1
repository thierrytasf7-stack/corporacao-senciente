# Validate-Migration.ps1 - System Readiness Check for Native Architecture

$allPassed = $true

function Test-Component($name, $condition) {
    if ($condition) {
        Write-Host "[PASS] $name" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] $name" -ForegroundColor Red
        $script:allPassed = $false
    }
}

Write-Host "Starting Migration Validation Suite..." -ForegroundColor Cyan
Write-Host "------------------------------------------"

# 1. Guardian Hive (Rust)
$hiveBinary = "rust_components/hive-guardian/target/release/hive-guardian.exe"
$hiveConfig = "rust_components/hive-guardian/config.json"
Test-Component "Guardian Hive Binary exists" (Test-Path $hiveBinary)
Test-Component "Guardian Hive Config exists" (Test-Path $hiveConfig)

# 2. Agent Zero (PowerShell)
$agentZeroDir = "workers/agent-zero"
$requiredScripts = @("Start-AgentZero.ps1", "Install-Dependencies.ps1", "Invoke-Tests.ps1", "Report-Error.ps1", "Initialize-Environment.ps1")
foreach ($script in $requiredScripts) {
    Test-Component "Agent Zero Script: $script" (Test-Path (Join-Path $agentZeroDir $script))
}

# 3. PM2 & Orchestration
Test-Component "PM2 Ecosystem Config exists" (Test-Path "ecosystem.config.js")
Test-Component "Setup-Squad script exists" (Test-Path "Setup-Squad.ps1")
Test-Component "Binance Bot Script exists" (Test-Path "scripts/Start-BinanceBot.ps1")
Test-Component "Protocol Genesis Script exists" (Test-Path "scripts/Start-ProtocolGenesis.ps1")
Test-Component "Environment Update Script exists" (Test-Path "scripts/Update-EnvironmentConfig.ps1")
Test-Component "File Ownership Script exists" (Test-Path "scripts/Test-FileOwnership.ps1")
Test-Component "Metrics Export Script exists" (Test-Path "scripts/Export-MetricsHistory.ps1")
Test-Component "Service Startup Script exists" (Test-Path "scripts/Test-ServiceStartup.ps1")
Test-Component "Control Panel Script exists" (Test-Path "scripts/Control-Panel.ps1")

# 4. Aider Configuration
$aiderScript = "scripts/aider-worker-engine.nu"
if (Test-Path $aiderScript) {
    $content = Get-Content $aiderScript -Raw
    $hasHardcodedKey = $content -match "sk-or-v1-"
    $hasDelegation = $content -match "Invoke-WorkerHandoff.ps1"
    Test-Component "Aider script is sanitized (no hardcoded keys)" (-not $hasHardcodedKey)
    Test-Component "Aider script implements delegation (Req 6.2)" $hasDelegation
} else {
    Test-Component "Aider script exists" $false
}

# 5. Environment
$nuPath = "C:/Users/User/AppData/Local/Programs/nu/bin/nu.exe"
Test-Component "Nushell executable found" (Test-Path $nuPath)

Write-Host "------------------------------------------"
if ($allPassed) {
    Write-Host "SYSTEM READY FOR NATIVE EXECUTION!" -ForegroundColor Green
    Write-Host "You can now run .\Setup-Squad.ps1 to start the system." -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "Some components are missing or misconfigured." -ForegroundColor Red
    exit 1
}
