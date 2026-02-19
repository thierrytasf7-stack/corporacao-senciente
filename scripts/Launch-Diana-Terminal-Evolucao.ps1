# Launch-Diana-Terminal-Evolucao.ps1
# Abre Windows Terminal com 5 abas para workers de evolucao
# FIX: 1 unica invocacao wt.exe (elimina race condition de janelas infinitas)

$ROOT      = Split-Path -Parent $PSScriptRoot
$scriptDir = Join-Path $ROOT "scripts"

$pSentinelas = Join-Path $scriptDir "tab-sentinelas.ps1"
$pIntencao   = Join-Path $scriptDir "tab-intencao.ps1"
$pWorker     = Join-Path $scriptDir "worker-multi-clis.ps1"

# Cada aba como string; "" dentro de string PS = literal " no output final
# Abas simples (worker) usam -Command inline; abas complexas usam -File
$t1 = "new-tab --title ""SENTINELAS""  powershell.exe -NoProfile -NoExit -File ""$pSentinelas"""
$t2 = "new-tab --title ""GENESIS""     powershell.exe -NoProfile -NoExit -File ""$pWorker"" -WorkerName genesis"
$t3 = "new-tab --title ""TRABALHADOR"" powershell.exe -NoProfile -NoExit -File ""$pWorker"" -WorkerName trabalhador"
$t4 = "new-tab --title ""REVISADOR""   powershell.exe -NoProfile -NoExit -File ""$pWorker"" -WorkerName revisador"
$t5 = "new-tab --title ""INTENCAO""    powershell.exe -NoProfile -NoExit -File ""$pIntencao"""

# Unico Start-Process: wt.exe cria todas as abas no mesmo lancamento
$wtArgs = "$t1 ; $t2 ; $t3 ; $t4 ; $t5"

Write-Host "Lancando Windows Terminal (5 abas)..." -ForegroundColor Cyan
Start-Process "wt.exe" -ArgumentList $wtArgs
Write-Host "OK - abas abertas: SENTINELAS | GENESIS | TRABALHADOR | REVISADOR | INTENCAO" -ForegroundColor Green
