# check-diana-status.ps1 - Full Diana system status check

Write-Host "=========================================="
Write-Host "  DIANA SYSTEM STATUS"
Write-Host "=========================================="

# 1. Workers
Write-Host "`n--- WORKERS ---"
foreach ($w in @('genesis','aider','zero')) {
    $f = "C:/AIOS/workers/$w.json"
    if (Test-Path $f) {
        $d = Get-Content $f | ConvertFrom-Json
        $age = [math]::Round(((Get-Date) - [datetime]$d.last_heartbeat).TotalSeconds)
        $st = if ($age -lt 30) { "ONLINE" } elseif ($age -lt 120) { "STALE" } else { "OFFLINE" }
        Write-Host ("{0,-10} {1,-8} cycles={2}" -f $d.worker, $st, $d.cycle_count)
    } else {
        Write-Host ("{0,-10} NO HEARTBEAT" -f $w)
    }
}

# 2. Servers
Write-Host "`n--- SERVERS ---"
$serverPorts = @(
    @{Port=3000; Name="Dashboard (Next.js)"},
    @{Port=3001; Name="Frontend (Vite)"},
    @{Port=3002; Name="Backend (Express)"},
    @{Port=13000; Name="Binance Frontend"}
)
foreach ($s in $serverPorts) {
    $conn = Get-NetTCPConnection -LocalPort $s.Port -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        Write-Host ("{0,-6} {1,-25} OK" -f $s.Port, $s.Name)
    } else {
        Write-Host ("{0,-6} {1,-25} DOWN" -f $s.Port, $s.Name)
    }
}

# 3. Stories
Write-Host "`n--- STORIES ---"
$stories = Get-ChildItem "C:\Users\User\Desktop\Diana-Corporacao-Senciente\docs\stories\*.md" -ErrorAction SilentlyContinue | Where-Object { -not $_.Name.StartsWith("_") }
$total = $stories.Count
$statuses = @{}
foreach ($s in $stories) {
    $content = Get-Content $s.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match '\*\*Status:\*\*\s*(\S+)') {
        $st = $Matches[1]
        if (-not $statuses.ContainsKey($st)) { $statuses[$st] = 0 }
        $statuses[$st]++
    }
}
Write-Host "Total: $total"
foreach ($kv in $statuses.GetEnumerator() | Sort-Object Name) {
    Write-Host ("  {0,-15} {1}" -f $kv.Key, $kv.Value)
}

# 4. Lock/Trigger/Stop
Write-Host "`n--- SIGNALS ---"
$signals = Get-ChildItem "C:\Users\User\Desktop\Diana-Corporacao-Senciente\.worker_*.lock","C:\Users\User\Desktop\Diana-Corporacao-Senciente\.trigger_*","C:\Users\User\Desktop\Diana-Corporacao-Senciente\.stop_*" -ErrorAction SilentlyContinue
if ($signals) {
    foreach ($sig in $signals) { Write-Host "  $($sig.Name)" }
} else {
    Write-Host "  (none)"
}

Write-Host "`n=========================================="
