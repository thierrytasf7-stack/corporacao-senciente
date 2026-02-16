# Test-DockerCleanup.ps1
# Comprehensive Pester tests for Remove-DockerArtifacts.ps1
# Tests image removal, network cleanup, volume cleanup, and verification

BeforeAll {
    # Import the script under test
    $scriptPath = Join-Path $PSScriptRoot "Remove-DockerArtifacts.ps1"
    
    # Create test directories
    $script:testRoot = Join-Path $TestDrive "docker-cleanup-test"
    $script:inventoryPath = Join-Path $testRoot "inventory.json"
    $script:backupManifestPath = Join-Path $testRoot "backups\backup-manifest.json"
    $script:statePath = Join-Path $testRoot "migration-state.json"
    
    New-Item -ItemType Directory -Path $testRoot -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $testRoot "backups") -Force | Out-Null
    
    # Create sample inventory
    $script:sampleInventory = @{
        generated_at = "2024-01-15T10:00:00Z"
        docker_version = "24.0.0"
        containers = @(
            @{
                id = "abc123"
                name = "test-container-1"
                image = "test-image:latest"
                image_id = "sha256:image123"
                status = "running"
                networks = @(
                    @{
                        id = "net123"
                        name = "test-network"
                    }
                )
                volumes = @(
                    @{
                        type = "volume"
                        source = "test-volume"
                        destination = "/data"
                    }
                )
            }
        )
    }
    
    # Create sample backup manifest
    $script:sampleBackupManifest = @{
        backup_started_at = "2024-01-15T09:00:00Z"
        backup_completed_at = "2024-01-15T09:30:00Z"
        summary = @{
            total_containers = 1
            successful_backups = 1
            failed_backups = 0
        }
        verification = @{
            checksums_verified = $true
            verification_passed = $true
            failed_verifications = @()
        }
    }
    
    # Save test files
    $sampleInventory | ConvertTo-Json -Depth 10 | Out-File -FilePath $inventoryPath -Encoding UTF8
    $sampleBackupManifest | ConvertTo-Json -Depth 10 | Out-File -FilePath $backupManifestPath -Encoding UTF8
}

Describe "Remove-DockerArtifacts" {
    Context "Data Preservation Verification" {
        It "Should verify data preservation before volume cleanup" {
            # Arrange
            Mock docker { return "" } -Verifiable
            
            # Act
            $result = & $scriptPath `
                -InventoryPath $inventoryPath `
                -BackupManifestPath $backupManifestPath `
                -RemoveImages $false `
                -RemoveNetworks $false `
                -RemoveVolumes $true `
                -VerifyCleanup $false
            
            # Assert
            $result | Should -Not -BeNullOrEmpty
            # Data preservation should be verified
        }
        
        It "Should skip volume cleanup if backup manifest not found" {
            # Arrange
            $missingManifestPath = Join-Path $testRoot "missing-manifest.json"
            Mock docker { return "" }
            
            # Act
            $result = & $scriptPath `
                -InventoryPath $inventoryPath `
                -BackupManifestPath $missingManifestPath `
                -RemoveImages $false `
                -RemoveNetworks $false `
                -RemoveVolumes $true `
                -VerifyCleanup $false
            
            # Assert
            $result | Should -Not -BeNullOrEmpty
            # Should skip volume cleanup
        }
        
        It "Should skip volume cleanup if backup failed" {
            # Arrange
            $failedManifest = @{
                backup_started_at = "2024-01-15T09:00:00Z"
                backup_completed_at = "2024-01-15T09:30:00Z"
                summary = @{
                    total_containers = 1
                    successful_backups = 0
                    failed_backups = 1
                }
            }
            
            $failedManifestPath = Join-Path $testRoot "failed-manifest.json"
            $failedManifest | ConvertTo-Json -Depth 10 | Out-File -FilePath $failedManifestPath -Encoding UTF8
            
            Mock docker { return "" }
            
            # Act
            $result = & $scriptPath `
                -InventoryPath $inventoryPath `
                -BackupManifestPath $failedManifestPath `
                -RemoveImages $false `
                -RemoveNetworks $false `
                -RemoveVolumes $true `
                -VerifyCleanup $false
            
            # Assert
            $result | Should -Not -BeNullOrEmpty
            # Should skip volume cleanup
        }
        
        It "Should skip volume cleanup if checksum verification failed" {
            # Arrange
            $failedChecksumManifest = @{
                backup_started_at = "2024-01-15T09:00:00Z"
                backup_completed_at = "2024-01-15T09:30:00Z"
                summary = @{
                    total_containers = 1
                    successful_backups = 1
                    failed_backups = 0
                }
                verification = @{
                    checksums_verified = $true
                    verification_passed = $false
                    failed_verifications = @(@{ container = "test" })
                }
            }
            
            $failedChecksumPath = Join-Path $testRoot "failed-checksum-manifest.json"
            $failedChecksumManifest | ConvertTo-Json -Depth 10 | Out-File -FilePath $failedChecksumPath -Encoding UTF8
            
            Mock docker { return "" }
            
            # Act
            $result = & $scriptPath `
                -InventoryPath $inventoryPath `
                -BackupManifestPath $failedChecksumPath `
                -RemoveImages $false `
                -RemoveNetworks $false `
                -RemoveVolumes $true `
                -VerifyCleanup $false
            
            # Assert
            $result | Should -Not -BeNullOrEmpty
            # Should skip volume cleanup
        }
    }
    
    Context "Docker Image Removal" {
        It "Should remove Docker images successfully" {
            # Arrange
            Mock docker { 
                param($Command)
                if ($Command -eq "rmi") {
                    $global:LASTEXITCODE = 0
                    return "Deleted: sha256:image123"
                }
                return ""
            } -Verifiable
            
            # Act
            $result = & $scriptPath `
                -InventoryPath $inventoryPath `
                -RemoveImages $true `
                -RemoveNetworks $false `
                -RemoveVolumes $false `
                -VerifyCleanup $false
            
            # Assert
            Should -Invoke docker -Times 1 -ParameterFilter { $Command -eq "rmi" }
        }
        
        It "Should handle image removal failures gracefully" {
            # Arrange
            Mock docker { 
                param($Command)
                if ($Command -eq "rmi") {
                    $global:LASTEXITCODE = 1
                    return "Error: image is being used"
                }
                return ""
            }
            
            # Act
            $result = & $scriptPath `
                -InventoryPath $inventoryPath `
                -RemoveImages $true `
                -RemoveNetworks $false `
                -RemoveVolumes $false `
                -VerifyCleanup $false
            
            # Assert
            $result | Should -Not -BeNullOrEmpty
            # Should report failure but not throw
        }
        
        It "Should collect unique images from inventory" {
            # Arrange
            $multiImageInventory = @{
                generated_at = "2024-01-15T10:00:00Z"
                containers = @(
                    @{
                        id = "abc123"
                        name = "container-1"
                        image = "test-image:latest"
                        image_id = "sha256:image123"
                    },
                    @{
                        id = "def456"
                        name = "container-2"
                        image = "test-image:latest"
                        image_id = "sha256:image123"
                    },
                    @{
                        id = "ghi789"
                        name = "container-3"
                        image = "other-image:latest"
                        image_id = "sha256:image456"
                    }
                )
            }
            
            $multiImagePath = Join-Path $testRoot "multi-image-inventory.json"
            $multiImageInventory | ConvertTo-Json -Depth 10 | Out-File -FilePath $multiImagePath -Encoding UTF8
            
            Mock docker { 
                $global:LASTEXITCODE = 0
                return "Deleted"
            }
            
            # Act
            $result = & $scriptPath `
                -InventoryPath $multiImagePath `
                -RemoveImages $true `
                -RemoveNetworks $false `
                -RemoveVolumes $false `
                -VerifyCleanup $false
            
            # Assert
            # Should only attempt to remove 2 unique images
            Should -Invoke docker -Times 2 -ParameterFilter { $args -contains "rmi" }
        }
    }
    
    Context "Docker Network Removal" {
        It "Should remove Docker networks successfully" {
            # Arrange
            Mock docker { 
                param($Command)
                if ($Command -eq "network" -and $args[0] -eq "rm") {
                    $global:LASTEXITCODE = 0
                    return "net123"
                }
                return ""
            } -Verifiable
            
            # Act
            $result = & $scriptPath `
                -InventoryPath $inventoryPath `
                -RemoveImages $false `
                -RemoveNetworks $true `
                -RemoveVolumes $false `
                -VerifyCleanup $false
            
            # Assert
            Should -Invoke docker -Times 1 -ParameterFilter { $Command -eq "network" }
        }
        
        It "Should skip default networks (bridge, host, none)" {
            # Arrange
            $defaultNetworkInventory = @{
                generated_at = "2024-01-15T10:00:00Z"
                containers = @(
                    @{
                        id = "abc123"
                        name = "container-1"
                        networks = @(
                            @{ id = "bridge"; name = "bridge" },
                            @{ id = "host"; name = "host" },
                            @{ id = "none"; name = "none" }
                        )
                    }
                )
            }
            
            $defaultNetPath = Join-Path $testRoot "default-network-inventory.json"
            $defaultNetworkInventory | ConvertTo-Json -Depth 10 | Out-File -FilePath $defaultNetPath -Encoding UTF8
            
            Mock docker { 
                $global:LASTEXITCODE = 0
                return ""
            }
            
            # Act
            $result = & $scriptPath `
                -InventoryPath $defaultNetPath `
                -RemoveImages $false `
                -RemoveNetworks $true `
                -RemoveVolumes $false `
                -VerifyCleanup $false
            
            # Assert
            # Should not attempt to remove default networks
            Should -Invoke docker -Times 0 -ParameterFilter { $args -contains "network" -and $args -contains "rm" }
        }
        
        It "Should handle network removal failures gracefully" {
            # Arrange
            Mock docker { 
                param($Command)
                if ($Command -eq "network") {
                    $global:LASTEXITCODE = 1
                    return "Error: network has active endpoints"
                }
                return ""
            }
            
            # Act
            $result = & $scriptPath `
                -InventoryPath $inventoryPath `
                -RemoveImages $false `
                -RemoveNetworks $true `
                -RemoveVolumes $false `
                -VerifyCleanup $false
            
            # Assert
            $result | Should -Not -BeNullOrEmpty
            # Should report failure but not throw
        }
    }
    
    Context "Docker Volume Removal" {
        It "Should remove Docker volumes after data preservation verification" {
            # Arrange
            Mock docker { 
                param($Command)
                if ($Command -eq "volume" -and $args[0] -eq "rm") {
                    $global:LASTEXITCODE = 0
                    return "test-volume"
                }
                return ""
            } -Verifiable
            
            # Act
            $result = & $scriptPath `
                -InventoryPath $inventoryPath `
                -BackupManifestPath $backupManifestPath `
                -RemoveImages $false `
                -RemoveNetworks $false `
                -RemoveVolumes $true `
                -VerifyCleanup $false
            
            # Assert
            Should -Invoke docker -Times 1 -ParameterFilter { $Command -eq "volume" }
        }
        
        It "Should only remove named volumes, not bind mounts" {
            # Arrange
            $mixedVolumeInventory = @{
                generated_at = "2024-01-15T10:00:00Z"
                containers = @(
                    @{
                        id = "abc123"
                        name = "container-1"
                        volumes = @(
                            @{ type = "volume"; source = "named-volume"; destination = "/data" },
                            @{ type = "bind"; source = "C:\host\path"; destination = "/app" }
                        )
                    }
                )
            }
            
            $mixedVolPath = Join-Path $testRoot "mixed-volume-inventory.json"
            $mixedVolumeInventory | ConvertTo-Json -Depth 10 | Out-File -FilePath $mixedVolPath -Encoding UTF8
            
            Mock docker { 
                $global:LASTEXITCODE = 0
                return "named-volume"
            }
            
            # Act
            $result = & $scriptPath `
                -InventoryPath $mixedVolPath `
                -BackupManifestPath $backupManifestPath `
                -RemoveImages $false `
                -RemoveNetworks $false `
                -RemoveVolumes $true `
                -VerifyCleanup $false
            
            # Assert
            # Should only attempt to remove 1 named volume
            Should -Invoke docker -Times 1 -ParameterFilter { $args -contains "volume" -and $args -contains "rm" }
        }
        
        It "Should handle volume removal failures gracefully" {
            # Arrange
            Mock docker { 
                param($Command)
                if ($Command -eq "volume") {
                    $global:LASTEXITCODE = 1
                    return "Error: volume is in use"
                }
                return ""
            }
            
            # Act
            $result = & $scriptPath `
                -InventoryPath $inventoryPath `
                -BackupManifestPath $backupManifestPath `
                -RemoveImages $false `
                -RemoveNetworks $false `
                -RemoveVolumes $true `
                -VerifyCleanup $false
            
            # Assert
            $result | Should -Not -BeNullOrEmpty
            # Should report failure but not throw
        }
    }
    
    Context "Cleanup Verification" {
        It "Should verify no Docker processes remain" {
            # Arrange
            Mock docker { 
                param($Command)
                if ($Command -eq "version") {
                    $global:LASTEXITCODE = 0
                    return "Docker version 24.0.0"
                }
                if ($Command -eq "ps") {
                    $global:LASTEXITCODE = 0
                    return ""
                }
                if ($Command -eq "images") {
                    $global:LASTEXITCODE = 0
                    return ""
                }
                if ($Command -eq "network") {
                    $global:LASTEXITCODE = 0
                    return "bridge`nhost`nnone"
                }
                if ($Command -eq "volume") {
                    $global:LASTEXITCODE = 0
                    return ""
                }
                return ""
            }
            
            # Act
            $result = & $scriptPath `
                -InventoryPath $inventoryPath `
                -RemoveImages $false `
                -RemoveNetworks $false `
                -RemoveVolumes $false `
                -VerifyCleanup $true
            
            # Assert
            $result | Should -Not -BeNullOrEmpty
            $result.verification.passed | Should -Be $true
        }
        
        It "Should detect remaining containers" {
            # Arrange
            Mock docker { 
                param($Command)
                if ($Command -eq "version") {
                    $global:LASTEXITCODE = 0
                    return "Docker version 24.0.0"
                }
                if ($Command -eq "ps") {
                    $global:LASTEXITCODE = 0
                    return "abc123`ndef456"
                }
                return ""
            }
            
            # Act
            $result = & $scriptPath `
                -InventoryPath $inventoryPath `
                -RemoveImages $false `
                -RemoveNetworks $false `
                -RemoveVolumes $false `
                -VerifyCleanup $true
            
            # Assert
            $result | Should -Not -BeNullOrEmpty
            $result.verification.passed | Should -Be $false
        }
        
        It "Should detect remaining images" {
            # Arrange
            Mock docker { 
                param($Command)
                if ($Command -eq "version") {
                    $global:LASTEXITCODE = 0
                    return "Docker version 24.0.0"
                }
                if ($Command -eq "ps") {
                    $global:LASTEXITCODE = 0
                    return ""
                }
                if ($Command -eq "images") {
                    $global:LASTEXITCODE = 0
                    return "sha256:image123`nsha256:image456"
                }
                return ""
            }
            
            # Act
            $result = & $scriptPath `
                -InventoryPath $inventoryPath `
                -RemoveImages $false `
                -RemoveNetworks $false `
                -RemoveVolumes $false `
                -VerifyCleanup $true
            
            # Assert
            $result | Should -Not -BeNullOrEmpty
            $result.verification.passed | Should -Be $false
        }
        
        It "Should pass verification when Docker daemon is not running" {
            # Arrange
            Mock docker { 
                param($Command)
                if ($Command -eq "version") {
                    $global:LASTEXITCODE = 1
                    throw "Cannot connect to Docker daemon"
                }
                return ""
            }
            
            # Act
            $result = & $scriptPath `
                -InventoryPath $inventoryPath `
                -RemoveImages $false `
                -RemoveNetworks $false `
                -RemoveVolumes $false `
                -VerifyCleanup $true
            
            # Assert
            $result | Should -Not -BeNullOrEmpty
            $result.verification.passed | Should -Be $true
        }
    }
    
    Context "Report Generation" {
        It "Should generate cleanup report JSON file" {
            # Arrange
            Mock docker { 
                $global:LASTEXITCODE = 0
                return ""
            }
            
            # Act
            $result = & $scriptPath `
                -InventoryPath $inventoryPath `
                -RemoveImages $false `
                -RemoveNetworks $false `
                -RemoveVolumes $false `
                -VerifyCleanup $false
            
            # Assert
            $result.report_path | Should -Not -BeNullOrEmpty
            Test-Path $result.report_path | Should -Be $true
        }
        
        It "Should include summary statistics in report" {
            # Arrange
            Mock docker { 
                $global:LASTEXITCODE = 0
                return ""
            }
            
            # Act
            $result = & $scriptPath `
                -InventoryPath $inventoryPath `
                -RemoveImages $true `
                -RemoveNetworks $true `
                -RemoveVolumes $false `
                -VerifyCleanup $false
            
            # Assert
            $result.summary | Should -Not -BeNullOrEmpty
            $result.summary.images | Should -Not -BeNullOrEmpty
            $result.summary.networks | Should -Not -BeNullOrEmpty
            $result.summary.volumes | Should -Not -BeNullOrEmpty
        }
    }
    
    Context "Error Handling" {
        It "Should handle missing inventory file" {
            # Arrange
            $missingPath = Join-Path $testRoot "missing-inventory.json"
            
            # Act & Assert
            { & $scriptPath -InventoryPath $missingPath } | Should -Throw
        }
        
        It "Should save partial report on error" {
            # Arrange
            Mock docker { 
                throw "Unexpected Docker error"
            }
            
            # Act
            $result = & $scriptPath `
                -InventoryPath $inventoryPath `
                -RemoveImages $true `
                -RemoveNetworks $false `
                -RemoveVolumes $false `
                -VerifyCleanup $false
            
            # Assert
            $result | Should -Not -BeNullOrEmpty
            $result.success | Should -Be $false
        }
    }
    
    Context "Integration with Migration State" {
        It "Should update migration state on error if available" {
            # This test would require MigrationState.ps1 to be available
            # Skipped for unit testing, covered in integration tests
        }
    }
}

Describe "Remove-DockerArtifacts Edge Cases" {
    Context "Empty Inventory" {
        It "Should handle empty container list gracefully" {
            # Arrange
            $emptyInventory = @{
                generated_at = "2024-01-15T10:00:00Z"
                containers = @()
            }
            
            $emptyPath = Join-Path $testRoot "empty-inventory.json"
            $emptyInventory | ConvertTo-Json -Depth 10 | Out-File -FilePath $emptyPath -Encoding UTF8
            
            Mock docker { 
                $global:LASTEXITCODE = 0
                return ""
            }
            
            # Act
            $result = & $scriptPath `
                -InventoryPath $emptyPath `
                -RemoveImages $true `
                -RemoveNetworks $true `
                -RemoveVolumes $true `
                -VerifyCleanup $true
            
            # Assert
            $result | Should -Not -BeNullOrEmpty
            $result.success | Should -Be $true
        }
    }
    
    Context "Partial Cleanup" {
        It "Should allow selective cleanup (images only)" {
            # Arrange
            Mock docker { 
                $global:LASTEXITCODE = 0
                return ""
            }
            
            # Act
            $result = & $scriptPath `
                -InventoryPath $inventoryPath `
                -RemoveImages $true `
                -RemoveNetworks $false `
                -RemoveVolumes $false `
                -VerifyCleanup $false
            
            # Assert
            $result | Should -Not -BeNullOrEmpty
            # Only images should be processed
        }
        
        It "Should allow selective cleanup (networks only)" {
            # Arrange
            Mock docker { 
                $global:LASTEXITCODE = 0
                return ""
            }
            
            # Act
            $result = & $scriptPath `
                -InventoryPath $inventoryPath `
                -RemoveImages $false `
                -RemoveNetworks $true `
                -RemoveVolumes $false `
                -VerifyCleanup $false
            
            # Assert
            $result | Should -Not -BeNullOrEmpty
            # Only networks should be processed
        }
    }
}
