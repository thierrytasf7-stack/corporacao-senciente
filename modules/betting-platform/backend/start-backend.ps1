# Betting Platform Backend Startup - Managed by PM2
$ErrorActionPreference = "Stop"

$ROOT = "C:\Users\User\Desktop\Diana-Corporacao-Senciente\modules\betting-platform\backend"
Set-Location $ROOT

Write-Host "[BETTING-BACKEND] Starting on port 21370..." -ForegroundColor Cyan

# Set environment
$env:PORT = "21370"
$env:NODE_ENV = "production"

# Run ts-node directly
npx ts-node src/index.ts
