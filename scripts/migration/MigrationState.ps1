# MigrationState.ps1
# Migration State Tracking System
# Manages migration phases, state transitions, and audit logging
# Provides functions for tracking migration progress and rollback capability

<#
.SYNOPSIS
    Manages migration state tracking and phase transitions.

.DESCRIPTION
    Provides a comprehensive state tracking system for the Docker to Native migration.
    Tracks migration phases, container processing status, validation results, and
    maintains rollback capability. All state is persisted in JSON format for
    transparency and auditability.

.NOTES
    Validates: Requirements 11.4
    Part of: Sentient Corp Native Architecture Migration
    
    Migration Phases:
    - NotStarted: Initial state before migration begins
    - BackupInProgress: Data preservation and backup phase
    - ContainerTermination: Docker container shutdown phase
    - NativeDeployment: Native process startup phase
    - Validation: System validation and testing phase
    - Completed: Migration successfully completed
    - RolledBack: Migration rolled back to Docker
#>

# Migration phase enumeration
$script:MigrationPhases = @(
    "NotStarted",
    "BackupInProgress",
    "ContainerTermination",
    "NativeDeployment",
    "Validation",
    "Completed",
    "RolledBack"
)

# Valid phase transitions
$script:ValidTransitions = @{
    "NotStarted" = @("BackupInProgress")
    "BackupInProgress" = @("ContainerTermination", "RolledBack")
    "ContainerTermination" = @("NativeDeployment", "RolledBack")
    "NativeDeployment" = @("Validation", "RolledBack")
    "Validation" = @("Completed", "RolledBack")
    "Completed" = @("RolledBack")
    "RolledBack" = @()
}

function Initialize-MigrationState {
    <#
    .SYNOPSIS
        Initializes a new migration state.
    
    .DESCRIPTION
        Creates a new migration state object with default values.
        Sets phase to NotStarted and initializes all tracking structures.
    
    .PARAMETER StatePath
        Path where the migration state JSON file will be stored.
        Default: C:\project\migration\migration-state.json
    
    .EXAMPLE
        Initialize-MigrationState
        Creates a new migration state at the default location.
    
    .EXAMPLE
        Initialize-MigrationState -StatePath "C:\custom\state.json"
        Creates a new migration state at a custom location.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$StatePath = "C:\project\migration\migration-state.json"
    )
    
    try {
        Write-Verbose "Initializing migration state at: $StatePath"
        
        $state = @{
            phase = "NotStarted"
            started_at = Get-Date -Format "o"
            completed_at = $null
            last_updated = Get-Date -Format "o"
            docker_containers_removed = @()
            data_preserved = @{}
            native_processes_started = @()
            validation_results = @()
            rollback_available = $true
            error = $null
            metadata = @{
                version = "1.0"
                migration_type = "docker_to_native"
                platform = "windows"
            }
        }
        
        # Ensure directory exists
        $stateDir = Split-Path -Parent $StatePath
        if (-not (Test-Path $stateDir)) {
            New-Item -ItemType Directory -Path $stateDir -Force | Out-Null
        }
        
        # Save initial state
        $state | ConvertTo-Json -Depth 10 | Out-File -FilePath $StatePath -Encoding UTF8
        
        # Log initialization
        Write-MigrationAuditLog -StatePath $StatePath -Action "Initialize" -Details "Migration state initialized"
        
        Write-Verbose "Migration state initialized successfully"
        return $state
    }
    catch {
        Write-Error "Failed to initialize migration state: $_"
        throw
    }
}

function Get-MigrationState {
    <#
    .SYNOPSIS
        Retrieves the current migration state.
    
    .DESCRIPTION
        Loads and returns the current migration state from the JSON file.
    
    .PARAMETER StatePath
        Path to the migration state JSON file.
        Default: C:\project\migration\migration-state.json
    
    .EXAMPLE
        Get-MigrationState
        Retrieves the migration state from the default location.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$StatePath = "C:\project\migration\migration-state.json"
    )
    
    try {
        if (-not (Test-Path $StatePath)) {
            Write-Warning "Migration state file not found: $StatePath"
            return $null
        }
        
        $state = Get-Content $StatePath -Raw | ConvertFrom-Json
        return $state
    }
    catch {
        Write-Error "Failed to load migration state: $_"
        throw
    }
}

function Set-MigrationPhase {
    <#
    .SYNOPSIS
        Transitions the migration to a new phase.
    
    .DESCRIPTION
        Updates the migration phase with validation of allowed transitions.
        Logs the phase transition to the audit log.
    
    .PARAMETER StatePath
        Path to the migration state JSON file.
    
    .PARAMETER NewPhase
        The target phase to transition to.
    
    .PARAMETER Force
        Skip transition validation (use with caution).
    
    .EXAMPLE
        Set-MigrationPhase -NewPhase "BackupInProgress"
        Transitions from NotStarted to BackupInProgress.
    
    .EXAMPLE
        Set-MigrationPhase -NewPhase "RolledBack" -Force
        Forces a transition to RolledBack regardless of current phase.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$StatePath = "C:\project\migration\migration-state.json",
        
        [Parameter(Mandatory=$true)]
        [ValidateSet("NotStarted", "BackupInProgress", "ContainerTermination", "NativeDeployment", "Validation", "Completed", "RolledBack")]
        [string]$NewPhase,
        
        [Parameter(Mandatory=$false)]
        [switch]$Force
    )
    
    try {
        # Load current state
        $state = Get-MigrationState -StatePath $StatePath
        
        if ($null -eq $state) {
            throw "Migration state not found. Please initialize first."
        }
        
        $currentPhase = $state.phase
        
        # Validate transition
        if (-not $Force) {
            $validTransitions = $script:ValidTransitions[$currentPhase]
            
            if ($validTransitions -notcontains $NewPhase) {
                throw "Invalid phase transition from '$currentPhase' to '$NewPhase'. Valid transitions: $($validTransitions -join ', ')"
            }
        }
        
        Write-Verbose "Transitioning from '$currentPhase' to '$NewPhase'"
        
        # Convert PSCustomObject to hashtable for modification
        $stateHash = @{}
        $state.PSObject.Properties | ForEach-Object { $stateHash[$_.Name] = $_.Value }
        
        # Update phase
        $stateHash.phase = $NewPhase
        $stateHash.last_updated = Get-Date -Format "o"
        
        # Set completed_at if reaching Completed or RolledBack
        if ($NewPhase -eq "Completed" -or $NewPhase -eq "RolledBack") {
            $stateHash.completed_at = Get-Date -Format "o"
        }
        
        # Save updated state
        $stateHash | ConvertTo-Json -Depth 10 | Out-File -FilePath $StatePath -Encoding UTF8
        
        # Log phase transition
        Write-MigrationAuditLog -StatePath $StatePath -Action "PhaseTransition" -Details "Transitioned from '$currentPhase' to '$NewPhase'"
        
        Write-Verbose "Phase transition completed successfully"
        return $stateHash
    }
    catch {
        Write-Error "Failed to set migration phase: $_"
        throw
    }
}

function Add-ProcessedContainer {
    <#
    .SYNOPSIS
        Records a container as processed during migration.
    
    .DESCRIPTION
        Adds a container to the list of removed Docker containers.
    
    .PARAMETER StatePath
        Path to the migration state JSON file.
    
    .PARAMETER ContainerName
        Name of the container that was processed.
    
    .PARAMETER ContainerId
        ID of the container that was processed.
    
    .EXAMPLE
        Add-ProcessedContainer -ContainerName "guardian-hive" -ContainerId "abc123"
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$StatePath = "C:\project\migration\migration-state.json",
        
        [Parameter(Mandatory=$true)]
        [string]$ContainerName,
        
        [Parameter(Mandatory=$true)]
        [string]$ContainerId
    )
    
    try {
        $state = Get-MigrationState -StatePath $StatePath
        
        if ($null -eq $state) {
            throw "Migration state not found"
        }
        
        # Convert to hashtable
        $stateHash = @{}
        $state.PSObject.Properties | ForEach-Object { $stateHash[$_.Name] = $_.Value }
        
        # Add container to removed list
        $containerInfo = @{
            name = $ContainerName
            id = $ContainerId
            removed_at = Get-Date -Format "o"
        }
        
        $stateHash.docker_containers_removed += $containerInfo
        $stateHash.last_updated = Get-Date -Format "o"
        
        # Save updated state
        $stateHash | ConvertTo-Json -Depth 10 | Out-File -FilePath $StatePath -Encoding UTF8
        
        # Log action
        Write-MigrationAuditLog -StatePath $StatePath -Action "ContainerProcessed" -Details "Container '$ContainerName' ($ContainerId) marked as removed"
        
        Write-Verbose "Container '$ContainerName' added to processed list"
    }
    catch {
        Write-Error "Failed to add processed container: $_"
        throw
    }
}

function Add-PreservedData {
    <#
    .SYNOPSIS
        Records preserved data location.
    
    .DESCRIPTION
        Adds an entry to the data preservation tracking.
    
    .PARAMETER StatePath
        Path to the migration state JSON file.
    
    .PARAMETER DataKey
        Identifier for the preserved data (e.g., "guardian-hive-config").
    
    .PARAMETER BackupPath
        Path where the data was backed up.
    
    .EXAMPLE
        Add-PreservedData -DataKey "guardian-hive-config" -BackupPath "C:\project\backups\guardian-hive\config.json"
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$StatePath = "C:\project\migration\migration-state.json",
        
        [Parameter(Mandatory=$true)]
        [string]$DataKey,
        
        [Parameter(Mandatory=$true)]
        [string]$BackupPath
    )
    
    try {
        $state = Get-MigrationState -StatePath $StatePath
        
        if ($null -eq $state) {
            throw "Migration state not found"
        }
        
        # Convert to hashtable
        $stateHash = @{}
        $state.PSObject.Properties | ForEach-Object { 
            if ($_.Name -eq 'data_preserved') {
                # Convert data_preserved PSCustomObject to hashtable
                $dataPreservedHash = @{}
                if ($_.Value -ne $null) {
                    $_.Value.PSObject.Properties | ForEach-Object {
                        $dataPreservedHash[$_.Name] = $_.Value
                    }
                }
                $stateHash[$_.Name] = $dataPreservedHash
            }
            else {
                $stateHash[$_.Name] = $_.Value
            }
        }
        
        # Add preserved data entry
        $stateHash.data_preserved[$DataKey] = $BackupPath
        $stateHash.last_updated = Get-Date -Format "o"
        
        # Save updated state
        $stateHash | ConvertTo-Json -Depth 10 | Out-File -FilePath $StatePath -Encoding UTF8
        
        # Log action
        Write-MigrationAuditLog -StatePath $StatePath -Action "DataPreserved" -Details "Data '$DataKey' preserved at '$BackupPath'"
        
        Write-Verbose "Preserved data '$DataKey' recorded"
    }
    catch {
        Write-Error "Failed to add preserved data: $_"
        throw
    }
}

function Add-NativeProcess {
    <#
    .SYNOPSIS
        Records a native process that was started.
    
    .DESCRIPTION
        Adds a process to the list of started native processes.
    
    .PARAMETER StatePath
        Path to the migration state JSON file.
    
    .PARAMETER ProcessName
        Name of the native process that was started.
    
    .PARAMETER ProcessId
        Process ID (optional).
    
    .EXAMPLE
        Add-NativeProcess -ProcessName "guardian-hive" -ProcessId 12345
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$StatePath = "C:\project\migration\migration-state.json",
        
        [Parameter(Mandatory=$true)]
        [string]$ProcessName,
        
        [Parameter(Mandatory=$false)]
        [int]$ProcessId = 0
    )
    
    try {
        $state = Get-MigrationState -StatePath $StatePath
        
        if ($null -eq $state) {
            throw "Migration state not found"
        }
        
        # Convert to hashtable
        $stateHash = @{}
        $state.PSObject.Properties | ForEach-Object { $stateHash[$_.Name] = $_.Value }
        
        # Add process info
        $processInfo = @{
            name = $ProcessName
            started_at = Get-Date -Format "o"
        }
        
        if ($ProcessId -gt 0) {
            $processInfo.process_id = $ProcessId
        }
        
        $stateHash.native_processes_started += $processInfo
        $stateHash.last_updated = Get-Date -Format "o"
        
        # Save updated state
        $stateHash | ConvertTo-Json -Depth 10 | Out-File -FilePath $StatePath -Encoding UTF8
        
        # Log action
        Write-MigrationAuditLog -StatePath $StatePath -Action "ProcessStarted" -Details "Native process '$ProcessName' started"
        
        Write-Verbose "Native process '$ProcessName' recorded"
    }
    catch {
        Write-Error "Failed to add native process: $_"
        throw
    }
}

function Add-ValidationResult {
    <#
    .SYNOPSIS
        Records a validation test result.
    
    .DESCRIPTION
        Adds a validation result to the migration state.
    
    .PARAMETER StatePath
        Path to the migration state JSON file.
    
    .PARAMETER Component
        Component being validated.
    
    .PARAMETER TestName
        Name of the validation test.
    
    .PARAMETER Passed
        Whether the test passed.
    
    .PARAMETER ErrorMessage
        Error message if test failed (optional).
    
    .EXAMPLE
        Add-ValidationResult -Component "guardian-hive" -TestName "native_execution_test" -Passed $true
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$StatePath = "C:\project\migration\migration-state.json",
        
        [Parameter(Mandatory=$true)]
        [string]$Component,
        
        [Parameter(Mandatory=$true)]
        [string]$TestName,
        
        [Parameter(Mandatory=$true)]
        [bool]$Passed,
        
        [Parameter(Mandatory=$false)]
        [string]$ErrorMessage = $null
    )
    
    try {
        $state = Get-MigrationState -StatePath $StatePath
        
        if ($null -eq $state) {
            throw "Migration state not found"
        }
        
        # Convert to hashtable
        $stateHash = @{}
        $state.PSObject.Properties | ForEach-Object { $stateHash[$_.Name] = $_.Value }
        
        # Add validation result
        $validationResult = @{
            component = $Component
            test_name = $TestName
            passed = $Passed
            error_message = $ErrorMessage
            tested_at = Get-Date -Format "o"
        }
        
        $stateHash.validation_results += $validationResult
        $stateHash.last_updated = Get-Date -Format "o"
        
        # Save updated state
        $stateHash | ConvertTo-Json -Depth 10 | Out-File -FilePath $StatePath -Encoding UTF8
        
        # Log action
        $status = if ($Passed) { "PASSED" } else { "FAILED" }
        Write-MigrationAuditLog -StatePath $StatePath -Action "ValidationResult" -Details "Test '$TestName' for '$Component': $status"
        
        Write-Verbose "Validation result recorded: $Component - $TestName - $status"
    }
    catch {
        Write-Error "Failed to add validation result: $_"
        throw
    }
}

function Set-RollbackAvailability {
    <#
    .SYNOPSIS
        Sets the rollback availability flag.
    
    .DESCRIPTION
        Updates whether rollback is available for the migration.
    
    .PARAMETER StatePath
        Path to the migration state JSON file.
    
    .PARAMETER Available
        Whether rollback is available.
    
    .EXAMPLE
        Set-RollbackAvailability -Available $false
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$StatePath = "C:\project\migration\migration-state.json",
        
        [Parameter(Mandatory=$true)]
        [bool]$Available
    )
    
    try {
        $state = Get-MigrationState -StatePath $StatePath
        
        if ($null -eq $state) {
            throw "Migration state not found"
        }
        
        # Convert to hashtable
        $stateHash = @{}
        $state.PSObject.Properties | ForEach-Object { $stateHash[$_.Name] = $_.Value }
        
        # Update rollback availability
        $stateHash.rollback_available = $Available
        $stateHash.last_updated = Get-Date -Format "o"
        
        # Save updated state
        $stateHash | ConvertTo-Json -Depth 10 | Out-File -FilePath $StatePath -Encoding UTF8
        
        # Log action
        $status = if ($Available) { "available" } else { "unavailable" }
        Write-MigrationAuditLog -StatePath $StatePath -Action "RollbackAvailability" -Details "Rollback set to $status"
        
        Write-Verbose "Rollback availability set to: $Available"
    }
    catch {
        Write-Error "Failed to set rollback availability: $_"
        throw
    }
}

function Set-MigrationError {
    <#
    .SYNOPSIS
        Records an error in the migration state.
    
    .DESCRIPTION
        Sets the error field in the migration state.
    
    .PARAMETER StatePath
        Path to the migration state JSON file.
    
    .PARAMETER ErrorMessage
        The error message to record.
    
    .EXAMPLE
        Set-MigrationError -ErrorMessage "Failed to start guardian-hive process"
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$StatePath = "C:\project\migration\migration-state.json",
        
        [Parameter(Mandatory=$true)]
        [string]$ErrorMessage
    )
    
    try {
        $state = Get-MigrationState -StatePath $StatePath
        
        if ($null -eq $state) {
            throw "Migration state not found"
        }
        
        # Convert to hashtable
        $stateHash = @{}
        $state.PSObject.Properties | ForEach-Object { $stateHash[$_.Name] = $_.Value }
        
        # Set error
        $stateHash.error = @{
            message = $ErrorMessage
            occurred_at = Get-Date -Format "o"
        }
        $stateHash.last_updated = Get-Date -Format "o"
        
        # Save updated state
        $stateHash | ConvertTo-Json -Depth 10 | Out-File -FilePath $StatePath -Encoding UTF8
        
        # Log action
        Write-MigrationAuditLog -StatePath $StatePath -Action "Error" -Details $ErrorMessage
        
        Write-Verbose "Migration error recorded: $ErrorMessage"
    }
    catch {
        Write-Error "Failed to set migration error: $_"
        throw
    }
}

function Write-MigrationAuditLog {
    <#
    .SYNOPSIS
        Writes an entry to the migration audit log.
    
    .DESCRIPTION
        Appends an audit log entry to the migration audit log file.
        Creates the log file if it doesn't exist.
    
    .PARAMETER StatePath
        Path to the migration state JSON file (used to determine log location).
    
    .PARAMETER Action
        The action being logged.
    
    .PARAMETER Details
        Details about the action.
    
    .PARAMETER Level
        Log level (INFO, WARNING, ERROR).
    
    .EXAMPLE
        Write-MigrationAuditLog -Action "PhaseTransition" -Details "Moved to BackupInProgress"
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$StatePath = "C:\project\migration\migration-state.json",
        
        [Parameter(Mandatory=$true)]
        [string]$Action,
        
        [Parameter(Mandatory=$true)]
        [string]$Details,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet("INFO", "WARNING", "ERROR")]
        [string]$Level = "INFO"
    )
    
    try {
        # Determine log file path
        $stateDir = Split-Path -Parent $StatePath
        $logPath = Join-Path $stateDir "migration-audit.log"
        
        # Ensure directory exists
        if (-not (Test-Path $stateDir)) {
            New-Item -ItemType Directory -Path $stateDir -Force | Out-Null
        }
        
        # Create log entry
        $logEntry = @{
            timestamp = Get-Date -Format "o"
            level = $Level
            action = $Action
            details = $Details
        }
        
        # Append to log file (JSON Lines format)
        $logEntry | ConvertTo-Json -Compress | Add-Content -Path $logPath -Encoding UTF8
        
        Write-Verbose "Audit log entry written: $Action - $Details"
    }
    catch {
        Write-Warning "Failed to write audit log: $_"
        # Don't throw - audit logging failure shouldn't stop migration
    }
}

function Get-MigrationAuditLog {
    <#
    .SYNOPSIS
        Retrieves the migration audit log.
    
    .DESCRIPTION
        Reads and parses the migration audit log file.
    
    .PARAMETER StatePath
        Path to the migration state JSON file (used to determine log location).
    
    .PARAMETER Last
        Number of most recent entries to return (optional).
    
    .EXAMPLE
        Get-MigrationAuditLog
        Returns all audit log entries.
    
    .EXAMPLE
        Get-MigrationAuditLog -Last 10
        Returns the 10 most recent audit log entries.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$false)]
        [string]$StatePath = "C:\project\migration\migration-state.json",
        
        [Parameter(Mandatory=$false)]
        [int]$Last = 0
    )
    
    try {
        $stateDir = Split-Path -Parent $StatePath
        $logPath = Join-Path $stateDir "migration-audit.log"
        
        if (-not (Test-Path $logPath)) {
            Write-Warning "Audit log file not found: $logPath"
            return @()
        }
        
        # Read log file (JSON Lines format)
        $logEntries = Get-Content $logPath | ForEach-Object {
            $_ | ConvertFrom-Json
        }
        
        # Return last N entries if specified
        if ($Last -gt 0 -and $logEntries.Count -gt $Last) {
            return $logEntries | Select-Object -Last $Last
        }
        
        return $logEntries
    }
    catch {
        Write-Error "Failed to read audit log: $_"
        throw
    }
}

# Functions are exported automatically when dot-sourced
