# Export-MetricsHistory.ps1 - Persist performance trends for historical analysis

$METRICS_FILE = "C:/AIOS/metrics_history.json"
$MAX_ENTRIES = 1000

Write-Host "[METRICS] Exporting system metrics..." -ForegroundColor Cyan

try {
    $pm2Json = pm2 jlist | Out-String
    $pm2Data = $pm2Json | ConvertFrom-Json -ErrorAction Stop
    $timestamp = Get-Date -Format "o"
    
    $currentMetrics = @()
    foreach ($app in $pm2Data) {
        $currentMetrics += @{
            name = $app.name
            cpu = $app.monit.cpu
            memory = $app.monit.memory
            status = $app.pm2_env.status
        }
    }
    
    $entry = @{
        timestamp = $timestamp
        metrics = $currentMetrics
    }
    
    # Load existing or create new
    if (Test-Path $METRICS_FILE) {
        $history = Get-Content $METRICS_FILE | ConvertFrom-Json
        if ($history -isnot [System.Collections.ArrayList]) {
            $history = [System.Collections.ArrayList]@($history)
        }
    } else {
        $history = [System.Collections.ArrayList]@()
    }
    
    # Add new entry
    [void]$history.Add($entry)
    
    # Truncate if too large
    if ($history.Count -gt $MAX_ENTRIES) {
        $history.RemoveAt(0)
    }
    
    $history | ConvertTo-Json -Depth 10 | Set-Content $METRICS_FILE -Encoding UTF8
    Write-Host "[OK] Metrics persisted to $METRICS_FILE" -ForegroundColor Green
}
catch {
    # Silently ignore errors - metrics export is non-critical
    Write-Host "[WARN] Failed to export metrics (non-critical)" -ForegroundColor Yellow
}
