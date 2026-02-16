# Start-CorporacaoSenciente.ps1 - High-level system orchestrator (Maestro)

$PROJECT_ROOT = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"

Write-Host "👑 Starting Diana Corporacao Senciente (MAESTRO)..." -ForegroundColor Cyan -BackgroundColor DarkBlue

try {
    # The Maestro ensures all workers are synchronized and triggers systemic audits
    Write-Host "   -> Synchronizing environment..." -ForegroundColor Gray
    & "$PROJECT_ROOT/scripts/Initialize-WorkerEnvironment.ps1" -WorkerType "global"
    
    Write-Host "   -> Running initial health check..." -ForegroundColor Gray
    & "$PROJECT_ROOT/scripts/Test-ProcessHealth.ps1"
    
    # Keep alive or trigger specific orchestration logic
    Write-Host "🚀 Maestro is active and monitoring the hive." -ForegroundColor Green
    
    # In this native mode, Maestro can also act as a watchdog
    while ($true) {
        & "$PROJECT_ROOT/scripts/Test-ProcessHealth.ps1" | Out-Null
        & "$PROJECT_ROOT/scripts/Export-MetricsHistory.ps1" | Out-Null
        Start-Sleep -Seconds 60
    }
}
catch {
    Write-Error "Maestro failed to start: $($_.Exception.Message)"
    exit 1
}
