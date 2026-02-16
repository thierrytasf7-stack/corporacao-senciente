param(
    [hashtable]$EnvVars,
    [string]$TaskId = "Manual"
)

Write-Host "Initializing environment variables..." -ForegroundColor Cyan

try {
    if ($EnvVars) {
        foreach ($key in $EnvVars.Keys) {
            $value = $EnvVars[$key]
            [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
            Write-Host "   Set $key = $value" -ForegroundColor Gray
        }
    }
    
    $required = @("OPENROUTER_API_KEY", "PROJECT_ROOT")
    foreach ($var in $required) {
        if (-not (Get-ChildItem Env:$var -ErrorAction SilentlyContinue)) {
            Write-Host "   Warning: $var is not set in current process environment." -ForegroundColor Yellow
        }
    }

    Write-Host "OK: Environment initialization complete." -ForegroundColor Green
}
catch {
    $msg = "Environment initialization failed: $($_.Exception.Message)"
    Write-Host $msg -ForegroundColor Red
    exit 1
}
