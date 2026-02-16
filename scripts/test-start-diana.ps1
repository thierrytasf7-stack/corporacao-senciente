# test-start-diana.ps1 - Simula startup do Windows Terminal para debug
$ROOT = "C:\Users\User\Desktop\Diana-Corporacao-Senciente"

Write-Host "=== SIMULACAO START DIANA ===" -ForegroundColor Cyan
Write-Host ""

# 1. PM2 Status (como Start-Diana-Native.bat faz)
Write-Host "[1] PM2 Status..." -ForegroundColor White
cd $ROOT
$pm2Status = npx pm2 status 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host $pm2Status
} else {
    Write-Host "  WARN: PM2 nao iniciado. Rode Start-Diana-Native.bat primeiro" -ForegroundColor Yellow
}

# 2. Testar cada worker individualmente (como Windows Terminal faz)
Write-Host ""
Write-Host "[2] Testando Workers (5s cada)..." -ForegroundColor White

# Sentinela Genesis (Python)
Write-Host ""
Write-Host "  === SENTINELA-WATCH (Python) ===" -ForegroundColor Cyan
$sentinelaJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\User\Desktop\Diana-Corporacao-Senciente"
    python scripts\sentinela-genesis.py 2>&1
}
Start-Sleep -Seconds 3
$sentinelaOutput = Receive-Job $sentinelaJob
Stop-Job $sentinelaJob -ErrorAction SilentlyContinue
Remove-Job $sentinelaJob -Force -ErrorAction SilentlyContinue

if ($sentinelaOutput) {
    Write-Host $sentinelaOutput[0..5] -ForegroundColor Gray
    if ($sentinelaOutput -match "error|exception|traceback") {
        Write-Host "    [ERRO] Detectado erro no output!" -ForegroundColor Red
    } else {
        Write-Host "    [OK] Iniciado sem erros" -ForegroundColor Green
    }
} else {
    Write-Host "    [WARN] Sem output" -ForegroundColor Yellow
}

# Claude Worker
Write-Host ""
Write-Host "  === SENTINELA-CLAUDE (PowerShell) ===" -ForegroundColor Cyan
$claudeJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\User\Desktop\Diana-Corporacao-Senciente\scripts"
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File claude-worker.ps1 -WorkerName sentinela 2>&1
}
Start-Sleep -Seconds 5
$claudeOutput = Receive-Job $claudeJob
Stop-Job $claudeJob -ErrorAction SilentlyContinue
Remove-Job $claudeJob -Force -ErrorAction SilentlyContinue

if ($claudeOutput) {
    # Show first 10 lines
    $claudeOutput[0..9] | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
    if ($claudeOutput -match "error|exception|failed") {
        Write-Host "    [ERRO] Detectado erro no output!" -ForegroundColor Red
        Write-Host "    Full output:" -ForegroundColor Yellow
        $claudeOutput | ForEach-Object { Write-Host "      $_" -ForegroundColor DarkYellow }
    } elseif ($claudeOutput -match "WORKER sentinela ONLINE") {
        Write-Host "    [OK] CEO-ZERO ativado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "    [OK] Iniciado" -ForegroundColor Green
    }
} else {
    Write-Host "    [WARN] Sem output" -ForegroundColor Yellow
}

# 3. Verificar arquivos criados
Write-Host ""
Write-Host "[3] Arquivos criados..." -ForegroundColor White
$files = @(
    ".session_sentinela.txt",
    ".trigger_sentinela",
    ".prompt_sentinela.txt",
    ".worker_sentinela.lock"
)
foreach ($f in $files) {
    $path = Join-Path $ROOT $f
    if (Test-Path $path) {
        $content = Get-Content $path -Raw -ErrorAction SilentlyContinue
        if ($content) {
            $preview = $content.Substring(0, [Math]::Min(50, $content.Length))
            Write-Host "  [OK] $f : $preview..." -ForegroundColor Green
        } else {
            Write-Host "  [OK] $f : (vazio)" -ForegroundColor Gray
        }
    } else {
        Write-Host "  [ ] $f : nao criado" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "=== FIM SIMULACAO ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para testar REAL:" -ForegroundColor White
Write-Host "  1. Execute: Start-Diana-Native.bat" -ForegroundColor Gray
Write-Host "  2. Execute: powershell scripts\Launch-Diana-Terminal.ps1" -ForegroundColor Gray
Write-Host "  3. Verifique cada aba do Windows Terminal" -ForegroundColor Gray
Write-Host ""
