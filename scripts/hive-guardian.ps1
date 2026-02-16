$AIOS_PATH = "C:/AIOS"
$SWARM_STATE_PATH = Join-Path $AIOS_PATH "swarm_state.json"
$HIVE_MEMORY_PATH = Join-Path $AIOS_PATH "hive_memory.log"
$POLLING_INTERVAL = 10 
$INERTIA_THRESHOLD_MINUTES = 5 

$PROJECT_ROOT = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Definition)

function Write-HiveLog($msg) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] HIVE-GUARDIAN: $msg"
    $logEntry | Out-File -FilePath $HIVE_MEMORY_PATH -Append -Encoding UTF8
}

function Get-SwarmState {
    $state = @{ desired_workers = 0; active_workers = 0; tasks_pending = 0; last_activity = (Get-Date).ToString("o") }
    if (Test-Path $SWARM_STATE_PATH) {
        $content = Get-Content $SWARM_STATE_PATH -Raw -Encoding UTF8
        try {
            $state = $content | ConvertFrom-Json
        } catch {
            Write-HiveLog("ERROR: Could not parse swarm_state.json. Using default.")
        }
    }
    return $state
}

function Save-SwarmState($state) {
    $state.last_activity = (Get-Date).ToString("o")
    $state | ConvertTo-Json -Depth 10 | Set-Content $SWARM_STATE_PATH -Encoding UTF8
}

function Get-PendingTasks {
    $count = 0
    $storyDir = Join-Path $PROJECT_ROOT "docs/stories"
    if (Test-Path $storyDir) {
        $files = Get-ChildItem -Path $storyDir -Filter "*.md" -Recurse
        foreach ($f in $files) {
            $content = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
            if ($content -match "Status:\s*(TODO|ERROR)") {
                $count++
            }
        }
    }
    return $count
}

Write-HiveLog("HIVE GUARDIAN STARTING - Script Edition Fixed")

while ($true) {
    try {
        $swarmState = Get-SwarmState
        $swarmState.tasks_pending = Get-PendingTasks
        Save-SwarmState $swarmState
        Write-HiveLog("Dashboard Status: Pending Tasks = $($swarmState.tasks_pending)")
    } catch {
        Write-HiveLog("Error in main loop: $($_.Exception.Message)")
    }
    Start-Sleep -Seconds $POLLING_INTERVAL
}