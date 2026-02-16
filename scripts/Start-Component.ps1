param([Parameter(Mandatory=$true)][string]$Name)
Write-Host "🚀 Starting component: $Name" -ForegroundColor Yellow
pm2 start $Name
