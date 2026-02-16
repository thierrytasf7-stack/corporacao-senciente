# Launch-Visual-Panel.ps1 - The Ultimate 4-Tab Dashboard

$projectRoot = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"

Write-Host "Constructing Visual Dashboard (4 Tabs)..." -ForegroundColor Cyan

# Restart PM2
pm2 stop all
pm2 delete all
pm2 start ecosystem.config.js

Start-Sleep -Seconds 3

# Define Scripts
$hiveScript = "$projectRoot/scripts/Launch-Hive-Tab.ps1"
$pm2Script = "$projectRoot/scripts/Launch-PM2-Tab.ps1"
$workerScript = "$projectRoot/scripts/Watch-Workers.ps1"
$logsScript = "$projectRoot/scripts/Launch-Logs-Tab.ps1"

# WT Arguments (4 Tabs)
# 1. Hive Core
# 2. Servers (PM2 Monit)
# 3. Workers (Custom Watch)
# 4. Logs
$wtArgs = "-w 0 nt --title `"HIVE CORE`" -d `"$projectRoot`" powershell -NoExit -ExecutionPolicy Bypass -File `"$hiveScript`" ; nt --title `"SERVERS (PM2)`" -d `"$projectRoot`" powershell -NoExit -ExecutionPolicy Bypass -File `"$pm2Script`" ; nt --title `"WORKERS (WATCH)`" -d `"$projectRoot`" powershell -NoExit -ExecutionPolicy Bypass -File `"$workerScript`" ; nt --title `"AGENT LOGS`" -d `"$projectRoot`" powershell -NoExit -ExecutionPolicy Bypass -File `"$logsScript`""

try {
    Start-Process "cmd.exe" -ArgumentList "/c start wt.exe $wtArgs" -WindowStyle Hidden
    Write-Host "Dashboard launched successfully." -ForegroundColor Green
}
catch {
    Write-Error "Failed to launch Windows Terminal: $($_.Exception.Message)"
}
