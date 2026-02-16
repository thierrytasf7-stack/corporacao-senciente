# Get-SystemStatus.ps1 - Unified dashboard data collection (Fixed for Windows)

Write-Host "Collecting System Status..." -ForegroundColor Cyan

# We use 'pm2 status' directly and parse the output to avoid JSON duplicate key issues on Windows
$pm2Output = pm2 status

Write-Host "--- PM2 LIVE STATUS ---" -ForegroundColor Yellow
$pm2Output

$report = @()
try {
    # Attempt to get a clean JSON by selecting only non-env fields if possible, 
    # but for now, the text output above is the source of truth for the user.
    Write-Host "`nDetailed Metrics Audit:" -ForegroundColor Gray
    
    # We can also check specific process activity
    $hive = Get-Process -Name "hive-guardian" -ErrorAction SilentlyContinue
    if ($hive) {
        Write-Host "✅ Guardian Hive: Running (PID: $($hive.Id))" -ForegroundColor Green
    } else {
        Write-Host "❌ Guardian Hive: NOT DETECTED" -ForegroundColor Red
    }
}
catch {
    Write-Host "Warning: Could not perform detailed process audit." -ForegroundColor Yellow
}
