$procs = Get-NetTCPConnection -LocalPort 21341 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($procId in $procs) {
    Write-Output "Killing PID $procId on port 21341"
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
}
if (-not $procs) { Write-Output "No process on port 21341" }
