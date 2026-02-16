param(
    [Parameter(Mandatory=$true)]
    [string]$Subject,
    
    [Parameter(Mandatory=$true)]
    [string]$Message,
    
    [string]$Level = "CRITICAL" # INFO, WARNING, CRITICAL
)

$configPath = "C:/Users/User/Desktop/Diana-Corporacao-Senciente/config/alert-config.json"
$config = Get-Content $configPath | ConvertFrom-Json

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$fullMessage = "[$timestamp] [$Level] [$Subject] $Message"

# 1. Console Alert
if ($config.notifications.console) {
    $color = switch ($Level) {
        "CRITICAL" { "Red" }
        "WARNING"  { "Yellow" }
        default    { "Cyan" }
    }
    Write-Host "🚨 ALERT: $fullMessage" -ForegroundColor $color
}

# 2. File Log
if ($config.notifications.log_file) {
    $fullMessage | Out-File -FilePath $config.notifications.log_file -Append -Encoding UTF8
}

# 3. Discord Webhook (Simulated if empty)
if ($config.notifications.discord_webhook -ne "") {
    try {
        $payload = @{ content = "🚨 **$Subject** ($Level)`n$Message" } | ConvertTo-Json
        Invoke-RestMethod -Uri $config.notifications.discord_webhook -Method Post -Body $payload -ContentType "application/json"
    }
    catch {
        Write-Warning "Failed to send Discord alert."
    }
}
