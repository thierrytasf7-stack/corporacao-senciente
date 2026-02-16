$ErrorActionPreference = "Stop"

Write-Host "Starting Agent Key Components..."

if (-not (Test-Path "venv")) {
    Write-Host "Error: venv not found."
    exit 1
}

# Python path
$python = ".\venv\Scripts\python.exe"

# Check connection
Write-Host "Checking connection..."
try {
    # Simple check
    $envContent = Get-Content .env
    $maestroUrl = ($envContent | Select-String "^MAESTRO_URL=").ToString().Split('=')[1]
    Write-Host "Target: $maestroUrl"
} catch {
    Write-Host "Warning: Could not parse .env, proceeding anyway."
}

Write-Host "Launching listener..."
& $python listener.py
