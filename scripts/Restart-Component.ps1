param([Parameter(Mandatory=$true)][string]$Name)
Write-Host "🔄 Restarting component: $Name" -ForegroundColor Yellow
pm2 restart $Name
