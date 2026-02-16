# Repair-FilePermissions.ps1 - Force correct ACLs for native workers
# Requires Administrator privileges

$PROJECT_ROOT = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
$AIOS_PATH = "C:/AIOS"

Write-Host "🛠️ Repairing filesystem permissions..." -ForegroundColor Yellow

function Grant-FullAccess($path) {
    if (Test-Path $path) {
        Write-Host "   Granting full access to: $path" -ForegroundColor Gray
        # Using icacls to grant full control to current user and system
        icacls "$path" /grant "$($env:USERNAME):(OI)(CI)F" /T /C /Q
        icacls "$path" /grant "SYSTEM:(OI)(CI)F" /T /C /Q
    }
}

try {
    Grant-FullAccess $PROJECT_ROOT
    Grant-FullAccess $AIOS_PATH
    
    # Ensure specific critical dirs exist and are writable
    $dirs = @(
        "C:/AIOS/agents",
        "$PROJECT_ROOT/workers/agent-zero/queue",
        "$PROJECT_ROOT/workers/aider/queue",
        "$PROJECT_ROOT/logs"
    )
    
    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        Grant-FullAccess $dir
    }

    Write-Host "`n✅ Permissions repaired successfully." -ForegroundColor Green
}
catch {
    Write-Host "`n❌ Failed to repair permissions: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
