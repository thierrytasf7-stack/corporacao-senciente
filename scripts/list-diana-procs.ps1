# list-diana-procs.ps1 - List all Diana-related processes
Write-Host "=== PYTHON ==="
$pyProcs = Get-Process python -ErrorAction SilentlyContinue
if ($pyProcs) {
    foreach ($p in $pyProcs) {
        $cmd = (Get-CimInstance Win32_Process -Filter "ProcessId = $($p.Id)" -ErrorAction SilentlyContinue).CommandLine
        Write-Host "  PID=$($p.Id) $cmd"
    }
} else { Write-Host "  (none)" }

Write-Host "=== NODE ==="
$nodeProcs = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcs) {
    foreach ($p in $nodeProcs) {
        $cmd = (Get-CimInstance Win32_Process -Filter "ProcessId = $($p.Id)" -ErrorAction SilentlyContinue).CommandLine
        Write-Host "  PID=$($p.Id) $cmd"
    }
} else { Write-Host "  (none)" }

Write-Host "=== CMD (DIANA) ==="
$cmdProcs = Get-Process cmd -ErrorAction SilentlyContinue
if ($cmdProcs) {
    foreach ($p in $cmdProcs) {
        Write-Host "  PID=$($p.Id) Title='$($p.MainWindowTitle)'"
    }
} else { Write-Host "  (none)" }
