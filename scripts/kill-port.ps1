param([int]$Port = 21341)
$conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if ($conns) {
    $procIds = $conns | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($procId in $procIds) {
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        Write-Host "Killed PID $procId on port $Port"
    }
} else {
    Write-Host "No process on port $Port"
}
