# ==============================================================================
# CORPORACAO SENCIENTE - Agent Listener Setup Script (Windows)
# ==============================================================================

Write-Host "=== CORPORACAO SENCIENTE - Agent Listener Setup ===" -ForegroundColor Cyan
Write-Host ""

# Verificar Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python encontrado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Python não encontrado" -ForegroundColor Red
    Write-Host "Instale Python 3.12+ primeiro: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Criar venv
if (-not (Test-Path "venv")) {
    Write-Host "Criando ambiente virtual..." -ForegroundColor Cyan
    python -m venv venv
}

# Ativar venv
Write-Host "Ativando ambiente virtual..." -ForegroundColor Cyan
& .\venv\Scripts\Activate.ps1

# Instalar dependências
Write-Host "Instalando dependências..." -ForegroundColor Cyan
python -m pip install --upgrade pip
pip install -r requirements.txt

# Criar .env se não existir
if (-not (Test-Path ".env")) {
    Write-Host "Criando arquivo .env..." -ForegroundColor Yellow
    $hostname = $env:COMPUTERNAME
    @"
# Maestro URL (Oracle VPS ou local)
MAESTRO_URL=https://api.senciente.corp

# Agent ID (identificador único)
AGENT_ID=$hostname

# Agent Name (nome amigável)
AGENT_NAME=$hostname

# Heartbeat interval (segundos)
HEARTBEAT_INTERVAL=10

# Reconnect delay (segundos)
RECONNECT_DELAY=5
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "Arquivo .env criado. Configure as variáveis conforme necessário." -ForegroundColor Green
}

# Criar diretório de logs
New-Item -ItemType Directory -Force -Path "logs" | Out-Null

Write-Host ""
Write-Host "=== Setup completo! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Edite o arquivo .env com suas configurações"
Write-Host "2. Execute: .\venv\Scripts\Activate.ps1"
Write-Host "3. Execute: python listener.py"
Write-Host ""
Write-Host "Para rodar como serviço Windows:" -ForegroundColor Yellow
Write-Host "Use NSSM (Non-Sucking Service Manager) ou Task Scheduler"
