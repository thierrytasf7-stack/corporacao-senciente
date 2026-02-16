param(
    [Parameter(Mandatory=$true)]
    [string]$Key,
    
    [Parameter(Mandatory=$true)]
    [string]$Value,
    
    [string]$Category = "global_vars" # global_vars, aider, agent_zero
)

$configPath = "C:/Users/User/Desktop/Diana-Corporacao-Senciente/config/environment-config.json"

Write-Host "🔄 Updating configuration: $Key = $Value" -ForegroundColor Cyan

try {
    $config = Get-Content $configPath | ConvertFrom-Json
    
    if ($Category -eq "global_vars") {
        $config.global_vars.$Key = $Value
    } else {
        $config.worker_specific.$Category.$Key = $Value
    }
    
    $config | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8
    Write-Host "✅ Configuration updated in $configPath" -ForegroundColor Green
    
    # Optionally notify components
    Write-Host "💡 Note: Some components may require a restart to apply changes." -ForegroundColor Yellow
}
catch {
    Write-Error "Failed to update configuration: $($_.Exception.Message)"
}
