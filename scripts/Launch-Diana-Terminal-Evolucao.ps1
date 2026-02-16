# Launch-Diana-Terminal-Evolucao.ps1
# Abre Windows Terminal com 4 abas para workers de evolucao

$ROOT = Split-Path -Parent $PSScriptRoot

# Profile config para Windows Terminal
$wtProfile = @{
    launchMode = "maximized"
    tabs = @(
        @{
            title = "SENTINELAS (Python)"
            commandline = "powershell.exe -NoProfile -NoExit -Command `"cd '$ROOT'; Write-Host '=== SENTINELAS PYTHON ===' -ForegroundColor Cyan; Write-Host 'Iniciando sentinelas em background...' -ForegroundColor Yellow; Start-Process python -ArgumentList 'scripts/sentinela-genesis.py' -WindowStyle Hidden; Start-Process python -ArgumentList 'scripts/sentinela-trabalhador.py' -WindowStyle Hidden; Start-Process python -ArgumentList 'scripts/sentinela-revisador.py' -WindowStyle Hidden; Write-Host 'Sentinelas iniciadas!' -ForegroundColor Green; Write-Host ''; Write-Host 'Monitoramento:' -ForegroundColor Cyan; while (`$true) { Clear-Host; Write-Host '=== SENTINELAS STATUS ===' -ForegroundColor Cyan; Get-Process python* | Where-Object { `$_.CommandLine -like '*sentinela*' } | Format-Table -Property Id,ProcessName,StartTime; Start-Sleep -Seconds 5 } `""
        },
        @{
            title = "GENESIS Worker"
            commandline = "powershell.exe -NoProfile -NoExit -Command `"cd '$ROOT'; `$env:CLAUDE_CODE_GIT_BASH_PATH='D:\Git\usr\bin\bash.exe'; Remove-Item Env:CLAUDECODE* -ErrorAction SilentlyContinue; Write-Host '=== WORKER GENESIS ===' -ForegroundColor Cyan; & '$ROOT/scripts/claude-worker-ceo.ps1' -WorkerName genesis`""
        },
        @{
            title = "TRABALHADOR Worker"
            commandline = "powershell.exe -NoProfile -NoExit -Command `"cd '$ROOT'; `$env:CLAUDE_CODE_GIT_BASH_PATH='D:\Git\usr\bin\bash.exe'; Remove-Item Env:CLAUDECODE* -ErrorAction SilentlyContinue; Write-Host '=== WORKER TRABALHADOR ===' -ForegroundColor Cyan; & '$ROOT/scripts/claude-worker-ceo.ps1' -WorkerName trabalhador`""
        },
        @{
            title = "REVISADOR Worker"
            commandline = "powershell.exe -NoProfile -NoExit -Command `"cd '$ROOT'; `$env:CLAUDE_CODE_GIT_BASH_PATH='D:\Git\usr\bin\bash.exe'; Remove-Item Env:CLAUDECODE* -ErrorAction SilentlyContinue; Write-Host '=== WORKER REVISADOR ===' -ForegroundColor Cyan; & '$ROOT/scripts/claude-worker-ceo.ps1' -WorkerName revisador`""
        }
    )
}

# Converter para JSON e escapar para linha de comando
$wtJson = ($wtProfile | ConvertTo-Json -Depth 10 -Compress).Replace('"', '\"')

# Lançar Windows Terminal com o profile
Start-Process "wt.exe" -ArgumentList "-w 1 new-tab --title `"EVOLUCAO WORKERS`""

# Aguardar 1s e então abrir as abas
Start-Sleep -Milliseconds 1000

# Sentinelas
Start-Process "wt.exe" -ArgumentList "-w 1 new-tab --title `"SENTINELAS`" powershell.exe -NoProfile -NoExit -Command `"cd '$ROOT'; Write-Host '=== SENTINELAS PYTHON ===' -ForegroundColor Cyan; Write-Host 'Iniciando sentinelas...' -ForegroundColor Yellow; Start-Process python -ArgumentList 'scripts/sentinela-genesis.py' -WindowStyle Hidden; Start-Process python -ArgumentList 'scripts/sentinela-trabalhador.py' -WindowStyle Hidden; Start-Process python -ArgumentList 'scripts/sentinela-revisador.py' -WindowStyle Hidden; Start-Sleep -Seconds 2; Write-Host 'Sentinelas iniciadas!' -ForegroundColor Green; Write-Host ''; while (`$true) { `$procs = Get-Process python -ErrorAction SilentlyContinue | Select-Object Id,ProcessName,StartTime; if (`$procs) { Write-Host '=== SENTINELAS ATIVAS ===' -ForegroundColor Green; `$procs | Format-Table } else { Write-Host 'Nenhuma sentinela ativa' -ForegroundColor Red }; Start-Sleep -Seconds 10; Clear-Host } `""

Start-Sleep -Milliseconds 500

# Genesis Worker
Start-Process "wt.exe" -ArgumentList "-w 1 new-tab --title `"GENESIS`" powershell.exe -NoProfile -NoExit -Command `"cd '$ROOT'; `$env:CLAUDE_CODE_GIT_BASH_PATH='D:\Git\usr\bin\bash.exe'; Remove-Item Env:CLAUDECODE* -ErrorAction SilentlyContinue; Write-Host '=== WORKER GENESIS ===' -ForegroundColor Cyan; & '$ROOT/scripts/claude-worker-ceo.ps1' -WorkerName genesis`""

Start-Sleep -Milliseconds 500

# Trabalhador Worker
Start-Process "wt.exe" -ArgumentList "-w 1 new-tab --title `"TRABALHADOR`" powershell.exe -NoProfile -NoExit -Command `"cd '$ROOT'; `$env:CLAUDE_CODE_GIT_BASH_PATH='D:\Git\usr\bin\bash.exe'; Remove-Item Env:CLAUDECODE* -ErrorAction SilentlyContinue; Write-Host '=== WORKER TRABALHADOR ===' -ForegroundColor Cyan; & '$ROOT/scripts/claude-worker-ceo.ps1' -WorkerName trabalhador`""

Start-Sleep -Milliseconds 500

# Revisador Worker
Start-Process "wt.exe" -ArgumentList "-w 1 new-tab --title `"REVISADOR`" powershell.exe -NoProfile -NoExit -Command `"cd '$ROOT'; `$env:CLAUDE_CODE_GIT_BASH_PATH='D:\Git\usr\bin\bash.exe'; Remove-Item Env:CLAUDECODE* -ErrorAction SilentlyContinue; Write-Host '=== WORKER REVISADOR ===' -ForegroundColor Cyan; & '$ROOT/scripts/claude-worker-ceo.ps1' -WorkerName revisador`""

Write-Host "Windows Terminal lancado com 4 abas (Sentinelas + 3 Workers)" -ForegroundColor Green
