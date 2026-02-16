# BinanceBot Backend Startup - Managed by PM2
$ErrorActionPreference = "Stop"

$ROOT = "C:\Users\User\Desktop\Diana-Corporacao-Senciente\modules\binance-bot\backend"
Set-Location $ROOT

Write-Host "[BINANCE-BACKEND] Starting on port 21341..." -ForegroundColor Cyan

# Run ts-node directly
npx ts-node src/real-server.ts
