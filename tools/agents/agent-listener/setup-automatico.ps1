# ==============================================================================
# CORPORACAO SENCIENTE - Setup Automatico Agent Listener
# Configura tudo automaticamente com o IP do Maestro
# ==============================================================================

Write-Host "=== CORPORACAO SENCIENTE - Setup Automatico ===" -ForegroundColor Cyan
Write-Host ""

# IP do Maestro (ja configurado)
$MAESTRO_IP = "100.78.145.65"
$MAESTRO_URL = "http://${MAESTRO_IP}:8080"

Write-Host "Maestro URL: $MAESTRO_URL" -ForegroundColor Green
Write-Host ""

# Verificar Python
Write-Host "1. Verificando Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "   ✓ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Python nao encontrado!" -ForegroundColor Red
    Write-Host "   Instale Python 3.12+ de: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Verificar Tailscale
Write-Host ""
Write-Host "2. Verificando Tailscale..." -ForegroundColor Yellow
try {
    $tailscaleStatus = tailscale status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Tailscale conectado" -ForegroundColor Green
        
        # Testar conectividade com Maestro
        Write-Host "   Testando conectividade com Maestro..." -ForegroundColor Gray
        $pingResult = Test-Connection -ComputerName $MAESTRO_IP -Count 1 -Quiet
        if ($pingResult) {
            Write-Host "   ✓ Conectividade OK" -ForegroundColor Green
        } else {
            Write-Host "   ⚠ Ping falhou (pode ser normal se firewall bloqueia ICMP)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ✗ Tailscale nao encontrado ou nao conectado" -ForegroundColor Red
        Write-Host "   Instale Tailscale: https://tailscale.com/download" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "   ✗ Tailscale nao encontrado" -ForegroundColor Red
    Write-Host "   Instale Tailscale: https://tailscale.com/download" -ForegroundColor Yellow
    exit 1
}

# Criar venv se nao existir
Write-Host ""
Write-Host "3. Configurando ambiente virtual..." -ForegroundColor Yellow
if (-not (Test-Path "venv")) {
    Write-Host "   Criando venv..." -ForegroundColor Gray
    python -m venv venv
    Write-Host "   ✓ venv criado" -ForegroundColor Green
} else {
    Write-Host "   ✓ venv ja existe" -ForegroundColor Green
}

# Ativar venv e instalar dependencias
Write-Host ""
Write-Host "4. Instalando dependencias..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1
pip install -q --upgrade pip
pip install -q -r requirements.txt
Write-Host "   ✓ Dependencias instaladas" -ForegroundColor Green

# Criar .env
Write-Host ""
Write-Host "5. Criando arquivo .env..." -ForegroundColor Yellow

# Solicitar ID do agente
$agentId = Read-Host "Digite o ID do agente (ex: pc-principal, pc-trading, pc-gpu)"
if ([string]::IsNullOrWhiteSpace($agentId)) {
    $agentId = "pc-principal"
    Write-Host "   Usando ID padrao: $agentId" -ForegroundColor Gray
}

# Solicitar nome do agente
$agentName = Read-Host "Digite o nome do agente (ex: PC Principal)"
if ([string]::IsNullOrWhiteSpace($agentName)) {
    $agentName = "PC Principal"
    Write-Host "   Usando nome padrao: $agentName" -ForegroundColor Gray
}

# Criar .env
$envContent = @"
# ==============================================================================
# CORPORACAO SENCIENTE - Agent Listener Configuration
# Gerado automaticamente em $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# ==============================================================================

# Maestro URL via Tailscale (IP do Google Cloud Brain)
MAESTRO_URL=$MAESTRO_URL

# Agent ID (identificador unico)
AGENT_ID=$agentId

# Agent Name (nome amigavel)
AGENT_NAME=$agentName

# Heartbeat interval (segundos)
HEARTBEAT_INTERVAL=10

# Reconnect delay (segundos)
RECONNECT_DELAY=5
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "   ✓ .env criado" -ForegroundColor Green

# Testar conexao com Maestro
Write-Host ""
Write-Host "6. Testando conexao com Maestro..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "${MAESTRO_URL}/health" -TimeoutSec 5 -ErrorAction Stop
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "   ✓ Maestro respondendo: $($healthResponse.Content)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Maestro retornou status: $($healthResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠ Nao foi possivel conectar ao Maestro" -ForegroundColor Yellow
    Write-Host "   Verifique se o Maestro esta rodando no Portainer" -ForegroundColor Gray
}

# Resumo
Write-Host ""
Write-Host "=== Setup Completo! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Configuracao:" -ForegroundColor Cyan
Write-Host "  Maestro URL: $MAESTRO_URL" -ForegroundColor White
Write-Host "  Agent ID: $agentId" -ForegroundColor White
Write-Host "  Agent Name: $agentName" -ForegroundColor White
Write-Host ""
Write-Host "Para executar o listener:" -ForegroundColor Yellow
Write-Host "  1. Ative o venv: .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host "  2. Execute: python listener.py" -ForegroundColor White
Write-Host ""
Write-Host "Ou execute diretamente:" -ForegroundColor Yellow
Write-Host "  .\venv\Scripts\python.exe listener.py" -ForegroundColor White
Write-Host ""
