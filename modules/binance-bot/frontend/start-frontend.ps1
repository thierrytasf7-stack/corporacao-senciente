# BinanceBot Frontend Startup (Vite)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "📊 [BINANCE-FRONTEND] Starting Vite on port 21340..." -ForegroundColor Cyan

# Check if build exists
if (Test-Path "dist") {
    Write-Host "✅ Build found, starting preview mode..." -ForegroundColor Green
    npm run preview -- --port 21340 --host
} else {
    Write-Host "⚠️  No build found, starting dev mode..." -ForegroundColor Yellow
    npm run dev -- --port 21340 --host
}
