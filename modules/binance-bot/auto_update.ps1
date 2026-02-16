# auto_update.ps1 - Automated log updater for Diana Frontend
# Native Windows Version - Stable ASCII strings

Write-Host "AUTO SYSTEM STARTED" -ForegroundColor Green
Write-Host "File: LOGS-CONSOLE-FRONTEND.JSON" -ForegroundColor Cyan

$counter = 0

while ($true) {
    $counter++
    $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
    $timeDisplay = Get-Date -Format "HH:mm:ss"
    
    $data = @{
        sessionId = "auto_$(Get-Date -UFormat %s)_$counter"
        startTime = $timestamp
        endTime = $timestamp
        totalLogs = $counter * 5
        errors = [math]::Max(1, $counter % 3)
        warnings = [math]::Max(1, $counter % 2)
        logs = @(
            @{
                timestamp = $timestamp
                level = "log"
                message = "System: Update #$counter"
                url = "http://localhost:13000"
            },
            @{
                timestamp = $timestamp
                level = "info"
                message = "Info: Cycle $counter active"
                url = "http://localhost:13000"
            },
            @{
                timestamp = $timestamp
                level = "warn"
                message = "Warning: Normal operation"
                url = "http://localhost:13000"
            }
        )
        status = "Active - Update #$counter - $timeDisplay"
    }
    
    try {
        $data | ConvertTo-Json -Depth 10 | Set-Content "LOGS-CONSOLE-FRONTEND.JSON" -Encoding UTF8 -Force
        Write-Host "OK: Update #$counter - $timeDisplay" -ForegroundColor Green
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 5
}
