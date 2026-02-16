# SOBRESCRITA AUTOMATICA - AURA BOT
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    SOBRESCRITA AUTOMATICA - AURA BOT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "SOBRESCREVENDO LOGS-CONSOLE-FRONTEND.JSON automaticamente" -ForegroundColor Yellow
Write-Host "Intervalo: 5 segundos" -ForegroundColor Yellow
Write-Host "NÃO solicita local de salvamento" -ForegroundColor Yellow
Write-Host ""

# Verificar se Python está disponível
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python encontrado: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Python não encontrado!" -ForegroundColor Red
    Write-Host "💡 Instale o Python e tente novamente" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar se Docker está disponível
try {
    $dockerVersion = docker --version 2>&1
    Write-Host "✅ Docker encontrado: $dockerVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker não encontrado!" -ForegroundColor Red
    Write-Host "💡 Instale o Docker e tente novamente" -ForegroundColor Yellow
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host ""
Write-Host "🚀 Iniciando sobrescrita automática..." -ForegroundColor Green
Write-Host "📝 SOBRESCREVENDO a cada 5 segundos" -ForegroundColor Green
Write-Host "🛑 Pressione Ctrl+C para parar" -ForegroundColor Yellow
Write-Host ""

try {
    python auto_overwrite_logs.py 5
}
catch {
    Write-Host "❌ Erro ao executar sobrescrita automática: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Sobrescrita automática finalizada" -ForegroundColor Green
Read-Host "Pressione Enter para sair"
