# check-heartbeats.ps1 - Check worker heartbeat status
Write-Host "=== DIANA WORKER HEARTBEATS ==="
foreach ($w in @('genesis','aider','zero')) {
    $f = "C:/AIOS/workers/$w.json"
    if (Test-Path $f) {
        $d = Get-Content $f | ConvertFrom-Json
        $age = [math]::Round(((Get-Date) - [datetime]$d.last_heartbeat).TotalSeconds)
        $online = if ($age -lt 30) { "ONLINE" } elseif ($age -lt 120) { "STALE" } else { "OFFLINE" }
        Write-Host ("{0,-10} {1,-8} cycles={2,-4} age={3}s" -f $d.worker, $online, $d.cycle_count, $age)
    } else {
        Write-Host ("{0,-10} NO HEARTBEAT" -f $w)
    }
}
