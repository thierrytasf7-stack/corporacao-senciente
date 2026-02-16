# Test-ProcessHealth.ps1 - Semantic monitoring for Guardian Hive

$LOG_PATH = "C:/AIOS/hive_memory.log"
$THRESHOLD_MINUTES = 5
$HIVE_APP_NAME = "guardian-hive"

Write-Host "Checking Guardian Hive health..." -ForegroundColor Cyan

# 1. Check if process is alive via Get-Process (more reliable than PM2 JSON in this env)
$hiveProc = Get-Process -Name "hive-guardian" -ErrorAction SilentlyContinue

if (-not $hiveProc) {
    Write-Host "FAIL: Hive Guardian process not detected." -ForegroundColor Red
    exit 1
}

# 2. Check for semantic inertia (log updates)
if (Test-Path $LOG_PATH) {
    $lastWrite = (Get-Item $LOG_PATH).LastWriteTime
    $diff = (Get-Date) - $lastWrite
    
    if ($diff.TotalMinutes -gt $THRESHOLD_MINUTES) {
        Write-Host "Warning: Hive Guardian inactive for $($diff.TotalMinutes) minutes." -ForegroundColor Yellow
        
        # Check if there are tasks waiting
        $storyDir = "C:/Users/User/Desktop/Diana-Corporacao-Senciente/docs/stories"
        $pendingCount = (Get-ChildItem $storyDir -Filter "*.md" | Get-Content | Select-String "Status: TODO" | Measure-Object).Count
        
        if ($pendingCount -gt 0) {
            $msg = "Tasks are pending but Hive is inactive. Restarting..."
            Write-Host "CRITICAL: $msg" -ForegroundColor Red
            # We use pm2 restart if available, or just log the need for restart
            pm2 restart $HIVE_APP_NAME
        } else {
            Write-Host "Info: Backlog is empty. Inactivity is expected." -ForegroundColor Gray
        }
    } else {
        Write-Host "PASS: Hive Guardian is active (Last update: $($diff.TotalSeconds)s ago)." -ForegroundColor Green
    }
} else {
    Write-Host "Warning: Health check log not found at $LOG_PATH" -ForegroundColor Yellow
}
