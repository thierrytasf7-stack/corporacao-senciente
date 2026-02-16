# Migration State Tracking System

## Overview

The Migration State Tracking System provides comprehensive state management for the Docker to Native migration process. It tracks migration phases, container processing, data preservation, native process deployment, validation results, and maintains rollback capability.

## Features

- **Phase Management**: Track migration through defined phases with validated transitions
- **Container Tracking**: Record which Docker containers have been processed
- **Data Preservation**: Track preserved data locations for rollback capability
- **Process Tracking**: Monitor native processes that have been started
- **Validation Results**: Record validation test results for each component
- **Audit Logging**: Comprehensive audit trail in JSON Lines format
- **Rollback Support**: Maintain rollback availability flag

## Migration Phases

The migration follows these phases in order:

1. **NotStarted**: Initial state before migration begins
2. **BackupInProgress**: Data preservation and backup phase
3. **ContainerTermination**: Docker container shutdown phase
4. **NativeDeployment**: Native process startup phase
5. **Validation**: System validation and testing phase
6. **Completed**: Migration successfully completed
7. **RolledBack**: Migration rolled back to Docker

## Valid Phase Transitions

```
NotStarted → BackupInProgress
BackupInProgress → ContainerTermination | RolledBack
ContainerTermination → NativeDeployment | RolledBack
NativeDeployment → Validation | RolledBack
Validation → Completed | RolledBack
Completed → RolledBack
RolledBack → (terminal state)
```

## Usage

### Initialize Migration State

```powershell
# Import the module
. .\MigrationState.ps1

# Initialize a new migration state
Initialize-MigrationState -StatePath "C:\project\migration\migration-state.json"
```

### Transition Between Phases

```powershell
# Transition to next phase
Set-MigrationPhase -StatePath "C:\project\migration\migration-state.json" -NewPhase "BackupInProgress"

# Force a transition (skip validation)
Set-MigrationPhase -StatePath "C:\project\migration\migration-state.json" -NewPhase "RolledBack" -Force
```

### Track Container Processing

```powershell
# Record a processed container
Add-ProcessedContainer -StatePath "C:\project\migration\migration-state.json" `
    -ContainerName "guardian-hive" `
    -ContainerId "abc123def456"
```

### Track Data Preservation

```powershell
# Record preserved data location
Add-PreservedData -StatePath "C:\project\migration\migration-state.json" `
    -DataKey "guardian-hive-config" `
    -BackupPath "C:\project\migration\backups\guardian-hive\config.json"
```

### Track Native Processes

```powershell
# Record a started native process
Add-NativeProcess -StatePath "C:\project\migration\migration-state.json" `
    -ProcessName "guardian-hive" `
    -ProcessId 12345
```

### Record Validation Results

```powershell
# Record a passing validation test
Add-ValidationResult -StatePath "C:\project\migration\migration-state.json" `
    -Component "guardian-hive" `
    -TestName "native_execution_test" `
    -Passed $true

# Record a failing validation test
Add-ValidationResult -StatePath "C:\project\migration\migration-state.json" `
    -Component "worker-aider" `
    -TestName "file_access_test" `
    -Passed $false `
    -ErrorMessage "Permission denied on C:\project\src"
```

### Manage Rollback Availability

```powershell
# Set rollback as unavailable (e.g., after Docker images are deleted)
Set-RollbackAvailability -StatePath "C:\project\migration\migration-state.json" -Available $false

# Set rollback as available
Set-RollbackAvailability -StatePath "C:\project\migration\migration-state.json" -Available $true
```

### Record Migration Errors

```powershell
# Record an error
Set-MigrationError -StatePath "C:\project\migration\migration-state.json" `
    -ErrorMessage "Failed to start guardian-hive process: Port 8080 already in use"
```

### Retrieve Migration State

```powershell
# Get current migration state
$state = Get-MigrationState -StatePath "C:\project\migration\migration-state.json"

# Display state
$state | ConvertTo-Json -Depth 5
```

### Audit Logging

```powershell
# Write a custom audit log entry
Write-MigrationAuditLog -StatePath "C:\project\migration\migration-state.json" `
    -Action "CustomAction" `
    -Details "Custom action details" `
    -Level "INFO"

# Retrieve all audit log entries
$auditLog = Get-MigrationAuditLog -StatePath "C:\project\migration\migration-state.json"

# Retrieve last 10 audit log entries
$recentLog = Get-MigrationAuditLog -StatePath "C:\project\migration\migration-state.json" -Last 10

# Display audit log
$auditLog | ForEach-Object {
    Write-Host "[$($_.timestamp)] [$($_.level)] $($_.action): $($_.details)"
}
```

## State File Structure

The migration state is stored as JSON:

```json
{
  "phase": "NativeDeployment",
  "started_at": "2024-01-15T09:00:00Z",
  "completed_at": null,
  "last_updated": "2024-01-15T09:15:00Z",
  "docker_containers_removed": [
    {
      "name": "guardian-hive",
      "id": "abc123def456",
      "removed_at": "2024-01-15T09:10:00Z"
    }
  ],
  "data_preserved": {
    "guardian-hive-config": "C:\\project\\backups\\guardian-hive\\config.json",
    "worker-aider-config": "C:\\project\\backups\\worker-aider\\config.json"
  },
  "native_processes_started": [
    {
      "name": "guardian-hive",
      "process_id": 12345,
      "started_at": "2024-01-15T09:12:00Z"
    }
  ],
  "validation_results": [
    {
      "component": "guardian-hive",
      "test_name": "native_execution_test",
      "passed": true,
      "error_message": null,
      "tested_at": "2024-01-15T09:14:00Z"
    }
  ],
  "rollback_available": true,
  "error": null,
  "metadata": {
    "version": "1.0",
    "migration_type": "docker_to_native",
    "platform": "windows"
  }
}
```

## Audit Log Format

The audit log uses JSON Lines format (one JSON object per line):

```json
{"timestamp":"2024-01-15T09:00:00Z","level":"INFO","action":"Initialize","details":"Migration state initialized"}
{"timestamp":"2024-01-15T09:01:00Z","level":"INFO","action":"PhaseTransition","details":"Transitioned from 'NotStarted' to 'BackupInProgress'"}
{"timestamp":"2024-01-15T09:05:00Z","level":"INFO","action":"DataPreserved","details":"Data 'guardian-hive-config' preserved at 'C:\\backups\\config.json'"}
{"timestamp":"2024-01-15T09:10:00Z","level":"INFO","action":"ContainerProcessed","details":"Container 'guardian-hive' (abc123) marked as removed"}
{"timestamp":"2024-01-15T09:12:00Z","level":"INFO","action":"ProcessStarted","details":"Native process 'guardian-hive' started"}
{"timestamp":"2024-01-15T09:14:00Z","level":"INFO","action":"ValidationResult","details":"Test 'native_execution_test' for 'guardian-hive': PASSED"}
{"timestamp":"2024-01-15T09:15:00Z","level":"ERROR","action":"Error","details":"Failed to start worker-aider: Permission denied"}
```

## Complete Migration Example

```powershell
# Import the module
. .\MigrationState.ps1

$statePath = "C:\project\migration\migration-state.json"

try {
    # 1. Initialize
    Write-Host "Initializing migration..." -ForegroundColor Cyan
    Initialize-MigrationState -StatePath $statePath
    
    # 2. Backup Phase
    Write-Host "Starting backup phase..." -ForegroundColor Cyan
    Set-MigrationPhase -StatePath $statePath -NewPhase "BackupInProgress"
    
    # Perform backups and track them
    Add-PreservedData -StatePath $statePath -DataKey "guardian-hive-config" -BackupPath "C:\backups\gh-config.json"
    Add-PreservedData -StatePath $statePath -DataKey "worker-aider-config" -BackupPath "C:\backups\wa-config.json"
    
    # 3. Container Termination
    Write-Host "Terminating containers..." -ForegroundColor Cyan
    Set-MigrationPhase -StatePath $statePath -NewPhase "ContainerTermination"
    
    # Stop containers and track them
    Add-ProcessedContainer -StatePath $statePath -ContainerName "guardian-hive" -ContainerId "abc123"
    Add-ProcessedContainer -StatePath $statePath -ContainerName "worker-aider" -ContainerId "def456"
    
    # 4. Native Deployment
    Write-Host "Deploying native processes..." -ForegroundColor Cyan
    Set-MigrationPhase -StatePath $statePath -NewPhase "NativeDeployment"
    
    # Start native processes and track them
    Add-NativeProcess -StatePath $statePath -ProcessName "guardian-hive" -ProcessId 12345
    Add-NativeProcess -StatePath $statePath -ProcessName "agent-zero" -ProcessId 12346
    
    # 5. Validation
    Write-Host "Validating migration..." -ForegroundColor Cyan
    Set-MigrationPhase -StatePath $statePath -NewPhase "Validation"
    
    # Run validation tests and record results
    Add-ValidationResult -StatePath $statePath -Component "guardian-hive" -TestName "native_execution" -Passed $true
    Add-ValidationResult -StatePath $statePath -Component "agent-zero" -TestName "dependency_install" -Passed $true
    
    # 6. Complete
    Write-Host "Migration completed successfully!" -ForegroundColor Green
    Set-MigrationPhase -StatePath $statePath -NewPhase "Completed"
    
    # Display final state
    $finalState = Get-MigrationState -StatePath $statePath
    Write-Host "`nFinal Migration State:" -ForegroundColor Cyan
    $finalState | ConvertTo-Json -Depth 5
}
catch {
    Write-Host "Migration failed: $_" -ForegroundColor Red
    Set-MigrationError -StatePath $statePath -ErrorMessage $_.Exception.Message
    
    # Optionally trigger rollback
    Write-Host "Initiating rollback..." -ForegroundColor Yellow
    Set-MigrationPhase -StatePath $statePath -NewPhase "RolledBack" -Force
}
```

## Testing

Run the test suite to verify functionality:

```powershell
# Run simple validation tests
.\Test-MigrationState.Simple.ps1

# Run Pester tests (if Pester v5+ is installed)
Invoke-Pester -Path .\Test-MigrationState.ps1
```

## Integration with Other Migration Scripts

The migration state tracking system integrates with other migration scripts:

```powershell
# Example: Integrate with backup script
$backupResult = .\Backup-DockerData.ps1 -InventoryPath "C:\project\migration\inventory.json"

if ($backupResult.success) {
    # Record preserved data
    foreach ($container in $backupResult.manifest.containers) {
        $dataKey = "$($container.container_name)-backup"
        $backupPath = Join-Path $backupResult.manifest.backup_root $container.container_name
        Add-PreservedData -StatePath $statePath -DataKey $dataKey -BackupPath $backupPath
    }
}
```

## Requirements Validation

This implementation validates:

- **Requirement 11.4**: Migration state tracking with phase transitions, container tracking, data preservation tracking, and audit logging

## Files

- `MigrationState.ps1`: Main module with all state tracking functions
- `Test-MigrationState.ps1`: Pester test suite (requires Pester v5+)
- `Test-MigrationState.Simple.ps1`: Simple validation tests (compatible with all Pester versions)
- `MigrationState-README.md`: This documentation file

## Notes

- All state is persisted in JSON format for transparency and portability
- Audit log uses JSON Lines format for easy parsing and streaming
- Phase transitions are validated to prevent invalid state changes
- The `-Force` flag can override transition validation when needed
- Audit logging failures do not stop migration (logged as warnings)
- State file and audit log are created automatically if they don't exist
