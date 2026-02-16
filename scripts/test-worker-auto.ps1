# test-worker-auto.ps1
# Testa o worker automatizado sem iniciar o ecossistema completo

param(
    [string]$Worker = "sentinela"
)

$ErrorActionPreference = "Stop"
$root = "C:\Users\User\Desktop\Diana-Corporacao-Senciente"
Set-Location $root

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTE: Worker Automatizado" -ForegroundColor Cyan
Write-Host "  Worker: $Worker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Validar script Python existe
Write-Host "[1/5] Validando script Python..." -ForegroundColor Yellow
$pythonScript = "scripts\claude-worker-auto.py"
if (-not (Test-Path $pythonScript)) {
    Write-Host "  [ERRO] $pythonScript nao encontrado!" -ForegroundColor Red
    exit 1
}
Write-Host "  [OK] $pythonScript existe" -ForegroundColor Green

# 2. Validar Python disponível
Write-Host ""
Write-Host "[2/5] Validando Python..." -ForegroundColor Yellow
try {
    $pythonVersion = & python --version 2>&1
    Write-Host "  [OK] $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  [ERRO] Python nao encontrado no PATH!" -ForegroundColor Red
    exit 1
}

# 3. Validar Claude CLI disponível
Write-Host ""
Write-Host "[3/5] Validando Claude CLI..." -ForegroundColor Yellow
try {
    $claudeVersion = & claude --version 2>&1
    Write-Host "  [OK] Claude CLI instalado" -ForegroundColor Green
} catch {
    Write-Host "  [ERRO] Claude CLI nao encontrado!" -ForegroundColor Red
    Write-Host "        Instale com: npm install -g @anthropic-ai/claude-code" -ForegroundColor Yellow
    exit 1
}

# 4. Cleanup de arquivos antigos
Write-Host ""
Write-Host "[4/5] Limpando arquivos de teste antigos..." -ForegroundColor Yellow
Remove-Item ".trigger_$Worker" -ErrorAction SilentlyContinue
Remove-Item ".prompt_$Worker.txt" -ErrorAction SilentlyContinue
Remove-Item ".worker_$Worker.lock" -ErrorAction SilentlyContinue
Write-Host "  [OK] Cleanup concluido" -ForegroundColor Green

# 5. Criar trigger de teste
Write-Host ""
Write-Host "[5/5] Criando trigger de teste..." -ForegroundColor Yellow

$testPrompt = @"
TESTE DO WORKER AUTOMATIZADO

Voce esta recebendo este trigger de teste do worker '$Worker'.

Por favor, confirme que:
1. Recebeu esta mensagem corretamente
2. CEO-ZERO esta ativado
3. Esta pronto para processar tasks

Responda: TESTE OK - WORKER $Worker PRONTO
"@

Set-Content -Path ".prompt_$Worker.txt" -Value $testPrompt -Encoding UTF8
New-Item -Path ".trigger_$Worker" -ItemType File -Force | Out-Null

Write-Host "  [OK] Trigger de teste criado:" -ForegroundColor Green
Write-Host "       .trigger_$Worker" -ForegroundColor Gray
Write-Host "       .prompt_$Worker.txt" -ForegroundColor Gray

# Instrucoes finais
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  PRONTO PARA TESTE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Proximo passo - Escolha uma opcao:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  OPCAO A: Teste manual (recomendado primeiro)" -ForegroundColor Yellow
Write-Host "    1. Abra nova janela CMD" -ForegroundColor White
Write-Host "    2. cd $root" -ForegroundColor Gray
Write-Host "    3. scripts\run-claude-$Worker-stable.bat" -ForegroundColor Gray
Write-Host "    4. Observe os logs:" -ForegroundColor White
Write-Host "       - Aguarda 60s (1 min - Claude iniciar)" -ForegroundColor Gray
Write-Host "       - Ativa CEO-ZERO" -ForegroundColor Gray
Write-Host "       - Aguarda 30s" -ForegroundColor Gray
Write-Host "       - Processa o trigger de teste" -ForegroundColor Gray
Write-Host ""
Write-Host "  OPCAO B: Teste automatico (apos validar manual)" -ForegroundColor Yellow
Write-Host "    start `"TEST-$Worker`" cmd /k `"cd /d $root && scripts\run-claude-$Worker-stable.bat`"" -ForegroundColor Gray
Write-Host ""
Write-Host "Esperado:" -ForegroundColor Cyan
Write-Host "  1. Worker inicia e mostra banner" -ForegroundColor White
Write-Host "  2. [00:01:00] Ativa CEO-ZERO (aguarda 1 min)" -ForegroundColor White
Write-Host "  3. [00:01:30] Inicia processamento" -ForegroundColor White
Write-Host "  4. [00:01:32] Detecta trigger de teste" -ForegroundColor White
Write-Host "  5. Processa e responde 'TESTE OK'" -ForegroundColor White
Write-Host ""
Write-Host "Cleanup apos teste:" -ForegroundColor Yellow
Write-Host "  Remove-Item .trigger_$Worker, .prompt_$Worker.txt, .counter_$Worker.txt" -ForegroundColor Gray
Write-Host ""
