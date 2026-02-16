# kill-diana-workers.ps1 - Kill all Diana processes (python sentinels + node servers)

# 1. Kill python sentinels/engines
$pyProcs = Get-Process python -ErrorAction SilentlyContinue
foreach ($p in $pyProcs) {
    try {
        $cmd = (Get-CimInstance Win32_Process -Filter "ProcessId = $($p.Id)").CommandLine
        if ($cmd -match "sentinela|worker_genesis|aider_worker|zero_worker") {
            Write-Host "[KILL] Python PID $($p.Id): $cmd"
            Stop-Process -Id $p.Id -Force
        }
    } catch {}
}

# 2. Kill node servers (dashboard, backend, frontend, binance, concurrently)
$nodeProcs = Get-Process node -ErrorAction SilentlyContinue
foreach ($p in $nodeProcs) {
    try {
        $cmd = (Get-CimInstance Win32_Process -Filter "ProcessId = $($p.Id)").CommandLine
        if ($cmd -match "server\.js|next|vite|concurrently|ts-node|npm") {
            Write-Host "[KILL] Node PID $($p.Id): $cmd"
            Stop-Process -Id $p.Id -Force
        }
    } catch {}
}

# 3. Kill any leftover cmd.exe from listener .bat files
$cmdProcs = Get-Process cmd -ErrorAction SilentlyContinue
foreach ($p in $cmdProcs) {
    try {
        $title = $p.MainWindowTitle
        if ($title -match "WORKER|SENTINEL|SENTINELA|DIANA|GENESIS|AIDER|REVISOR") {
            Write-Host "[KILL] CMD PID $($p.Id): $title"
            Stop-Process -Id $p.Id -Force
        }
    } catch {}
}

Write-Host "[OK] Diana processes cleaned"
