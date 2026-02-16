param(
    [string]$ProjectRoot,
    [string]$TestCommand,
    [string]$TaskId = "Manual"
)

$configPath = Join-Path $PSScriptRoot "config.json"
$config = Get-Content $configPath | ConvertFrom-Json

if (-not $ProjectRoot) { $ProjectRoot = $config.project_root }
if (-not $TestCommand) { $TestCommand = $config.test_command }

Write-Host "Running tests in $ProjectRoot using command: $TestCommand" -ForegroundColor Cyan

try {
    # Set location to project root
    Push-Location $ProjectRoot
    
    # Execute test command
    Invoke-Expression $TestCommand
    $exitCode = $LASTEXITCODE
    
    Pop-Location
    
    if ($exitCode -ne 0) {
        throw "Test command failed with exit code $exitCode"
    }

    Write-Host "OK: Tests passed successfully!" -ForegroundColor Green
}
catch {
    $msg = "Test execution failed: $($_.Exception.Message)"
    Write-Host $msg -ForegroundColor Red
    exit 1
}
