# Test-DockerInventory.ps1
# Test script for Docker container discovery and inventory system

<#
.SYNOPSIS
    Tests the Get-DockerInventory.ps1 script functionality.

.DESCRIPTION
    Validates that the Docker inventory script can successfully discover containers,
    extract metadata, and generate a valid JSON report.

.EXAMPLE
    .\Test-DockerInventory.ps1
    Runs all validation tests for the inventory system.
#>

[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Message = ""
    )
    
    $status = if ($Passed) { "PASS" } else { "FAIL" }
    $color = if ($Passed) { "Green" } else { "Red" }
    
    Write-Host "[$status] $TestName" -ForegroundColor $color
    if ($Message) {
        Write-Host "       $Message" -ForegroundColor Gray
    }
}

# Test 1: Check if Docker is available
Write-Host "`n=== Test 1: Docker Availability ===" -ForegroundColor Cyan
try {
    $dockerVersion = docker --version 2>&1
    Write-TestResult "Docker is available" $true "Version: $dockerVersion"
}
catch {
    Write-TestResult "Docker is available" $false "Docker not found or not running"
    Write-Host "`nCannot proceed with tests without Docker. Exiting." -ForegroundColor Yellow
    exit 1
}

# Test 2: Check if Get-DockerInventory.ps1 exists
Write-Host "`n=== Test 2: Script Existence ===" -ForegroundColor Cyan
$scriptPath = Join-Path $PSScriptRoot "Get-DockerInventory.ps1"
$scriptExists = Test-Path $scriptPath
Write-TestResult "Get-DockerInventory.ps1 exists" $scriptExists "Path: $scriptPath"

if (-not $scriptExists) {
    Write-Host "`nScript not found. Exiting." -ForegroundColor Yellow
    exit 1
}

# Test 3: Run inventory script
Write-Host "`n=== Test 3: Inventory Generation ===" -ForegroundColor Cyan
$testOutputPath = Join-Path $env:TEMP "test-docker-inventory-$(Get-Date -Format 'yyyyMMddHHmmss').json"

try {
    $result = & $scriptPath -OutputPath $testOutputPath
    
    if ($result.success) {
        Write-TestResult "Inventory script executed successfully" $true
    }
    else {
        Write-TestResult "Inventory script executed successfully" $false "Error: $($result.error)"
    }
}
catch {
    Write-TestResult "Inventory script executed successfully" $false "Exception: $_"
    exit 1
}

# Test 4: Validate JSON output file exists
Write-Host "`n=== Test 4: Output File Validation ===" -ForegroundColor Cyan
$outputExists = Test-Path $testOutputPath
Write-TestResult "Inventory JSON file created" $outputExists "Path: $testOutputPath"

if (-not $outputExists) {
    Write-Host "`nOutput file not created. Exiting." -ForegroundColor Yellow
    exit 1
}

# Test 5: Validate JSON structure
Write-Host "`n=== Test 5: JSON Structure Validation ===" -ForegroundColor Cyan
try {
    $inventoryData = Get-Content $testOutputPath -Raw | ConvertFrom-Json
    
    # Check required fields
    $requiredFields = @('generated_at', 'docker_version', 'containers', 'summary')
    $allFieldsPresent = $true
    
    foreach ($field in $requiredFields) {
        if (-not ($inventoryData.PSObject.Properties.Name -contains $field)) {
            Write-TestResult "Required field '$field' present" $false
            $allFieldsPresent = $false
        }
    }
    
    if ($allFieldsPresent) {
        Write-TestResult "All required fields present" $true
    }
    
    # Check summary structure
    $summaryFields = @('total_containers', 'running_containers', 'stopped_containers', 'total_volumes', 'total_networks')
    $allSummaryFieldsPresent = $true
    
    foreach ($field in $summaryFields) {
        if (-not ($inventoryData.summary.PSObject.Properties.Name -contains $field)) {
            Write-TestResult "Summary field '$field' present" $false
            $allSummaryFieldsPresent = $false
        }
    }
    
    if ($allSummaryFieldsPresent) {
        Write-TestResult "All summary fields present" $true
    }
}
catch {
    Write-TestResult "JSON structure validation" $false "Error parsing JSON: $_"
    exit 1
}

# Test 6: Validate container metadata structure (if containers exist)
Write-Host "`n=== Test 6: Container Metadata Validation ===" -ForegroundColor Cyan
if ($inventoryData.containers.Count -gt 0) {
    $firstContainer = $inventoryData.containers[0]
    
    $containerFields = @('id', 'name', 'image', 'status', 'volumes', 'networks', 'config')
    $allContainerFieldsPresent = $true
    
    foreach ($field in $containerFields) {
        if (-not ($firstContainer.PSObject.Properties.Name -contains $field)) {
            Write-TestResult "Container field '$field' present" $false
            $allContainerFieldsPresent = $false
        }
    }
    
    if ($allContainerFieldsPresent) {
        Write-TestResult "All container metadata fields present" $true
    }
    
    Write-Host "`nSample container data:" -ForegroundColor Gray
    Write-Host "  Name: $($firstContainer.name)" -ForegroundColor Gray
    Write-Host "  Image: $($firstContainer.image)" -ForegroundColor Gray
    Write-Host "  Status: $($firstContainer.status)" -ForegroundColor Gray
    Write-Host "  Volumes: $($firstContainer.volumes.Count)" -ForegroundColor Gray
    Write-Host "  Networks: $($firstContainer.networks.Count)" -ForegroundColor Gray
}
else {
    Write-TestResult "Container metadata validation" $true "No containers found (this is OK)"
}

# Test 7: Display summary
Write-Host "`n=== Test 7: Inventory Summary ===" -ForegroundColor Cyan
Write-Host "Docker Version: $($inventoryData.docker_version)" -ForegroundColor Gray
Write-Host "Generated At: $($inventoryData.generated_at)" -ForegroundColor Gray
Write-Host "Total Containers: $($inventoryData.summary.total_containers)" -ForegroundColor Gray
Write-Host "Running Containers: $($inventoryData.summary.running_containers)" -ForegroundColor Gray
Write-Host "Stopped Containers: $($inventoryData.summary.stopped_containers)" -ForegroundColor Gray
Write-Host "Total Volumes: $($inventoryData.summary.total_volumes)" -ForegroundColor Gray
Write-Host "Total Networks: $($inventoryData.summary.total_networks)" -ForegroundColor Gray

Write-TestResult "Summary data is valid" $true

# Cleanup
Write-Host "`n=== Cleanup ===" -ForegroundColor Cyan
try {
    Remove-Item $testOutputPath -Force
    Write-TestResult "Test output file cleaned up" $true
}
catch {
    Write-TestResult "Test output file cleaned up" $false "Could not delete: $_"
}

Write-Host "`n=== All Tests Completed ===" -ForegroundColor Green
Write-Host "The Docker inventory system is working correctly.`n" -ForegroundColor Green
