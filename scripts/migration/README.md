# Docker to Native Migration Scripts

This directory contains PowerShell scripts for migrating from Docker-based architecture to native Windows execution as part of the Sentient Corp Native Architecture Migration project.

## Overview

The migration follows a phased approach:
1. **Discovery & Inventory** - Identify Docker containers and extract metadata
2. **Data Preservation** - Backup volumes and configurations
3. **Container Termination** - Gracefully stop and remove containers
4. **Native Deployment** - Configure and start native processes
5. **Validation** - Verify migration success

## Scripts

### Get-DockerInventory.ps1

Discovers Docker containers and generates a comprehensive migration inventory report.

**Purpose**: Query Docker API for running containers and extract metadata including volumes, configurations, networks, and environment variables.

**Usage**:
```powershell
# Generate inventory for running containers
.\Get-DockerInventory.ps1

# Include stopped containers
.\Get-DockerInventory.ps1 -IncludeStopped

# Specify custom output path
.\Get-DockerInventory.ps1 -OutputPath "C:\backup\inventory.json"
```

**Output**: JSON file containing:
- Docker version information
- Container metadata (ID, name, image, status)
- Volume mounts (source, destination, mode)
- Network configurations (IP addresses, gateways)
- Environment variables (sensitive values masked)
- Port bindings
- Resource limits
- Summary statistics

**Validates**: Requirements 1.1

### Test-DockerInventory.ps1

Validates the Docker inventory system functionality.

**Purpose**: Run automated tests to ensure the inventory script works correctly.

**Usage**:
```powershell
.\Test-DockerInventory.ps1
```

**Tests**:
1. Docker availability check
2. Script existence validation
3. Inventory generation execution
4. Output file creation
5. JSON structure validation
6. Container metadata validation
7. Summary data verification

### Backup-DockerData.ps1

Preserves Docker container data and configurations before migration with checksum verification.

**Purpose**: Extract all Docker volume data, configuration files, and container metadata with checksum generation for integrity verification. Creates a comprehensive backup manifest for migration tracking and rollback capability.

**Usage**:
```powershell
# Backup all containers from default inventory
.\Backup-DockerData.ps1

# Use custom inventory and backup paths
.\Backup-DockerData.ps1 -InventoryPath "C:\custom\inventory.json" -BackupRoot "D:\backups"

# Skip checksum verification (faster but less safe)
.\Backup-DockerData.ps1 -VerifyChecksums $false
```

**Features**:
- Extracts Docker volume data (both bind mounts and named volumes)
- Preserves all container configurations (environment, networks, ports, resources)
- Generates SHA256 checksums for all backed up data
- Creates comprehensive backup manifest in JSON format
- Verifies data integrity after backup
- Supports rollback capability

**Output**: 
- Backup directory structure: `{BackupRoot}\{ContainerName}\`
  - `config\` - Configuration files (metadata, environment, networks, ports, resources)
  - `volumes\volume-{N}\` - Volume data directories
- `backup-manifest.json` - Complete backup manifest with checksums

**Validates**: Requirements 1.3, 11.1, 11.2

### MigrationState.ps1

Manages migration state tracking and phase transitions with comprehensive audit logging.

**Purpose**: Provides a state tracking system for the Docker to Native migration. Tracks migration phases, container processing status, data preservation tracking, validation results, and maintains rollback capability. All state is persisted in JSON format.

**Usage**:
```powershell
# Import the module
. .\MigrationState.ps1

# Initialize migration state
Initialize-MigrationState -StatePath "C:\project\migration\migration-state.json"

# Transition to next phase
Set-MigrationPhase -StatePath "C:\project\migration\migration-state.json" -NewPhase "BackupInProgress"

# Track processed container
Add-ProcessedContainer -StatePath "C:\project\migration\migration-state.json" -ContainerName "guardian-hive" -ContainerId "abc123"

# Track preserved data
Add-PreservedData -StatePath "C:\project\migration\migration-state.json" -DataKey "guardian-hive-config" -BackupPath "C:\backups\config.json"

# Track native process
Add-NativeProcess -StatePath "C:\project\migration\migration-state.json" -ProcessName "guardian-hive" -ProcessId 12345

# Record validation result
Add-ValidationResult -StatePath "C:\project\migration\migration-state.json" -Component "guardian-hive" -TestName "native_execution_test" -Passed $true

# Get current state
$state = Get-MigrationState -StatePath "C:\project\migration\migration-state.json"

# View audit log
$auditLog = Get-MigrationAuditLog -StatePath "C:\project\migration\migration-state.json"
```

**Features**:
- Phase management with validated transitions
- Container processing tracking
- Data preservation location tracking
- Native process deployment tracking
- Validation result recording
- Rollback availability management
- Comprehensive audit logging (JSON Lines format)
- Error tracking and reporting

**Migration Phases**:
1. NotStarted - Initial state
2. BackupInProgress - Data preservation phase
3. ContainerTermination - Docker shutdown phase
4. NativeDeployment - Native process startup phase
5. Validation - System validation phase
6. Completed - Migration complete
7. RolledBack - Migration rolled back

**Output**:
- `migration-state.json` - Current migration state
- `migration-audit.log` - Audit trail (JSON Lines format)

**Validates**: Requirements 11.4

See [MigrationState-README.md](MigrationState-README.md) for detailed documentation.

### Test-MigrationState.ps1 / Test-MigrationState.Simple.ps1

Validates the migration state tracking system functionality.

**Purpose**: Run automated tests to ensure the state tracking system works correctly.

**Usage**:
```powershell
# Run simple validation tests (compatible with all Pester versions)
.\Test-MigrationState.Simple.ps1

# Run Pester tests (requires Pester v5+)
Invoke-Pester -Path .\Test-MigrationState.ps1
```

**Tests**:
1. State initialization
2. Phase transitions (valid and invalid)
3. Container tracking
4. Data preservation tracking
5. Native process tracking
6. Validation result recording
7. Rollback availability management
8. Error recording
9. Audit logging
10. Complete migration flow

### Test-DockerBackup.ps1

Validates the Docker backup and data preservation system.

**Purpose**: Run automated tests to ensure the backup script works correctly.

**Usage**:
```powershell
.\Test-DockerBackup.ps1
```

**Tests**:
1. Backup script existence
2. Backup directory creation
3. Checksum generation
4. Manifest creation
5. Configuration extraction and preservation
6. Checksum verification and integrity detection

## Output Format

### Inventory JSON Structure

The inventory JSON has the following structure:

```json
{
  "generated_at": "2024-01-15T10:30:00Z",
  "docker_version": "24.0.7",
  "containers": [
    {
      "id": "abc123...",
      "name": "guardian-hive",
      "image": "guardian-hive:latest",
      "status": "running",
      "created": "2024-01-10T08:00:00Z",
      "started_at": "2024-01-15T09:00:00Z",
      "platform": "linux",
      "volumes": [
        {
          "type": "bind",
          "source": "/host/path",
          "destination": "/container/path",
          "mode": "rw",
          "rw": true
        }
      ],
      "networks": [
        {
          "name": "bridge",
          "network_id": "xyz789...",
          "ip_address": "172.17.0.2",
          "gateway": "172.17.0.1"
        }
      ],
      "config": {
        "hostname": "guardian-hive",
        "env": ["PATH=/usr/local/bin", "API_KEY=***MASKED***"],
        "cmd": ["./start.sh"],
        "working_dir": "/app",
        "exposed_ports": ["8080/tcp"]
      },
      "port_bindings": [
        {
          "container_port": "8080/tcp",
          "host_ip": "0.0.0.0",
          "host_port": "8080"
        }
      ],
      "resources": {
        "memory_limit": 536870912,
        "cpu_shares": 1024,
        "cpu_quota": 100000
      }
    }
  ],
  "summary": {
    "total_containers": 3,
    "running_containers": 2,
    "stopped_containers": 1,
    "total_volumes": 5,
    "total_networks": 3
  }
}
```

### Backup Manifest JSON Structure

The backup manifest JSON has the following structure:

```json
{
  "backup_started_at": "2024-01-15T10:30:00Z",
  "backup_completed_at": "2024-01-15T10:45:00Z",
  "backup_root": "C:\\project\\migration\\backups",
  "inventory_source": "C:\\project\\migration\\inventory.json",
  "containers": [
    {
      "container_id": "abc123...",
      "container_name": "guardian-hive",
      "image": "guardian-hive:latest",
      "backup_started_at": "2024-01-15T10:30:00Z",
      "backup_completed_at": "2024-01-15T10:35:00Z",
      "success": true,
      "error": null,
      "config": {
        "backup_path": "C:\\backups\\guardian-hive\\config",
        "checksum": "ABC123DEF456...",
        "backed_up_at": "2024-01-15T10:31:00Z",
        "success": true
      },
      "volumes": [
        {
          "source": "/var/lib/docker/volumes/data/_data",
          "destination": "/app/data",
          "type": "volume",
          "backup_path": "C:\\backups\\guardian-hive\\volumes\\volume-0",
          "checksum": "789GHI012JKL...",
          "size_bytes": 10485760,
          "file_count": 42,
          "backed_up_at": "2024-01-15T10:33:00Z",
          "success": true
        }
      ]
    }
  ],
  "summary": {
    "total_containers": 3,
    "successful_backups": 3,
    "failed_backups": 0,
    "total_volumes_backed_up": 5,
    "total_configs_backed_up": 3,
    "total_size_bytes": 52428800
  },
  "verification": {
    "checksums_verified": true,
    "verification_passed": true,
    "failed_verifications": []
  }
}
```

## Requirements

- Windows PowerShell 5.1 or PowerShell 7+
- Docker Desktop for Windows (installed and running)
- Appropriate permissions to query Docker API

## Security Notes

- Sensitive environment variables (PASSWORD, SECRET, KEY, TOKEN) are automatically masked in the output
- The inventory report should be stored securely as it contains system configuration details
- Review the generated JSON before sharing to ensure no sensitive data is exposed

## Next Steps

After generating the inventory:
1. Review the inventory report to identify all containers requiring migration
2. Run the data preservation scripts (Task 1.2)
3. Plan the migration sequence based on container dependencies
4. Execute the migration following the implementation plan

## Troubleshooting

**Docker not available**:
- Ensure Docker Desktop is installed and running
- Check that the Docker service is started
- Verify Docker CLI is in your PATH

**Permission errors**:
- Run PowerShell as Administrator
- Ensure your user has Docker access permissions

**Empty inventory**:
- Verify containers are running: `docker ps`
- Use `-IncludeStopped` flag to include stopped containers
- Check Docker daemon logs for issues

## Related Documentation

- [Requirements Document](../../.kiro/specs/sentient-corp-native-migration/requirements.md)
- [Design Document](../../.kiro/specs/sentient-corp-native-migration/design.md)
- [Implementation Tasks](../../.kiro/specs/sentient-corp-native-migration/tasks.md)

## Task Status

- [x] Task 1.1: Implement Docker container discovery and inventory system (PowerShell)
- [x] Task 1.2: Implement data preservation and backup system (PowerShell)
- [ ] Task 1.3: Write property test for data preservation
- [x] Task 1.4: Implement migration state tracking (JSON files)
