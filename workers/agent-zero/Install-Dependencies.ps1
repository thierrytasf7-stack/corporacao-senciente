param(
    [string]$ProjectRoot,
    [string]$TaskId = "Manual"
)

$configPath = Join-Path $PSScriptRoot "config.json"
$config = Get-Content $configPath | ConvertFrom-Json

if (-not $ProjectRoot) {
    $ProjectRoot = $config.project_root
}

Write-Host "Installing dependencies in $ProjectRoot..." -ForegroundColor Cyan

try {
    # Detect and install Python dependencies
    if (Test-Path (Join-Path $ProjectRoot "requirements.txt")) {
        Write-Host "Found requirements.txt. Running pip install..." -ForegroundColor Yellow
        pip install -r (Join-Path $ProjectRoot "requirements.txt") --quiet
        if ($LASTEXITCODE -ne 0) { throw "pip install failed" }
    }

    # Detect and install Node.js dependencies
    if (Test-Path (Join-Path $ProjectRoot "package.json")) {
        Write-Host "Found package.json. Running npm install..." -ForegroundColor Yellow
        npm install --prefix $ProjectRoot --quiet
        if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
    }

    # Detect and build Rust dependencies
    if (Test-Path (Join-Path $ProjectRoot "Cargo.toml")) {
        Write-Host "Found Cargo.toml. Running cargo fetch..." -ForegroundColor Yellow
        cargo fetch --manifest-path (Join-Path $ProjectRoot "Cargo.toml")
        if ($LASTEXITCODE -ne 0) { throw "cargo fetch failed" }
    }

    Write-Host "OK: Dependencies installed successfully!" -ForegroundColor Green
}
catch {
    $msg = "Dependency installation failed: $($_.Exception.Message)"
    Write-Host $msg -ForegroundColor Red
    exit 1
}
