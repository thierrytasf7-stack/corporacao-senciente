# Script para iniciar WebSocket Monitor Server
# Porta: 4001

Write-Host "`n🚀 Iniciando WebSocket Monitor Server..." -ForegroundColor Cyan
Write-Host "📡 Porta: 4001" -ForegroundColor Yellow
Write-Host "🔌 Endpoint: ws://localhost:4001/stream`n" -ForegroundColor Yellow

# Verificar se a porta 4001 está em uso
$portInUse = Get-NetTCPConnection -LocalPort 4001 -ErrorAction SilentlyContinue

if ($portInUse) {
    Write-Host "⚠️  Porta 4001 já está em uso!" -ForegroundColor Red
    Write-Host "Encerrando processo existente...`n" -ForegroundColor Yellow
    
    $processId = $portInUse.OwningProcess
    Stop-Process -Id $processId -Force
    Start-Sleep -Seconds 2
}

# Iniciar servidor WebSocket
Set-Location $PSScriptRoot
node websocket-server.js
