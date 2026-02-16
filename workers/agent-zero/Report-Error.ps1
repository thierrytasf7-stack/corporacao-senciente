param(
    [Parameter(Mandatory=$true)]
    [string]$ErrorMessage,
    
    [string]$Severity = "Error",
    
    [string]$TaskId = "Unknown"
)

$configPath = Join-Path $PSScriptRoot "config.json"
if (-not (Test-Path $configPath)) {
    Write-Error "Config file not found at $configPath"
    exit 1
}

$config = Get-Content $configPath | ConvertFrom-Json
$logDir = $config.log_path

if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$errorLog = @{
    timestamp = Get-Date -Format "o"
    task_id = $TaskId
    severity = $Severity
    message = $ErrorMessage
    worker = "AgentZero"
}

$fileName = "error-$($TaskId)-$((Get-Date).Ticks).json"
$filePath = Join-Path $logDir $fileName

$errorLog | ConvertTo-Json | Set-Content $filePath -Encoding UTF8

Write-Host "❌ Error reported: $ErrorMessage" -ForegroundColor Red
