# Control-Panel.ps1 - Interactive management for Diana Corporacao Senciente

function Show-Menu {
    Clear-Host
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host "🛡️  DIANA SENTIENT CORP - NATIVE CONTROL PANEL" -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host " [0] 👁️  ELITE VISUAL MODE (Split & PM2)"
    Write-Host " [1] 🚀 Setup Squad (Standard)"
    Write-Host " [2] 📊 Check System Status"
    Write-Host " [3] 🔍 Run Migration Validation"
    Write-Host " [4] 🛠️  Repair Filesystem Permissions"
    Write-Host " [5] 🛑 Stop All Processes"
    Write-Host " [6] 🔄 Restart All Processes"
    Write-Host " [7] 🧪 Run Integration Tests"
    Write-Host " [Q] 🚪 Exit"
    Write-Host "-----------------------------------------------"
}

$projectRoot = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
Set-Location $projectRoot

while ($true) {
    Show-Menu
    $choice = Read-Host "Select an option"

    switch ($choice) {
        "0" { & ".\scripts\Launch-Visual-Panel.ps1" }
        "1" { & ".\Setup-Squad.ps1" }
        "2" { & ".\scripts\Get-SystemStatus.ps1"; pause }
        "3" { & ".\scripts\Validate-Migration.ps1"; pause }
        "4" { & ".\scripts\Repair-FilePermissions.ps1"; pause }
        "5" { pm2 stop all; Write-Host "All processes stopped." -ForegroundColor Yellow; pause }
        "6" { pm2 restart all; Write-Host "All processes restarted." -ForegroundColor Green; pause }
        "7" { & ".\scripts\Test-EndToEndWorkflow.ps1"; pause }
        "Q" { exit }
        "q" { exit }
        default { Write-Host "Invalid option!" -ForegroundColor Red; Start-Sleep -Seconds 1 }
    }
}
