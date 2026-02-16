# Test-MigrationState.ps1
# Unit tests for migration state tracking system
# Tests state initialization, phase transitions, and audit logging

# Import the module
Import-Module "$PSScriptRoot\MigrationState.ps1" -Force

# Create temp directory for tests
$script:TestRoot = Join-Path $env:TEMP "migration-state-tests-$(Get-Date -Format 'yyyyMMddHHmmss')"
New-Item -ItemType Directory -Path $script:TestRoot -Force | Out-Null

Describe "Initialize-MigrationState" {
    AfterAll {
        # Cleanup test directory
        if (Test-Path $script:TestRoot) {
            Remove-Item -Path $script:TestRoot -Recurse -Force -ErrorAction SilentlyContinue
        }
    }
    Context "When initializing a new migration state" {
        It "Should create a state file with correct structure" {
            $statePath = Join-Path $script:TestRoot "test-init-state.json"
            
            $state = Initialize-MigrationState -StatePath $statePath
            
            Test-Path $statePath | Should -Be $true
            $state.phase | Should -Be "NotStarted"
            $state.rollback_available | Should -Be $true
            $state.started_at | Should -Not -BeNullOrEmpty
        }
        
        It "Should create the directory if it doesn't exist" {
            $statePath = Join-Path $script:TestRoot "newdir\test-state.json"
            
            Initialize-MigrationState -StatePath $statePath
            
            Test-Path (Split-Path -Parent $statePath) | Should -Be $true
        }
        
        It "Should create an audit log entry" {
            $statePath = Join-Path $script:TestRoot "test-audit-state.json"
            
            Initialize-MigrationState -StatePath $statePath
            
            $logPath = Join-Path (Split-Path -Parent $statePath) "migration-audit.log"
            Test-Path $logPath | Should -Be $true
            
            $logContent = Get-Content $logPath -Raw
            $logContent | Should -Match "Initialize"
        }
    }
}

Describe "Get-MigrationState" {
    Context "When retrieving migration state" {
        It "Should return the state object" {
            $statePath = Join-Path $script:TestRoot "test-get-state.json"
            Initialize-MigrationState -StatePath $statePath
            
            $state = Get-MigrationState -StatePath $statePath
            
            $state | Should -Not -BeNullOrEmpty
            $state.phase | Should -Be "NotStarted"
        }
        
        It "Should return null if state file doesn't exist" {
            $statePath = Join-Path $script:TestRoot "nonexistent-state.json"
            
            $state = Get-MigrationState -StatePath $statePath
            
            $state | Should -BeNullOrEmpty
        }
    }
}

Describe "Set-MigrationPhase" {
    Context "When transitioning to valid phases" {
        It "Should transition from NotStarted to BackupInProgress" {
            $statePath = Join-Path $script:TestRoot "test-phase-valid.json"
            Initialize-MigrationState -StatePath $statePath
            
            $state = Set-MigrationPhase -StatePath $statePath -NewPhase "BackupInProgress"
            
            $state.phase | Should -Be "BackupInProgress"
        }
        
        It "Should transition from BackupInProgress to ContainerTermination" {
            $statePath = Join-Path $script:TestRoot "test-phase-chain.json"
            Initialize-MigrationState -StatePath $statePath
            Set-MigrationPhase -StatePath $statePath -NewPhase "BackupInProgress"
            
            $state = Set-MigrationPhase -StatePath $statePath -NewPhase "ContainerTermination"
            
            $state.phase | Should -Be "ContainerTermination"
        }
        
        It "Should set completed_at when reaching Completed phase" {
            $statePath = Join-Path $script:TestRoot "test-phase-completed.json"
            Initialize-MigrationState -StatePath $statePath
            Set-MigrationPhase -StatePath $statePath -NewPhase "BackupInProgress"
            Set-MigrationPhase -StatePath $statePath -NewPhase "ContainerTermination"
            Set-MigrationPhase -StatePath $statePath -NewPhase "NativeDeployment"
            Set-MigrationPhase -StatePath $statePath -NewPhase "Validation"
            
            $state = Set-MigrationPhase -StatePath $statePath -NewPhase "Completed"
            
            $state.completed_at | Should -Not -BeNullOrEmpty
        }
    }
    
    Context "When attempting invalid transitions" {
        It "Should throw error for invalid transition" {
            $statePath = Join-Path $script:TestRoot "test-phase-invalid.json"
            Initialize-MigrationState -StatePath $statePath
            
            { Set-MigrationPhase -StatePath $statePath -NewPhase "Completed" } | Should -Throw
        }
        
        It "Should allow invalid transition with Force flag" {
            $statePath = Join-Path $script:TestRoot "test-phase-force.json"
            Initialize-MigrationState -StatePath $statePath
            
            $state = Set-MigrationPhase -StatePath $statePath -NewPhase "Completed" -Force
            
            $state.phase | Should -Be "Completed"
        }
    }
    
    Context "When transitioning to RolledBack" {
        It "Should allow rollback from any phase" {
            $statePath = Join-Path $script:TestRoot "test-phase-rollback.json"
            Initialize-MigrationState -StatePath $statePath
            Set-MigrationPhase -StatePath $statePath -NewPhase "BackupInProgress"
            
            $state = Set-MigrationPhase -StatePath $statePath -NewPhase "RolledBack"
            
            $state.phase | Should -Be "RolledBack"
            $state.completed_at | Should -Not -BeNullOrEmpty
        }
    }
}

Describe "Add-ProcessedContainer" {
    Context "When recording processed containers" {
        It "Should add container to removed list" {
            $statePath = Join-Path $script:TestRoot "test-container.json"
            Initialize-MigrationState -StatePath $statePath
            
            Add-ProcessedContainer -StatePath $statePath -ContainerName "guardian-hive" -ContainerId "abc123"
            
            $state = Get-MigrationState -StatePath $statePath
            $state.docker_containers_removed.Count | Should -Be 1
            $state.docker_containers_removed[0].name | Should -Be "guardian-hive"
            $state.docker_containers_removed[0].id | Should -Be "abc123"
        }
        
        It "Should add multiple containers" {
            $statePath = Join-Path $script:TestRoot "test-containers-multiple.json"
            Initialize-MigrationState -StatePath $statePath
            
            Add-ProcessedContainer -StatePath $statePath -ContainerName "container1" -ContainerId "id1"
            Add-ProcessedContainer -StatePath $statePath -ContainerName "container2" -ContainerId "id2"
            
            $state = Get-MigrationState -StatePath $statePath
            $state.docker_containers_removed.Count | Should -Be 2
        }
    }
}

Describe "Add-PreservedData" {
    Context "When recording preserved data" {
        It "Should add data preservation entry" {
            $statePath = Join-Path $script:TestRoot "test-preserved.json"
            Initialize-MigrationState -StatePath $statePath
            
            Add-PreservedData -StatePath $statePath -DataKey "guardian-hive-config" -BackupPath "C:\backups\config.json"
            
            $state = Get-MigrationState -StatePath $statePath
            $state.data_preserved.'guardian-hive-config' | Should -Be "C:\backups\config.json"
        }
        
        It "Should add multiple preservation entries" {
            $statePath = Join-Path $script:TestRoot "test-preserved-multiple.json"
            Initialize-MigrationState -StatePath $statePath
            
            Add-PreservedData -StatePath $statePath -DataKey "config1" -BackupPath "C:\backups\config1.json"
            Add-PreservedData -StatePath $statePath -DataKey "config2" -BackupPath "C:\backups\config2.json"
            
            $state = Get-MigrationState -StatePath $statePath
            $state.data_preserved.PSObject.Properties.Count | Should -Be 2
        }
    }
}

Describe "Add-NativeProcess" {
    Context "When recording native processes" {
        It "Should add process to started list" {
            $statePath = Join-Path $script:TestRoot "test-process.json"
            Initialize-MigrationState -StatePath $statePath
            
            Add-NativeProcess -StatePath $statePath -ProcessName "guardian-hive" -ProcessId 12345
            
            $state = Get-MigrationState -StatePath $statePath
            $state.native_processes_started.Count | Should -Be 1
            $state.native_processes_started[0].name | Should -Be "guardian-hive"
            $state.native_processes_started[0].process_id | Should -Be 12345
        }
        
        It "Should add process without process ID" {
            $statePath = Join-Path $script:TestRoot "test-process-noid.json"
            Initialize-MigrationState -StatePath $statePath
            
            Add-NativeProcess -StatePath $statePath -ProcessName "agent-zero"
            
            $state = Get-MigrationState -StatePath $statePath
            $state.native_processes_started[0].name | Should -Be "agent-zero"
            $state.native_processes_started[0].PSObject.Properties.Name | Should -Not -Contain "process_id"
        }
    }
}

Describe "Add-ValidationResult" {
    Context "When recording validation results" {
        It "Should add passing validation result" {
            $statePath = Join-Path $script:TestRoot "test-validation-pass.json"
            Initialize-MigrationState -StatePath $statePath
            
            Add-ValidationResult -StatePath $statePath -Component "guardian-hive" -TestName "native_execution_test" -Passed $true
            
            $state = Get-MigrationState -StatePath $statePath
            $state.validation_results.Count | Should -Be 1
            $state.validation_results[0].component | Should -Be "guardian-hive"
            $state.validation_results[0].test_name | Should -Be "native_execution_test"
            $state.validation_results[0].passed | Should -Be $true
        }
        
        It "Should add failing validation result with error message" {
            $statePath = Join-Path $script:TestRoot "test-validation-fail.json"
            Initialize-MigrationState -StatePath $statePath
            
            Add-ValidationResult -StatePath $statePath -Component "worker-aider" -TestName "file_access_test" -Passed $false -ErrorMessage "Permission denied"
            
            $state = Get-MigrationState -StatePath $statePath
            $state.validation_results[0].passed | Should -Be $false
            $state.validation_results[0].error_message | Should -Be "Permission denied"
        }
    }
}

Describe "Set-RollbackAvailability" {
    Context "When setting rollback availability" {
        It "Should set rollback to unavailable" {
            $statePath = Join-Path $script:TestRoot "test-rollback.json"
            Initialize-MigrationState -StatePath $statePath
            
            Set-RollbackAvailability -StatePath $statePath -Available $false
            
            $state = Get-MigrationState -StatePath $statePath
            $state.rollback_available | Should -Be $false
        }
        
        It "Should set rollback to available" {
            $statePath = Join-Path $script:TestRoot "test-rollback-available.json"
            Initialize-MigrationState -StatePath $statePath
            Set-RollbackAvailability -StatePath $statePath -Available $false
            
            Set-RollbackAvailability -StatePath $statePath -Available $true
            
            $state = Get-MigrationState -StatePath $statePath
            $state.rollback_available | Should -Be $true
        }
    }
}

Describe "Set-MigrationError" {
    Context "When recording migration errors" {
        It "Should set error message" {
            $statePath = Join-Path $script:TestRoot "test-error.json"
            Initialize-MigrationState -StatePath $statePath
            
            Set-MigrationError -StatePath $statePath -ErrorMessage "Failed to start process"
            
            $state = Get-MigrationState -StatePath $statePath
            $state.error.message | Should -Be "Failed to start process"
            $state.error.occurred_at | Should -Not -BeNullOrEmpty
        }
    }
}

Describe "Write-MigrationAuditLog" {
    Context "When writing audit log entries" {
        It "Should create audit log file" {
            $statePath = Join-Path $script:TestRoot "test-audit-write.json"
            Initialize-MigrationState -StatePath $statePath
            
            Write-MigrationAuditLog -StatePath $statePath -Action "TestAction" -Details "Test details"
            
            $logPath = Join-Path (Split-Path -Parent $statePath) "migration-audit.log"
            Test-Path $logPath | Should -Be $true
        }
        
        It "Should append multiple entries" {
            $statePath = Join-Path $script:TestRoot "test-audit-multiple.json"
            Initialize-MigrationState -StatePath $statePath
            
            Write-MigrationAuditLog -StatePath $statePath -Action "Action1" -Details "Details1"
            Write-MigrationAuditLog -StatePath $statePath -Action "Action2" -Details "Details2"
            
            $logPath = Join-Path (Split-Path -Parent $statePath) "migration-audit.log"
            $logLines = Get-Content $logPath
            $logLines.Count | Should -BeGreaterThan 2  # Including initialization entry
        }
        
        It "Should support different log levels" {
            $statePath = Join-Path $script:TestRoot "test-audit-levels.json"
            Initialize-MigrationState -StatePath $statePath
            
            Write-MigrationAuditLog -StatePath $statePath -Action "ErrorAction" -Details "Error details" -Level "ERROR"
            
            $logPath = Join-Path (Split-Path -Parent $statePath) "migration-audit.log"
            $logContent = Get-Content $logPath -Raw
            $logContent | Should -Match "ERROR"
        }
    }
}

Describe "Get-MigrationAuditLog" {
    Context "When retrieving audit log" {
        It "Should return all log entries" {
            $statePath = Join-Path $script:TestRoot "test-audit-get.json"
            Initialize-MigrationState -StatePath $statePath
            Write-MigrationAuditLog -StatePath $statePath -Action "Action1" -Details "Details1"
            Write-MigrationAuditLog -StatePath $statePath -Action "Action2" -Details "Details2"
            
            $logEntries = Get-MigrationAuditLog -StatePath $statePath
            
            $logEntries.Count | Should -BeGreaterThan 2
        }
        
        It "Should return last N entries when specified" {
            $statePath = Join-Path $script:TestRoot "test-audit-get-last.json"
            Initialize-MigrationState -StatePath $statePath
            Write-MigrationAuditLog -StatePath $statePath -Action "Action1" -Details "Details1"
            Write-MigrationAuditLog -StatePath $statePath -Action "Action2" -Details "Details2"
            Write-MigrationAuditLog -StatePath $statePath -Action "Action3" -Details "Details3"
            
            $logEntries = Get-MigrationAuditLog -StatePath $statePath -Last 2
            
            $logEntries.Count | Should -Be 2
            $logEntries[-1].action | Should -Be "Action3"
        }
        
        It "Should return empty array if log doesn't exist" {
            $statePath = Join-Path $script:TestRoot "test-audit-get-empty.json"
            
            $logEntries = Get-MigrationAuditLog -StatePath $statePath
            
            $logEntries.Count | Should -Be 0
        }
    }
}

Describe "Integration: Complete Migration Flow" {
    Context "When simulating a complete migration" {
        It "Should track all phases correctly" {
            $statePath = Join-Path $script:TestRoot "test-integration.json"
            
            # Initialize
            Initialize-MigrationState -StatePath $statePath
            $state = Get-MigrationState -StatePath $statePath
            $state.phase | Should -Be "NotStarted"
            
            # Backup phase
            Set-MigrationPhase -StatePath $statePath -NewPhase "BackupInProgress"
            Add-PreservedData -StatePath $statePath -DataKey "config1" -BackupPath "C:\backups\config1.json"
            
            # Container termination
            Set-MigrationPhase -StatePath $statePath -NewPhase "ContainerTermination"
            Add-ProcessedContainer -StatePath $statePath -ContainerName "container1" -ContainerId "id1"
            
            # Native deployment
            Set-MigrationPhase -StatePath $statePath -NewPhase "NativeDeployment"
            Add-NativeProcess -StatePath $statePath -ProcessName "guardian-hive" -ProcessId 12345
            
            # Validation
            Set-MigrationPhase -StatePath $statePath -NewPhase "Validation"
            Add-ValidationResult -StatePath $statePath -Component "guardian-hive" -TestName "test1" -Passed $true
            
            # Complete
            Set-MigrationPhase -StatePath $statePath -NewPhase "Completed"
            
            # Verify final state
            $finalState = Get-MigrationState -StatePath $statePath
            $finalState.phase | Should -Be "Completed"
            $finalState.completed_at | Should -Not -BeNullOrEmpty
            $finalState.docker_containers_removed.Count | Should -Be 1
            $finalState.native_processes_started.Count | Should -Be 1
            $finalState.validation_results.Count | Should -Be 1
            
            # Verify audit log
            $auditLog = Get-MigrationAuditLog -StatePath $statePath
            $auditLog.Count | Should -BeGreaterThan 5
        }
    }
}
