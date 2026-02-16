# Invoke-Rollback.ps1 - Disaster recovery back to Docker

Write-Host "🆘 INITIATING MIGRATION ROLLBACK..." -ForegroundColor Red -BackgroundColor Black

# 1. Stop all native processes
Write-Host "🛑 Stopping native processes (PM2)..." -ForegroundColor Yellow
pm2 stop all
pm2 delete all

# 2. Restore Docker containers
Write-Host "🐳 Restoring Docker infrastructure..." -ForegroundColor Cyan
if (Test-Path "docker-compose.yml") {
    docker-compose up -d
} else {
    Write-Warning "docker-compose.yml not found in root. Searching in subdirectories..."
    $composeFile = Get-ChildItem -Filter "docker-compose.yml" -Recurse | Select-Object -First 1
    if ($composeFile) {
        docker-compose -f $composeFile.FullName up -d
    } else {
        Write-Error "Could not find Docker infrastructure to restore."
        exit 1
    }
}

# 3. Verify Docker health
Write-Host "🔍 Verifying container health..." -ForegroundColor Yellow
docker ps

Write-Host ""
Write-Host "✅ Rollback completed. System is back in Docker mode." -ForegroundColor Green
