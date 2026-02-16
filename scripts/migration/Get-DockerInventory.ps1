# Get-DockerInventory.ps1
# Docker Container Discovery and Inventory System
# Queries Docker API for running containers and extracts metadata
# Generates migration inventory report as JSON

<#
.SYNOPSIS
    Discovers Docker containers and generates migration inventory report.

.DESCRIPTION
    Queries Docker API to identify running containers, extracts metadata including
    volumes, configurations, networks, and environment variables. Generates a
    comprehensive JSON inventory report for migration planning.

.PARAMETER OutputPath
    Path where the inventory JSON report will be saved.
    Default: C:\project\migration\inventory.json

.PARAMETER IncludeStopped
    Include stopped containers in the inventory.
    Default: $false (only running containers)

.EXAMPLE
    .\Get-DockerInventory.ps1
    Generates inventory for running containers only.

.EXAMPLE
    .\Get-DockerInventory.ps1 -OutputPath "C:\backup\inventory.json" -IncludeStopped
    Generates inventory including stopped containers.

.NOTES
    Validates: Requirements 1.1
    Part of: Sentient Corp Native Architecture Migration
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$OutputPath = $null,
    
    [Parameter(Mandatory=$false)]
    [switch]$IncludeStopped = $false
)

$ErrorActionPreference = "Stop"

# Robust path resolution
if (-not $OutputPath) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    if (-not $scriptDir) { $scriptDir = "." }
    $OutputPath = Join-Path $scriptDir "inventory.json"
}

# Initialize inventory structure
$inventory = @{
    generated_at = Get-Date -Format "o"
    docker_version = $null
    containers = @()
    summary = @{
        total_containers = 0
        running_containers = 0
        stopped_containers = 0
        total_volumes = 0
        total_networks = 0
    }
}

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] [$Level] $Message"
}

function Test-DockerAvailable {
    try {
        $null = docker --version 2>&1
        return $true
    }
    catch {
        return $false
    }
}

function Get-DockerVersion {
    try {
        $versionOutput = docker version --format '{{.Server.Version}}' 2>&1
        return $versionOutput
    }
    catch {
        Write-Log "Failed to get Docker version: $_" "WARNING"
        return "unknown"
    }
}

function Get-ContainerList {
    param([bool]$IncludeAll)
    
    try {
        $filter = if ($IncludeAll) { "-a" } else { "" }
        $containerIds = docker ps $filter --format '{{.ID}}' 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Failed to list containers: $containerIds" "ERROR"
            return @()
        }
        
        return $containerIds -split "`n" | Where-Object { $_ -ne "" }
    }
    catch {
        Write-Log "Error listing containers: $_" "ERROR"
        return @()
    }
}

function Get-ContainerMetadata {
    param([string]$ContainerId)
    
    try {
        Write-Log "Inspecting container: $ContainerId" "INFO"
        
        # Get container inspection data as JSON
        $inspectJson = docker inspect $ContainerId 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Failed to inspect container $ContainerId" "ERROR"
            return $null
        }
        
        $containerData = $inspectJson | ConvertFrom-Json
        
        if ($containerData -is [array]) {
            $containerData = $containerData[0]
        }
        
        # Extract relevant metadata
        $metadata = @{
            id = $containerData.Id
            name = $containerData.Name -replace '^/', ''
            image = $containerData.Config.Image
            status = $containerData.State.Status
            created = $containerData.Created
            started_at = $containerData.State.StartedAt
            platform = $containerData.Platform
            
            # Volume information
            volumes = @()
            
            # Network information
            networks = @()
            
            # Configuration
            config = @{
                hostname = $containerData.Config.Hostname
                env = @()
                cmd = $containerData.Config.Cmd
                entrypoint = $containerData.Config.Entrypoint
                working_dir = $containerData.Config.WorkingDir
                exposed_ports = @()
            }
            
            # Resource limits
            resources = @{
                memory_limit = $containerData.HostConfig.Memory
                cpu_shares = $containerData.HostConfig.CpuShares
                cpu_quota = $containerData.HostConfig.CpuQuota
            }
        }
        
        # Extract volume mounts
        if ($containerData.Mounts) {
            foreach ($mount in $containerData.Mounts) {
                $volumeInfo = @{
                    type = $mount.Type
                    source = $mount.Source
                    destination = $mount.Destination
                    mode = $mount.Mode
                    rw = $mount.RW
                    propagation = $mount.Propagation
                }
                
                if ($mount.Name) {
                    $volumeInfo.name = $mount.Name
                }
                
                $metadata.volumes += $volumeInfo
            }
        }
        
        # Extract network information
        if ($containerData.NetworkSettings.Networks) {
            foreach ($networkName in $containerData.NetworkSettings.Networks.PSObject.Properties.Name) {
                $network = $containerData.NetworkSettings.Networks.$networkName
                $networkInfo = @{
                    name = $networkName
                    network_id = $network.NetworkID
                    endpoint_id = $network.EndpointID
                    gateway = $network.Gateway
                    ip_address = $network.IPAddress
                    mac_address = $network.MacAddress
                }
                $metadata.networks += $networkInfo
            }
        }
        
        # Extract environment variables (filter sensitive data)
        if ($containerData.Config.Env) {
            foreach ($envVar in $containerData.Config.Env) {
                # Mask sensitive values
                if ($envVar -match '(PASSWORD|SECRET|KEY|TOKEN)=') {
                    $parts = $envVar -split '=', 2
                    $metadata.config.env += "$($parts[0])=***MASKED***"
                }
                else {
                    $metadata.config.env += $envVar
                }
            }
        }
        
        # Extract exposed ports
        if ($containerData.Config.ExposedPorts) {
            $metadata.config.exposed_ports = @($containerData.Config.ExposedPorts.PSObject.Properties.Name)
        }
        
        # Extract port bindings
        $metadata.port_bindings = @()
        if ($containerData.HostConfig.PortBindings) {
            foreach ($containerPort in $containerData.HostConfig.PortBindings.PSObject.Properties.Name) {
                $bindings = $containerData.HostConfig.PortBindings.$containerPort
                foreach ($binding in $bindings) {
                    $metadata.port_bindings += @{
                        container_port = $containerPort
                        host_ip = $binding.HostIp
                        host_port = $binding.HostPort
                    }
                }
            }
        }
        
        return $metadata
    }
    catch {
        Write-Log "Error extracting metadata for container $ContainerId : $_" "ERROR"
        return $null
    }
}

# Main execution
try {
    Write-Log "Starting Docker container discovery..." "INFO"
    
    # Check if Docker is available
    if (-not (Test-DockerAvailable)) {
        Write-Log "Docker is not available or not running" "ERROR"
        throw "Docker is not available. Please ensure Docker is installed and running."
    }
    
    # Get Docker version
    $dockerVer = Get-DockerVersion
    $inventory.docker_version = $dockerVer
    Write-Log "Docker version: $($inventory.docker_version)" "INFO"
    
    # Get container list
    $containerIds = Get-ContainerList -IncludeAll $IncludeStopped.IsPresent
    Write-Log "Found $($containerIds.Count) container(s)" "INFO"
    
    if ($containerIds.Count -eq 0) {
        Write-Log "No containers found" "WARNING"
    }
    else {
        # Extract metadata for each container
        foreach ($containerId in $containerIds) {
            $metadata = Get-ContainerMetadata -ContainerId $containerId
            
            if ($metadata) {
                $inventory.containers += $metadata
                
                # Update summary
                $inventory.summary.total_containers++
                
                if ($metadata.status -eq "running") {
                    $inventory.summary.running_containers++
                }
                else {
                    $inventory.summary.stopped_containers++
                }
                
                $inventory.summary.total_volumes += $metadata.volumes.Count
                $inventory.summary.total_networks += $metadata.networks.Count
                
                Write-Log "Processed container: $($metadata.name) (Status: $($metadata.status))" "INFO"
            }
        }
    }
    
    # Ensure output directory exists
    $outputDir = Split-Path -Parent $OutputPath
    if (-not (Test-Path $outputDir)) {
        Write-Log "Creating output directory: $outputDir" "INFO"
        New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    }
    
    # Generate JSON report
    Write-Log "Generating inventory report..." "INFO"
    $jsonOutput = $inventory | ConvertTo-Json -Depth 10
    $jsonOutput | Out-File -FilePath $OutputPath -Encoding UTF8
    
    Write-Log "Inventory report saved to: $OutputPath" "INFO"
    Write-Log "Summary: $($inventory.summary.total_containers) total, $($inventory.summary.running_containers) running, $($inventory.summary.stopped_containers) stopped" "INFO"
    Write-Log "Total volumes: $($inventory.summary.total_volumes), Total networks: $($inventory.summary.total_networks)" "INFO"
    
    # Return success
    return @{
        success = $true
        inventory_path = $OutputPath
        summary = $inventory.summary
    }
}
catch {
    Write-Log "Fatal error during inventory generation: $_" "ERROR"
    Write-Log $_.ScriptStackTrace "ERROR"
    
    # Return error
    return @{
        success = $false
        error = $_.Exception.Message
        stack_trace = $_.ScriptStackTrace
    }
}
