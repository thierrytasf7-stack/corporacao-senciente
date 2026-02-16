# check-signals.ps1 - Check trigger, lock and stop files
$root = "C:\Users\User\Desktop\Diana-Corporacao-Senciente"

Write-Host "=== TRIGGER FILES ==="
$triggers = Get-ChildItem "$root\.trigger_*" -ErrorAction SilentlyContinue
if ($triggers) {
    foreach ($f in $triggers) {
        $age = [math]::Round(((Get-Date) - $f.LastWriteTime).TotalSeconds)
        Write-Host "  $($f.Name) (age: ${age}s)"
    }
} else { Write-Host "  (none)" }

Write-Host "=== LOCK FILES ==="
$locks = Get-ChildItem "$root\.worker_*.lock" -ErrorAction SilentlyContinue
if ($locks) {
    foreach ($f in $locks) {
        $age = [math]::Round(((Get-Date) - $f.LastWriteTime).TotalSeconds)
        $content = Get-Content $f.FullName -ErrorAction SilentlyContinue
        Write-Host "  $($f.Name) (age: ${age}s) content: $content"
    }
} else { Write-Host "  (none)" }

Write-Host "=== STOP FILES ==="
$stops = Get-ChildItem "$root\.stop_*" -ErrorAction SilentlyContinue
if ($stops) {
    foreach ($f in $stops) { Write-Host "  $($f.Name)" }
} else { Write-Host "  (none)" }

Write-Host "=== CMD PROCESSES ==="
$cmds = Get-Process cmd -ErrorAction SilentlyContinue
if ($cmds) {
    foreach ($p in $cmds) {
        Write-Host "  PID=$($p.Id) Title='$($p.MainWindowTitle)'"
    }
} else { Write-Host "  (none)" }
