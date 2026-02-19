# tab-sentinelas.ps1 - Aba SENTINELAS: inicia e monitora processos Python
$ROOT = Split-Path -Parent $PSScriptRoot
Set-Location $ROOT

Write-Host "=== SENTINELAS PYTHON ===" -ForegroundColor Cyan
Write-Host "Iniciando sentinelas em background..." -ForegroundColor Yellow

Start-Process python -ArgumentList "scripts/sentinela-genesis.py"     -WindowStyle Hidden
Start-Process python -ArgumentList "scripts/sentinela-trabalhador.py" -WindowStyle Hidden
Start-Process python -ArgumentList "scripts/sentinela-revisador.py"   -WindowStyle Hidden

Start-Sleep 2
Write-Host "Sentinelas iniciadas!" -ForegroundColor Green
Write-Host ""

while ($true) {
    Start-Sleep 10
    Clear-Host
    Write-Host "=== SENTINELAS ATIVAS ===" -ForegroundColor Green
    Write-Host (Get-Date -Format "HH:mm:ss") -ForegroundColor Gray
    Write-Host ""
    $procs = Get-Process python -ErrorAction SilentlyContinue |
             Select-Object Id, ProcessName, StartTime
    if ($procs) {
        $procs | Format-Table -AutoSize
    } else {
        Write-Host "Nenhuma sentinela ativa" -ForegroundColor Red
    }
}
