# Betting Platform Frontend Startup - Managed by PM2
$ErrorActionPreference = "Stop"

$ROOT = "C:\Users\User\Desktop\Diana-Corporacao-Senciente\modules\betting-platform\frontend"
Set-Location $ROOT

Write-Host "[BETTING-FRONTEND] Starting on port 21371..." -ForegroundColor Cyan

# Set environment
$env:PORT = "21371"
$env:VITE_API_URL = "http://localhost:21370"

# Run vite directly
npx vite --port 21371 --host
