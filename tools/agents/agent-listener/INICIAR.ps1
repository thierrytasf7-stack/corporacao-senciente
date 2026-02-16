# ==============================================================================
# CORPORACAO SENCIENTE - Iniciar Agent Listener
# Script rapido para iniciar o listener
# ==============================================================================

Write-Host "=== Iniciando Agent Listener ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se estamos na pasta correta
if (-not (Test-Path "listener.py")) {
    Write-Host "ERRO: Execute este script da pasta agent-listener" -ForegroundColor Red
    exit 1
}

# Verificar .env
if (-not (Test-Path ".env")) {
    Write-Host "ERRO: Arquivo .env nao encontrado" -ForegroundColor Red
    Write-Host "Execute primeiro: .\setup-automatico.ps1" -ForegroundColor Yellow
    exit 1
}

# Verificar venv
if (-not (Test-Path "venv")) {
    Write-Host "ERRO: Ambiente virtual nao encontrado" -ForegroundColor Red
    Write-Host "Execute primeiro: .\setup-automatico.ps1" -ForegroundColor Yellow
    exit 1
}

# Ler configuracoes
$envContent = Get-Content .env
$maestroUrl = ($envContent | Select-String "^MAESTRO_URL=").ToString().Split('=')[1]
$agentId = ($envContent | Select-String "^AGENT_ID=").ToString().Split('=')[1]

Write-Host "Configuracao:" -ForegroundColor Yellow
Write-Host "  Maestro: $maestroUrl" -ForegroundColor White
Write-Host "  Agent ID: $agentId" -ForegroundColor White
Write-Host ""

# Testar conexao
Write-Host "Testando conexao com Maestro..." -ForegroundColor Cyan
try {
    $health = Invoke-WebRequest -Uri "$maestroUrl/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Maestro respondendo" -ForegroundColor Green
} catch {
    Write-Host "⚠ Aviso: Nao foi possivel conectar ao Maestro" -ForegroundColor Yellow
    Write-Host "  Verifique se o Maestro esta rodando no Portainer" -ForegroundColor Gray
    Write-Host "  Continuando mesmo assim..." -ForegroundColor Gray
}

Write-Host ""
Write-Host "Iniciando listener..." -ForegroundColor Cyan
Write-Host "Pressione Ctrl+C para parar" -ForegroundColor Yellow
Write-Host ""

# Iniciar listener
& .\venv\Scripts\python.exe listener.py
