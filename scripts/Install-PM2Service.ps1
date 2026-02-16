# Install-PM2Service.ps1 - Configure PM2 to start on boot
# Requires Administrator privileges

$taskName = "Diana-AIOS-AutoStart"
$projectRoot = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
$pm2Path = (Get-Command pm2).Source

Write-Host "⚙️  Installing PM2 auto-start service via Task Scheduler..." -ForegroundColor Yellow

# 1. Save current PM2 state
Write-Host "   -> Saving PM2 state..." -ForegroundColor Gray
pm2 save

# 2. Create the task action
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-ExecutionPolicy Bypass -Command `"& '$pm2Path' resurrect; Set-Location '$projectRoot'; .\Setup-Squad.ps1`""

# 3. Create the trigger (At Startup)
$trigger = New-ScheduledTaskTrigger -AtStartup

# 4. Create the principal (Run as SYSTEM or current user with highest privileges)
$principal = New-ScheduledTaskPrincipal -UserId "$($env:USERDOMAIN)\$($env:USERNAME)" -LogonType InteractiveToken -RunLevel Highest

# 5. Register the task
try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Force | Out-Null
    Write-Host "✅ Auto-start task '$taskName' registered successfully." -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to register task. Please run this script as Administrator." -ForegroundColor Red
    exit 1
}
