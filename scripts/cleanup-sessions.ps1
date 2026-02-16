# cleanup-sessions.ps1 - Kill all Diana terminal/worker processes
$ROOT = Split-Path -Parent $PSScriptRoot

Write-Host "=== DIANA CLEANUP ===" -ForegroundColor Yellow

# 1. Kill PM2 processes
Write-Host "[1] Parando PM2..." -ForegroundColor Cyan
& npx pm2 kill 2>$null

# 2. Kill python sentinelas
$pythonProcs = Get-Process python* -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -match "sentinela" -or $_.CommandLine -match "genesis" -or $_.CommandLine -match "escrivao" -or $_.CommandLine -match "revisador"
}
if ($pythonProcs) {
    Write-Host "[2] Matando $($pythonProcs.Count) sentinelas Python..." -ForegroundColor Cyan
    $pythonProcs | Stop-Process -Force
} else {
    Write-Host "[2] Nenhum sentinela Python encontrado" -ForegroundColor DarkGray
}

# 3. Kill claude CLI processes (workers)
$claudeProcs = Get-Process claude* -ErrorAction SilentlyContinue
if ($claudeProcs) {
    Write-Host "[3] Matando $($claudeProcs.Count) processos Claude CLI..." -ForegroundColor Cyan
    $claudeProcs | Stop-Process -Force
} else {
    Write-Host "[3] Nenhum Claude CLI encontrado" -ForegroundColor DarkGray
}

# 4. Kill Windows Terminal (old tabs)
$wtProcs = Get-Process WindowsTerminal -ErrorAction SilentlyContinue
if ($wtProcs) {
    Write-Host "[4] Encontrados $($wtProcs.Count) Windows Terminal(s)" -ForegroundColor Cyan
    # Kill all except the one running this script
    $currentPid = $PID
    $parentWt = $null
    try {
        $parent = (Get-CimInstance Win32_Process -Filter "ProcessId=$currentPid").ParentProcessId
        while ($parent -and $parent -ne 0) {
            $proc = Get-Process -Id $parent -ErrorAction SilentlyContinue
            if ($proc -and $proc.ProcessName -eq "WindowsTerminal") {
                $parentWt = $parent
                break
            }
            $parent = (Get-CimInstance Win32_Process -Filter "ProcessId=$parent" -ErrorAction SilentlyContinue).ParentProcessId
        }
    } catch {}

    foreach ($wt in $wtProcs) {
        if ($wt.Id -ne $parentWt) {
            Write-Host "  Fechando WT PID $($wt.Id)..." -ForegroundColor DarkYellow
            Stop-Process -Id $wt.Id -Force -ErrorAction SilentlyContinue
        } else {
            Write-Host "  Mantendo WT PID $($wt.Id) (atual)" -ForegroundColor Green
        }
    }
} else {
    Write-Host "[4] Nenhum Windows Terminal encontrado" -ForegroundColor DarkGray
}

# 5. Clean trigger/lock/session files
Write-Host "[5] Limpando arquivos residuais..." -ForegroundColor Cyan
$patterns = @(".trigger_*", ".prompt_*.txt", ".worker_*.lock", ".stop_*", ".session_*.txt", ".corp_prompt.json")
foreach ($p in $patterns) {
    $files = Get-ChildItem -Path $ROOT -Filter $p -ErrorAction SilentlyContinue
    if ($files) {
        $files | Remove-Item -Force
        Write-Host "  Removidos: $p ($($files.Count) arquivos)" -ForegroundColor DarkGray
    }
}

# 6. Kill orphan node processes on Diana ports
$dianaPorts = @(21300, 21301, 21302, 21303, 21310, 21311, 21312, 21340, 21341, 21350)
$killed = 0
foreach ($port in $dianaPorts) {
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Where-Object State -eq "Listen"
    if ($conn) {
        $procId = $conn.OwningProcess
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
        $killed++
    }
}
if ($killed -gt 0) {
    Write-Host "[6] Liberadas $killed portas Diana" -ForegroundColor Cyan
} else {
    Write-Host "[6] Portas Diana ja livres" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "=== CLEANUP COMPLETO ===" -ForegroundColor Green
Write-Host "Agora execute: Start-Diana-Native.bat + Launch-Diana-Terminal.ps1" -ForegroundColor White
