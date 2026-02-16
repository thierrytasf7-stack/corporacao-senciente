# Test-MigrationState.Simple.ps1
# Simple validation tests for migration state tracking
# Compatible with Pester v3

# Import the module
. "$PSScriptRoot\MigrationState.ps1"

# Create temp directory for tests
$script:TestRoot = Join-Path $env:TEMP "migration-state-tests-$(Get-Date -Format 'yyyyMMddHHmmss')"
New-Item -ItemType Directory -Path $script:TestRoot -Force | Out-Null

Write-Host "Running migration state tracking tests..." -ForegroundColor Cyan
Write-Host "Test directory: $script:TestRoot" -ForegroundColor Gray

try {
    # Test 1: Initialize migration state
    Write-Host "`nTest 1: Initialize migration state" -ForegroundColor Yellow
    $statePath = Join-Path $script:TestRoot "test-state.json"
    $state = Initialize-MigrationState -StatePath $statePath
    
    if ((Test-Path $statePath) -and ($state.phase -eq "NotStarted")) {
        Write-Host "  PASS: State initialized correctly" -ForegroundColor Green
    }
    else {
        Write-Host "  FAIL: State initialization failed" -ForegroundColor Red
        exit 1
    }
    
    # Test 2: Phase transition
    Write-Host "`nTest 2: Phase transition" -ForegroundColor Yellow
    $state = Set-MigrationPhase -StatePath $statePath -NewPhase "BackupInProgress"
    
    if ($state.phase -eq "BackupInProgress") {
        Write-Host "  PASS: Phase transition successful" -ForegroundColor Green
    }
    else {
        Write-Host "  FAIL: Phase transition failed" -ForegroundColor Red
        exit 1
    }
    
    # Test 3: Invalid phase transition
    Write-Host "`nTest 3: Invalid phase transition (should fail)" -ForegroundColor Yellow
    try {
        Set-MigrationPhase -StatePath $statePath -NewPhase "Completed" -ErrorAction Stop
        Write-Host "  FAIL: Should have thrown error for invalid transition" -ForegroundColor Red
        exit 1
    }
    catch {
        Write-Host "  PASS: Invalid transition correctly rejected" -ForegroundColor Green
    }
    
    # Test 4: Add processed container
    Write-Host "`nTest 4: Add processed container" -ForegroundColor Yellow
    Add-ProcessedContainer -StatePath $statePath -ContainerName "test-container" -ContainerId "abc123"
    $state = Get-MigrationState -StatePath $statePath
    
    if ($state.docker_containers_removed.Count -eq 1 -and $state.docker_containers_removed[0].name -eq "test-container") {
        Write-Host "  PASS: Container added successfully" -ForegroundColor Green
    }
    else {
        Write-Host "  FAIL: Container not added correctly" -ForegroundColor Red
        exit 1
    }
    
    # Test 5: Add preserved data
    Write-Host "`nTest 5: Add preserved data" -ForegroundColor Yellow
    Add-PreservedData -StatePath $statePath -DataKey "test-config" -BackupPath "C:\backups\config.json"
    $state = Get-MigrationState -StatePath $statePath
    
    if ($state.data_preserved.'test-config' -eq "C:\backups\config.json") {
        Write-Host "  PASS: Preserved data added successfully" -ForegroundColor Green
    }
    else {
        Write-Host "  FAIL: Preserved data not added correctly" -ForegroundColor Red
        exit 1
    }
    
    # Test 6: Add native process
    Write-Host "`nTest 6: Add native process" -ForegroundColor Yellow
    Add-NativeProcess -StatePath $statePath -ProcessName "guardian-hive" -ProcessId 12345
    $state = Get-MigrationState -StatePath $statePath
    
    if ($state.native_processes_started.Count -eq 1 -and $state.native_processes_started[0].name -eq "guardian-hive") {
        Write-Host "  PASS: Native process added successfully" -ForegroundColor Green
    }
    else {
        Write-Host "  FAIL: Native process not added correctly" -ForegroundColor Red
        exit 1
    }
    
    # Test 7: Add validation result
    Write-Host "`nTest 7: Add validation result" -ForegroundColor Yellow
    Add-ValidationResult -StatePath $statePath -Component "guardian-hive" -TestName "test1" -Passed $true
    $state = Get-MigrationState -StatePath $statePath
    
    if ($state.validation_results.Count -eq 1 -and $state.validation_results[0].passed -eq $true) {
        Write-Host "  PASS: Validation result added successfully" -ForegroundColor Green
    }
    else {
        Write-Host "  FAIL: Validation result not added correctly" -ForegroundColor Red
        exit 1
    }
    
    # Test 8: Set rollback availability
    Write-Host "`nTest 8: Set rollback availability" -ForegroundColor Yellow
    Set-RollbackAvailability -StatePath $statePath -Available $false
    $state = Get-MigrationState -StatePath $statePath
    
    if ($state.rollback_available -eq $false) {
        Write-Host "  PASS: Rollback availability set successfully" -ForegroundColor Green
    }
    else {
        Write-Host "  FAIL: Rollback availability not set correctly" -ForegroundColor Red
        exit 1
    }
    
    # Test 9: Set migration error
    Write-Host "`nTest 9: Set migration error" -ForegroundColor Yellow
    Set-MigrationError -StatePath $statePath -ErrorMessage "Test error message"
    $state = Get-MigrationState -StatePath $statePath
    
    if ($state.error.message -eq "Test error message") {
        Write-Host "  PASS: Migration error set successfully" -ForegroundColor Green
    }
    else {
        Write-Host "  FAIL: Migration error not set correctly" -ForegroundColor Red
        exit 1
    }
    
    # Test 10: Audit log
    Write-Host "`nTest 10: Audit log" -ForegroundColor Yellow
    $auditLog = Get-MigrationAuditLog -StatePath $statePath
    
    if ($auditLog.Count -gt 5) {
        Write-Host "  PASS: Audit log contains entries ($($auditLog.Count) entries)" -ForegroundColor Green
    }
    else {
        Write-Host "  FAIL: Audit log missing entries" -ForegroundColor Red
        exit 1
    }
    
    # Test 11: Complete migration flow
    Write-Host "`nTest 11: Complete migration flow" -ForegroundColor Yellow
    $flowStatePath = Join-Path $script:TestRoot "test-flow-state.json"
    Initialize-MigrationState -StatePath $flowStatePath
    Set-MigrationPhase -StatePath $flowStatePath -NewPhase "BackupInProgress"
    Set-MigrationPhase -StatePath $flowStatePath -NewPhase "ContainerTermination"
    Set-MigrationPhase -StatePath $flowStatePath -NewPhase "NativeDeployment"
    Set-MigrationPhase -StatePath $flowStatePath -NewPhase "Validation"
    $finalState = Set-MigrationPhase -StatePath $flowStatePath -NewPhase "Completed"
    
    if ($finalState.phase -eq "Completed" -and $finalState.completed_at -ne $null) {
        Write-Host "  PASS: Complete migration flow successful" -ForegroundColor Green
    }
    else {
        Write-Host "  FAIL: Complete migration flow failed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`n=== All tests passed ===" -ForegroundColor Green
    Write-Host "Total tests: 11" -ForegroundColor Cyan
    
    # Display sample state
    Write-Host "`nSample migration state:" -ForegroundColor Cyan
    $state | ConvertTo-Json -Depth 5 | Write-Host
    
    exit 0
}
catch {
    Write-Host "`nTest execution failed: $_" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}
finally {
    # Cleanup
    Write-Host "`nCleaning up test directory..." -ForegroundColor Gray
    if (Test-Path $script:TestRoot) {
        Remove-Item -Path $script:TestRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
}
