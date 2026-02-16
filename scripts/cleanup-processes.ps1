Get-Process -Name 'python','aider' -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Killing PID $($_.Id) ($($_.ProcessName))"
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}
# Clean lock/trigger/stop files
Get-ChildItem -Path "C:\Users\User\Desktop\Diana-Corporacao-Senciente" -Filter ".trigger_*" -ErrorAction SilentlyContinue | Remove-Item -Force
Get-ChildItem -Path "C:\Users\User\Desktop\Diana-Corporacao-Senciente" -Filter ".worker_*.lock" -ErrorAction SilentlyContinue | Remove-Item -Force
Get-ChildItem -Path "C:\Users\User\Desktop\Diana-Corporacao-Senciente" -Filter ".stop_*" -ErrorAction SilentlyContinue | Remove-Item -Force
Write-Host "Cleanup done."
