# Stop-Diana-Complete.ps1 - SHUTDOWN TOTAL do ecossistema Diana
# Mata TODOS os processos relacionados, incluindo guardian-hive que fica em background

$ROOT = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "   DIANA - SHUTDOWN TOTAL" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

$killed = 0

# 1. PM2 - KILL TOTAL
Write-Host "[1] Matando PM2 e todos processos gerenciados..." -ForegroundColor Yellow
try {
    & npx pm2 kill 2>&1 | Out-Null
    Write-Host "    PM2 killed" -ForegroundColor Green
} catch {
    Write-Host "    PM2 nao estava rodando" -ForegroundColor DarkGray
}

# 2. Guardian Hive (Node.js em background)
Write-Host "[2] Matando Guardian Hive (background)..." -ForegroundColor Yellow
$hiveProcs = Get-Process node* -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -match "hive|guardian" -or
    $_.MainWindowTitle -match "hive|guardian"
}
if ($hiveProcs) {
    $hiveProcs | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "    $($hiveProcs.Count) processos Hive mortos" -ForegroundColor Green
    $killed += $hiveProcs.Count
} else {
    Write-Host "    Nenhum processo Hive encontrado" -ForegroundColor DarkGray
}

# 3. Todos processos Node.js (dashboard, backend, binance, whatsapp)
Write-Host "[3] Matando todos processos Node.js..." -ForegroundColor Yellow
$nodeProcs = Get-Process node* -ErrorAction SilentlyContinue
if ($nodeProcs) {
    $nodeProcs | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "    $($nodeProcs.Count) processos Node mortos" -ForegroundColor Green
    $killed += $nodeProcs.Count
} else {
    Write-Host "    Nenhum Node.js rodando" -ForegroundColor DarkGray
}

# 4. Python (sentinelas)
Write-Host "[4] Matando sentinelas Python..." -ForegroundColor Yellow
$pythonProcs = Get-Process python* -ErrorAction SilentlyContinue
if ($pythonProcs) {
    $pythonProcs | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "    $($pythonProcs.Count) processos Python mortos" -ForegroundColor Green
    $killed += $pythonProcs.Count
} else {
    Write-Host "    Nenhum Python rodando" -ForegroundColor DarkGray
}

# 5. Claude CLI (workers)
Write-Host "[5] Matando Claude CLI workers..." -ForegroundColor Yellow
$claudeProcs = Get-Process claude* -ErrorAction SilentlyContinue
if ($claudeProcs) {
    $claudeProcs | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "    $($claudeProcs.Count) processos Claude mortos" -ForegroundColor Green
    $killed += $claudeProcs.Count
} else {
    Write-Host "    Nenhum Claude CLI rodando" -ForegroundColor DarkGray
}

# 6. PowerShell workers (claude-worker.ps1)
Write-Host "[6] Matando PowerShell workers..." -ForegroundColor Yellow
$psProcs = Get-Process powershell* -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -match "claude-worker|sentinela" -and
    $_.Id -ne $PID  # Nao mata a si mesmo
}
if ($psProcs) {
    $psProcs | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "    $($psProcs.Count) processos PowerShell mortos" -ForegroundColor Green
    $killed += $psProcs.Count
} else {
    Write-Host "    Nenhum PowerShell worker rodando" -ForegroundColor DarkGray
}

# 7. Processos usando portas Diana
Write-Host "[7] Liberando portas Diana (21300-21399)..." -ForegroundColor Yellow
$dianaPorts = 21300..21399
$portsKilled = 0
foreach ($port in $dianaPorts) {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        $procId = $conn.OwningProcess
        try {
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            $portsKilled++
        } catch {}
    }
}
if ($portsKilled -gt 0) {
    Write-Host "    $portsKilled portas liberadas" -ForegroundColor Green
    $killed += $portsKilled
} else {
    Write-Host "    Portas ja livres" -ForegroundColor DarkGray
}

# 8. Windows Terminal (todas instancias)
Write-Host "[8] Fechando Windows Terminal..." -ForegroundColor Yellow
$wtProcs = Get-Process WindowsTerminal -ErrorAction SilentlyContinue
if ($wtProcs) {
    # Mata todos WT exceto o atual (se houver)
    $currentWT = $null
    try {
        $parent = (Get-CimInstance Win32_Process -Filter "ProcessId=$PID").ParentProcessId
        while ($parent -and $parent -ne 0) {
            $proc = Get-Process -Id $parent -ErrorAction SilentlyContinue
            if ($proc -and $proc.ProcessName -eq "WindowsTerminal") {
                $currentWT = $parent
                break
            }
            $parent = (Get-CimInstance Win32_Process -Filter "ProcessId=$parent" -ErrorAction SilentlyContinue).ParentProcessId
        }
    } catch {}

    foreach ($wt in $wtProcs) {
        if ($wt.Id -ne $currentWT) {
            Stop-Process -Id $wt.Id -Force -ErrorAction SilentlyContinue
            $killed++
        }
    }
    Write-Host "    $($wtProcs.Count) Windows Terminal fechados" -ForegroundColor Green
} else {
    Write-Host "    Nenhum Windows Terminal aberto" -ForegroundColor DarkGray
}

# 9. Limpar arquivos residuais
Write-Host "[9] Limpando arquivos residuais..." -ForegroundColor Yellow
cd $ROOT
$patterns = @(
    ".trigger_*",
    ".prompt_*.txt",
    ".worker_*.lock",
    ".stop_*",
    ".session_*.txt",
    ".corp_prompt.json"
)
$filesRemoved = 0
foreach ($p in $patterns) {
    $files = Get-ChildItem -Path $ROOT -Filter $p -ErrorAction SilentlyContinue
    if ($files) {
        $files | Remove-Item -Force -ErrorAction SilentlyContinue
        $filesRemoved += $files.Count
    }
}
if ($filesRemoved -gt 0) {
    Write-Host "    $filesRemoved arquivos removidos" -ForegroundColor Green
} else {
    Write-Host "    Nenhum arquivo residual" -ForegroundColor DarkGray
}

# 10. Verificar se algo ainda esta rodando
Write-Host ""
Write-Host "[10] Verificacao final..." -ForegroundColor Yellow
$remaining = @()
$remaining += @(Get-Process node* -ErrorAction SilentlyContinue)
$remaining += @(Get-Process python* -ErrorAction SilentlyContinue)
$remaining += @(Get-Process claude* -ErrorAction SilentlyContinue)

if ($remaining.Count -gt 0) {
    Write-Host "    AVISO: $($remaining.Count) processos ainda rodando!" -ForegroundColor Red
    $remaining | ForEach-Object {
        Write-Host "      PID $($_.Id): $($_.ProcessName)" -ForegroundColor DarkYellow
    }
} else {
    Write-Host "    Tudo limpo!" -ForegroundColor Green
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   SHUTDOWN COMPLETO" -ForegroundColor Green
Write-Host "   Total morto: $killed processos" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Diana em repouso. Para reiniciar:" -ForegroundColor White
Write-Host "  1. Start-Diana-Native.bat" -ForegroundColor Gray
Write-Host "  2. powershell scripts\Launch-Diana-Terminal.ps1" -ForegroundColor Gray
Write-Host ""
