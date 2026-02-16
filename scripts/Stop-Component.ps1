param([Parameter(Mandatory=$true)][string]$Name)
Write-Host "🛑 Stopping component: $Name" -ForegroundColor Yellow
pm2 stop $Name
