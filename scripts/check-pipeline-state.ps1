$base = "C:\Users\User\Desktop\Diana-Corporacao-Senciente"

Write-Output "=== HEARTBEATS ==="
$hbDir = "C:\AIOS\workers"
if (Test-Path $hbDir) {
    Get-ChildItem "$hbDir\*.json" | ForEach-Object {
        Write-Output "`n--- $($_.Name) ---"
        Get-Content $_.FullName
    }
} else {
    Write-Output "No heartbeat directory found"
}

Write-Output "`n=== TRIGGER FILES ==="
$triggers = @(".trigger_aider", ".trigger_revisor", ".trigger_worker")
foreach ($t in $triggers) {
    $path = Join-Path $base $t
    if (Test-Path $path) {
        Write-Output "  FOUND: $t (age: $([math]::Round((New-TimeSpan (Get-Item $path).LastWriteTime (Get-Date)).TotalSeconds))s)"
    } else {
        Write-Output "  ABSENT: $t"
    }
}

Write-Output "`n=== LOCK FILES ==="
$locks = @(".worker_aider.lock", ".worker_revisor.lock", ".worker_genesis.lock")
foreach ($l in $locks) {
    $path = Join-Path $base $l
    if (Test-Path $path) {
        $age = [math]::Round((New-TimeSpan (Get-Item $path).LastWriteTime (Get-Date)).TotalSeconds)
        Write-Output "  FOUND: $l (age: ${age}s) - BLOCKING!"
    } else {
        Write-Output "  ABSENT: $l"
    }
}

Write-Output "`n=== STORIES TODO ==="
$stories = Get-ChildItem (Join-Path $base "docs\stories\*.md") -ErrorAction SilentlyContinue | Where-Object { -not $_.Name.StartsWith("_") }
$todoCount = 0
foreach ($s in $stories) {
    $head = Get-Content $s.FullName -TotalCount 30 -ErrorAction SilentlyContinue
    $headStr = $head -join "`n"
    if ($headStr -match '\*\*Status:\*\*\s*TODO') {
        $todoCount++
        if ($todoCount -le 5) {
            $agent = "unknown"
            if ($headStr -match '\*\*Agente Sugerido:\*\*\s*(\S+)') { $agent = $Matches[1] }
            Write-Output "  $($s.Name) -> Agent: $agent"
        }
    }
}
Write-Output "  Total TODO: $todoCount"
