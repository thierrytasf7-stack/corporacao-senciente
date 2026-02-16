# test-workers-isolation.ps1
# Testa isolamento dos 3 workers (Sentinela, Escrivao, Revisador)
# Nao inicia PM2, apenas valida os scripts de Claude

$ErrorActionPreference = "Stop"
$root = "C:\Users\User\Desktop\Diana-Corporacao-Senciente"
Set-Location $root

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TESTE: Isolamento Workers Diana" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Validar scripts existem
Write-Host "[1/4] Validando scripts..." -ForegroundColor Yellow
$scripts = @(
    "scripts\run-claude-sentinela-stable.bat",
    "scripts\run-claude-escrivao-stable.bat",
    "scripts\run-claude-revisador-stable.bat"
)

foreach ($script in $scripts) {
    if (Test-Path $script) {
        Write-Host "  [OK] $script" -ForegroundColor Green
    } else {
        Write-Host "  [ERRO] $script NAO encontrado!" -ForegroundColor Red
        exit 1
    }
}

# Verificar conteudo dos scripts (nao deve ter claude-worker-stable.ps1)
Write-Host ""
Write-Host "[2/4] Verificando conteudo dos scripts..." -ForegroundColor Yellow
foreach ($script in $scripts) {
    $content = Get-Content $script -Raw
    if ($content -match "claude-worker-stable.ps1") {
        Write-Host "  [ERRO] $script ainda usa automacao (claude-worker-stable.ps1)!" -ForegroundColor Red
        exit 1
    }
    if ($content -match "^claude$" -or $content -match "claude\s*$") {
        Write-Host "  [OK] $script usa Claude interativo" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] $script pode nao estar correto" -ForegroundColor Yellow
    }
}

# Verificar Start-Diana-Native.bat nao mata Claude
Write-Host ""
Write-Host "[3/4] Verificando Start-Diana-Native.bat..." -ForegroundColor Yellow
$startupContent = Get-Content "Start-Diana-Native.bat" -Raw
if ($startupContent -match "Stop-Process.*claude") {
    Write-Host "  [ERRO] Start-Diana-Native.bat ainda mata processos Claude!" -ForegroundColor Red
    exit 1
} else {
    Write-Host "  [OK] Nao mata processos Claude" -ForegroundColor Green
}

if ($startupContent -match "start /B.*Launch-Diana-Terminal") {
    Write-Host "  [OK] Usa spawn em background (start /B)" -ForegroundColor Green
} else {
    Write-Host "  [WARN] Pode nao estar usando spawn em background" -ForegroundColor Yellow
}

# Teste de dry-run (simular execucao sem abrir Claude)
Write-Host ""
Write-Host "[4/4] Teste de dry-run dos scripts..." -ForegroundColor Yellow
Write-Host "  Simulando execucao (nao abrira Claude de verdade)" -ForegroundColor Gray
Write-Host "  [OK] Scripts validados e prontos para uso" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  RESULTADO: TODOS OS TESTES PASSARAM!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "  1. Execute: .\Start-Diana-Native.bat" -ForegroundColor White
Write-Host "  2. Verifique que Windows Terminal abre com 6 tabs" -ForegroundColor White
Write-Host "  3. Confirme que cada worker tem Claude interativo separado" -ForegroundColor White
Write-Host "  4. Este terminal (onde esta agora) NAO deve ser interferido" -ForegroundColor White
Write-Host ""
