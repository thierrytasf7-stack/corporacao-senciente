# test-trigger-flow.ps1
# Testa o fluxo completo: Cria trigger → Watcher detecta → Copia para clipboard

param(
    [string]$Worker = "sentinela"
)

$ROOT = "C:\Users\User\Desktop\Diana-Corporacao-Senciente"
Set-Location $ROOT

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TESTE DE FLUXO: Trigger → Watcher → Claude" -ForegroundColor Cyan
Write-Host "  Worker: $Worker" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar se watcher está rodando
Write-Host "[1/5] Verificando se watcher está rodando..." -ForegroundColor Yellow
$watcherRunning = Get-Process -Name powershell -ErrorAction SilentlyContinue | Where-Object {
    $_.MainWindowTitle -like "*WATCHER*$Worker*"
}

if ($watcherRunning) {
    Write-Host "  [OK] Watcher rodando (PID: $($watcherRunning.Id))" -ForegroundColor Green
} else {
    Write-Host "  [AVISO] Watcher nao detectado. Pode nao estar rodando." -ForegroundColor Yellow
    Write-Host "         Execute: Start-Diana-Native.bat" -ForegroundColor Gray
}

# 2. Limpar triggers antigos
Write-Host ""
Write-Host "[2/5] Limpando triggers antigos..." -ForegroundColor Yellow
Remove-Item ".trigger_$Worker" -ErrorAction SilentlyContinue
Remove-Item ".prompt_$Worker.txt" -ErrorAction SilentlyContinue
Write-Host "  [OK] Cleanup concluido" -ForegroundColor Green

# 3. Criar trigger de teste
Write-Host ""
Write-Host "[3/5] Criando trigger de teste..." -ForegroundColor Yellow

$testPrompt = @"
TESTE DE COMUNICACAO - Worker $Worker

Este é um prompt de teste gerado em $(Get-Date -Format "HH:mm:ss").

Se você está lendo isto, significa que:
1. Sentinela criou o trigger corretamente
2. Watcher detectou o trigger
3. Texto foi copiado para clipboard
4. Você colou no Claude manualmente (Ctrl+V)

PROXIMOS PASSOS:
- Responda: "TESTE OK - Recebi em $(Get-Date -Format "HH:mm:ss")"
- O watcher continuará monitorando triggers reais
"@

Set-Content -Path ".prompt_$Worker.txt" -Value $testPrompt -Encoding UTF8
New-Item -Path ".trigger_$Worker" -ItemType File -Force | Out-Null

Write-Host "  [OK] Trigger criado:" -ForegroundColor Green
Write-Host "       .trigger_$Worker" -ForegroundColor Gray
Write-Host "       .prompt_$Worker.txt" -ForegroundColor Gray

# 4. Aguardar watcher processar
Write-Host ""
Write-Host "[4/5] Aguardando watcher detectar (max 10s)..." -ForegroundColor Yellow

$timeout = 10
$elapsed = 0
while ((Test-Path ".trigger_$Worker") -and ($elapsed -lt $timeout)) {
    Start-Sleep -Seconds 1
    $elapsed++
    Write-Host "  Aguardando... $elapsed`s/$timeout`s" -NoNewline -ForegroundColor Gray
    Write-Host "`r" -NoNewline
}

Write-Host ""

if (-not (Test-Path ".trigger_$Worker")) {
    Write-Host "  [OK] Trigger foi processado pelo watcher!" -ForegroundColor Green
    Write-Host "       Verifique o pane do watcher para notificacao" -ForegroundColor Gray
} else {
    Write-Host "  [AVISO] Trigger ainda existe. Watcher pode nao ter detectado." -ForegroundColor Yellow
    Write-Host "          Verifique se watcher esta rodando corretamente." -ForegroundColor Gray
}

# 5. Verificar clipboard
Write-Host ""
Write-Host "[5/5] Verificando clipboard..." -ForegroundColor Yellow

try {
    $clipboardContent = Get-Clipboard -Raw
    if ($clipboardContent -like "*TESTE DE COMUNICACAO*") {
        Write-Host "  [OK] Clipboard contém o prompt de teste!" -ForegroundColor Green
        Write-Host ""
        Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host "  TESTE PASSOU!" -ForegroundColor Green
        Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
        Write-Host ""
        Write-Host "Proximos passos:" -ForegroundColor Cyan
        Write-Host "  1. Va para o terminal CLAUDE (pane de baixo)" -ForegroundColor White
        Write-Host "  2. Aperte Ctrl+V para colar" -ForegroundColor White
        Write-Host "  3. Aperte Enter" -ForegroundColor White
        Write-Host "  4. Claude deve responder: 'TESTE OK - Recebi...'" -ForegroundColor White
    } else {
        Write-Host "  [AVISO] Clipboard nao contem prompt de teste" -ForegroundColor Yellow
        Write-Host "          Conteudo atual: $($clipboardContent.Substring(0, [Math]::Min(50, $clipboardContent.Length)))..." -ForegroundColor Gray
    }
} catch {
    Write-Host "  [ERRO] Nao foi possivel ler clipboard: $_" -ForegroundColor Red
}

Write-Host ""
