# Dashboard UI Startup (Next.js)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "🎨 [DASHBOARD] Starting Next.js on port 21300..." -ForegroundColor Cyan

# Check if build exists, if not use dev mode
if (Test-Path ".next") {
    Write-Host "✅ Build found, starting production mode..." -ForegroundColor Green
    npm run start -- -p 21300
} else {
    Write-Host "⚠️  No build found, starting development mode..." -ForegroundColor Yellow
    npm run dev
}
