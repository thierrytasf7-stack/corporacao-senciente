$pythons = Get-Process python -ErrorAction SilentlyContinue
foreach ($p in $pythons) {
    $wmi = Get-CimInstance Win32_Process -Filter "ProcessId = $($p.Id)" -ErrorAction SilentlyContinue
    Write-Output "PID=$($p.Id) | Start=$($p.StartTime) | CMD=$($wmi.CommandLine)"
    Write-Output "---"
}
