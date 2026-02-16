param(
    [string]$WorkerType = "global"
)

$configPath = "C:/Users/User/Desktop/Diana-Corporacao-Senciente/config/environment-config.json"

if (-not (Test-Path $configPath)) {
    Write-Error "Environment config not found at $configPath"
    exit 1
}

$config = Get-Content $configPath | ConvertFrom-Json

Write-Host "🌐 Syncing environment for: $WorkerType" -ForegroundColor Cyan

# Set global variables
foreach ($var in $config.global_vars.PSObject.Properties) {
    [System.Environment]::SetEnvironmentVariable($var.Name, $var.Value, "Process")
    Write-Host "   Set $($var.Name)" -ForegroundColor Gray
}

# Set worker-specific variables
if ($config.worker_specific.$WorkerType) {
    foreach ($var in $config.worker_specific.$WorkerType.PSObject.Properties) {
        [System.Environment]::SetEnvironmentVariable($var.Name, $var.Value, "Process")
        Write-Host "   Set $($var.Name) (worker-specific)" -ForegroundColor Gray
    }
}

Write-Host "✅ Environment sync complete." -ForegroundColor Green
