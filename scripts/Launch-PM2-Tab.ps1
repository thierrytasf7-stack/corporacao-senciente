# Launch-PM2-Tab.ps1
$projectRoot = "C:/Users/User/Desktop/Diana-Corporacao-Senciente"
Set-Location $projectRoot

Write-Host "Starting PM2 Dashboard..." -ForegroundColor Cyan

# Try standard path first, then fallback to known roaming path
$pm2Path = "pm2"
if (-not (Get-Command "pm2" -ErrorAction SilentlyContinue)) {
    $pm2Path = "$env:APPDATA\npm\pm2.cmd"
}

if (Test-Path $pm2Path) {
    & $pm2Path monit
} else {
    # Last ditch effort
    try { 
        pm2 monit 
    } catch { 
        Write-Error "PM2 not found. Install it with: npm install -g pm2"
        Read-Host 'Press Enter to exit'
    }
}
