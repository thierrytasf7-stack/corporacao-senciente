# ==============================================================================
# Script de Verificacao do Deploy - Maestro Stack
# ==============================================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$TailscaleIP
)

Write-Host "=== Verificacao do Deploy Maestro ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Health Check
Write-Host "1. Testando Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "http://${TailscaleIP}:8080/health" -TimeoutSec 5 -ErrorAction Stop
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "   ✓ Health check OK: $($healthResponse.Content)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Health check retornou status: $($healthResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Erro ao conectar: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Verifique se o container esta rodando no Portainer" -ForegroundColor Yellow
}

Write-Host ""

# 2. Verificar WebSocket (Socket.IO)
Write-Host "2. Testando endpoint Socket.IO..." -ForegroundColor Yellow
try {
    $socketResponse = Invoke-WebRequest -Uri "http://${TailscaleIP}:8080/socket.io/" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✓ Socket.IO endpoint acessivel" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ Socket.IO endpoint nao respondeu (pode ser normal)" -ForegroundColor Yellow
}

Write-Host ""

# 3. Verificar Redis (via Maestro)
Write-Host "3. Verificando conectividade Redis..." -ForegroundColor Yellow
Write-Host "   (Redis e verificado internamente pelo Maestro)" -ForegroundColor Gray
Write-Host "   Se o health check passou, Redis esta OK" -ForegroundColor Gray

Write-Host ""

# 4. Resumo
Write-Host "=== Resumo ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "URLs de acesso:" -ForegroundColor Yellow
Write-Host "  - Health: http://${TailscaleIP}:8080/health" -ForegroundColor White
Write-Host "  - Socket.IO: http://${TailscaleIP}:8080/socket.io/" -ForegroundColor White
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Yellow
Write-Host "  1. Configurar agent-listener nos PCs locais" -ForegroundColor White
Write-Host "  2. Conectar Mission Control Center" -ForegroundColor White
Write-Host "  3. Testar comunicacao completa" -ForegroundColor White
