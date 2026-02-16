# ==============================================================================
# CORPORACAO SENCIENTE - Setup Multiple Agent Listeners
# Script para configurar múltiplos agent listeners
# ==============================================================================

Write-Host "=== CORPORACAO SENCIENTE - Setup Agent Listeners ===" -ForegroundColor Cyan
Write-Host ""

# Solicitar IP Tailscale do Google Cloud Brain
$tailscaleIP = Read-Host "Digite o IP Tailscale do Google Cloud Brain (ex: 100.78.145.65)"

if ([string]::IsNullOrWhiteSpace($tailscaleIP)) {
    Write-Host "ERRO: IP Tailscale é obrigatório" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Configurando agent listeners..." -ForegroundColor Cyan

# Lista de agentes
$agents = @(
    @{Id="pc-principal"; Name="PC Principal"},
    @{Id="pc-trading"; Name="PC Trading"},
    @{Id="pc-gpu"; Name="Cerebro-Nuvem"}
)

foreach ($agent in $agents) {
    $envFile = ".env.$($agent.Id)"
    
    Write-Host "Criando $envFile..." -ForegroundColor Yellow
    
    @"
# ==============================================================================
# CORPORACAO SENCIENTE - Agent Listener Configuration
# $($agent.Name)
# ==============================================================================

# Maestro URL via Tailscale (IP do Google Cloud Brain)
MAESTRO_URL=http://$tailscaleIP:8080

# Agent ID (identificador único)
AGENT_ID=$($agent.Id)

# Agent Name (nome amigável)
AGENT_NAME=$($agent.Name)

# Heartbeat interval (segundos)
HEARTBEAT_INTERVAL=10

# Reconnect delay (segundos)
RECONNECT_DELAY=5
"@ | Out-File -FilePath $envFile -Encoding UTF8
    
    Write-Host "✓ $envFile criado" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Setup Completo! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Para usar um agente específico:" -ForegroundColor Cyan
Write-Host "1. Copie o arquivo .env correspondente para .env"
Write-Host "   Exemplo: Copy-Item .env.pc-principal .env"
Write-Host "2. Execute: python listener.py"
Write-Host ""
